import { Controller, Post, Body } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';

@Controller('orchestrator')
export class OrchestratorController {
    constructor(private readonly orchestratorService: OrchestratorService) { }

    @Post('extract')
    async extract(@Body('text') text: string) {
        return this.orchestratorService.extractConcepts(text);
    }

    @Post('quiz')
    async generateQuiz(@Body() body: { label: string; difficulty: string }) {
        return this.orchestratorService.generateQuiz(body.label, body.difficulty);
    }
}
