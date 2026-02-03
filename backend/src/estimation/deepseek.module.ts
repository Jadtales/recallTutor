import { Module } from '@nestjs/common';
import { DeepSeekService } from './deepseek.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [DeepSeekService],
    exports: [DeepSeekService],
})
export class DeepSeekModule { }
