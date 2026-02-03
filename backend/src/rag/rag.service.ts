import { Injectable, Logger } from '@nestjs/common';
import { ChromaService } from '../knowledge/chroma.service';
import { DeepSeekService } from '../estimation/deepseek.service';

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);

    constructor(
        private chromaService: ChromaService,
        private deepSeekService: DeepSeekService,
    ) { }

    async retrieveSimilarTasks(description: string, topK: number = 3) {
        this.logger.log(`Retrieving similar tasks via RAG for: "${description.substring(0, 30)}..."`);

        // 1. Vectorize query
        const vector = await this.deepSeekService.generateEmbedding(description);

        // 2. Query Chroma
        const results = await this.chromaService.querySimilar(vector, topK);

        // 3. Format results 
        return results.map(match => ({
            taskId: match.metadata?.taskId,
            description: match.document,
            actual_effort: match.metadata?.actual_effort,
            similarity: match.similarity || 0,
        })).filter(r => r.actual_effort); // Only return context with known effort
    }
}

