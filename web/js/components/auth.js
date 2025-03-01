export function initAuth() {
    checkAuth();
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'authToken' || e.key === 'user') {
            checkAuth();
        }
    });
}

function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const artistNameElement = document.getElementById('logged-in-artist-name');
    
    if (token && user && user.name) {
        if (user.type === 'fan') {
            window.location.href = 'fan-dashboard.html';
            return;
        }
        
        artistNameElement.textContent = user.name;
    } else {
        window.location.href = 'login.html';
    }
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
} 