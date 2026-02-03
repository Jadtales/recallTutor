import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { ConceptService } from './concept.service';
import { VectorService } from './vector.service';
import { VectorModule } from './vector.module';

import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { QuizModule } from '../quiz/quiz.module';

import { KnowledgeController } from './knowledge.controller';

@Module({
    imports: [OrchestratorModule, QuizModule, VectorModule], // Added VectorModule
    controllers: [KnowledgeController],
    providers: [IngestService, ConceptService], // Removed VectorService
    exports: [IngestService, ConceptService], // Removed VectorService
})
export class KnowledgeModule { }
