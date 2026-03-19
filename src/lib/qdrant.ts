import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';

export interface ProgramVector {
  id: string;
  name: string;
  department: string | null;
  degreeType: string;
  durationMonths: number | null;
  tuitionPerYear: number | null;
  applyUrl: string | null;
  universityId: string;
}

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';

export const qdrantClient = new QdrantClient({
  url: qdrantUrl,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001',
});

/**
 * Checks if a Qdrant collection exists for the given universityId.
 * If it doesn't, creates it (size: 3072, distance: 'Cosine').
 */
export async function ensureCollection(universityId: string) {
  const collectionName = `university_${universityId}`;
  
  try {
    const exists = await qdrantClient.collectionExists(collectionName);
    if (!exists.exists) {
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 3072,
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
 * Deletes all Qdrant vectors for a specific program (by payload filter).
 * Called when a program is deleted from the DB so no stale vectors remain.
 */
export async function deleteProgramVector(
  universityId: string,
  programId: string
) {
  const collectionName = `university_${universityId}`;

  try {
    const exists = await qdrantClient.collectionExists(collectionName);
    if (!exists.exists) return; // nothing to delete

    await qdrantClient.delete(collectionName, {
      wait: true,
      filter: {
        must: [
          { key: 'type', match: { value: 'program' } },
          { key: 'programId', match: { value: programId } },
        ],
      },
    });

    console.log(`[Qdrant] Deleted vectors for program ${programId} from ${collectionName}`);
  } catch (err) {
    console.error(`[Qdrant] Failed to delete vectors for program ${programId} (non-fatal):`, err);
  }
}


/**
 * Embeds all programs for a university into Qdrant.
 * Each program is stored as a rich text summary with type='program' in the payload.
 * This allows semantic searches like "programs for AI career" or "low tuition MS programs".
 */
export async function embedPrograms(
  universityId: string,
  programs: ProgramVector[]
) {
  if (!programs || programs.length === 0) return;

  const collectionName = `university_${universityId}`;
  await ensureCollection(universityId);

  const points = [];

  for (const program of programs) {
    // Build a rich text summary so semantic search can find it
    const summary = [
      `Program: ${program.name}`,
      program.department ? `Department: ${program.department}` : null,
      `Degree: ${program.degreeType}`,
      program.durationMonths ? `Duration: ${program.durationMonths} months` : null,
      program.tuitionPerYear ? `Tuition: $${program.tuitionPerYear.toLocaleString()} per year` : null,
      program.applyUrl ? `Apply URL: ${program.applyUrl}` : null,
    ]
      .filter(Boolean)
      .join('. ');

    const vector = await embeddings.embedQuery(summary);

    points.push({
      id: uuidv4(),
      vector,
      payload: {
        type: 'program',
        programId: program.id,
        universityId,
        name: program.name,
        department: program.department,
        degreeType: program.degreeType,
        durationMonths: program.durationMonths,
        tuitionPerYear: program.tuitionPerYear,
        applyUrl: program.applyUrl,
        content: summary,
      },
    });
  }

  if (points.length > 0) {
    await qdrantClient.upsert(collectionName, { wait: true, points });
    console.log(`Upserted ${points.length} program vectors to ${collectionName}`);
  }
}

/**
 * Searches Qdrant for programs semantically matching the query.
 * Scoped to program vectors only (type: 'program' filter).
 */
export async function searchPrograms(
  universityId: string,
  query: string,
  topK: number = 8
) {
  const collectionName = `university_${universityId}`;

  try {
    const exists = await qdrantClient.collectionExists(collectionName);
    if (!exists.exists) return [];

    const queryVector = await embeddings.embedQuery(query);

    const searchResults = await qdrantClient.search(collectionName, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
      filter: {
        must: [{ key: 'type', match: { value: 'program' } }],
      },
    });

    return searchResults;
  } catch (error: any) {
    if (error?.status === 404) return [];
    console.error(`Error searching programs in ${collectionName}:`, error);
    throw error;
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
  
  try {
    const exists = await qdrantClient.collectionExists(collectionName);
    if (!exists.exists) {
      return [];
    }

    const queryVector = await embeddings.embedQuery(query);

    const searchResults = await qdrantClient.search(collectionName, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });

    return searchResults;
  } catch (error: any) {
    if (error?.status === 404) {
      return [];
    }
    console.error(`Error searching knowledge in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Searches Qdrant for programs semantically matching the query across ALL collections (universities).
 */
export async function searchAllPrograms(
  query: string,
  topK: number = 20
) {
  try {
    // 1. Get all collections
    const collectionsResponse = await qdrantClient.getCollections();
    const collections = collectionsResponse.collections.map(c => c.name);

    if (collections.length === 0) return [];

    // 2. Embed the query
    const queryVector = await embeddings.embedQuery(query);

    // 3. Search each collection in parallel
    const searchPromises = collections.map(async (collectionName) => {
      try {
        const results = await qdrantClient.search(collectionName, {
          vector: queryVector,
          limit: topK,
          with_payload: true,
          filter: {
            must: [{ key: 'type', match: { value: 'program' } }],
          },
        });
        return results;
      } catch (err: any) {
        if (err?.status === 404) return [];
        console.error(`Error searching programs in ${collectionName}:`, err);
        return [];
      }
    });

    const allResultsArrays = await Promise.all(searchPromises);

    // 4. Flatten, sort by score descending, and take topK
    const flatResults = allResultsArrays.flat();
    flatResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return flatResults.slice(0, topK);
  } catch (error: any) {
    console.error('Error searching all programs in Qdrant:', error);
    throw error;
  }
}
