import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { KtEngine } from './kt.engine';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [StudentController],
    providers: [StudentService, KtEngine],
    exports: [StudentService, KtEngine],
})
export class StudentModule { }
