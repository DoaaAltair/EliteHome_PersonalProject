// Automatically use Vercel API URL in production, localhost in development
const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? window.location.origin
        : "http://localhost:5000");

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };

    try {
        console.log(`Making API request to: ${url}`);
        console.log(`Headers:`, config.headers);

        const response = await fetch(url, config);

        // Check content type before parsing
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            // Try to get text first to see what we received
            const text = await response.text();
            console.error(`Server returned non-JSON response for ${endpoint}:`, text.substring(0, 500));

            // Try to parse as JSON anyway (in case content-type header is wrong)
            try {
                const data = JSON.parse(text);
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                return data;
            } catch (parseError) {
                throw new Error(`Server returned invalid response. Status: ${response.status}. Response: ${text.substring(0, 100)}`);
            }
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        // Make sure we always throw an Error object with a message
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(error.message || `Request failed: ${error}`);
        }
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!userStr) return null;

    try {
        const user = JSON.parse(userStr);
        return { ...user, role };
    } catch {
        return null;
    }
};

export const hasRole = (role) => {
    const currentRole = localStorage.getItem("role");
    return currentRole === role;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
};

export const API_ENDPOINTS = {
    LOGIN: "/api/auth/login",
    ADMIN_STATS: "/api/admin/stats",
    ADMIN_USERS: "/api/admin/users",
    ADMIN_NOTIFICATIONS: "/api/admin/notifications",
    ADMIN_INVOICES: "/api/admin/invoices",
    APARTMENTS: "/api/apartments",
    OWNER_DASHBOARD: "/api/owner/dashboard",
    OWNER_APARTMENTS: "/api/owner/apartments",
};
