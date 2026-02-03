import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) { }

    @Get('daily')
    async getDailyQuizzes() {
        // hardcoded student ID for demo
        const studentId = 'student-1';
        return this.quizService.getPendingQuizzes(studentId);
    }

    @Post('response')
    async submitResponse(@Body() body: { questionId: string; selectedOption: string; latency: number }) {
        const studentId = 'student-1';
        return this.quizService.submitResponse(studentId, body.questionId, body.selectedOption, body.latency);
    }
}
