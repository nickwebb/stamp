const config = {
    development: {
        apiUrl: 'http://localhost:3002',
        wsUrl: 'ws://localhost:3002'
    },
    production: {
        apiUrl: 'https://api.yourdomain.com',
        wsUrl: 'wss://api.yourdomain.com'
    }
};

const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
export const { apiUrl, wsUrl } = config[environment]; 