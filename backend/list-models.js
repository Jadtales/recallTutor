const axios = require('axios');

async function listModels() {
    const url = 'http://localhost:11434/api/tags';
    console.log(`Listing models from ${url}...`);
    try {
        const response = await axios.get(url);
        console.log('Models:', response.data.models.map(m => m.name));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
