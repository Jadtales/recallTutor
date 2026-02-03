import { Injectable } from '@nestjs/common';
import { DeepSeekService } from '../estimation/deepseek.service';

@Injectable()
export class OrchestratorService {
    constructor(private deepSeekService: DeepSeekService) { }

    async extractConcepts(text: string): Promise<any[]> {
        const prompt = `You are an expert tutor. Extract key concepts from the following text. 
        Return a JSON object with a key "concepts" containing a list of objects.
        Each object should have:
        - "label": short canonical name of the concept.
        - "definition": a concise definition based on the text.
        - "type": one of "definition", "formula", "phrase".
        
        Text: ${text.substring(0, 3000)}`;

        try {
            const parsed = await this.deepSeekService.generateCompletionJson(prompt);
            return parsed?.concepts || [];
        } catch (e) {
            console.warn('LLM Failed (extractConcepts). Using Mock.', e.message);
            return [{ label: 'Photosynthesis', definition: 'Turning sunlight to energy', type: 'definition' }];
        }
    }

    async generateQuiz(conceptLabel: string, difficulty: string, context: string = ''): Promise<any> {
        console.log(`Generating quiz for ${conceptLabel} with context length: ${context.length}`);
        const prompt = `Generate a ${difficulty} difficulty micro-quiz for the concept "${conceptLabel}". 
        Use the following context to ensure the question is relevant to the student's notes:
        ---
        ${context}
        --- 
        Return a JSON object with:
        - "question": The question text.
        - "options": An array of 4 options (strings).
        - "answer": The correct option (string), must be one of the options.
        - "distractors": An array of the 3 incorrect options.
        - "explanation": A brief explanation of why the answer is correct.`;

        try {
            const parsed = await this.deepSeekService.generateCompletionJson(prompt);
            return parsed || {
                question: `MOCK: What is ${conceptLabel}?`,
                options: ['A', 'B', 'C', 'D'],
                answer: 'A',
                distractors: ['B', 'C', 'D'],
                explanation: 'Because it is mocked.'
            };
        } catch (e) {
            console.warn('LLM Failed (generateQuiz). Using Mock.', e.message);
            return {
                question: `MOCK: What is ${conceptLabel}?`,
                options: ['A', 'B', 'C', 'D'],
                answer: 'A',
                distractors: ['B', 'C', 'D'],
                explanation: 'Because it is mocked.'
            };
        }
    }

    async embedText(text: string): Promise<number[]> {
        try {
            return await this.deepSeekService.generateEmbedding(text);
        } catch (e) {
            console.warn('LLM Failed (embedText). Using Mock.', e.message);
            return new Array(1536).fill(0.1);
        }
    }
}
