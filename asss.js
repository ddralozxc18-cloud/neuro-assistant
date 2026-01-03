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

    // Элементы меню (перемещены внутрь DOMContentLoaded)
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuItems = document.querySelectorAll('.menu-item');

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
    
    // ОБНОВЛЕННАЯ ФУНКЦИЯ addMessage с кнопкой копирования:
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
        
        // Для пользователя - только текст, для бота - аватарка + текст
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
            
            // Возвращаем исходный вид через 1.5 секунды
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                copyBtn.style.background = isUser ? 'rgba(116, 51, 191, 0.2)' : 'rgba(255, 255, 255, 0.9)';
                copyBtn.style.color = isUser ? 'rgba(255, 255, 255, 0.9)' : 'var(--gray)';
                copyBtn.style.borderColor = isUser ? 'rgba(255, 255, 255, 0.3)' : 'var(--border)';
            }, 1500);
        });
        
        // Для мобильных устройств добавляем обработчик долгого нажатия на сообщение
        if (window.innerWidth <= 768) {
            const messageText = messageDiv.querySelector('.message-text');
            let longPressTimer;
            
            messageText.addEventListener('touchstart', function(e) {
                longPressTimer = setTimeout(() => {
                    copyTextToClipboard(text);
                    
                    // Визуальная обратная связь
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

    // Обработчик для новой кнопки скрепки (внутри поля ввода)
    const attachButton = document.getElementById('attachButton');
    if (attachButton) {
        attachButton.addEventListener('click', function() {
            // Логика для загрузки файла (такая же как у .file-hint)
            console.log('Добавить файл clicked (новая кнопка)');
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', function(e) {
                if (this.files.length > 0) {
                    console.log('Выбран файл:', this.files[0].name);
                    // Можно добавить отображение имени файла или его предпросмотр
                }
            });
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }

    // =========== ЛОГИКА МЕНЮ С ИКОНКАМИ ===========
    
    // Проверяем, существует ли кнопка меню
    if (menuToggleBtn) {
        const menuIcon = menuToggleBtn.querySelector('i');
        
        // Состояние меню и выбранного режима
        let isMenuOpen = false;
        let selectedMode = null; // 'thoughtful', 'internet', или null
        
        // Иконки для разных состояний
        const icons = {
            ellipsis: 'fas fa-ellipsis-h',
            thoughtful: 'fas fa-brain',
            internet: 'fas fa-wifi',
            close: 'fas fa-times'
        };
        
        // Функция смены иконки
        function updateMenuIcon() {
            if (isMenuOpen) {
                // Если меню открыто, показываем три точки
                menuIcon.className = icons.ellipsis;
            } else if (selectedMode) {
                // Если меню закрыто и выбран режим, показываем его иконку
                menuIcon.className = icons[selectedMode];
            } else {
                // По умолчанию - три точки
                menuIcon.className = icons.ellipsis;
            }
            
            // Добавляем/убираем класс для hover эффекта
            menuToggleBtn.classList.toggle('has-selection', selectedMode !== null);
        }
        
        // Функция открытия/закрытия меню
        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('active');
            }
            
            // На мобильных устройствах показываем оверлей
            if (window.innerWidth <= 768 && menuOverlay) {
                menuOverlay.classList.toggle('active');
            }
            
            updateMenuIcon();
        }
        
        // Функция закрытия меню
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
        
        // Обработчики событий для кнопки меню
        menuToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Если уже есть выбранный режим и меню закрыто, сбрасываем его
            if (selectedMode && !isMenuOpen) {
                selectedMode = null;
                updateMenuIcon();
                showNotification('Режим сброшен');
                console.log('Режим сброшен');
                return;
            }
            
            toggleMenu();
        });
        
        // Обработчик hover для смены иконки на крестик
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
        
        // Для мобильных устройств используем touch события
        menuToggleBtn.addEventListener('touchstart', function() {
            if (selectedMode && !isMenuOpen) {
                menuIcon.className = icons.close;
            }
        });
        
        // Закрытие меню при клике на оверлей
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }
        
        // Закрытие меню при клике на пункт меню
        if (menuItems.length > 0) {
            menuItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.getAttribute('data-action');
                    
                    // Выполняем действие в зависимости от выбранного пункта
                    handleMenuAction(action);
                    
                    // Устанавливаем выбранный режим
                    if (action === 'thoughtful' || action === 'internet') {
                        selectedMode = action;
                    }
                    
                    // Закрываем меню
                    closeMenu();
                });
            });
        }
        
        // Обработка действий меню
        function handleMenuAction(action) {
            switch(action) {
                case 'thoughtful':
                    // Режим "Вдумчиво"
                    showNotification('Режим "Вдумчиво" активирован');
                    console.log('Режим "Вдумчиво" активирован');
                    break;
                    
                case 'internet':
                    // Режим "Поиск"
                    showNotification('Режим "Поиск" активирован');
                    console.log('Режим "Поиск" активирован');
                    break;
            }
        }
        
        // Функция показа уведомления (упрощенная версия)
        function showNotification(message) {
            console.log(message);
            // Здесь можно добавить более красивую систему уведомлений
        }
        
        // Закрытие меню при изменении размера окна
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && menuOverlay) {
                // На десктопе скрываем оверлей
                menuOverlay.classList.remove('active');
            }
            updateMenuIcon();
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(e) {
            if (isMenuOpen && 
                dropdownMenu && 
                !dropdownMenu.contains(e.target) && 
                !menuToggleBtn.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Инициализация иконки
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










document.addEventListener("DOMContentLoaded", () => {
    const messages = document.getElementById("messages");
    const scrollBtn = document.getElementById("scrollToBottomBtn");

    if (!messages || !scrollBtn) return;

    // Убедимся, что кнопка всегда поверх всего на мобильных устройствах
    function ensureButtonZIndex() {
        if (window.innerWidth <= 768) {
            scrollBtn.style.zIndex = '10001';
            scrollBtn.style.position = 'fixed';
            
            // Проверяем, нет ли элементов с более высоким z-index
            const highZIndexElements = document.querySelectorAll('[style*="z-index"]');
            let maxZIndex = 0;
            
            highZIndexElements.forEach(el => {
                const zIndex = parseInt(window.getComputedStyle(el).zIndex);
                if (zIndex > maxZIndex) {
                    maxZIndex = zIndex;
                }
            });
            
            // Устанавливаем z-index выше самого высокого найденного
            if (maxZIndex > 10001) {
                scrollBtn.style.zIndex = (maxZIndex + 1).toString();
            }
        }
    }

    // Скролл вниз
    const scrollToBottom = () => {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: "smooth"
        });
    };

    // Проверка: мы внизу или нет
    const checkScroll = () => {
        const threshold = 120; // чувствительность
        const isAtBottom =
            messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;

        scrollBtn.classList.toggle("show", !isAtBottom);
    };

    // Клик по кнопке
    scrollBtn.addEventListener("click", scrollToBottom);

    // Следим за скроллом
    messages.addEventListener("scroll", checkScroll);

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

    // Инициализация
    checkScroll();
    ensureButtonZIndex();
    
    // Повторная проверка при изменении размера окна
    window.addEventListener('resize', ensureButtonZIndex);
    
    // Также проверяем при открытии/закрытии сайдбара на мобильных
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const observerSidebar = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    setTimeout(ensureButtonZIndex, 10);
                }
            });
        });
        
        observerSidebar.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});
