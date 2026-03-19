import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ModelProvider } from '../../providers/llm';
import { universityToolbox } from '../../tools/registry';
import prisma from '@/lib/prisma';

// Define the state for Maya
export const MayaState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  universityId: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
  }),
  context: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
  }),
});

export type MayaStateType = typeof MayaState.State;

/**
 * Node: The Agent logic
 */
async function callModel(state: MayaStateType) {
  let universityName = 'this university';
  
  if (state.universityId) {
    try {
      const university = await prisma.university.findUnique({
        where: { id: state.universityId },
        select: { name: true }
      });
      if (university) {
        universityName = university.name;
      }
    } catch (error) {
      console.error('Error fetching university name for agent:', error);
    }
  }

  const systemPrompt = `You are Maya, an elite AI career and education counselor for BeyondCampus.
Your goal is to help students find their perfect university match.

### MANDATORY GUIDELINES:
1. **Professional Persona**: Be concise, professional, and encouraging.
2. **Mandate Tool Usage**: You must ONLY answer based on data retrieved from tools. If you don't have the data, use the appropriate tool to find it. Do not hallucinate.
3. **Source Citations**: End every response or specific section with a citation like "📄 Source: Admissions Guide" or "📄 Source: Program Catalog" based on where the tool data came from.
4. **Formatting & GenUI**: When you use the \`list_programs\` or \`search_programs\` tools, the application automatically renders a beautiful visual table directly in the UI for the user. **DO NOT** summarize or list all the programs in your text response. Simply acknowledge that the programs are shown above and give a brief helpful insight or ask a follow-up question. For other data, use markdown formatting.
5. **Smart Program Discoverability**:
   - Use \`list_programs\` when the student asks for an exact lookup (e.g., "List all Master's programs", "Computer Science department"). It uses strict database filters.
   - Use \`search_programs\` for vague, open-ended, or conceptual queries (e.g., "programs related to AI", "low tuition options", "best for a career in finance"). This uses semantic AI search.
   - **Privacy & Security**: Tools are automatically scoped to the current university. You do not need to provide a university ID; it is handled programmatically to ensure data safety.
6. **Context**: ${state.universityId ? `The student is currently interested in ${universityName}.` : 'The student is exploring general options.'}
   ${state.context ? `Additional Context: ${state.context}` : ''}

If a student asks something outside your knowledge base, guide them to explore the platform or contact the university admissions office directly.`;

  const model = ModelProvider.getOpenAI().bindTools(universityToolbox);
  const messages = [new SystemMessage(systemPrompt), ...state.messages];
  const response = await model.invoke(messages);

  return {
    messages: [response],
  };
}

/**
 * Node: Tools execution
 */
const toolNode = new ToolNode(universityToolbox);

/**
 * Edge: Logic to determine if tools should be called
 */
function shouldContinue(state: MayaStateType) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'tools';
  }
  return END;
}

/**
 * Build the Maya graph
 */
export const mayaGraph = new StateGraph(MayaState)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');
