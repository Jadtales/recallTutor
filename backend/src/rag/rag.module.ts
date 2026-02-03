import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChromaModule } from '../knowledge/chroma.module';
import { DeepSeekModule } from '../estimation/deepseek.module';

@Module({
    imports: [ChromaModule, DeepSeekModule],
    providers: [RagService],
    exports: [RagService],
})
export class RagModule { }
