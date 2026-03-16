import { PrismaClient, University, Program } from '@prisma/client'

const prisma = new PrismaClient()

export class UniversityService {
  /**
   * Fetch all universities with basic stats
   */
  static async getAllUniversities() {
    return await prisma.university.findMany({
      orderBy: {
        ranking: 'asc'
      },
      include: {
        _count: {
          select: { programs: true }
        }
      }
    })
  }

  /**
   * Get a detailed university profile with all programs
   */
  static async getUniversityById(id: string) {
    return await prisma.university.findUnique({
      where: { id },
      include: {
        programs: true
      }
    })
  }

  /**
   * Create or update a university profile
   */
  static async upsertUniversity(data: Partial<University>) {
    if (data.id) {
      return await prisma.university.update({
        where: { id: data.id },
        data: data as any
      })
    }
    
    return await prisma.university.create({
      data: data as any
    })
  }

  /**
   * Delete a university (and its programs)
   */
  static async deleteUniversity(id: string) {
    return await prisma.university.delete({
      where: { id }
    })
  }
}
