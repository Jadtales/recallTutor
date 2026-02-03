import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { QuizModule } from './quiz/quiz.module';
import { StudentModule } from './student/student.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { EstimationModule } from './estimation/estimation.module';
import { ChromaModule } from './knowledge/chroma.module';
import { RagModule } from './rag/rag.module';
import { KtModule } from './kt/kt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    OrchestratorModule,
    KnowledgeModule,
    QuizModule,
    StudentModule,
    // SchedulingModule,
    TasksModule,
    EstimationModule,
    ChromaModule,
    RagModule,
    KtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
