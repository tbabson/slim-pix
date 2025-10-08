import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://slimpix.onrender.com/';

// Create axios instance with default config
const customFetch = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for image processing
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
customFetch.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
customFetch.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
            console.error('API Error:', message);
            return Promise.reject({ message, status: error.response.status });
        } else if (error.request) {
            // Request was made but no response
            console.error('Network Error:', error.message);
            return Promise.reject({ message: 'Network error. Please check your connection.', status: 0 });
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject({ message: error.message, status: 0 });
        }
    }
);

// API methods
export const uploadImages = async (files, quality = 'medium', format = null, onProgress = null) => {
    const formData = new FormData();

    // Append each file
    files.forEach((file) => {
        formData.append('files', file);
    });

    // Append quality setting
    formData.append('quality', quality);

    // Append format if specified
    if (format) {
        formData.append('format', format);
    }

    const response = await customFetch.post('/api/v1/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });

    return response.data;
};

export default customFetch;