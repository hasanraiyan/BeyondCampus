import { NextRequest } from 'next/server';
import { globalAgent } from '@/lib/maya/globalAgent';
import { setupCheckpointer } from '@/lib/maya/checkpoint';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    // Extract threadId if passed
    const { messages, threadId } = await req.json();

    const mappedMessages = messages.map((m: any) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    // Initialize the DB checkpointer tables
    await setupCheckpointer();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const eventStream = await globalAgent.streamEvents(
            {
              messages: mappedMessages,
            },
            {
              version: 'v2',
              configurable: { thread_id: threadId || 'default-thread' }
            }
          );

          for await (const event of eventStream) {
            const eventType = event.event;

            // Check for chat model stream events from the 'agent' node
            if (
              eventType === 'on_chat_model_stream' &&
              event.metadata?.langgraph_node === 'agent'
            ) {
              const content = event.data?.chunk?.content;
              if (content) {
                const text =
                  typeof content === 'string'
                    ? content
                    : JSON.stringify(content);
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
    console.error('Global Maya Agent Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
