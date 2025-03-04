import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                console.log('Auth error, redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // Log API errors
            if (error.response.data && error.response.data.message) {
                console.error(`API Error (${error.response.status}):`, error.response.data.message);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;