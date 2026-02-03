import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
    constructor(private prisma: PrismaService) { }

    async getProfile(id: string) {
        // Placeholder
        return { id, name: 'Student' };
    }

    async getStats(studentId: string) {
        // 1. Concepts Mastered (mastery > 0.8)
        const masteredCount = await this.prisma.memoryEntry.count({
            where: {
                studentId,
                masteryProbability: { gt: 0.8 }
            }
        });

        // 2. Current Streak
        // Get all dates with at least one response
        const responses = await this.prisma.response.findMany({
            where: { studentId },
            select: { timestamp: true },
            orderBy: { timestamp: 'desc' }
        });

        const uniqueDates = new Set(responses.map(r => r.timestamp.toISOString().split('T')[0]));
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let currentCheck = new Date();

        // Check if active today
        if (uniqueDates.has(today)) {
            streak = 1;
            currentCheck.setDate(currentCheck.getDate() - 1); // Check yesterday
        }

        while (true) {
            const dateStr = currentCheck.toISOString().split('T')[0];
            if (uniqueDates.has(dateStr)) {
                streak++;
                currentCheck.setDate(currentCheck.getDate() - 1);
            } else {
                break;
            }
        }

        // 3. Time Spent (Sum of latencyMs)
        const aggregate = await this.prisma.response.aggregate({
            _sum: { latencyMs: true },
            where: { studentId }
        });
        const totalMs = aggregate._sum.latencyMs || 0;
        const hours = Math.floor(totalMs / 1000 / 60 / 60);
        const minutes = Math.floor((totalMs / 1000 / 60) % 60);
        const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        // 4. Retention Rate (average mastery)
        const avgMastery = await this.prisma.memoryEntry.aggregate({
            _avg: { masteryProbability: true },
            where: { studentId }
        });

        return {
            conceptsMastered: masteredCount,
            streak: `${streak} Days`,
            timeSpent: timeSpent === '0m' && totalMs > 0 ? '< 1m' : timeSpent,
            retentionRate: `${Math.round((avgMastery._avg.masteryProbability || 0) * 100)}%`
        };
    }
}
