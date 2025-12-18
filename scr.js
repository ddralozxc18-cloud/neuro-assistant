// scr.js - обновленная версия
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Фокус на поле ввода при загрузке
    if (messageInput) messageInput.focus();
    
    // Функция добавления сообщения
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        
        if (chatMessages) {
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Функция показа индикатора печати
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        if (chatMessages) {
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Функция скрытия индикатора печати
    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Функция обработки отправки сообщения
    function handleSendMessage() {
        if (!messageInput) return;
        
        const message = messageInput.value.trim();
        if (message) {
            // Добавляем сообщение пользователя
            addMessage(message, true);
            messageInput.value = '';
            if (messageInput.style) messageInput.style.height = 'auto';
            
            // Показываем индикатор печати
            showTypingIndicator();
            
            // Имитация ответа бота в стиле Яндекс
            setTimeout(() => {
                hideTypingIndicator();
                const responses = [
                    "Интересный вопрос! На основе доступных данных я могу предложить несколько вариантов решения.",
                    "Спасибо за обращение! Анализирую ваш запрос и подбираю наиболее релевантную информацию.",
                    "Отличный вопрос! Использую нейросетевые алгоритмы для поиска оптимального ответа.",
                    "Понял ваш запрос! Обрабатываю информацию и формирую развернутый ответ.",
                    "Благодарю за вопрос! Применяю методы машинного обучения для анализа вашего запроса."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse);
            }, 2000);
        }
    }
    
    // Обработчики событий (если элементы существуют)
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        
        // Автоматическое увеличение высоты textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Добавляем начальное сообщение бота с задержкой
    setTimeout(() => {
        addMessage("Готов к работе! Можете задавать вопросы по любым темам — от анализа данных до генерации контента.");
    }, 500);
});

// Функция для Minecraft текста (из вашего оригинала)
function showMinecraftText(event) {
    // Удаляем существующий текст, если есть
    const existingText = document.querySelector('.minecraft-text');
    if (existingText) {
        existingText.classList.add('fade-out');
        setTimeout(() => existingText.remove(), 300);
        return;
    }

    const text = document.createElement('div');
    text.className = 'minecraft-text';
    text.textContent = 'Notch был здесь!';
    
    const rect = event.target.getBoundingClientRect();
    text.style.left = rect.left + 'px';
    text.style.top = (rect.top - 50) + 'px';
    
    document.body.appendChild(text);

    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
        text.classList.add('fade-out');
        setTimeout(() => {
            if (text.parentNode) {
                text.parentNode.removeChild(text);
            }
        }, 300);
    }, 3000);
}


const examplePrompts = document.querySelectorAll('.example-prompts span');
const promptInput = document.getElementById('heroPrompt');

examplePrompts.forEach(prompt => {
    prompt.addEventListener('click', () => {
        const promptText = prompt.textContent;
        // Перенаправляем в чат с выбранным промптом
        window.location.href = `assistent.html?prompt=${encodeURIComponent(promptText)}`;
    });
});
