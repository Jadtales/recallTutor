import { Injectable } from '@nestjs/common';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { KtEngine } from '../student/kt.engine';
import { VectorService } from '../knowledge/vector.service';

@Injectable()
export class QuizService {
  constructor(
    private orchestratorService: OrchestratorService,
    private prisma: PrismaService,
    private ktEngine: KtEngine,
    private vectorService: VectorService,
  ) { }

  async generateQuizForConcept(
    conceptId: string,
    difficulty: string = 'medium',
  ) {
    const concept = await this.prisma.concept.findUnique({
      where: { id: conceptId },
    });
    if (!concept) {
      throw new Error('Concept not found');
    }

    // RAG: 1. Embed concept label
    const embedding = await this.orchestratorService.embedText(concept.label);

    // RAG: 2. Retrieve relevant context
    const retrieval = await this.vectorService.query(embedding, 3);
    const context = retrieval.matches.map(m => m.metadata?.text || m.metadata?.definition || m.metadata?.original_text || '').join('\n\n');

    // RAG: 3. Create Quiz with Context
    const quizData = await this.orchestratorService.generateQuiz(
      concept.label,
      difficulty,
      context
    );

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        action: 'generate_quiz',
        payload: { conceptId, label: concept.label, difficulty, contextLength: context.length },
        timestamp: new Date(),
      }
    });

    // Save to DB
    const quiz = await this.prisma.quiz.create({
      data: {
        title: `Micro-quiz: ${concept.label}`,
        questions: {
          create: {
            text: quizData.question,
            type: 'multiple-choice',
            options: quizData.options,
            answer: quizData.answer,
            conceptId: concept.id,
          },
        },
      },
      include: {
        questions: true,
      },
    });

    return quiz;
  }

  async getPendingQuizzes(studentId: string) {
    // Find concepts due for review
    let dueEntries = await this.prisma.memoryEntry.findMany({
      where: {
        studentId,
        // In production, use nextReview: { lte: new Date() }
      },
      orderBy: { nextReview: 'asc' },
      take: 3,
      include: { concept: true }
    });

    // Fallback: If no due entries, pick *any* concepts so the user can practice
    if (dueEntries.length === 0) {
      const allConcepts = await this.prisma.concept.findMany({ take: 3 });
      // Create memory entries on the fly for them
      for (const concept of allConcepts) {
        const entry = await this.prisma.memoryEntry.create({
          data: {
            studentId,
            conceptId: concept.id,
            courseId: (await this.prisma.course.findFirst())?.id || '',
            masteryProbability: 0.5,
            nextReview: new Date()
          },
          include: { concept: true }
        });
        dueEntries.push(entry);
      }
    }

    const quizzes: any[] = [];
    for (const entry of dueEntries) {
      // Generate or fetch a question for this concept
      // We can generate on the fly if needed
      let quizData = await this.orchestratorService.generateQuiz(entry.concept.label, 'medium');

      // Validate quizData structure
      if (!quizData || !quizData.question || !quizData.answer || !Array.isArray(quizData.options)) {
        console.warn(`Invalid quiz data for concept ${entry.concept.label}:`, quizData);
        // Use fallback if LLM returned partial/invalid data
        quizData = {
          question: `What is ${entry.concept.label}? (Fallback)`,
          options: ['Concept', 'Process', 'Tool', 'Metric'],
          answer: 'Concept',
          distractors: ['Process', 'Tool', 'Metric']
        };
      }

      // We return a structure the frontend can use
      quizzes.push({
        conceptId: entry.conceptId,
        conceptLabel: entry.concept.label,
        question: quizData.question,
        options: quizData.options,
        id: 'temp-question-' + Date.now() + Math.random(), // Temp ID initially
      });

      // Attempt to save to DB
      try {
        if (quizData.question && quizData.answer) {
          const savedQuiz = await this.prisma.quiz.create({
            data: {
              title: `Review: ${entry.concept.label}`,
              questions: {
                create: {
                  text: quizData.question,
                  type: 'multiple-choice',
                  options: quizData.options as any, // Cast to any to satisfy Prisma InputJsonValue
                  answer: quizData.answer,
                  conceptId: entry.conceptId
                }
              }
            },
            include: { questions: true }
          });
          // Update the ID in the returned array so frontend uses the real ID
          quizzes[quizzes.length - 1].id = savedQuiz.questions[0].id;
        }
      } catch (dbError) {
        console.error(`Failed to save quiz for concept ${entry.concept.label}:`, dbError);
      }
    }
    return quizzes;
  }

  async submitResponse(studentId: string, questionId: string, selectedOption: string, latency: number) {
    // 1. Find the question
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { concept: true }
    });
    if (!question) throw new Error('Question not found');

    const isCorrect = question.answer === selectedOption;

    // 2. Log Response
    await this.prisma.response.create({
      data: {
        studentId,
        questionId,
        isCorrect,
        latencyMs: latency,
      }
    });

    // 3. Update Mastery (KT)
    const memoryEntry = await this.prisma.memoryEntry.findFirst({
      where: { studentId, conceptId: question.conceptId }
    });

    if (memoryEntry) {
      const newMastery = this.ktEngine.updateMastery(memoryEntry.masteryProbability, isCorrect);

      // 4. Schedule next review (Forgetting Curve / Spaced Repetition)
      // stability roughly correlates with mastery or count of correct reviews
      // Simplified: stability = 1 + consecutive_correct (we don't track consecutive here, just mastery as proxy)
      const stability = Math.max(0.5, newMastery * 10);

      // Calculate next review
      // Calculate next review (Forgetting Curve simplified local logic)
      const daysUntilReview = -stability * Math.log(0.7);
      const nextReviewDate = new Date(new Date().getTime() + daysUntilReview * 24 * 60 * 60 * 1000);

      await this.prisma.memoryEntry.update({
        where: { id: memoryEntry.id },
        data: {
          masteryProbability: newMastery,
          lastReview: new Date(),
          nextReview: nextReviewDate,
        }
      });

      return {
        correct: isCorrect,
        correctAnswer: question.answer,
        newMastery,
        nextReview: nextReviewDate
      };
    }

    return { correct: isCorrect, correctAnswer: question.answer };
  }
}
