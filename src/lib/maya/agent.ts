
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
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

// Initialize the model - Using gemini-2.0-flash as requested
const model = new ChatGoogleGenerativeAI({
  model: process.env.GOOGLE_MODEL_NAME || 'gemini-3.1-flash-lite-preview',
  apiKey: process.env.GOOGLE_API_KEY,
  streaming: true,
  temperature: 0.2, // Lower temperature for more consistent counselor behavior
}).bindTools(toolbox);

// Node: The Agent (Maya)
async function callModel(state: typeof MayaState.State) {
  const systemPrompt = `You are Maya, an elite AI career and education counselor for BeyondCampus.
Your goal is to help students find their perfect university match.

### MANDATORY GUIDELINES:
1. **Professional Persona**: Be concise, professional, and encouraging.
2. **Mandate Tool Usage**: You must ONLY answer based on data retrieved from tools. If you don't have the data, use the appropriate tool to find it. Do not hallucinate.
3. **Source Citations**: End every response or specific section with a citation like "📄 Source: Admissions Guide" or "📄 Source: Program Catalog" based on where the tool data came from.
4. **Formatting**: Use markdown tables when listing multiple programs, deadlines, or requirements. 
5. **Context**: ${state.universityId ? `The student is currently interested in University ID: ${state.universityId}.` : 'The student is exploring general options.'}
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
