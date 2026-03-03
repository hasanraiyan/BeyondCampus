import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export { prisma }

export const database = {
  async createUser(userData: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({
      data: userData,
    })
  },

  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        testScores: { orderBy: { createdAt: 'desc' } },
        profileFields: { orderBy: { createdAt: 'desc' } },
      },
    })
  },

  async updateUser(userId: string, updates: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data: updates,
    })
  },
}
