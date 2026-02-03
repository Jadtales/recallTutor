
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TasksService } from './src/tasks/tasks.service';
import { EstimationService } from './src/estimation/estimation.service';
import { KtService } from './src/kt/kt.service';

async function bootstrap() {
    console.log('Initializing NestJS App Context...');
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const tasksService = app.get(TasksService);
        const estimationService = app.get(EstimationService);
        const ktService = app.get(KtService);

        console.log('Services retrieved successfully.');

        // 1. Task Creation & Embeddings
        console.log('\n--- 1. Testing Create Task ---');
        const task = await tasksService.createTask({
            title: 'Integration Test Task',
            description: 'Implement a new authentication flow using Oauth2 providers.',
            category: 'Backend',
            actual_effort: '5 points'
        });
        console.log('Task Created:', task.id, task.title);

        // 2. Estimation (RAG + LLM)
        console.log('\n--- 2. Testing Estimation ---');
        // Note: This might fail if Ollama is not running, so we wrap in try/catch or expect partial failure
        try {
            const estimate = await estimationService.estimateTask(task.id);
            console.log('Estimation Result:', estimate);
        } catch (e) {
            console.warn('Estimation failed (likely due to missing Ollama/DeepSeek):', e.message);
        }

        // 3. DKT Inference
        console.log('\n--- 3. Testing DKT Inference ---');
        // Mock student ID and concept ID (uuids)
        const studentId = 'student-test-123';
        const conceptId = 'concept-test-456';
        const mastery = await ktService.updateMastery(studentId, conceptId, true);
        console.log('DKT Predicted Mastery:', mastery);

        console.log('\nVerification Complete.');
    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
