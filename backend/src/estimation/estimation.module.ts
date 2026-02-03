import { Module } from '@nestjs/common';
import { DeepSeekModule } from './deepseek.module';
import { EstimationService } from './estimation.service';
import { EstimationController } from './estimation.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { RagModule } from '../rag/rag.module';

@Module({
    imports: [ConfigModule, PrismaModule, RagModule, DeepSeekModule],
    controllers: [EstimationController],
    providers: [EstimationService],
    exports: [EstimationService],
})
export class EstimationModule { }
