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
      return new Response(JSON.stringify({ error: 'University ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
            { version: 'v2' }
          );

          for await (const event of eventStream) {
            const eventType = event.event;

            // Stream text content from the 'agent' node
            // Note: In the refactored agent, the node name is 'agent'
            if (
              eventType === 'on_chat_model_stream' &&
              event.metadata?.langgraph_node === 'agent'
            ) {
              const content = event.data?.chunk?.content;
              if (content) {
                const text = typeof content === 'string' ? content : JSON.stringify(content);
                controller.enqueue(encoder.encode(text));
              }
            }
          }
          controller.close();
        } catch (e) {
          console.error('Stream error:', e);
          controller.error(e);
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
