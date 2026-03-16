import { PrismaClient, Program } from '@prisma/client'

const prisma = new PrismaClient()

export class ProgramService {
  /**
   * Fetch all programs for a specific university
   */
  static async getProgramsByUniversity(universityId: string) {
    return await prisma.program.findMany({
      where: { universityId },
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Add a new program to a university
   */
  static async createProgram(universityId: string, data: Partial<Program>) {
    return await prisma.program.create({
      data: {
        ...data as any,
        universityId
      }
    })
  }

  /**
   * Update an existing program
   */
  static async updateProgram(id: string, data: Partial<Program>) {
    return await prisma.program.update({
      where: { id },
      data: data as any
    })
  }

  /**
   * Delete a program
   */
  static async deleteProgram(id: string) {
    return await prisma.program.delete({
      where: { id }
    })
  }

  /**
   * Get a single program by ID
   */
  static async getProgramById(id: string) {
    return await prisma.program.findUnique({
      where: { id }
    })
  }
}
