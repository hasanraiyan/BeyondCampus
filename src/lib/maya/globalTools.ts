import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { searchAllPrograms } from '@/lib/qdrant';
import { ProgramDegreeType } from '@prisma/client';

/**
 * Tool to list all available universities.
 */
export const get_all_universities = new DynamicStructuredTool({
  name: 'get_all_universities',
  description: 'List all universities available in the system. Use this to find universities that the student might be interested in.',
  schema: z.object({}),
  func: async () => {
    try {
      const universities = await prisma.university.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          website: true,
        },
      });

      if (universities.length === 0) {
        return 'No universities found.';
      }

      return JSON.stringify(universities, null, 2);
    } catch (error) {
      console.error('Error in get_all_universities tool:', error);
      return 'An error occurred while fetching universities.';
    }
  },
});

/**
 * Tool to list programs offered across ALL universities.
 * Supports both structured DB queries and semantic search via Qdrant.
 */
export const global_list_programs = new DynamicStructuredTool({
  name: 'global_list_programs',
  description:
    'List or discover programs offered across ALL universities. ' +
    'Use useSemanticSearch=true for vague, open-ended queries (e.g. "programs related to AI", "low tuition options", "best programs for data science career"). ' +
    'Use useSemanticSearch=false (default) for exact lookups filtered by degreeType or department.',
  schema: z.object({
    degreeType: z
      .nativeEnum(ProgramDegreeType)
      .optional()
      .describe('Filter by degree level (e.g., BS, MS, MBA, PHD). Only used when useSemanticSearch is false.'),
    department: z
      .string()
      .optional()
      .describe('Filter by department name (e.g., Computer Science). Only used when useSemanticSearch is false.'),
    query: z
      .string()
      .optional()
      .describe('A semantic search query to find relevant programs globally. Required when useSemanticSearch is true.'),
    useSemanticSearch: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Set to true to use semantic/vector search to find programs by meaning globally. ' +
        'Set to false (default) to use exact structured DB filters (degreeType, department).'
      ),
  }),
  func: async ({
    degreeType,
    department,
    query,
    useSemanticSearch,
  }: {
    degreeType?: ProgramDegreeType;
    department?: string;
    query?: string;
    useSemanticSearch?: boolean;
  }) => {
    try {
      if (useSemanticSearch) {
        if (!query) {
          return 'A query string is required for global semantic search. Please provide what kind of programs the student is looking for.';
        }

        const results = await searchAllPrograms(query, 10);

        if (!results || results.length === 0) {
          return 'No programs found globally via semantic search. Try using structured search instead.';
        }

        const programIds = results.map((r) => r.payload?.programId).filter(Boolean) as string[];

        // Fetch university names for context
        const programsWithUniversities = await prisma.program.findMany({
          where: { id: { in: programIds } },
          select: {
            id: true,
            university: {
              select: { name: true }
            }
          }
        });

        const universityMap = new Map(
          programsWithUniversities.map(p => [p.id, p.university.name])
        );

        const programs = results.map((r) => ({
          id: r.payload?.programId,
          name: r.payload?.name,
          department: r.payload?.department,
          degreeType: r.payload?.degreeType,
          durationMonths: r.payload?.durationMonths,
          tuitionPerYear: r.payload?.tuitionPerYear,
          applyUrl: r.payload?.applyUrl,
          universityName: r.payload?.programId ? universityMap.get(r.payload.programId as string) : 'Unknown',
          _relevanceScore: Math.round((r.score ?? 0) * 100) / 100,
        }));

        return JSON.stringify(programs, null, 2);
      }

      const programs = await prisma.program.findMany({
        where: {
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
          university: {
            select: {
              name: true,
            }
          }
        } as any,
        take: 20, // Limit results to prevent massive payloads
      });

      if (programs.length === 0) {
        return 'No programs found globally matching the criteria.';
      }

      return JSON.stringify(programs, null, 2);
    } catch (error) {
      console.error('Error in global_list_programs tool:', error);
      return 'An error occurred while listing programs globally.';
    }
  },
});

/**
 * Tool to get detailed information about a specific program, anywhere.
 */
export const global_get_program_details = new DynamicStructuredTool({
  name: 'global_get_program_details',
  description: 'Get full details for a specific program using its programId, including tuition, duration, and requirements.',
  schema: z.object({
    programId: z.string().describe('The unique ID of the program.'),
  }),
  func: async ({ programId }: { programId: string }) => {
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

      if (!program) {
        return 'Program not found.';
      }

      return JSON.stringify(program, null, 2);
    } catch (error) {
      console.error('Error in global_get_program_details tool:', error);
      return 'An error occurred while fetching program details.';
    }
  },
});

export const globalToolbox = [get_all_universities, global_list_programs, global_get_program_details];
