import { Module } from '@nestjs/common';
import { KtService } from './kt.service';
import { OnnxService } from './onnx.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [KtService, OnnxService],
    exports: [KtService],
})
export class KtModule { }
