
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const studentId = 'student-1'; // Hardcoded as per controller

    console.log('--- Debugging Student Stats ---');

    // 1. Check Responses
    const responses = await prisma.response.findMany({
        where: { studentId }
    });
    console.log(`Total Responses: ${responses.length}`);
    responses.forEach(r => console.log(` - Correct: ${r.isCorrect}, Latency: ${r.latencyMs}ms, Time: ${r.timestamp}`));

    // 2. Check Memory Entries
    const entries = await prisma.memoryEntry.findMany({
        where: { studentId },
        include: { concept: true }
    });
    console.log(`\nMemory Entries (${entries.length}):`);
    entries.forEach(e => console.log(` - ${e.concept.label}: Mastery=${e.masteryProbability}`));

    // 3. Simulate StudentService logic
    const masteredCount = entries.filter(e => e.masteryProbability > 0.8).length;

    const avgMastery = entries.reduce((acc, curr) => acc + curr.masteryProbability, 0) / (entries.length || 1);

    console.log('\n--- Calculated Stats ---');
    console.log(`Concepts Mastered (>0.8): ${masteredCount}`);
    console.log(`Average Mastery: ${avgMastery}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
