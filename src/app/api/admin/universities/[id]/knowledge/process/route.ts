import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// ─── Extraction Schemas ───────────────────────────────────────────

const DeadlineSchema = z.object({
  roundName: z.string().describe('Name of the application round (e.g. Round 1, Early Action, Fall 2024)'),
  applicationDeadline: z.string().describe('ISO date string (YYYY-MM-DDT00:00:00Z). If only month/year is given, use the 1st of the month.'),
  decisionDate: z.string().optional().nullable().describe('ISO date string (YYYY-MM-DDT00:00:00Z)'),
});

const ProgramSchema = z.object({
  name: z.string().describe('Full name of the academic program'),
  department: z.string().optional().nullable().describe('Department offering the program'),
  degreeType: z.enum(['BS', 'MS', 'MBA', 'PHD', 'ASSOCIATE', 'CERTIFICATE']).describe('Degree type (must be one of the enums)'),
  durationMonths: z.number().optional().nullable().describe('Duration of the program in months'),
  tuitionPerYear: z.number().optional().nullable().describe('Tuition cost per year in USD'),
  deadlines: z.array(DeadlineSchema).describe('List of application deadlines for this program'),
});

const ScholarshipSchema = z.object({
  name: z.string().describe('Name of the scholarship'),
  amount: z.string().optional().nullable().describe('Amount or value of the scholarship (e.g. $10,000, Full Tuition)'),
  description: z.string().optional().nullable().describe('Brief description of the scholarship'),
  deadline: z.string().optional().nullable().describe('ISO date string for the application deadline'),
  eligibility: z.string().optional().nullable().describe('Eligibility criteria for the scholarship'),
});

const ExtractionSchema = z.object({
  programs: z.array(ProgramSchema).describe('List of academic programs accurately extracted from the text'),
  scholarships: z.array(ScholarshipSchema).describe('List of scholarships extracted from the text'),
  universityDescription: z.string().optional().nullable().describe('A refined, high-level summary of the university based on Campus Life and Staff docs'),
});

// ─── API Handler ───────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: universityId } = await params;

    if (!universityId) {
      return NextResponse.json({ message: 'University ID is required' }, { status: 400 });
    }

    // 1. Fetch ALL knowledge docs for the university
    const docs = await prisma.universityKnowledgeDoc.findMany({
      where: { universityId },
      select: {
        id: true,
        content: true,
        category: true,
      },
    });

    if (!docs || docs.length === 0) {
      return NextResponse.json(
        { message: 'No knowledge documents found to process' },
        { status: 404 }
      );
    }

    // 2. Combine into one context blocks
    const combinedContent = docs
      .map((doc) => `--- Category: ${doc.category} ---\n\n${doc.content}`)
      .join('\n\n');

    // 3. Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash', // Using best available flash model
      temperature: 0.1,
    });

    const structuredModel = model.withStructuredOutput(ExtractionSchema);

    const prompt = `
      You are an elite institutional data analyst. Analyze the provided knowledge base documents for this university and extract the following:
      
      1. **Programs**: Detailed list of academic programs, their departments, tuition, and all specific deadlines.
      2. **Scholarships**: All available financial aid, grants, and scholarships mentioned.
      3. **Identity**: A polished, descriptive summary of the campus life and administrative strengths.
      
      Map degree types strictly to: BS, MS, MBA, PHD, ASSOCIATE, CERTIFICATE.
      Format all dates to ISO-8601 strings.
      
      University Context:
      ${combinedContent}
    `;

    const result = (await structuredModel.invoke(prompt)) as z.infer<typeof ExtractionSchema>;

    if (!result) {
      return NextResponse.json({ message: 'AI extraction failed' }, { status: 500 });
    }

    // 4. Update Database within a transaction
    await prisma.$transaction(async (tx) => {
      // A. Update University Description if provided
      if (result.universityDescription) {
        await tx.university.update({
          where: { id: universityId },
          data: { description: result.universityDescription },
        });
      }

      // B. Process Programs & Deadlines
      // Note: We clean existing programs/scholarships to avoid duplicates on re-extraction
      await tx.program.deleteMany({ where: { universityId } });
      await tx.scholarship.deleteMany({ where: { universityId } });

      for (const prog of result.programs) {
        const programRecord = await tx.program.create({
          data: {
            universityId,
            name: prog.name,
            department: prog.department,
            degreeType: prog.degreeType,
            durationMonths: prog.durationMonths,
            tuitionPerYear: prog.tuitionPerYear,
          },
        });

        if (prog.deadlines && prog.deadlines.length > 0) {
          await tx.deadline.createMany({
            data: prog.deadlines.map((dl) => ({
              programId: programRecord.id,
              roundName: dl.roundName,
              applicationDeadline: new Date(dl.applicationDeadline),
              decisionDate: dl.decisionDate ? new Date(dl.decisionDate) : null,
            })),
          });
        }
      }

      // C. Process Scholarships
      if (result.scholarships && result.scholarships.length > 0) {
        await tx.scholarship.createMany({
          data: result.scholarships.map((s) => ({
            universityId,
            name: s.name,
            amount: s.amount,
            description: s.description,
            deadline: s.deadline ? new Date(s.deadline) : null,
            eligibility: s.eligibility,
          })),
        });
      }

      // D. Mark docs as processed
      await tx.universityKnowledgeDoc.updateMany({
        where: { id: { in: docs.map((d) => d.id) } },
        data: { processedAt: new Date() },
      });
    });

    return NextResponse.json({
      message: 'Processing complete',
      stats: {
        programs: result.programs.length,
        scholarships: result.scholarships.length,
      },
    });
  } catch (error: any) {
    console.error('Extraction Error:', error);
    return NextResponse.json(
      { message: 'Extraction failed', error: error.message },
      { status: 500 }
    );
  }
}

