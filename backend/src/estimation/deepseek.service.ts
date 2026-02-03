import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DeepSeekService {
    private readonly logger = new Logger(DeepSeekService.name);
    private readonly ollamaBaseUrl: string;
    private readonly embeddingModel: string;
    private readonly chatModel: string;

    constructor(private configService: ConfigService) {
        this.ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
        this.embeddingModel = this.configService.get<string>('EMBEDDING_MODEL') || 'nomic-embed-text'; // default for Ollama if BGE not pulled
        this.chatModel = this.configService.get<string>('CHAT_MODEL') || 'deepseek-r1:1.5b'; // default local deepseek
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await axios.post(`${this.ollamaBaseUrl}/api/embeddings`, {
                model: this.embeddingModel,
                prompt: text,
            });
            return response.data.embedding;
        } catch (error) {
            this.logger.error(`Failed to generate embedding with model ${this.embeddingModel}`, error.message);
            // Fallback or rethrow. For now rethrow.
            throw new Error('Embedding generation failed');
        }
    }

    async generateCompletion(prompt: string, context: string = ''): Promise<string> {
        try {
            const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
                model: this.chatModel,
                prompt: context ? `${context}\n\n${prompt}` : prompt,
                stream: false,
                options: { temperature: 0.7 }
            });
            return response.data.response;
        } catch (error) {
            this.logger.error(`Failed to generate completion with model ${this.chatModel}`, error.message);
            throw new Error('LLM completion failed');
        }
    }

    async generateCompletionJson(prompt: string, context: string = ''): Promise<any> {
        try {
            const fullPrompt = `${context}\n\n${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting.`;
            const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
                model: this.chatModel,
                prompt: fullPrompt,
                stream: false,
                format: "json", // Enforce JSON mode if model supports it (Ollama does)
                options: { temperature: 0.5 }
            });

            const content = response.data.response;
            try {
                return JSON.parse(content);
            } catch (e) {
                // Try to extract JSON if mixed with text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) return JSON.parse(jsonMatch[0]);
                throw e;
            }
        } catch (error) {
            this.logger.error(`Failed to generate JSON completion with model ${this.chatModel}`, error.message);
            // Fallback for demo purposes if LLM fails
            return null;
        }
    }
}
