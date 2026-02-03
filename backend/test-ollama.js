const axios = require('axios');

async function testDeepSeek() {
    const url = 'http://localhost:11434/api/generate';
    console.log(`Testing connection to ${url}...`);
    try {
        const response = await axios.post(url, {
            model: 'deepseek-r1:1.5b',
            prompt: 'Say hello',
            stream: false
        });
        console.log('Success:', response.data.response);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testDeepSeek();
