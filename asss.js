// Определяем, мобильное ли устройство
function isMobile() {
    return window.innerWidth <= 768;
}

// =========== ОСНОВНОЙ КОД ===========

// Получаем промпт из URL параметров
const urlParams = new URLSearchParams(window.location.search);
const initialPrompt = urlParams.get('prompt');

// Уведомление о копировании
let copyNotificationTimeout = null;

// Функция показа уведомления о копировании
function showCopyNotification() {
    // Удаляем старое уведомление если есть
    const oldNotification = document.querySelector('.copy-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'copy-notification show';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div class="copy-notification-content">Текст скопирован</div>
    `;
    
    document.body.appendChild(notification);
    
    // Очищаем предыдущий таймаут
    if (copyNotificationTimeout) {
        clearTimeout(copyNotificationTimeout);
    }
    
    // Автоматически скрываем через 2 секунды
    copyNotificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 2000);
}

// Функция копирования текста
function copyTextToClipboard(text) {
    // Проверяем поддержку Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        // Современный метод
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopyNotification();
            })
            .catch(err => {
                console.error('Ошибка при копировании: ', err);
                fallbackCopyTextToClipboard(text);
            });
    } else {
        // Старый метод для совместимости
        fallbackCopyTextToClipboard(text);
    }
}

// Резервный метод копирования
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // КРИТИЧНО для мобильных
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    
    document.body.appendChild(textArea);
    
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Ошибка при копировании:', err);
    }
    
    document.body.removeChild(textArea);
}

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

    // Элементы меню
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuItems = document.querySelectorAll('.menu-item');

    // =========== ФИКС СОХРАНЕНИЯ СОСТОЯНИЯ САЙДБАРА ===========
    
    // 1. Убираем collapsed-класс на мобильных при загрузке
    if (isMobile()) {
        console.log('Мобильное устройство: удаляем класс collapsed с сайдбара');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
            // Также убираем expanded у main если он есть
            if (main) {
                main.classList.remove('expanded');
            }
        }
    } else {
        // 2. На десктопе восстанавливаем состояние из localStorage
        console.log('Десктоп: восстанавливаем состояние сайдбара');
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed && sidebar) {
            sidebar.classList.add('collapsed');
            if (main) {
                main.classList.add('expanded');
            }
        } else if (sidebar) {
            sidebar.classList.remove('collapsed');
            if (main) {
                main.classList.remove('expanded');
            }
        }
    }

    // Функция переключения боковой панели (ТОЛЬКО для десктопа)
    function toggleSidebar() {
        // Если это мобильное устройство, игнорируем
        if (isMobile()) {
            console.log('Мобильное устройство: игнорируем переключение сайдбара');
            return;
        }
        
        sidebar.classList.toggle('collapsed');
        if (main) {
            main.classList.toggle('expanded');
        }
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        console.log('Десктоп: состояние сайдбара сохранено:', isCollapsed ? 'свернут' : 'развернут');
    }

    // Обработчик для десктопной кнопки переключения
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
        
        // Скрываем кнопку на мобильных
        if (isMobile()) {
            toggleSidebarBtn.style.display = 'none';
        }
    }

    // Функция открытия/закрытия мобильного меню
    function toggleMobileMenu() {
        sidebar.classList.toggle('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        
        // На мобильных всегда удаляем класс collapsed при открытии меню
        if (isMobile()) {
            sidebar.classList.remove('collapsed');
            if (main) {
                main.classList.remove('expanded');
            }
        }
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
                if (isMobile()) {
                    sidebar.classList.remove('active');
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Обработчик изменения размера окна - обновляем состояние сайдбара
    window.addEventListener('resize', function() {
        // При переходе с десктопа на мобильный
        if (isMobile()) {
            console.log('Перешли на мобильный режим: удаляем collapsed');
            if (sidebar) {
                sidebar.classList.remove('collapsed');
                sidebar.classList.remove('active'); // Закрываем если было открыто
            }
            if (main) {
                main.classList.remove('expanded');
            }
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
            
            // Скрываем кнопку toggle если она есть
            if (toggleSidebarBtn) {
                toggleSidebarBtn.style.display = 'none';
            }
        } else {
            // При переходе на десктоп - показываем кнопку toggle
            if (toggleSidebarBtn) {
                toggleSidebarBtn.style.display = 'flex';
            }
            
            // Восстанавливаем состояние из localStorage
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed && sidebar) {
                sidebar.classList.add('collapsed');
                if (main) {
                    main.classList.add('expanded');
                }
            } else if (sidebar) {
                sidebar.classList.remove('collapsed');
                if (main) {
                    main.classList.remove('expanded');
                }
            }
        }
    });

    // =========== КОНЕЦ ФИКСА СОХРАНЕНИЯ СОСТОЯНИЯ ===========
    
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
    
    // Функция addMessage с кнопкой копирования
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const messageContent = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <button class="copy-button" title="Копировать текст">
                    <i class="far fa-copy"></i>
                </button>
            </div>
        `;
        
        messageDiv.innerHTML = isUser ? 
            messageContent : 
            `<div class="avatar bot-avatar"><i class="fas fa-brain"></i></div>${messageContent}`;
        
        messagesContainer.appendChild(messageDiv);
        
        // Добавляем обработчик для кнопки копирования
        const copyBtn = messageDiv.querySelector('.copy-button');
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            copyTextToClipboard(text);
            
            // Анимация нажатия кнопки
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = 'var(--primary)';
            copyBtn.style.color = 'white';
            copyBtn.style.borderColor = 'var(--primary)';
            
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                copyBtn.style.background = isUser ? 'rgba(116, 51, 191, 0.2)' : 'rgba(255, 255, 255, 0.9)';
                copyBtn.style.color = isUser ? 'rgba(255, 255, 255, 0.9)' : 'var(--gray)';
                copyBtn.style.borderColor = isUser ? 'rgba(255, 255, 255, 0.3)' : 'var(--border)';
            }, 1500);
        });
        
        // Для мобильных устройств добавляем обработчик долгого нажатия
        if (isMobile()) {
            const messageText = messageDiv.querySelector('.message-text');
            let longPressTimer;
            
            messageText.addEventListener('touchstart', function(e) {
                longPressTimer = setTimeout(() => {
                    copyTextToClipboard(text);
                    
                    messageText.style.backgroundColor = isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(116, 51, 191, 0.1)';
                    setTimeout(() => {
                        messageText.style.backgroundColor = '';
                    }, 500);
                }, 500);
            });
            
            messageText.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);
            });
            
            messageText.addEventListener('touchmove', function() {
                clearTimeout(longPressTimer);
            });
        }
        
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
        
        if (isMobile()) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight + 80;
                
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
            
            if (isMobile()) {
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
            
            if (isMobile()) {
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
            
            if (isMobile()) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    });
    
    // Обработка хинтов
    document.querySelectorAll('.hint').forEach(hint => {
        hint.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            const isFileHint = this.classList.contains('file-hint');
            
            if (!isFileHint) {
                this.classList.toggle('active');
            }
            
            const isActive = this.classList.contains('active');
            
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

    // Обработчик для новой кнопки скрепки
    const attachButton = document.getElementById('attachButton');
    if (attachButton) {
        attachButton.addEventListener('click', function() {
            console.log('Добавить файл clicked (новая кнопка)');
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
        });
    }

    // =========== ЛОГИКА МЕНЮ С ИКОНКАМИ ===========
    
    if (menuToggleBtn) {
        const menuIcon = menuToggleBtn.querySelector('i');
        
        let isMenuOpen = false;
        let selectedMode = null;
        
        const icons = {
            ellipsis: 'fas fa-ellipsis-h',
            thoughtful: 'fas fa-brain',
            internet: 'fas fa-globe',
            close: 'fas fa-times'
        };
        
        function updateMenuIcon() {
            if (isMenuOpen) {
                menuIcon.className = icons.ellipsis;
            } else if (selectedMode) {
                menuIcon.className = icons[selectedMode];
            } else {
                menuIcon.className = icons.ellipsis;
            }
            
            menuToggleBtn.classList.toggle('has-selection', selectedMode !== null);
        }
        
        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('active');
            }
            
            if (isMobile() && menuOverlay) {
                menuOverlay.classList.toggle('active');
            }
            
            updateMenuIcon();
        }
        
        function closeMenu() {
            isMenuOpen = false;
            if (dropdownMenu) {
                dropdownMenu.classList.remove('active');
            }
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            updateMenuIcon();
        }
        
        menuToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (selectedMode && !isMenuOpen) {
                selectedMode = null;
                updateMenuIcon();
                showNotification('Режим сброшен');
                console.log('Режим сброшен');
                return;
            }
            
            toggleMenu();
        });
        
        menuToggleBtn.addEventListener('mouseenter', function() {
            if (selectedMode && !isMenuOpen) {
                menuIcon.className = icons.close;
            }
        });
        
        menuToggleBtn.addEventListener('mouseleave', function() {
            if (selectedMode && !isMenuOpen) {
                menuIcon.className = icons[selectedMode];
            }
        });
        
        menuToggleBtn.addEventListener('touchstart', function() {
            if (selectedMode && !isMenuOpen) {
                menuIcon.className = icons.close;
            }
        });
        
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }
        
        if (menuItems.length > 0) {
            menuItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.getAttribute('data-action');
                    
                    handleMenuAction(action);
                    
                    if (action === 'thoughtful' || action === 'internet') {
                        selectedMode = action;
                    }
                    
                    closeMenu();
                });
            });
        }
        
        function handleMenuAction(action) {
            switch(action) {
                case 'thoughtful':
                    showNotification('Режим "Вдумчиво" активирован');
                    console.log('Режим "Вдумчиво" активирован');
                    break;
                    
                case 'internet':
                    showNotification('Режим "Поиск" активирован');
                    console.log('Режим "Поиск" активирован');
                    break;
            }
        }
        
        function showNotification(message) {
            console.log(message);
        }
        
        window.addEventListener('resize', function() {
            if (!isMobile() && menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            updateMenuIcon();
        });
        
        document.addEventListener('click', function(e) {
            if (isMenuOpen && 
                dropdownMenu && 
                !dropdownMenu.contains(e.target) && 
                !menuToggleBtn.contains(e.target)) {
                closeMenu();
            }
        });
        
        updateMenuIcon();
    }
    // =========== КОНЕЦ ЛОГИКИ МЕНЮ ===========
    
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
    if (isMobile() && mobileHeader) {
        mobileHeader.style.zIndex = '1000';
        
        messagesContainer.addEventListener('scroll', function() {
            if (mobileHeader.style.position !== 'sticky') {
                mobileHeader.style.position = 'sticky';
            }
        });
    }
});

