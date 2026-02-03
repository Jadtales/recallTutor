import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface Task {
    id: number;
    title: string;
    description: string;
    category?: string;
    actual_effort?: string;
}

export interface Estimate {
    id: number;
    predicted_effort: string;
    explanation_text: string;
    timestamp: string;
}

export interface RefinementResult {
    original_estimate: string;
    adjusted_estimate: string;
    reasoning: string;
}

export const api = {
    createTask: async (task: Omit<Task, 'id'>) => {
        const response = await axios.post(`${API_URL}/tasks`, task);
        return response.data;
    },

    estimateTask: async (taskId: number) => {
        const response = await axios.post(`${API_URL}/estimate`, { taskId });
        return response.data;
    },

    refineEstimate: async (estimateId: number, feedback: string) => {
        const response = await axios.post(`${API_URL}/estimate/refine`, { estimateId, feedback });
        return response.data;
    }
};
