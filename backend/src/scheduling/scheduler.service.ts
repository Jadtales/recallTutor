import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QuizService } from '../quiz/quiz.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private prisma: PrismaService,
        private quizService: QuizService,
    ) { }

    // Forgetting curve: R = e^(-t/S)
    // We want to review when R drops below threshold (e.g. 0.7)
    // t = -S * ln(R)
    // S (stability) increases with successful reviews.

    calculateNextReview(lastReview: Date, stability: number, targetRetention: number = 0.7): Date {
        const daysUntilReview = -stability * Math.log(targetRetention);
        // daysUntilReview is in days. Convert to ms.
        const nextReview = new Date(lastReview.getTime() + daysUntilReview * 24 * 60 * 60 * 1000);
        return nextReview;
    }

    @Cron(CronExpression.EVERY_MINUTE) // Running every minute for demo purposes; use EVERY_DAY_AT_MIDNIGHT for prod
    async handleCron() {
        this.logger.debug('Checking for due reviews...');

        const now = new Date();
        const dueEntries = await this.prisma.memoryEntry.findMany({
            where: {
                nextReview: {
                    lte: now,
                },
            },
            include: {
                concept: true,
                student: true,
            },
            take: 10, // Process in batches
        });

        if (dueEntries.length === 0) {
            this.logger.debug('No due reviews found.');
            return;
        }

        this.logger.log(`Found ${dueEntries.length} due reviews.`);

        for (const entry of dueEntries) {
            try {
                // Generate a review quiz
                await this.quizService.generateQuizForConcept(entry.conceptId, 'medium');

                // Update nextReview to tomorrow to avoid re-generating immediately (rudimentary lockout)
                // Real logic should wait for user response to update schedule based on performance.
                // Here we just "schedule" the collection of the result.
                // For now, bump it by 1 day so we don't spam.
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                await this.prisma.memoryEntry.update({
                    where: { id: entry.id },
                    data: { nextReview: tomorrow }, // Tentative bump
                });

                this.logger.log(`Generated review quiz for concept: ${entry.concept.label} (Student: ${entry.student.email})`);

            } catch (error) {
                this.logger.error(`Failed to generate review for entry ${entry.id}`, error);
            }
        }
    }
}
