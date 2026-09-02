import { prisma } from "../config/prisma";

export class UsageTrackerService {
  /**
   * Sync and recalculate tenant resource consumption in real-time
   */
  static async syncTenantUsage(instituteId: string) {
    const [studentCount, courseCount, batchCount, testsCount] = await Promise.all([
      prisma.student.count({ where: { instituteId } }),
      prisma.course.count({ where: { instituteId } }),
      prisma.batch.count({ where: { instituteId } }),
      prisma.test.count({
        where: {
          instituteId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return prisma.tenantUsage.upsert({
      where: { instituteId },
      update: {
        studentCount,
        courseCount,
        batchCount,
        testsCreatedThisMonth: testsCount
      },
      create: {
        instituteId,
        studentCount,
        courseCount,
        batchCount,
        testsCreatedThisMonth: testsCount
      }
    });
  }

  /**
   * Increment storage consumption
   */
  static async addStorageUsage(instituteId: string, bytes: number) {
    const mb = bytes / (1024 * 1024);
    return prisma.tenantUsage.upsert({
      where: { instituteId },
      update: {
        storageUsedMB: { increment: mb }
      },
      create: {
        instituteId,
        storageUsedMB: mb
      }
    });
  }
}
