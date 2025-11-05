// Получаем промпт из URL параметров
const urlParams = new URLSearchParams(window.location.search);
const initialPrompt = urlParams.get('prompt');

document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    
    // Мобильные элементы
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNewChatBtn = document.getElementById('mobileNewChatBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mobileHeader = document.getElementById('mobileHeader');

    // Функция переключения боковой панели (десктоп)
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    // Функция открытия/закрытия мобильного меню
    function toggleMobileMenu() {
        sidebar.classList.toggle('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    // Закрытие мобильного меню при клике на оверлей
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Обработчики для мобильного меню
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    if (mobileNewChatBtn) {
        mobileNewChatBtn.addEventListener('click', function() {
            if (confirm('Начать новый чат? Текущая история будет очищена.')) {
                messagesContainer.innerHTML = '';
                if (messageInput) {
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                }
                messageInput.focus();
                
                // Закрываем меню на мобильных после создания нового чата
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Восстанавливаем состояние панели из localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        main.classList.add('expanded');
    }

    // Обработчик для десктопной кнопки переключения
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            removeTypingIndicator();
            const responses = [
                "Интересный вопрос! Давайте разберем его подробнее...",
                "Отлично! Сейчас проанализирую ваш запрос и подготовлю лучший ответ.",
                "Понимаю ваш вопрос. Использую нейросетевые алгоритмы для поиска оптимального решения.",
                "Спасибо за обращение! Обрабатываю информацию и формирую развернутый ответ.",
                "Отличный запрос! Применяю методы машинного обучения для анализа."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, false);
        }, 1500 + Math.random() * 1000);
    }
    
    // Add message to chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const avatar = isUser ? 
            '<div class="avatar user-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="avatar bot-avatar"><i class="fas fa-brain"></i></div>';
        
        const messageContent = `
            <div class="message-content">
                <div class="message-text">${text}</div>
            </div>
        `;
        
        messageDiv.innerHTML = isUser ? 
            `${messageContent}${avatar}` : 
            `${avatar}${messageContent}`;
        
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="avatar bot-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    // Улучшенный скролл для мобильных устройств
    function scrollToBottom() {
        const scrollHeight = messagesContainer.scrollHeight;
        const height = messagesContainer.clientHeight;
        const maxScrollTop = scrollHeight - height;
        
        messagesContainer.scrollTop = maxScrollTop;
        
        // Дополнительная проверка для мобильных
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight + 80;
                
                // Двойная проверка для надежности
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 50);
            }, 150);
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            messageInput.value = prompt;
            messageInput.focus();
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            
            // Закрываем меню на мобильных после выбора примера
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    });
    
    // New chat button
    document.querySelector('.new-chat-btn').addEventListener('click', function() {
        if (confirm('Начать новый чат? Текущая история будет очищена.')) {
            messagesContainer.innerHTML = '';
            if (messageInput) {
                messageInput.value = '';
                messageInput.style.height = 'auto';
            }
            messageInput.focus();
            
            // Закрываем меню на мобильных после создания нового чата
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        }
    });
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            messageInput.value = action.toLowerCase() + '...';
            messageInput.focus();
            
            // Закрываем меню на мобильных после выбора действия
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    });
    
    // Обработка хинтов (подсказок)
    document.querySelectorAll('.hint').forEach(hint => {
        hint.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            const isFileHint = this.classList.contains('file-hint');
            
            // Для file-hint НЕ переключаем активное состояние
            if (!isFileHint) {
                this.classList.toggle('active');
            }
            
            const isActive = this.classList.contains('active');
            
            // Обрабатываем разные типы хинтов
            switch(action) {
                case 'file':
                    console.log('Добавить файл clicked');
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.style.display = 'none';
                    fileInput.addEventListener('change', function(e) {
                        if (this.files.length > 0) {
                            console.log('Выбран файл:', this.files[0].name);
                        }
                    });
                    document.body.appendChild(fileInput);
                    fileInput.click();
                    document.body.removeChild(fileInput);
                    break;
                    
                case 'thoughtful':
                    console.log('Режим "Вдумчиво":', isActive ? 'включен' : 'выключен');
                    break;
                    
                case 'internet':
                    console.log('Поиск в интернете:', isActive ? 'включен' : 'выключен');
                    break;
            }
        });
    });

    // Если есть промпт из URL, автоматически отправляем его
    if (initialPrompt) {
        setTimeout(() => {
            messageInput.value = initialPrompt;
            sendMessage();
        }, 1000);
    }
    
    // Initial focus
    messageInput.focus();
    
    // iOS оптимизации
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.querySelectorAll('.hint').forEach(hint => {
            hint.style.cursor = 'pointer';
            hint.style.webkitTapHighlightColor = 'transparent';
        });
        messageInput.style.fontSize = '16px';
    }

    // Дополнительная защита для мобильной верхней панели
    if (window.innerWidth <= 768 && mobileHeader) {
        // Убедимся, что верхняя панель всегда поверх контента
        mobileHeader.style.zIndex = '1000';
        
        // Добавляем обработчик скролла для дополнительной защиты
        messagesContainer.addEventListener('scroll', function() {
            // Гарантируем, что верхняя панель всегда видна
            if (mobileHeader.style.position !== 'sticky') {
                mobileHeader.style.position = 'sticky';
            }
        });
    }
});