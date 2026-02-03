import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { QuizModule } from '../quiz/quiz.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [QuizModule, PrismaModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulingModule { }
