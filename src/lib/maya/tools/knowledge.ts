import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { searchKnowledge } from '@/lib/qdrant';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Tool to search the university knowledge base using semantic search.
 */
export const search_knowledge = new DynamicStructuredTool({
  name: 'search_knowledge',
  description: 'Search the university knowledge base for specific information using semantic search. Use this for general questions about admissions, campus life, scholarships, or specific course details not found in structured data.',
  schema: z.object({
    query: z.string().describe('The search query or question to search for.'),
  }),
  func: async ({ query }: { query: string }, _runManager, config?: RunnableConfig) => {
    const universityId = config?.configurable?.universityId;
    if (!universityId) return 'Error: University context is missing.';

    try {
      const results = await searchKnowledge(universityId, query);
      if (!results || results.length === 0) {
        return 'No relevant information found in the knowledge base.';
      }
      return JSON.stringify(results.map(r => ({
        content: r.payload?.content,
        category: r.payload?.category,
        score: r.score
      })), null, 2);
    } catch (error) {
      console.error('Error in search_knowledge tool:', error);
      return 'An error occurred while searching the knowledge base.';
    }
  },
});
