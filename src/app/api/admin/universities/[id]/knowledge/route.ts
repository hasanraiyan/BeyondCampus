import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { embedAndStore } from '@/lib/qdrant';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params;

    if (!universityId) {
      return NextResponse.json(
        { message: 'University ID is required' },
        { status: 400 }
      );
    }

    const docs = await prisma.universityKnowledgeDoc.findMany({
      where: { universityId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(docs);
  } catch (error: any) {
    console.error('Error fetching knowledge docs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch knowledge docs', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params;
    const body = await request.json();
    const { category, content, fileName } = body;

    if (!universityId || !category || !content || !fileName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Upsert raw markdown in Postgres
    const doc = await prisma.universityKnowledgeDoc.upsert({
      where: {
        universityId_category: {
          universityId,
          category,
        },
      },
      update: {
        content,
        fileName,
        embeddedAt: null, // Reset embedded timestamp
        processedAt: null, // Reset processed timestamp since content changed
      },
      create: {
        universityId,
        category,
        content,
        fileName,
      },
    });

    // 2. Chunk and store in Qdrant
    await embedAndStore(universityId, category, content);

    // 3. Update embeddedAt timestamp
    const updatedDoc = await prisma.universityKnowledgeDoc.update({
      where: { id: doc.id },
      data: { embeddedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Document successfully uploaded and embedded',
      doc: updatedDoc,
    });
  } catch (error: any) {
    console.error('Error uploading knowledge doc:', error);
    return NextResponse.json(
      { message: 'Failed to upload knowledge doc', error: error.message },
      { status: 500 }
    );
  }
}
