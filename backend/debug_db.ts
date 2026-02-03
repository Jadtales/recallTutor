
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Concepts...');
    const concepts = await prisma.concept.findMany();
    console.log(`Found ${concepts.length} concepts:`);
    concepts.forEach(c => console.log(` - ${c.label} (${c.id})`));

    console.log('\nChecking MemoryEntries...');
    const entries = await prisma.memoryEntry.findMany({
        include: { concept: true }
    });
    console.log(`Found ${entries.length} memory entries:`);
    entries.forEach(e => console.log(` - Student: ${e.studentId}, Concept: ${e.concept.label}, Next Review: ${e.nextReview}`));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
