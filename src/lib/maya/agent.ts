
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { toolbox } from './universityTools';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Define the state for the agent
const MayaState = Annotation.Root({
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

// Initialize the model - Using OpenAI as requested
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL_NAME || 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  streaming: true,
  temperature: 0.2, // Lower temperature for more consistent counselor behavior
}).bindTools(toolbox);

import prisma from '@/lib/prisma';

// Node: The Agent (Maya)
async function callModel(state: typeof MayaState.State) {
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
4. **Formatting & GenUI**: When you use the \`list_programs\` tool, the application automatically renders a beautiful visual table directly in the UI for the user. **DO NOT** summarize or list all the programs in your text response. Simply acknowledge that the programs are shown above and give a brief helpful insight or ask a follow-up question. For other data, use markdown formatting.
5. **Context**: ${state.universityId ? `The student is currently interested in ${universityName} (ID: ${state.universityId}).` : 'The student is exploring general options.'}
   ${state.context ? `Additional Context: ${state.context}` : ''}

If a student asks something outside your knowledge base, guide them to explore the platform or contact the university admissions office directly.`;

  const messages = [new SystemMessage(systemPrompt), ...state.messages];
  const response = await model.invoke(messages);

  return {
    messages: [response],
  };
}

// Node: Tools execution
const toolNode = new ToolNode(toolbox);

// Edge: Logic to determine if tools should be called
function shouldContinue(state: typeof MayaState.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'tools';
  }
  return END;
}

// Build the graph (ReAct Pattern: agent -> tools -> agent)
const workflow = new StateGraph(MayaState)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

// Compile the agent
export const universityAgent = workflow.compile();

// For backward compatibility and specialized use
export const mayaAgent = universityAgent;
