// ========== ПРЕЛОАДЕР ==========
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.querySelector('.preloader');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = document.querySelector('.progress-percent');

    if (preloader) {
        let progress = 0;
        const totalTime = 2000; // 2 секунды для быстрой загрузки
        const interval = 50; // Обновление каждые 50мс
        
        // Блокируем скролл на время показа прелоадера
        document.body.style.overflow = 'hidden';

        function updateProgress() {
            progress += 2; // Увеличиваем быстрее
            
            if (progress > 100) {
                progress = 100;
            }
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressPercent) {
                progressPercent.textContent = `${progress}%`;
            }
            
            if (progress < 100) {
                setTimeout(updateProgress, interval);
            } else {
                // Задержка перед скрытием для демонстрации 100%
                setTimeout(() => {
                    preloader.classList.add('loaded');
                    
                    // Разблокируем скролл
                    document.body.style.overflow = '';
                    
                    // Удаляем прелоадер из DOM через 0.5 секунды
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        
                        // Запускаем остальные анимации сайта
                        startSiteAnimations();
                    }, 500);
                }, 300);
            }
        }

        // Запускаем прогресс-бар
        setTimeout(updateProgress, 500);

        // Если страница загрузилась быстрее, ускоряем завершение
        window.addEventListener('load', function() {
            if (progress < 90) {
                progress = 90;
                if (progressFill) progressFill.style.width = `${progress}%`;
                if (progressPercent) progressPercent.textContent = `${progress}%`;
            }
        });

        // Аварийное скрытие через 4 секунды
        setTimeout(() => {
            if (preloader && !preloader.classList.contains('loaded')) {
                preloader.classList.add('loaded');
                document.body.style.overflow = '';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    startSiteAnimations();
                }, 500);
                console.warn('⚠️ Прелоадер принудительно скрыт по таймауту');
            }
        }, 4000);
    } else {
        // Если прелоадера нет, сразу запускаем анимации сайта
        startSiteAnimations();
    }

    // Функция запуска анимаций сайта после прелоадера
    function startSiteAnimations() {
        console.log('🚀 Прелоадер завершен, запускаем анимации сайта...');
        
        // Плавное появление всего контента
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 10);
        
        // Запускаем основной код сайта
        initializeSite();
    }
});

