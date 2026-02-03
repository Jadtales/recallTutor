import { Injectable } from '@nestjs/common';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { VectorService } from './vector.service';
import { QuizService } from '../quiz/quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IngestService {
    constructor(
        private orchestratorService: OrchestratorService,
        private vectorService: VectorService,
        private quizService: QuizService,
        private prisma: PrismaService,
    ) { }

    async ingestDocument(content: string, metadata: any = {}, studentId: string = 'student-1') {
        console.log('IngestService: Starting ingestDocument');
        try {
            // 1. Extract concepts
            const concepts = await this.orchestratorService.extractConcepts(content);
            console.log('Extracted Concepts:', concepts);

            // 2. Process each concept
            for (const concept of concepts) {
                console.log('Processing concept:', concept.label);
                const conceptId = uuidv4();
                const textToEmbed = `${concept.label}: ${concept.definition || ''}`;

                // 3. Embed
                const vector = await this.orchestratorService.embedText(textToEmbed);

                // 4. Store in Vector DB
                await this.vectorService.upsert(conceptId, vector, {
                    ...metadata,
                    type: 'concept',
                    label: concept.label,
                    definition: concept.definition,
                    original_text: content.substring(0, 100), // Store snippet or reference
                });

                // 5. Store in Relational DB
                await this.prisma.concept.create({
                    data: {
                        id: conceptId,
                        label: concept.label,
                    }
                });

                // 5b. Create Memory Entry for Student
                let course = await this.prisma.course.findFirst();
                if (!course) {
                    course = await this.prisma.course.create({ data: { name: 'General', description: 'Default' } });
                }

                // Ensure Student exists
                let student = await this.prisma.student.findUnique({ where: { email: 'student@example.com' } });

                if (!student) {
                    student = await this.prisma.student.upsert({
                        where: { email: 'student@example.com' },
                        update: {},
                        create: { id: studentId, email: 'student@example.com', name: 'Demo Student' },
                    });
                }

                await this.prisma.memoryEntry.create({
                    data: {
                        studentId: student.id,
                        conceptId: conceptId,
                        courseId: course.id,
                        masteryProbability: 0.5,
                        nextReview: new Date(),
                        lastReview: null
                    }
                });

                // 6. Generate Initial Quiz
                await this.quizService.generateQuizForConcept(conceptId, 'easy');
            }

            // Audit Log
            await this.prisma.auditLog.create({
                data: {
                    action: 'ingest_document',
                    payload: { studentId, conceptsCount: concepts.length, metadata },
                    timestamp: new Date(),
                }
            });

            return { status: 'ingested', conceptsCount: concepts.length };
        } catch (error) {
            console.error('Ingest Error:', error);
            // throw error; // Don't throw, return error for debugging
            return { status: 'error', message: error.message, stack: error.stack };
        }
    }
}
