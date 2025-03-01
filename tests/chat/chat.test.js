import { initChat, sendMessage, addMessageToChat } from '../../js/chat.js';

describe('Chat Functionality', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="chat" class="tab-content">
                <div class="chat-container">
                    <div class="chat-messages"></div>
                    <div class="chat-input-container">
                        <input type="text" id="messageInput" placeholder="Type your message...">
                        <button class="send-btn">Send</button>
                    </div>
                </div>
            </div>
        `;

        // Mock localStorage with user data
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'Test Artist',
            email: 'test@example.com'
        }));
        localStorage.setItem('authToken', 'test-token');

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            })
        );

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('Chat Initialization', () => {
        test('initializes chat interface', () => {
            initChat();
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.querySelector('.send-btn');
            
            expect(messageInput).toBeTruthy();
            expect(sendButton).toBeTruthy();
        });

        test('sets up event listeners', () => {
            initChat();
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.querySelector('.send-btn');
            
            expect(messageInput.onclick).toBeDefined;
            expect(sendButton.onclick).toBeDefined;
        });
    });

    describe('Message Handling', () => {
        test('adds message to chat', () => {
            const message = 'Test message';
            addMessageToChat(message, 'sent');
            
            const chatMessages = document.querySelector('.chat-messages');
            const messageElement = chatMessages.querySelector('.message');
            
            expect(messageElement).toBeTruthy();
            expect(messageElement.textContent).toBe(message);
            expect(messageElement.classList.contains('sent')).toBeTruthy();
        });

        test('sends message to API', async () => {
            const message = 'Test message';
            await sendMessage(message);
            
            expect(fetch).toHaveBeenCalledWith(
                'https://stamp-api.nickwebb.workers.dev/api/chat/send',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    })
                })
            );
        });
    });

    describe('Error Handling', () => {
        test('handles missing auth token', async () => {
            localStorage.removeItem('authToken');
            const consoleSpy = jest.spyOn(console, 'error');
            
            await sendMessage('Test message');
            
            expect(consoleSpy).toHaveBeenCalledWith('No authentication token found');
            consoleSpy.mockRestore();
        });

        test('handles API errors', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ error: 'API Error' })
                })
            );
            
            const consoleSpy = jest.spyOn(console, 'error');
            await sendMessage('Test message');
            
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('User Input', () => {
        test('clears input after sending', async () => {
            const messageInput = document.getElementById('messageInput');
            messageInput.value = 'Test message';
            
            await sendMessage('Test message');
            
            expect(messageInput.value).toBe('');
        });
    });
}); 