// ========== ОСНОВНОЙ КОД САЙТА ==========
function initializeSite() {
    console.log('🎮 Cobalt BAB - Запуск исправленной версии...');
    
    // ========== ПЕРЕМЕННЫЕ ==========
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const header = document.querySelector('header');
    
    // ========== ГАМБУРГЕР-МЕНЮ (ТОЛЬКО НА МОБИЛЬНЫХ) ==========
if (window.innerWidth <= 992) {
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Меню');
    hamburger.setAttribute('aria-expanded', 'false');

    // Создаем оверлей для меню
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';

    // Вставляем кнопку в хедер
    const headerContainer = document.querySelector('header .container');
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-header-controls';
    mobileControls.appendChild(hamburger);
    headerContainer.appendChild(mobileControls);
    document.body.appendChild(menuOverlay);

    const nav = document.querySelector('nav');

    // Функция закрытия меню
    function closeMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    // Функция переключения меню
    function toggleMenu() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        hamburger.setAttribute('aria-expanded', !isExpanded);
    }

    // Обработчики для гамбургера
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    menuOverlay.addEventListener('click', closeMenu);

    // Закрытие меню при клике на ссылку - ИЗМЕНЕНИЕ ЗДЕСЬ
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Для Discord ссылок - не закрываем меню сразу
            if (this.href.includes('discord.gg') || 
                this.classList.contains('discord-btn') ||
                this.textContent.includes('Discord')) {
                return; // Выходим без закрытия меню
            }
            
            // Закрываем меню сразу, без задержки
            closeMenu();
        });
    });

    // Закрытие меню клавишей ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    // Закрытие меню при изменении размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && nav.classList.contains('active')) {
            closeMenu();
        }
    });
}
    
    // ========== ОБРАБОТКА КНОПКИ "СМОТРЕТЬ БИНДЫ" ==========
    const viewBindsButton = document.querySelector('.hero-btn[href="#binds"]');
    if (viewBindsButton) {
        viewBindsButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Анимация нажатия
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс к соответствующей ссылке
            const targetLink = document.querySelector('.nav-link[href="#binds"]');
            if (targetLink) {
                targetLink.classList.add('active');
            }
            
            // Скрываем все секции
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем целевую секцию
            const targetSection = document.getElementById('binds');
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Прокручиваем к секции
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
            
            // Обновляем URL без перезагрузки страницы
            history.pushState(null, null, '#binds');
        });
    }
    
    // ========== НАВИГАЦИЯ ==========
    // Плавная анимация хедера при скролле
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Обработка кликов по навигационным ссылкам
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // ОСОБЫЙ СЛУЧАЙ: Discord ссылка - открываем в новой вкладке
            if (this.href.includes('discord.gg') || 
                this.classList.contains('discord-btn') ||
                this.textContent.includes('Discord')) {
                
                // Не останавливаем событие для Discord
                this.target = '_blank';
                this.rel = 'noopener noreferrer';
                return; // Выходим из функции
            }
            
            // Для внутренних ссылок - стандартная обработка
            e.preventDefault();
            
            // Анимация клика
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
            
            // Получаем ID целевой секции из href
            const href = this.getAttribute('href');
            const targetId = href.substring(1); // Убираем #
            
            console.log('🔗 Навигация:', `Переход к секции #${targetId}`);
            
            // Плавный переход между секциями
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(20px)';
                    section.classList.remove('active');
                    
                    setTimeout(() => {
                        section.classList.add('active');
                        setTimeout(() => {
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 50);
                    }, 300);
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Плавная прокрутка к секции (только для не-home секций)
            if (targetId !== 'home') {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    setTimeout(() => {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            } else {
                // Home - прокручиваем к началу
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            // Обновляем URL без перезагрузки страницы
            history.pushState(null, null, `#${targetId}`);
            /*
            // Закрываем мобильное меню если оно открыто
            const nav = document.querySelector('nav');
            if (nav && nav.classList.contains('active')) {
                const hamburger = document.querySelector('.hamburger');
                const menuOverlay = document.querySelector('.menu-overlay');
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            */
           const nav = document.querySelector('nav');
if (nav && nav.classList.contains('active')) {
    // Используем функцию closeMenu, если она существует
    if (typeof closeMenu === 'function') {
        closeMenu();
    } else {
        // Fallback на случай, если функция не определена
        const hamburger = document.querySelector('.hamburger');
        const menuOverlay = document.querySelector('.menu-overlay');
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}
        });
    });

    
    // ========== ОТСЛЕЖИВАНИЕ АКТИВНОГО РАЗДЕЛА ПРИ ПРОКРУТКЕ ==========
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY;
        const headerHeight = header.offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // Убираем активный класс у всех ссылок
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Добавляем активный класс к соответствующей ссылке
                const activeLink = document.querySelector(`a[href="#${section.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    console.log(`📍 Активная секция: #${section.id}`);
                }
            }
        });
    }
    
    // Слушаем событие прокрутки
    window.addEventListener('scroll', updateActiveNavLink);
    
    // ========== STICKY HEADER - ЭФФЕКТ ПРИ ПРОКРУТКЕ ==========
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ========== ФИКС ДЛЯ Discord КНОПОК В ДРУГИХ МЕСТАХ ==========
    // Кнопка "Присоединиться" в Hero секции
    const discordHeroBtn = document.querySelector('.hero-btn[href*="discord"]');
    if (discordHeroBtn) {
        discordHeroBtn.target = '_blank';
        discordHeroBtn.rel = 'noopener noreferrer';
    }
    
    // Кнопка в секции Discord
    const discordJoinBtn = document.querySelector('.discord-join-btn');
    if (discordJoinBtn) {
        discordJoinBtn.target = '_blank';
        discordJoinBtn.rel = 'noopener noreferrer';
    }
    
    // Кнопка в гайдах
    const discordHelpBtn = document.querySelector('.discord-help-btn');
    if (discordHelpBtn) {
        discordHelpBtn.target = '_blank';
        discordHelpBtn.rel = 'noopener noreferrer';
    }
    
    // Ссылка в футере
    document.querySelectorAll('a[href*="discord"]').forEach(link => {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });
    
    // ========== ТАБЫ БИНДОВ ==========
    const tabBtns = document.querySelectorAll('.tab-btn');
    const bindCategories = document.querySelectorAll('.bind-category');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Анимация нажатия
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Удаляем активный класс у всех кнопок
            tabBtns.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс к текущей кнопке
            this.classList.add('active');
            
            // Получаем категорию
            const category = this.getAttribute('data-category');
            
            // Плавная смена категорий
            bindCategories.forEach(cat => {
                if (cat.id === category) {
                    cat.style.opacity = '0';
                    cat.style.transform = 'translateY(20px)';
                    cat.classList.remove('active');
                    
                    setTimeout(() => {
                        cat.classList.add('active');
                        setTimeout(() => {
                            cat.style.opacity = '1';
                            cat.style.transform = 'translateY(0)';
                        }, 50);
                    }, 200);
                } else {
                    cat.classList.remove('active');
                }
            });
        });
    });
    
    // ========== ТАБЫ ГАЙДОВ ==========
    const guideTabBtns = document.querySelectorAll('.guide-tab-btn');
    const guideCategories = document.querySelectorAll('.guide-category');
    
    if (guideTabBtns.length > 0) {
        guideTabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Анимация нажатия
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Удаляем активный класс у всех кнопок
                guideTabBtns.forEach(item => item.classList.remove('active'));
                
                // Добавляем активный класс к текущей кнопке
                this.classList.add('active');
                
                // Получаем категорию гайда
                const guideCategory = this.getAttribute('data-guide');
                
                // Плавная смена категорий гайдов
                guideCategories.forEach(cat => {
                    if (cat.id === guideCategory) {
                        cat.style.opacity = '0';
                        cat.style.transform = 'translateY(20px)';
                        cat.classList.remove('active');
                        
                        setTimeout(() => {
                            cat.classList.add('active');
                            setTimeout(() => {
                                cat.style.opacity = '1';
                                cat.style.transform = 'translateY(0)';
                            }, 50);
                        }, 200);
                    } else {
                        cat.classList.remove('active');
                    }
                });
            });
        });
    }
    
    // ========== КОПИРОВАНИЕ БИНДОВ ==========
    const copyBtns = document.querySelectorAll('.copy-btn');
    const copyNotification = document.getElementById('copyNotification');
    
    // Глобальная переменная для таймера уведомления
    let notificationTimer = null;
    
    // Функция для отображения уведомления
    function showCopyNotification(message, isError = false) {
        // Очищаем предыдущий таймер
        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }
        
        // Устанавливаем текст и стиль
        copyNotification.textContent = message;
        copyNotification.style.background = isError 
            ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' 
            : 'var(--gradient-primary)';
        
        // Показываем уведомление
        copyNotification.classList.remove('show');
        void copyNotification.offsetWidth; // Перезапуск анимации
        copyNotification.classList.add('show');
        
        // Устанавливаем таймер на скрытие
        notificationTimer = setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 2500); // 2.5 секунды
    }
    
    // Функция для копирования текста с fallback
    function copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            // Пробуем современный метод
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text)
                    .then(resolve)
                    .catch(() => {
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        
                        try {
                            const success = document.execCommand('copy');
                            document.body.removeChild(textArea);
                            if (success) resolve();
                            else reject(new Error('Не удалось скопировать'));
                        } catch (err) {
                            document.body.removeChild(textArea);
                            reject(err);
                        }
                    });
            } else {
                // Fallback для HTTP сайтов
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const success = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    if (success) resolve();
                    else reject(new Error('Не удалось скопировать'));
                } catch (err) {
                    document.body.removeChild(textArea);
                    reject(err);
                }
            }
        });
    }
    
    // Обработчики для кнопок копирования
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const bindText = this.getAttribute('data-clipboard-text');
            
            // Анимация нажатия
            this.style.transform = 'scale(0.95)';
            
            // Сохраняем оригинальный вид кнопки
            const originalHTML = this.innerHTML;
            const originalBg = this.style.background;
            const originalColor = this.style.color;
            
            try {
                // Копируем текст
                await copyToClipboard(bindText);
                
                // Успешное копирование
                this.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                this.style.background = 'var(--gradient-accent)';
                this.style.color = 'white';
                
                // Показываем уведомление
                showCopyNotification('✅ Бинд скопирован в буфер обмена!');
                
                // Восстанавливаем кнопку через 1.5 секунды
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = originalBg;
                    this.style.color = originalColor;
                    this.style.transform = '';
                }, 1500);
                
            } catch (err) {
                console.error('Ошибка при копировании:', err);
                
                // Ошибка копирования
                this.innerHTML = '<i class="fas fa-times"></i> Ошибка!';
                this.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
                this.style.color = 'white';
                
                // Показываем уведомление об ошибке
                showCopyNotification('❌ Нажмите Ctrl+C для копирования', true);
                
                // Восстанавливаем кнопку через 2 секунды
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = originalBg;
                    this.style.color = originalColor;
                    this.style.transform = '';
                }, 2000);
            }
        });
    });
    
    // Закрытие уведомления при клике на него
    if (copyNotification) {
        copyNotification.addEventListener('click', function() {
            this.classList.remove('show');
            if (notificationTimer) {
                clearTimeout(notificationTimer);
            }
        });
    }
    
    // ========== КНОПКА НАВЕРХ ==========
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        // Изначально скрываем
        scrollTopBtn.style.display = 'none';
        scrollTopBtn.style.opacity = '0';
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollTopBtn.style.display = 'flex';
                setTimeout(() => {
                    scrollTopBtn.style.opacity = '1';
                    scrollTopBtn.style.transform = 'translateY(0)';
                }, 10);
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (window.scrollY <= 500) {
                        scrollTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            // Анимация нажатия
            this.style.transform = 'scale(0.9)';
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
    
    // ========== ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ ГАЙДОВ ==========
    // Интерактивные чеклисты
    const checklistItems = document.querySelectorAll('.checklist-item');
    if (checklistItems.length > 0) {
        checklistItems.forEach(item => {
            item.addEventListener('click', function() {
                // Анимация нажатия
                this.style.transform = 'scale(0.95)';
                
                const icon = this.querySelector('i');
                if (this.classList.contains('checked')) {
                    this.classList.remove('checked');
                    icon.className = 'far fa-circle';
                    icon.style.color = '#666';
                } else {
                    this.classList.add('checked');
                    icon.className = 'fas fa-check-circle';
                    icon.style.color = 'var(--success-color)';
                    
                    // Анимация галочки
                    icon.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        icon.style.transform = '';
                    }, 200);
                }
                
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }
    
    // ========== АНИМАЦИИ ПРИ ПРОКРУТКЕ ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Разные задержки для разных элементов
                let delay = 0;
                if (entry.target.classList.contains('card')) {
                    delay = 100;
                } else if (entry.target.classList.contains('bind-card')) {
                    delay = 150;
                } else if (entry.target.classList.contains('team-card')) {
                    delay = 200;
                } else if (entry.target.classList.contains('guide-card')) {
                    delay = 100;
                }
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    
                    // Эффект "появления" для карточек команды
                    if (entry.target.classList.contains('team-card')) {
                        const avatar = entry.target.querySelector('.team-avatar');
                        if (avatar) {
                            avatar.style.transform = 'scale(1) rotate(0deg)';
                            avatar.style.opacity = '1';
                        }
                    }
                }, delay);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за всеми элементами с анимацией
    document.querySelectorAll('.card, .bind-card, .team-card, .guide-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px) scale(0.98)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.1)';
        observer.observe(element);
    });
    
    // Особые анимации для аватаров команды
    document.querySelectorAll('.team-avatar').forEach(avatar => {
        avatar.style.transform = 'scale(0.8) rotate(-10deg)';
        avatar.style.opacity = '0';
        avatar.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.6s ease';
        observer.observe(avatar.parentElement);
    });
    
    // ========== СЕКЦИЯ БАЗ ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.querySelector('.sort-select');
    const baseCards = document.querySelectorAll('.base-card');
    
    if (filterBtns.length > 0) {
        // Фильтрация баз
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Удаляем активный класс у всех кнопок
                filterBtns.forEach(item => item.classList.remove('active'));
                
                // Добавляем активный класс текущей
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                // Показываем/скрываем карточки
                baseCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
        
        // Сортировка баз
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortBy = this.value;
                const cardsArray = Array.from(baseCards);
                
                cardsArray.sort((a, b) => {
                    switch(sortBy) {
                        case 'newest':
                            return b.getAttribute('data-id') - a.getAttribute('data-id');
                        case 'size':
                            const sizeA = a.getAttribute('data-size');
                            const sizeB = b.getAttribute('data-size');
                            return sizeB.localeCompare(sizeA);
                        case 'cost':
                            const costA = a.getAttribute('data-cost');
                            const costB = b.getAttribute('data-cost');
                            const costOrder = {low: 1, medium: 2, high: 3};
                            return costOrder[costA] - costOrder[costB];
                        default:
                            return 0;
                    }
                });
                
                // Перестраиваем порядок карточек
                const grid = document.querySelector('.bases-grid');
                cardsArray.forEach(card => grid.appendChild(card));
            });
        }
    }
    
    // ========== ОБНОВЛЕНИЕ ГОДА В ФУТЕРЕ ==========
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear;
    } else {
        // Резервный вариант для старых браузеров
        const yearElements = document.querySelectorAll('.footer-bottom p');
        yearElements.forEach(el => {
            if (el.textContent.includes('2023')) {
                el.innerHTML = el.innerHTML.replace('2023', new Date().getFullYear());
            }
        });
    }
    
    // ========== АНИМАЦИЯ ПРОГРЕСС-БАРА В ГАЙДАХ ==========
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const observerProgress = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        progressBar.style.width = '65%';
                        progressBar.style.transition = 'width 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    }, 500);
                }
            });
        }, { threshold: 0.5 });
        
        if (progressBar.parentElement) {
            observerProgress.observe(progressBar.parentElement);
        }
    }
    
    // ========== ОБРАБОТКА ХЭША В URL ==========
    function navigateToSection(targetId) {
        console.log('📍 Переход к секции:', targetId);
        
        // Удаляем активный класс у всех ссылок
        navLinks.forEach(item => item.classList.remove('active'));
        
        // Добавляем активный класс к соответствующей ссылке
        const targetLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
        
        // Скрываем все секции
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Показываем целевую секцию
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Прокручиваем к секции
            if (targetId !== 'home') {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Обработка хэша при загрузке
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        setTimeout(() => {
            navigateToSection(hash);
        }, 300);
    } else {
        // Если нет хэша, показываем Home
        setTimeout(() => {
            navigateToSection('home');
        }, 300);
    }
    
    // Обработка изменения хэша (кнопка назад/вперед браузера)
    window.addEventListener('hashchange', function() {
        const newHash = window.location.hash.substring(1);
        if (newHash) {
            navigateToSection(newHash);
        } else {
            navigateToSection('home');
        }
    });
    
    // ========== ЛОГИКА FAQ ==========
    const faqItems = document.querySelectorAll('.faq-item');
    const faqHeaders = document.querySelectorAll('.faq-header');
    const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
    const faqSearch = document.getElementById('faqSearch');
    const faqNoResults = document.querySelector('.faq-no-results');
    
    // Открытие/закрытие вопроса
    faqHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Закрываем все остальные вопросы
            faqItems.forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            
            // Переключаем текущий
            faqItem.classList.toggle('active');
            
            console.log(`📖 FAQ: ${isActive ? 'Закрыт' : 'Открыт'} вопрос`);
        });
    });
    
    // Фильтрация по категориям
    faqFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedCategory = this.getAttribute('data-category');
            
            // Обновляем активную кнопку
            faqFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Фильтруем вопросы
            filterFAQItems(selectedCategory);
            
            console.log(`🔍 FAQ: Выбрана категория "${selectedCategory}"`);
        });
    });
    
    // Функция фильтрации
    function filterFAQItems(category) {
        let visibleCount = 0;
        
        faqItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Показываем/скрываем сообщение "не найдено"
        if (visibleCount === 0) {
            faqNoResults.style.display = 'block';
        } else {
            faqNoResults.style.display = 'none';
        }
    }
    
    // Поиск по вопросам
    if (faqSearch) {
        faqSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            faqItems.forEach(item => {
                const questionText = item.querySelector('h3').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-content p').textContent.toLowerCase();
                
                // Проверяем и активный фильтр
                const activeFilter = document.querySelector('.faq-filter-btn.active');
                const activeCategory = activeFilter.getAttribute('data-category');
                const itemCategory = item.getAttribute('data-category');
                
                const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
                const matchesSearch = questionText.includes(searchTerm) || answerText.includes(searchTerm);
                
                if (matchesCategory && matchesSearch) {
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Показываем/скрываем сообщение "не найдено"
            if (visibleCount === 0) {
                faqNoResults.style.display = 'block';
            } else {
                faqNoResults.style.display = 'none';
            }
            
            console.log(`🔎 FAQ: Поиск по "${searchTerm}" - найдено ${visibleCount} результатов`);
        });
    }

    // ========== ВСТАВКА ИЗОБРАЖЕНИЙ (CTRL+V) ДЛЯ КАРТОЧЕК МОНУМЕНТОВ ==========
    // Логика: клик по .monument-image делает элемент активным, затем при paste вставляется первое изображение из буфера
    (function enableMonumentPaste() {
        let activeMonumentTarget = null;

        document.querySelectorAll('.monument-image').forEach(el => {
            // подсказка внутри если пусто
            if (!el.innerHTML.trim()) {
                el.textContent = 'Клик и вставьте изображение (Ctrl+V)';
            }

            el.addEventListener('click', () => {
                // помечаем текущую целевую карточку
                activeMonumentTarget = el;
                document.querySelectorAll('.monument-image').forEach(x => x.classList.remove('active-paste'));
                el.classList.add('active-paste');
            });
        });

        // Убираем активность при клике вне карточки
        document.addEventListener('click', (ev) => {
            if (!ev.target.closest || !ev.target.closest('.monument-image')) {
                document.querySelectorAll('.monument-image.active-paste').forEach(x => x.classList.remove('active-paste'));
                activeMonumentTarget = null;
            }
        });

        document.addEventListener('paste', (ev) => {
            if (!activeMonumentTarget) return;
            const clipboard = (ev.clipboardData || window.clipboardData);
            if (!clipboard) return;

            const items = clipboard.items || [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type && item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Вставляем <img> внутрь контейнера
                        activeMonumentTarget.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        activeMonumentTarget.appendChild(img);
                        activeMonumentTarget.classList.remove('active-paste');
                        activeMonumentTarget = null;
                    };
                    reader.readAsDataURL(blob);
                    ev.preventDefault();
                    console.log('📎 Вставлено изображение в карточку монумента');
                    break;
                }
            }
        });

        // Кнопки очистки изображения
        document.addEventListener('click', (ev) => {
            const btn = ev.target.closest && ev.target.closest('.monument-clear-btn');
            if (btn) {
                const card = btn.closest('.monument-card');
                const holder = card && card.querySelector('.monument-image');
                if (holder) {
                    holder.innerHTML = '';
                    holder.textContent = 'Клик и вставьте изображение (Ctrl+V)';
                }
            }
        });
    })();

    console.log('✅ Cobalt BAB инициализирован! Все системы готовы.');
}

// ЗАВЕРШЕНИЕ СКРИПТА
console.log('🚀 Cobalt BAB полностью загружен и готов!');