// =========== КОД ДЛЯ КНОПКИ SCROLL TO BOTTOM ===========
document.addEventListener("DOMContentLoaded", () => {
    const messages = document.getElementById("messages");
    const scrollBtn = document.getElementById("scrollToBottomBtn");
    const sidebar = document.getElementById("sidebar");
    const messageInput = document.getElementById("messageInput");

    if (!messages || !scrollBtn) return;

    // Определяем, мобильное ли устройство
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Переменные для отслеживания состояния клавиатуры
    let keyboardOpen = false;
    let originalViewportHeight = window.innerHeight;
    let resizeTimeout;

    // Определяем, открыта ли клавиатура
    function isKeyboardOpen() {
        const currentViewportHeight = window.innerHeight;
        const heightDifference = originalViewportHeight - currentViewportHeight;
        
        const isInputFocused = document.activeElement === messageInput || 
                              document.activeElement === document.querySelector('textarea') ||
                              document.activeElement === document.querySelector('input');
        
        if (isMobileDevice() && isInputFocused && heightDifference > 100) {
            return true;
        }
        
        if (isMobileDevice() && isInputFocused && currentViewportHeight < originalViewportHeight * 0.7) {
            return true;
        }
        
        return false;
    }

    // Функция для проверки и обновления состояния клавиатуры
    function checkKeyboardState() {
        const wasKeyboardOpen = keyboardOpen;
        keyboardOpen = isKeyboardOpen();
        
        if (keyboardOpen !== wasKeyboardOpen) {
            updateScrollButtonForKeyboard();
        }
    }

    // Функция для обновления кнопки при открытии/закрытии клавиатуры
    function updateScrollButtonForKeyboard() {
        if (isMobileDevice()) {
            if (keyboardOpen) {
                scrollBtn.classList.add('keyboard-open');
                scrollBtn.classList.remove('show');
                scrollBtn.style.opacity = '0';
                scrollBtn.style.pointerEvents = 'none';
                scrollBtn.style.transform = 'translateY(20px)';
            } else {
                scrollBtn.classList.remove('keyboard-open');
                scrollBtn.style.opacity = '';
                scrollBtn.style.pointerEvents = '';
                scrollBtn.style.transform = '';
                checkScroll();
            }
        }
    }

    // Функция для скрытия/показа кнопки в зависимости от состояния сайдбара
    function updateScrollButtonVisibility() {
        if (isMobileDevice() && sidebar && sidebar.classList.contains('active')) {
            scrollBtn.style.display = 'none';
        } else {
            scrollBtn.style.display = 'flex';
        }
    }

    // Скролл вниз
    const scrollToBottom = () => {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: "smooth"
        });
        
        if (keyboardOpen && messageInput) {
            messageInput.blur();
        }
    };

    // Проверка: мы внизу или нет
    const checkScroll = () => {
        const threshold = 120;
        const isAtBottom =
            messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;

        updateScrollButtonVisibility();
        
        if (keyboardOpen) {
            scrollBtn.classList.remove("show");
            return;
        }
        
        if (!isAtBottom && scrollBtn.style.display !== 'none' && !keyboardOpen) {
            scrollBtn.classList.add("show");
        } else {
            scrollBtn.classList.remove("show");
        }
    };

    // Клик по кнопке
    scrollBtn.addEventListener("click", scrollToBottom);

    // Следим за скроллом
    messages.addEventListener("scroll", checkScroll);

    // Обработчики для определения открытия клавиатуры
    if (messageInput) {
        messageInput.addEventListener('focus', function() {
            originalViewportHeight = window.innerHeight;
            setTimeout(checkKeyboardState, 300);
        });
        
        messageInput.addEventListener('blur', function() {
            setTimeout(checkKeyboardState, 100);
        });
    }

    // Отслеживание изменения размера окна
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            checkKeyboardState();
            originalViewportHeight = window.innerHeight;
            
            // При изменении размера окна также обновляем состояние сайдбара
            if (isMobileDevice()) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('collapsed');
                }
            }
        }, 100);
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            checkKeyboardState();
        });
    }

    document.addEventListener('touchstart', function() {
        setTimeout(checkKeyboardState, 200);
    });

    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            originalViewportHeight = window.innerHeight;
            checkKeyboardState();
            updateScrollButtonVisibility();
            checkScroll();
        }, 500);
    });

    // Автоскролл при новом сообщении
    const observer = new MutationObserver(() => {
        const isNearBottom =
            messages.scrollHeight - messages.scrollTop - messages.clientHeight < 200;

        if (isNearBottom) {
            scrollToBottom();
        } else {
            checkScroll();
        }
    });

    observer.observe(messages, {
        childList: true,
        subtree: true
    });

    // Наблюдаем за изменениями сайдбара
    if (sidebar) {
        const sidebarObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    updateScrollButtonVisibility();
                    checkScroll();
                }
            });
        });
        
        sidebarObserver.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Инициализация
    originalViewportHeight = window.innerHeight;
    updateScrollButtonVisibility();
    checkKeyboardState();
    checkScroll();
    
    setInterval(checkKeyboardState, 1000);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(function() {
                originalViewportHeight = window.innerHeight;
                checkKeyboardState();
                checkScroll();
            }, 100);
        }
    });
});











