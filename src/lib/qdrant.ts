import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';

export const qdrantClient = new QdrantClient({
  url: qdrantUrl,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001',
});

/**
 * Checks if a Qdrant collection exists for the given universityId.
 * If it doesn't, creates it (size: 768, distance: 'Cosine').
 */
export async function ensureCollection(universityId: string) {
  const collectionName = `university_${universityId}`;
  
  try {
    const exists = await qdrantClient.collectionExists(collectionName);
    if (!exists.exists) {
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 768,
          distance: 'Cosine',
        },
      });
      console.log(`Created Qdrant collection: ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error ensuring collection ${collectionName} exists:`, error);
    throw error;
  }
}

/**
 * Chunks the markdown content, embeds it, and stores the vectors in Qdrant.
 */
export async function embedAndStore(
  universityId: string,
  category: string,
  markdownContent: string
) {
  const collectionName = `university_${universityId}`;
  
  await ensureCollection(universityId);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await textSplitter.createDocuments([markdownContent]);

  const points = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = await embeddings.embedQuery(chunk.pageContent);

    points.push({
      id: uuidv4(),
      vector,
      payload: {
        category,
        universityId,
        chunkIndex: i,
        content: chunk.pageContent, // raw text content
      },
    });
  }

  if (points.length > 0) {
    await qdrantClient.upsert(collectionName, {
      wait: true,
      points,
    });
    console.log(`Upserted ${points.length} vectors to ${collectionName}`);
  }
}

/**
 * Embeds the query and performs a semantic similarity search on the Qdrant collection.
 */
export async function searchKnowledge(
  universityId: string,
  query: string,
  topK: number = 5
) {
  const collectionName = `university_${universityId}`;
  const queryVector = await embeddings.embedQuery(query);

  const searchResults = await qdrantClient.search(collectionName, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  return searchResults;
}
