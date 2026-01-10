// Оптимизированный JavaScript для сайта Cobalt BAB
// Версия 2.2 - Исправлено уведомление о копировании

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Cobalt BAB - Запуск исправленной версии...');
    
    // ========== НАВИГАЦИЯ ==========
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const header = document.querySelector('header');
    
    // Плавная анимация хедера при скролле
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // ОСОБЫЙ СЛУЧАЙ: Discord ссылка - открываем в новой вкладке
            if (this.href.includes('discord.gg') || 
                this.classList.contains('discord-btn') ||
                this.textContent.includes('Discord')) {
                
                // Не останавливаем событие для Discord
                // Пусть работает как обычная ссылка
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
            
            // Получаем ID целевой секции
            const targetId = this.getAttribute('href').substring(1);
            
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
            if (targetId !== 'home' && document.getElementById(targetId)) {
                const targetSection = document.getElementById(targetId);
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else if (targetId === 'home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            // Обновляем URL без перезагрузки страницы
            history.pushState(null, null, `#${targetId}`);
        });
    });
    
    // ========== ФИКС ДЛЯ Discord КНОПОК В ДРУГИХ МЕСТАХ ==========
    // Кнопка "Присоединиться" в Hero секции
    const discordHeroBtn = document.querySelector('.hero-btn[href*="discord"]');
    if (discordHeroBtn) {
        discordHeroBtn.target = '_blank';
        discordHeroBtn.rel = 'noopener noreferrer';
        // Убираем обработчик клика, если он есть
        discordHeroBtn.onclick = null;
    }
    
    // Кнопка в секции Discord
    const discordJoinBtn = document.querySelector('.discord-join-btn');
    if (discordJoinBtn) {
        discordJoinBtn.target = '_blank';
        discordJoinBtn.rel = 'noopener noreferrer';
        discordJoinBtn.onclick = null;
    }
    
    // Кнопка в гайдах
    const discordHelpBtn = document.querySelector('.discord-help-btn');
    if (discordHelpBtn) {
        discordHelpBtn.target = '_blank';
        discordHelpBtn.rel = 'noopener noreferrer';
        discordHelpBtn.onclick = null;
    }
    
    // Ссылка в футере
    document.querySelectorAll('a[href*="discord"]').forEach(link => {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.onclick = null;
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
    
    // ========== КОПИРОВАНИЕ БИНДОВ (ИСПРАВЛЕННАЯ ВЕРСИЯ) ==========
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
    
    // ========== ПАРАЛЛАКС ЭФФЕКТ ==========
    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
        
        // Параллакс для карточек на главной
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            const speed = 0.1 + (index * 0.05);
            card.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
        });
    });
    
    // ========== ОБРАБОТКА ХЭША В URL ==========
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        // Небольшая задержка для плавного перехода
        setTimeout(() => {
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс к соответствующей ссылке
            const targetLink = document.querySelector(`.nav-link[href="#${hash}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
            
            // Скрываем все секции
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем целевую секцию
            const targetSection = document.getElementById(hash);
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
        }, 300);
    }
    
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
        
        // Превью 3D вида
        document.querySelectorAll('.base-preview-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const baseId = this.getAttribute('data-base');
                // Здесь можно добавить модальное окно с 3D превью
                alert(`Превью базы #${baseId}. В будущем здесь будет 3D модель базы!`);
            });
        });
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
    
    // ========== ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ ==========
    
    // Анимация иконок при наведении
    document.querySelectorAll('.nav-link i, .btn i, .card i').forEach(icon => {
        icon.style.transition = 'transform 0.3s ease';
        
        const parent = icon.parentElement;
        parent.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
        });
        
        parent.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Анимация Discord лого
    const discordLogo = document.querySelector('.discord-logo');
    if (discordLogo) {
        discordLogo.style.animation = 'float 4s ease-in-out infinite';
    }
    
    // ========== КЛАВИАТУРНЫЕ СОКРАЩЕНИЯ ==========
    document.addEventListener('keydown', function(e) {
        // Ctrl + C для быстрого копирования (когда фокус на кнопке копирования)
        if (e.ctrlKey && e.key === 'c') {
            const activeCopyBtn = document.querySelector('.copy-btn:focus');
            if (activeCopyBtn) {
                activeCopyBtn.click();
            }
        }
        
        // Escape для скрытия уведомлений
        if (e.key === 'Escape' && copyNotification) {
            copyNotification.classList.remove('show');
            if (notificationTimer) {
                clearTimeout(notificationTimer);
            }
        }
        
        // Стрелки для навигации по табам
        if (document.activeElement.classList.contains('tab-btn')) {
            const currentTab = document.activeElement;
            const tabIndex = Array.from(tabBtns).indexOf(currentTab);
            
            if (e.key === 'ArrowRight' && tabIndex < tabBtns.length - 1) {
                tabBtns[tabIndex + 1].click();
                tabBtns[tabIndex + 1].focus();
            } else if (e.key === 'ArrowLeft' && tabIndex > 0) {
                tabBtns[tabIndex - 1].click();
                tabBtns[tabIndex - 1].focus();
            }
        }
    });
    
    // ========== АНИМАЦИЯ ЗАГРУЗКИ ==========
    // Плавное появление всего контента после загрузки
    setTimeout(() => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 10);
    }, 100);
    
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
    
    // ========== ИНИЦИАЛИЗАЦИЯ ВСЕХ АНИМАЦИЙ ==========
    console.log('✅ Cobalt BAB инициализирован! Все системы готовы.');
    console.log('📌 Особенности этой версии:');
    console.log('   • Уведомления о копировании работают корректно');
    console.log('   • Discord ссылки открываются в новой вкладке');
    console.log('   • Анимации плавные и оптимизированные');
    console.log('   • Секция баз с фильтрацией и сортировкой');
});