// Обработка меню аккаунта
document.querySelectorAll('.account-menu .menu-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    const action = this.getAttribute('data-action');
    
    // switch(action) {
    //   case 'logout':
    //     if (confirm('Вы действительно хотите выйти?')) {
    //       // Здесь можно очистить localStorage, перенаправить и т.д.
    //       alert('Выход выполнен');
    //     }
    //     break;
    //   case 'settings':
    //     alert('Открываются настройки...');
    //     break;
    // }

    // Закрываем меню (если используете клик вместо hover)
    document.getElementById('accountMenu').classList.remove('active');
  });
});

// Если хотите закрывать меню при клике вне его — добавьте:
document.addEventListener('click', function(e) {
  const accountDropdown = document.querySelector('.account-dropdown');
  if (!accountDropdown.contains(e.target)) {
    document.getElementById('accountMenu').classList.remove('active');
  }
});



// === Меню аккаунта по клику ===
const accountBtn = document.getElementById('accountBtn');
const accountMenu = document.getElementById('accountMenu');

if (accountBtn && accountMenu) {
  accountBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('open');
  });

  // Закрыть меню при клике вне его
  document.addEventListener('click', function(e) {
    if (!accountBtn.contains(e.target)) {
      accountBtn.classList.remove('open');
    }
  });
}


