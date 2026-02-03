import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get('stats')
    async getStats() {
        return this.studentService.getStats('student-1'); // Mock ID
    }
}
