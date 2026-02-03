# Local LLM Integration

The application has been configured to use local LLMs via Ollama.

## Setup
1. **Ollama**: Ensure Ollama is installed and running (`ollama serve`).
2. **Models**: The following models have been pulled:
   - Generation: `llama3`
   - Embeddings: `nomic-embed-text`
3. **Configuration**: The backend `.env` file has been updated:
   ```env
   LLM_BASE_URL=http://localhost:11434/v1
   LLM_MODEL=llama3
   EMBEDDING_MODEL=nomic-embed-text
   LLM_API_KEY=ollama
   ```

## Backend Adaptation
The `OrchestratorService` in NestJS now checks for these environment variables and uses the compatible OpenAI SDK `baseURL` to communicate with the local Ollama instance.

## Usage
- **Upload Notes**: When you upload a document, text extraction and concept embedding happen locally.
- **Quizzes**: Quiz generation uses the local `llama3` model.
- **Privacy**: No data leaves your machine for AI processing.