// === Настройки: модальное окно ===
const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Открытие через меню аккаунта уже есть: data-action="settings"
// Но нужно подключить его к новому модальному окну
document.querySelectorAll('.menu-item[data-action="settings"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsModalOverlay.classList.add('active');
        // Закрываем меню аккаунта
        const accountBtn = document.getElementById('accountBtn');
        if (accountBtn) accountBtn.classList.remove('open');
    });
});

// Закрытие модального окна
function closeSettingsModal() {
    settingsModalOverlay.classList.remove('active');
}

if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeSettingsModal);

// Закрытие по клику на оверлей
settingsModalOverlay.addEventListener('click', function(e) {
    if (e.target === settingsModalOverlay) {
        closeSettingsModal();
    }
});

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Убираем активный класс у всех
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Добавляем активный класс текущей вкладке и контенту
        this.classList.add('active');
        document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
    });
});

// Сохранение настроек (пример)
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
        // Здесь можно сохранить в localStorage или отправить на сервер
        alert('Настройки сохранены!');
        closeSettingsModal();
    });
}


// Показ/скрытие поля "Класс" в зависимости от уровня образования
const educationSelect = document.getElementById('educationLevel');
const gradeRow = document.getElementById('gradeRow');

if (educationSelect && gradeRow) {
    educationSelect.addEventListener('change', function() {
        gradeRow.style.display = this.value === 'school' ? 'flex' : 'none';
    });

    // Инициализация при загрузке
    gradeRow.style.display = educationSelect.value === 'school' ? 'flex' : 'none';
}









