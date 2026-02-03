import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class VectorService {
    private pinecone: Pinecone;
    private indexName = 'recalltutor';

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('PINECONE_API_KEY');
        if (apiKey && apiKey !== 'your_pinecone_api_key') {
            this.pinecone = new Pinecone({ apiKey });
        } else {
            console.warn('PINECONE_API_KEY not set or default. Using Mock Vector Store.');
        }
    }

    async upsert(id: string, vector: number[], metadata: any) {
        if (!this.pinecone) {
            console.log(`[MOCK] Upserting vector for ${id}`, metadata);
            return;
        }
        const index = this.pinecone.index(this.indexName);
        await index.upsert([{
            id,
            values: vector,
            metadata,
        }]);
    }

    async query(vector: number[], topK: number = 5, filter?: any) {
        if (!this.pinecone) {
            console.log(`[MOCK] Querying vector`, vector.slice(0, 5));
            return {
                matches: [
                    {
                        id: 'mock-1',
                        score: 0.99,
                        metadata: {
                            text: 'Photosynthesis is the process used by plants to turn sunlight into chemical energy. 6CO2 + 6H2O -> C6H12O6 + 6O2.',
                            label: 'Photosynthesis'
                        }
                    },
                    {
                        id: 'mock-2',
                        score: 0.95,
                        metadata: {
                            text: 'Chlorophyll absorbs light energy.',
                            label: 'Chlorophyll'
                        }
                    }
                ]
            };
        }
        const index = this.pinecone.index(this.indexName);
        const queryRequest: any = {
            vector,
            topK,
            includeMetadata: true,
        };
        if (filter) {
            queryRequest.filter = filter;
        }
        return await index.query(queryRequest);
    }
}
