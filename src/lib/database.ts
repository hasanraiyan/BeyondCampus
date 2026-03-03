import { PrismaClient, Prisma, TwinStatus } from '@prisma/client'

const prisma = new PrismaClient()

export const database = {
  async createTwin(twinData: Prisma.TwinUncheckedCreateInput, customId?: string) {
    return prisma.twin.create({
      data: customId ? { ...twinData, id: customId } : twinData,
    })
  },

  async findTwin(twinId: string, userId?: string) {
    return prisma.twin.findFirst({
      where: {
        id: twinId,
        ...(userId ? { user_id: userId } : {}),
      },
    })
  },

  async findTwinBySlug(slug: string) {
    return prisma.twin.findFirst({
      where: {
        public_url: slug,
        status: TwinStatus.PUBLISHED,
      },
    })
  },

  async updateTwin(twinId: string, updates: Prisma.TwinUncheckedUpdateInput) {
    try {
      return await prisma.twin.update({
        where: { id: twinId },
        data: updates,
      })
    } catch {
      return null
    }
  },

  async getAllTwins() {
    return prisma.twin.findMany({
      orderBy: { created_at: 'desc' },
    })
  },

  async getUserTwins(userId: string) {
    return prisma.twin.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })
  },

  async createUser(userData: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({
      data: userData,
    })
  },

  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    })
  },

  async updateUser(userId: string, updates: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data: updates,
    })
  },

  async createSession(sessionData: Prisma.TwinSessionUncheckedCreateInput) {
    return prisma.twinSession.create({
      data: sessionData,
    })
  },

  async getTwinSessions(twinId: string) {
    return prisma.twinSession.findMany({
      where: { twin_id: twinId },
      orderBy: { created_at: 'desc' },
    })
  },
}