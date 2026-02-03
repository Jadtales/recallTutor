const axios = require('axios');

async function testEmbedding() {
    const url = 'http://localhost:11434/api/embeddings';
    console.log(`Testing embedding to ${url}...`);
    try {
        const response = await axios.post(url, {
            model: 'nomic-embed-text',
            prompt: 'Hello world'
        });
        console.log('Success, vector length:', response.data.embedding.length);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testEmbedding();
