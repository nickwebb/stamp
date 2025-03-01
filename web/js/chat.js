// Internal functions (not exported)
function addMessageToChat(message, type = 'sent') {
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage(message) {
    try {
        const token = localStorage.getItem('authToken');
        console.log('Using token:', token);

        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessageToChat(message, 'sent');
            const messageInput = document.getElementById('messageInput');
            if (messageInput) messageInput.value = '';
        } else {
            console.error('Failed to send message:', data);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Exported functions
export function initChat() {
    console.log('Chat initialized');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.querySelector('.send-btn');

    if (messageInput && sendButton) {
        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                console.log('Sending message:', message);
                sendMessage(message);
                messageInput.value = '';
            }
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = messageInput.value.trim();
                if (message) {
                    console.log('Sending message:', message);
                    sendMessage(message);
                    messageInput.value = '';
                }
            }
        });
    }
}

function loadChatHistory() {
    console.log('Loading chat history');
    // Add a welcome message
    addMessageToChat('Welcome to your chat! 👋', 'received');
}

// Export for testing
export { sendMessage, addMessageToChat };