// === Предметы: теги + флажки ===
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.subject-checkbox input[type="checkbox"]');
    const tagsContainer = document.getElementById('selectedSubjects');

    // Восстановить из localStorage (опционально)
    let selectedSubjects = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');

    // Инициализация
    checkboxes.forEach(cb => {
        if (selectedSubjects.includes(cb.value)) {
            cb.checked = true;
        }
    });
    updateSubjectTags();

    // Обработчик кликов
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (this.checked) {
                if (!selectedSubjects.includes(this.value)) {
                    selectedSubjects.push(this.value);
                }
            } else {
                selectedSubjects = selectedSubjects.filter(s => s !== this.value);
            }
            localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
            updateSubjectTags();
        });
    });

    function updateSubjectTags() {
        tagsContainer.innerHTML = '';
        selectedSubjects.forEach(subject => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                ${subject}
                <span class="remove" data-subject="${subject}">×</span>
            `;
            tagsContainer.appendChild(tag);

            // Удаление по крестику
            tag.querySelector('.remove').addEventListener('click', function() {
                const subj = this.getAttribute('data-subject');
                selectedSubjects = selectedSubjects.filter(s => s !== subj);
                localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
                document.querySelector(`input[value="${subj}"]`).checked = false;
                updateSubjectTags();
            });
        });
    }
});







// Открытие настроек по клику на мобильную кнопку "Аккаунт"
const mobileAccountBtn = document.getElementById('mobileAccountBtn');
if (mobileAccountBtn) {
    mobileAccountBtn.addEventListener('click', function() {
        document.getElementById('settingsModalOverlay').classList.add('active');
    });
}

