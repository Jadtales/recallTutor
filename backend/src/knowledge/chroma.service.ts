import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChromaService implements OnModuleInit {
    private client: ChromaClient;
    private collection: Collection;
    private readonly collectionName = 'estimate_ai_tasks';
    private readonly logger = new Logger(ChromaService.name);

    constructor(private configService: ConfigService) {
        const chromaUrl = this.configService.get<string>('CHROMA_DB_URL') || 'http://localhost:8000';
        this.client = new ChromaClient({ path: chromaUrl });
    }

    async onModuleInit() {
        await this.connect();
    }

    async connect() {
        try {
            // Heartbeat check or just try getting the collection
            const heartbeat = await this.client.heartbeat();
            this.logger.log(`Connected to ChromaDB at ${await this.client.version()} (Heartbeat: ${heartbeat})`);
            await this.ensureCollection();
        } catch (error) {
            this.logger.error('Failed to connect to ChromaDB', error);
            // We don't throw here to allow app to start even if Chroma is temporarily down, 
            // but operations will fail.
        }
    }

    private async ensureCollection() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { "hnsw:space": "cosine" } // Use cosine similarity
            });
            this.logger.log(`Collection '${this.collectionName}' is ready.`);
        } catch (error) {
            this.logger.error(`Error creating/getting collection '${this.collectionName}'`, error);
            throw error;
        }
    }

    /**
     * Upserts a task embedding into ChromaDB
     * @param taskId The unique ID of the task
     * @param description The textual description of the task
     * @param embedding The vector embedding of the description
     * @param extraMetadata Additional metadata like actual_effort
     */
    async upsertTask(taskId: number, description: string, embedding: number[], extraMetadata: Record<string, any> = {}) {
        if (!this.collection) await this.ensureCollection();

        // Chroma expects string IDs
        const id = taskId.toString();

        try {
            await this.collection.upsert({
                ids: [id],
                embeddings: [embedding],
                metadatas: [{ ...extraMetadata, taskId: taskId, full_text: description }], // Store full text in metadata for easy retrieval if needed
                documents: [description], // Store description as the document content
            });
            this.logger.log(`Upserted task ${id} into ChromaDB.`);
        } catch (error) {
            this.logger.error(`Failed to upsert task ${id}`, error);
            throw error;
        }
    }

    /**
     * Queries for similar tasks
     * @param embedding The query vector
     * @param topK Number of results to return
     * @returns List of matches
     */
    async querySimilar(embedding: number[], topK: number = 5) {
        if (!this.collection) await this.ensureCollection();

        try {
            const response = await this.collection.query({
                queryEmbeddings: [embedding],
                nResults: topK,
            });

            // Structure the response to be cleaner
            // Chroma returns arrays of arrays (batch query support)
            const matches = response.ids[0].map((id, index) => ({
                id: id,
                similarity: response.distances?.[0]?.[index] ? 1 - response.distances[0][index] : 0,
                metadata: response.metadatas?.[0]?.[index] || {},
                document: response.documents?.[0]?.[index] || null
            }));

            return matches;
        } catch (error) {
            this.logger.error('Error querying similar tasks', error);
            throw error;
        }
    }

    async count() {
        if (!this.collection) await this.ensureCollection();
        return await this.collection.count();
    }
}
