
import { Test, TestingModule } from '@nestjs/testing';
import { KtService } from '../src/kt/kt.service';
import { OnnxService } from '../src/kt/onnx.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('KtService', () => {
    let service: KtService;
    let prismaService: PrismaService;
    let onnxService: OnnxService;

    const mockPrismaService = {
        response: {
            findMany: jest.fn(),
        },
        memoryEntry: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockOnnxService = {
        runInference: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KtService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: OnnxService, useValue: mockOnnxService },
            ],
        }).compile();

        service = module.get<KtService>(KtService);
        prismaService = module.get<PrismaService>(PrismaService);
        onnxService = module.get<OnnxService>(OnnxService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateMastery', () => {
        it('should calculate mastery and update memory entry', async () => {
            // Arrange
            const studentId = 'student-1';
            const conceptId = 'concept-1';
            const isCorrect = true;
            const history = [{ isCorrect: true }, { isCorrect: false }];
            const predictedMastery = 0.85;
            const memoryEntryId = 'memory-1';

            mockPrismaService.response.findMany.mockResolvedValue(history);
            mockOnnxService.runInference.mockResolvedValue(predictedMastery);
            mockPrismaService.memoryEntry.findFirst.mockResolvedValue({ id: memoryEntryId });

            // Act
            const result = await service.updateMastery(studentId, conceptId, isCorrect);

            // Assert
            expect(mockPrismaService.response.findMany).toHaveBeenCalledWith({
                where: { studentId },
                orderBy: { timestamp: 'asc' },
                take: 50,
            });
            expect(mockOnnxService.runInference).toHaveBeenCalled();
            expect(mockPrismaService.memoryEntry.update).toHaveBeenCalledWith({
                where: { id: memoryEntryId },
                data: { masteryProbability: predictedMastery },
            });
            expect(result).toBe(predictedMastery);
        });
    });
});
