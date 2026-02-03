import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';
import { DeepSeekModule } from '../estimation/deepseek.module';

@Module({
    imports: [DeepSeekModule],
    controllers: [OrchestratorController],
    providers: [OrchestratorService],
    exports: [OrchestratorService],
})
export class OrchestratorModule { }
