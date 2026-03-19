import { NextRequest } from 'next/server';
import { universityAgent } from '@/lib/maya/agent';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params;
    const { message, history } = await req.json();

    if (!universityId) {
      console.error(`❌ [API Error] University ID is missing in request.`);
      return new Response(JSON.stringify({ error: 'University ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`\n======================================================`);
    console.log(`💬 [API: /api/universities/${universityId}/chat] New Message`);
    console.log(`🗣️ User: "${message}"`);
    console.log(`======================================================\n`);

    // Map history to LangChain messages
    const mappedMessages = (history || []).map((m: any) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    // Append the new user message
    mappedMessages.push(new HumanMessage(message));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const eventStream = await universityAgent.streamEvents(
            {
              messages: mappedMessages,
              universityId: universityId,
            },
            { 
              configurable: { universityId: universityId }
            }
          );

          for await (const event of eventStream) {
            const eventType = event.event;

            // --- AI Step Logging ---
            if (eventType === 'on_tool_start') {
              console.log(`\n🔹 [STEP: Tool Call] AI is calling tool: ${event.name}`);
              console.log(`📥 Input:`, JSON.stringify(event.data?.input || {}, null, 2));
            } else if (eventType === 'on_tool_end') {
              console.log(`\n✅ [STEP: Tool Result] Tool returned from: ${event.name}`);
              console.log(`📤 Output:`, JSON.stringify(event.data?.output || {}, null, 2));
            } else if (eventType === 'on_chat_model_start') {
              console.log(`\n🧠 [STEP: Model Start] AI model is thinking...`);
            } else if (eventType === 'on_chat_model_end') {
              console.log(`\n💭 [STEP: Model End] AI model finished generating.`);
            }
            // -----------------------

            const isProgramTool = event.name === 'list_programs' || event.name === 'search_programs';

            if (eventType === 'on_tool_end' && isProgramTool) {
              // Try to correctly parse the tool result whether it is inside content or kwargs
              const output = event.data?.output;
              let toolOutputData = output?.kwargs?.content || output?.content || output;
              
              if (typeof toolOutputData === 'string') {
                try {
                  toolOutputData = JSON.parse(toolOutputData);
                } catch (e) {}
              }

              try {
                // Only send if it's an array (to avoid crashing the UI)
                if (Array.isArray(toolOutputData)) {
                  const payload = JSON.stringify({
                    type: 'tool',
                    tool: event.name,
                    data: toolOutputData,
                  }) + '\n';
                  controller.enqueue(encoder.encode(payload));
                }
              } catch (e) {
                // ignore
              }
            }

            // Stream text content from the 'agent' node
            // Note: In the refactored agent, the node name is 'agent'
            if (
              eventType === 'on_chat_model_stream' &&
              event.metadata?.langgraph_node === 'agent'
            ) {
              const content = event.data?.chunk?.content;
              if (content) {
                const text = typeof content === 'string' ? content : JSON.stringify(content);
                try {
                  const payload = JSON.stringify({
                    type: 'text',
                    content: text,
                  }) + '\n';
                  controller.enqueue(encoder.encode(payload));
                } catch (e) {
                  // Controller might be closed if client disconnected
                  break;
                }
              }
            }
          }
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        } catch (e) {
          console.error('Stream error:', e);
          try {
            controller.error(e);
          } catch (err) {
            // Already errored or closed
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('University Chat Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
