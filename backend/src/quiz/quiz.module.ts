import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { StudentModule } from '../student/student.module';
import { PrismaModule } from '../prisma/prisma.module';

import { VectorModule } from '../knowledge/vector.module';

@Module({
    imports: [OrchestratorModule, StudentModule, PrismaModule, VectorModule],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService],
})
export class QuizModule { }
