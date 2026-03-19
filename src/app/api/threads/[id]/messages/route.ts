import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { globalAgent } from '@/lib/maya/globalAgent';
import { mayaAgent } from '@/lib/maya/agent';
import { setupCheckpointer } from '@/lib/maya/checkpoint';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: threadId } = await params;

    // Verify the user owns this thread
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId, userId: session.user.id },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    await setupCheckpointer();

    // Fetch the thread state from LangGraph using the appropriate agent
    const config = { configurable: { thread_id: threadId } };

    let state;
    if (thread.context === 'global') {
      state = await globalAgent.getState(config);
    } else {
      state = await mayaAgent.getState(config);
    }

    // Format the messages for the UI
    const formattedMessages = [];
    if (state && state.values && state.values.messages) {
       for (const msg of state.values.messages) {
         if (msg.getType() === 'human') {
           formattedMessages.push({
             id: msg.id || Date.now().toString() + Math.random(),
             role: 'user',
             content: msg.content,
             timestamp: new Date() // Note: LangGraph doesn't store timestamps natively on messages without metadata
           });
         } else if (msg.getType() === 'ai' && msg.content) {
           formattedMessages.push({
             id: msg.id || Date.now().toString() + Math.random(),
             role: 'assistant',
             content: msg.content,
             timestamp: new Date()
           });
         }
       }
    }

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread messages' },
      { status: 500 }
    );
  }
}
