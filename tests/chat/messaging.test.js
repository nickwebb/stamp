import { jest } from '@jest/globals';
import { initChat, sendMessage } from '../../js/chat.js';

describe('Chat Functionality', () => {
  beforeEach(() => {
    // Setup DOM elements needed for chat
    document.body.innerHTML = `
      <div class="chat-container">
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" id="messageInput" />
          <button class="send-btn">Send</button>
        </div>
      </div>
    `;
    
    jest.clearAllMocks();
    // Set token in localStorage
    localStorage.setItem('authToken', 'fake-token-123');
  });

  describe('Chat Initialization', () => {
    test('initializes chat interface', () => {
      initChat();
      expect(document.querySelector('.chat-container')).toBeTruthy();
    });

    test('sets up event listeners', () => {
      const sendButton = document.querySelector('.send-btn');
      const messageInput = document.getElementById('messageInput');
      
      sendButton.addEventListener = jest.fn();
      messageInput.addEventListener = jest.fn();

      initChat();

      expect(sendButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(messageInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function));
    });
  });

  describe('Message Sending', () => {
    test('sends message successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await sendMessage('Test message');

      expect(fetch).toHaveBeenCalledWith(
        'https://stamp-api.nickwebb.workers.dev/api/chat/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token-123'
          }
        })
      );

      const messageElement = document.querySelector('.message.sent');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.textContent).toBe('Test message');
    });

    test('handles missing auth token', async () => {
      localStorage.clear();
      const consoleSpy = jest.spyOn(console, 'error');
      
      await sendMessage('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith('No authentication token found');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('handles server error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      const consoleSpy = jest.spyOn(console, 'error');
      await sendMessage('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      expect(document.querySelector('.message.sent')).not.toBeInTheDocument();
    });

    test('handles network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error');
      
      await sendMessage('Test message');
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Message Display', () => {
    test('displays sent message in chat container', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await sendMessage('Hello world');

      const messageElement = document.querySelector('.message.sent');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.textContent).toBe('Hello world');
    });

    test('clears input after sending', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const messageInput = document.getElementById('messageInput');
      messageInput.value = 'Test message';

      await sendMessage('Test message');

      expect(messageInput.value).toBe('');
    });
  });
}); 