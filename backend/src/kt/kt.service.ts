import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnnxService } from './onnx.service';

@Injectable()
export class KtService {
    private readonly logger = new Logger(KtService.name);

    constructor(
        private prisma: PrismaService,
        private onnxService: OnnxService,
    ) { }

    async updateMastery(studentId: string, conceptId: string, isCorrect: boolean) {
        // 1. Fetch student history (simplified for DKT context)
        // ideally we get the sequence of (concept_id, is_correct) pairs
        const history = await this.prisma.response.findMany({
            where: { studentId },
            orderBy: { timestamp: 'asc' },
            take: 50, // Context window
        });

        // 2. Prepare sequence for ONNX
        // This is a placeholder transformation. 
        // Real DKT requires mapping concept IDs to integers and one-hot encoding or embedding.
        const sequence = history.map(h => [
            // concept_id mapping would happen here
            h.isCorrect ? 1 : 0
        ]);

        // 3. Run Inference
        const predictedMastery = await this.onnxService.runInference(sequence);

        // 4. Update MemoryEntry or Student State
        // Find existing memory entry for this concept
        const memoryEntry = await this.prisma.memoryEntry.findFirst({
            where: { studentId, conceptId }
        });

        if (memoryEntry) {
            await this.prisma.memoryEntry.update({
                where: { id: memoryEntry.id },
                data: { masteryProbability: predictedMastery }
            });
            this.logger.log(`Updated mastery for student ${studentId} on concept ${conceptId} to ${predictedMastery}`);
        }

        return predictedMastery;
    }
}
