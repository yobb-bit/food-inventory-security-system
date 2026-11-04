class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = sessionStorage.getItem('inventoryToken') || '';
    }

    setToken(token) {
        this.token = token;
        sessionStorage.setItem('inventoryToken', token);
    }

    clearToken() {
        this.token = '';
        sessionStorage.removeItem('inventoryToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                let message = `HTTP error! status: ${response.status}`;
                try {
                    const body = await response.json();
                    if (body.message) message = body.message;
                } catch (_) {}
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}
// No module.exports — this file is loaded directly via <script> in the browser
