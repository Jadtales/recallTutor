import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5,
    });
    console.log('--- RECENT AUDIT LOGS ---');
    console.log(JSON.stringify(logs, null, 2));

    const concepts = await prisma.concept.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- RECENT CONCEPTS ---');
    console.log(JSON.stringify(concepts, null, 2));

    const questions = await prisma.question.findMany({
        orderBy: { id: 'desc' }, // questions uses uuid, but let's see
        take: 5
    });
    console.log('--- RECENT QUESTIONS ---');
    console.log(JSON.stringify(questions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
