import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { embedPrograms } from '@/lib/qdrant';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Basic authorization check
    const authHeader = req.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'default_dev_secret';

    // Using Bearer token or simple secret comparison
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      console.warn('[Migration] Unauthorized migration attempt.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Migration] Starting program vectors migration to shared collection...');

    // 1. Fetch all programs from Prisma
    const programs = await prisma.program.findMany({
      include: {
        university: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!programs || programs.length === 0) {
      console.log('[Migration] No programs found in database.');
      return NextResponse.json({ message: 'No programs found to migrate' }, { status: 200 });
    }

    console.log(`[Migration] Found ${programs.length} programs to migrate.`);

    // 2. Group programs by university to process them in batches efficiently
    const programsByUniversity = programs.reduce((acc, program) => {
      const uId = program.universityId;
      if (!acc[uId]) {
        acc[uId] = [];
      }
      acc[uId].push({
        id: program.id,
        name: program.name,
        department: program.department ?? null,
        degreeType: program.degreeType,
        durationMonths: program.durationMonths ?? null,
        tuitionPerYear: program.tuitionPerYear ?? null,
        applyUrl: program.applyUrl ?? null,
        universityId: program.universityId,
      });
      return acc;
    }, {} as Record<string, any[]>);

    let totalEmbedded = 0;

    // 3. Process each university's programs
    for (const [universityId, universityPrograms] of Object.entries(programsByUniversity)) {
      console.log(`[Migration] Re-embedding ${universityPrograms.length} programs for university ${universityId}...`);

      try {
        await embedPrograms(universityId, universityPrograms);
        totalEmbedded += universityPrograms.length;

        // Update the embeddedAt timestamp for these programs securely
        await prisma.program.updateMany({
          where: { universityId: universityId },
          data: { embeddedAt: new Date() },
        });

      } catch (embedError) {
        console.error(`[Migration] Failed to embed programs for university ${universityId}:`, embedError);
        // Continue processing other universities even if one fails
      }
    }

    console.log(`[Migration] Successfully re-embedded ${totalEmbedded} programs.`);

    return NextResponse.json(
      {
        message: 'Migration completed successfully',
        totalMigrated: totalEmbedded
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Migration] Critical error during migration:', error);
    return NextResponse.json(
      { error: 'Failed to run migration script' },
      { status: 500 }
    );
  }
}
