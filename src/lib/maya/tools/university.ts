import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { searchPrograms, searchKnowledge } from '@/lib/qdrant';
import { ProgramDegreeType } from '@prisma/client';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Tool to list programs offered by a university using structured filters.
 */
export const list_programs = new DynamicStructuredTool({
  name: 'list_programs',
  description:
    'List programs offered by a university using exact filters. ' +
    'Use this for structured lookups by degree level (BS, MS, etc.) or department.',
  schema: z.object({
    degreeType: z
      .nativeEnum(ProgramDegreeType)
      .optional()
      .describe('Filter by degree level (e.g., BS, MS, MBA, PHD).'),
    department: z
      .string()
      .optional()
      .describe('Filter by department name (e.g., Computer Science).'),
  }),
  func: async ({
    degreeType,
    department,
  }: {
    degreeType?: ProgramDegreeType;
    department?: string;
  }, _runManager, config?: RunnableConfig) => {
    const universityId = config?.configurable?.universityId;
    if (!universityId) return 'Error: University context is missing.';

    try {
      const programs = await prisma.program.findMany({
        where: {
          universityId,
          ...(degreeType && { degreeType }),
          ...(department && { department: { contains: department, mode: 'insensitive' } }),
        },
        select: {
          id: true,
          name: true,
          department: true,
          degreeType: true,
          durationMonths: true,
          tuitionPerYear: true,
          applyUrl: true,
        } as any,
      });

      if (programs.length === 0) {
        return '[]';
      }

      return JSON.stringify(programs, null, 2);
    } catch (error) {
      console.error('Error in list_programs tool:', error);
      return 'An error occurred while listing programs.';
    }
  },
});

/**
 * Tool to search for programs using semantic/AI search.
 */
export const search_programs = new DynamicStructuredTool({
  name: 'search_programs',
  description:
    'Search for programs using AI/semantic search. ' +
    'Use this for vague or open-ended queries like "programs related to AI", "low tuition options", or "career in data science".',
  schema: z.object({
    query: z.string().describe('The semantic search query describing what the student is looking for.'),
    limit: z.number().optional().default(10).describe('Max number of results to return.'),
  }),
  func: async ({
    query,
    limit,
  }: {
    query: string;
    limit?: number;
  }, _runManager, config?: RunnableConfig) => {
    const universityId = config?.configurable?.universityId;

    try {
      const results = await searchPrograms(query, universityId, limit || 10);

      if (!results || results.length === 0) {
        return '[]';
      }

      const programs = results.map((r) => ({
        id: r.payload?.programId,
        name: r.payload?.name,
        department: r.payload?.department,
        degreeType: r.payload?.degreeType,
        durationMonths: r.payload?.durationMonths,
        tuitionPerYear: r.payload?.tuitionPerYear,
        applyUrl: r.payload?.applyUrl,
        _relevanceScore: Math.round((r.score ?? 0) * 100) / 100,
      }));

      return JSON.stringify(programs, null, 2);
    } catch (error) {
      console.error('Error in search_programs tool:', error);
      return 'An error occurred while searching programs.';
    }
  },
});

/**
 * Tool to get detailed information about a specific program.
 */
export const get_program_details = new DynamicStructuredTool({
  name: 'get_program_details',
  description: 'Get full details for a specific program, including tuition, duration, and requirements.',
  schema: z.object({
    programId: z.string().describe('The unique ID of the program.'),
  }),
  func: async ({ programId }: { programId: string }, _runManager, config?: RunnableConfig) => {
    const universityId = config?.configurable?.universityId;
    if (!universityId) return 'Error: University context is missing.';

    try {
      const program = await prisma.program.findUnique({
        where: { id: programId },
        include: {
          university: {
            select: {
              id: true,
              name: true,
              website: true
            }
          }
        }
      });

      if (!program || program.universityId !== universityId) {
        return 'Program not found in this university.';
      }

      let requirements = 'Visit the university website for detailed requirements.';
      try {
        const searchResults = await searchKnowledge(program.universityId, `Admissions requirements for ${program.name}`, 3);
        if (searchResults && searchResults.length > 0) {
          requirements = searchResults.map(r => r.payload?.content).join('\n\n');
        }
      } catch (e) {
        console.warn('Could not fetch additional requirements from Qdrant:', e);
      }

      return JSON.stringify({
        ...program,
        admissionsRequirements: requirements
      }, null, 2);
    } catch (error) {
      console.error('Error in get_program_details tool:', error);
      return 'An error occurred while fetching program details.';
    }
  },
});

/**
 * Tool to get upcoming deadlines for a program or university.
 */
export const get_deadlines = new DynamicStructuredTool({
  name: 'get_deadlines',
  description: 'Get upcoming application deadlines for a specific program.',
  schema: z.object({
    programId: z.string().describe('The unique ID of the program.'),
  }),
  func: async ({ programId }: { programId: string }, _runManager, config?: RunnableConfig) => {
    const universityId = config?.configurable?.universityId;
    if (!universityId) return 'Error: University context is missing.';

    try {
      const deadlines = await prisma.deadline.findMany({
        where: { 
          programId,
          program: { universityId }
        },
        orderBy: { applicationDeadline: 'asc' },
      });

      if (deadlines.length === 0) {
        return 'No deadlines found for this program.';
      }

      return JSON.stringify(deadlines, null, 2);
    } catch (error) {
      console.error('Error in get_deadlines tool:', error);
      return 'An error occurred while fetching deadlines.';
    }
  },
});
