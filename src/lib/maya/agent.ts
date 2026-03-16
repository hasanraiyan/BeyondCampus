import "server-only";
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import prisma from "@/lib/prisma";


// Define the state for the agent
const MayaState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  universityId: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
  }),
  context: Annotation<string>({
    reducer: (x, y) => y,
  }),
});

// Initialize the model
const model = new ChatGoogleGenerativeAI({
  model: process.env.GOOGLE_MODEL_NAME || "gemini-3.1-flash-lite-preview",
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY,
  streaming: true,
});




// Node: Analyze intent and retrieve data
async function researchNode(state: typeof MayaState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  let context = "";

  if (state.universityId) {
    // Fetch specific university details if in context
    const university = await prisma.university.findUnique({
      where: { id: state.universityId },
    });
    if (university) {
      context = `You are currently discussing ${university.name}. 
      Location: ${university.city}, ${university.state}.
      Description: ${university.description}.
      Ranking: ${university.ranking}.
      Enrollment: ${university.enrollmentSize}.
      Specialties: ${university?.specialties?.join(", ")}.`;
    }
  }

  return { context };
}

// Node: Generate response
async function generateNode(state: typeof MayaState.State) {
  const systemMessage = {
    role: "system",
    content: `You are Maya, an elite AI career and education counselor for BeyondCampus.
    Your goal is to help students find their perfect university match.
    BE concise, professional, and encouraging.
    
    Current Context: ${state.context || 'General university exploration.'}
    
    If the user asks about specific rankings or data you don't have, guide them to explore the university profiles on the platform.`,
  };

  const response = await model.invoke([
    systemMessage,
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
}

// Build the graph
const workflow = new StateGraph(MayaState)
  .addNode("research", researchNode)
  .addNode("generate", generateNode)
  .addEdge(START, "research")
  .addEdge("research", "generate")
  .addEdge("generate", END);

// Compile the agent
export const mayaAgent = workflow.compile();
