import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { EstimationService } from './estimation.service';

@Controller('estimate')
export class EstimationController {
    constructor(private readonly estimationService: EstimationService) { }

    @Post()
    async estimate(@Body('taskId', ParseIntPipe) taskId: number) {
        return this.estimationService.estimateTask(taskId);
    }

    @Post('refine')
    async refine(
        @Body('estimateId', ParseIntPipe) estimateId: number,
        @Body('feedback') feedback: string
    ) {
        return this.estimationService.refineEstimate(estimateId, feedback);
    }
}
