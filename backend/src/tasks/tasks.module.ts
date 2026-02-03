import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DeepSeekModule } from '../estimation/deepseek.module';
import { ChromaModule } from '../knowledge/chroma.module';

@Module({
    imports: [PrismaModule, DeepSeekModule, ChromaModule],
    controllers: [TasksController],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule { }
