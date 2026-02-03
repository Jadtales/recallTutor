import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestService } from './ingest.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

@Controller('knowledge')
export class KnowledgeController {
    constructor(private readonly ingestService: IngestService) { }

    @Post('ingest')
    @UseInterceptors(FileInterceptor('file'))
    async ingestFile(@UploadedFile() file: Express.Multer.File) {
        console.log('KnowledgeController: Received file upload request');
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        let content = '';

        if (file.mimetype === 'application/pdf') {
            const data = await pdf(file.buffer);
            content = data.text;
        } else if (file.mimetype === 'text/plain') {
            content = file.buffer.toString('utf-8');
        } else {
            throw new BadRequestException('Unsupported file type. Only PDF and Text files are allowed.');
        }

        if (!content.trim()) {
            throw new BadRequestException('File is empty or could not extract text');
        }

        const result = await this.ingestService.ingestDocument(content, {
            source: file.originalname,
            uploadedAt: new Date(),
        });

        return result;
    }
}
