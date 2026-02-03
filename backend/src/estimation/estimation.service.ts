import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeepSeekService } from './deepseek.service';
import { RagService } from '../rag/rag.service';

@Injectable()
export class EstimationService {
    private readonly logger = new Logger(EstimationService.name);

    constructor(
        private prisma: PrismaService,
        private deepSeekService: DeepSeekService,
        private ragService: RagService,
    ) { }

    async estimateTask(taskId: number) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // 1. Retrieve Similar Tasks (RAG)
        const similarTasks = await this.ragService.retrieveSimilarTasks(task.description);

        // 2. Construct Prompt
        const context = `You are an expert software estimator.
    Your goal is to estimate the effort (in story points) for a new task based on historical data.
    
    Historical Tasks:
    ${similarTasks.map(t => `- Description: ${t.description}\n  Actual Effort: ${t.actual_effort}\n  Similarity: ${(t.similarity * 100).toFixed(1)}%`).join('\n\n')}
    `;

        const prompt = `New Task:
    Title: ${task.title}
    Description: ${task.description}
    
    Instruction: Estimate the effort for the new task and explain your reasoning based on the similar tasks provided.
    Output JSON format: { "effort": "X story points", "explanation": "..." }`;

        // 3. Call DeepSeek
        const prediction = await this.deepSeekService.generateCompletionJson(prompt, context);

        // 4. Parse Prediction
        let effort = "Unknown";
        let explanation = "No explanation provided";

        if (prediction) {
            effort = prediction.effort || effort;
            explanation = prediction.explanation || explanation;
            if (!prediction.effort && !prediction.explanation) {
                // Fallback if structure is different
                explanation = JSON.stringify(prediction);
            }
        }

        // 5. Save History
        const history = await this.prisma.estimationHistory.create({
            data: {
                taskId: task.id,
                predicted_effort: effort,
                explanation_text: explanation,
            }
        });

        return history;
    }

    async refineEstimate(estimateId: number, feedback: string) {
        const history = await this.prisma.estimationHistory.findUnique({
            where: { id: estimateId },
            include: { task: true }
        });

        if (!history) throw new NotFoundException(`EstimationHistory ${estimateId} not found`);

        // MCP Pattern: "The LLM analyzes the feedback... and calls the tool to adjust"
        // We simulate the tool call here by processing the feedback and asking for adjustment.

        const context = `You are an expert software estimator.
    Previous Estimate: ${history.predicted_effort}
    Explanation: ${history.explanation_text}
    Task Description: ${history.task.description}
    `;

        const prompt = `User Feedback: ${feedback}
    
    Instruction: Analyze the feedback and adjust the estimate. 
    Output JSON format: { "adjusted_effort": "X story points", "reasoning": "..." }`;

        const predictionRaw = await this.deepSeekService.generateCompletion(prompt, context);

        let adjustedEffort = history.predicted_effort;
        let reasoning = predictionRaw;

        try {
            const jsonMatch = predictionRaw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                adjustedEffort = parsed.adjusted_effort || adjustedEffort;
                reasoning = parsed.reasoning || reasoning;
            }
        } catch (e) {
            this.logger.warn('Failed to parse JSON from LLM refinement', e);
        }

        // Save Feedback
        await this.prisma.feedback.create({
            data: {
                estimationId: history.id,
                feedback_text: feedback,
                adjusted_estimate: adjustedEffort
            }
        });

        return {
            original_estimate: history.predicted_effort,
            adjusted_estimate: adjustedEffort,
            reasoning
        };
    }
}
