import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { globalToolbox } from './globalTools';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Define the state for the global agent
const GlobalMayaState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
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
}).bindTools(globalToolbox);

// Node: The Agent (Maya Global)
async function callGlobalModel(state: typeof GlobalMayaState.State) {
  const systemPrompt = `You are Maya, an elite AI career and education counselor for BeyondCampus.
Your goal is to help students find their perfect university match globally.

### MANDATORY GUIDELINES:
1. **Professional Persona**: Be concise, professional, and encouraging.
2. **Mandate Tool Usage**: You must ONLY answer based on data retrieved from tools. If you don't have the data, use the appropriate tool to find it. Do not hallucinate. Use \`get_all_universities\` or \`global_list_programs\` to help the user.
3. **Source Citations**: End every response or specific section with a citation like "📄 Source: Platform Database" based on where the tool data came from.
4. **Formatting & GenUI**: If you list programs, give a brief helpful insight or ask a follow-up question. Use markdown formatting.
5. **Context**: The student is exploring general options globally across all universities.
   ${state.context ? `Additional Context: ${state.context}` : ''}

If a student asks something outside your knowledge base, guide them to explore the platform or contact the university admissions office directly.`;

  const messages = [new SystemMessage(systemPrompt), ...state.messages];
  const response = await model.invoke(messages);

  return {
    messages: [response],
  };
}

// Node: Tools execution
const toolNode = new ToolNode(globalToolbox);

// Edge: Logic to determine if tools should be called
function shouldContinue(state: typeof GlobalMayaState.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return 'tools';
  }
  return END;
}

// Build the graph (ReAct Pattern: agent -> tools -> agent)
const workflow = new StateGraph(GlobalMayaState)
  .addNode('agent', callGlobalModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

// Compile the agent
export const globalAgent = workflow.compile();
