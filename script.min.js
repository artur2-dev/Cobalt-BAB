// Cobalt BAB main script (rebuilt)
(function() {
  let particlesLoaderPromise = null;
  let checklistDelegatedHandlersBound = false;

  // ===== Preloader =====
  document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = document.querySelector('.progress-percent');
    const startTime = performance.now();
    let finished = false;
    let siteStarted = false;
    let safetyTimer = 0;
    let finishTimer = 0;

    const startSiteOnce = () => {
      if (siteStarted) return;
      siteStarted = true;
      startSite();
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safetyTimer);
      clearTimeout(finishTimer);
      if (!preloader) return startSiteOnce();
      preloader.classList.add('loaded');
      document.body.style.overflow = '';
      setTimeout(() => {
        preloader.style.display = 'none';
        startSiteOnce();
      }, 250);
    };

    if (!preloader) return startSiteOnce();

    document.body.style.overflow = 'hidden';
    let progress = 0;
    const tick = () => {
      progress = Math.min(100, progress + 5);
      if (progressFill) progressFill.style.width = progress + '%';
      if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
      if (progress < 95) setTimeout(tick, 80);
    };
    setTimeout(tick, 100);

    window.addEventListener('load', () => {
      if (progressFill) progressFill.style.width = '100%';
      if (progressPercent) progressPercent.textContent = '100%';
      const elapsed = performance.now() - startTime;
      const delay = elapsed > 1200 ? 150 : 400;
      finishTimer = setTimeout(finish, delay);
    }, { once: true });

    // На возврате из bfcache "load" может не сработать повторно
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) finish();
    }, { once: true });

    if (document.readyState === 'complete') {
      if (progressFill) progressFill.style.width = '100%';
      if (progressPercent) progressPercent.textContent = '100%';
      finishTimer = setTimeout(finish, 120);
    }

    safetyTimer = setTimeout(finish, 4000); // safety
  });

  // ===== Start site logic =====
  function startSite() {
    initializeSite();
  }

  // ===== Main site =====
  function initializeSite() {
    // Lazy images
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    const header = document.querySelector('header');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('.section'));
    const hasHashNav = navLinks.some(link => (link.getAttribute('href') || '').startsWith('#'));

    initA11yEnhancements();
    syncActiveNavAria();
    initHeroParticles();
    initHeroCinematicBackground();
    initHomeNewsFeed();
    initHomeChangelog();
    initFirstVisitTour();
    initScrollReveal();

    // Для многостраничной версии: если на странице одна .section, показываем её сразу.
    if (sections.length === 1 && !sections[0].classList.contains('active')) {
      sections[0].classList.add('active');
    }

    // Mobile hamburger
    if (window.innerWidth <= 992) {
      const hamburger = document.createElement('button');
      hamburger.className = 'hamburger';
      hamburger.innerHTML = '<span></span><span></span><span></span>';
      hamburger.setAttribute('aria-label', 'Меню');
      hamburger.setAttribute('aria-expanded', 'false');
      const overlay = document.createElement('div');
      overlay.className = 'menu-overlay';
      const headerContainer = document.querySelector('header .container');
      const nav = document.querySelector('nav');
      if (headerContainer && nav) {
        const ctrl = document.createElement('div');
        ctrl.className = 'mobile-header-controls';
        ctrl.appendChild(hamburger);
        headerContainer.appendChild(ctrl);
        document.body.appendChild(overlay);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close';
        closeBtn.innerHTML = '&times;';
        nav.prepend(closeBtn);
        const toggle = (open) => {
          const state = (typeof open === 'boolean') ? open : !nav.classList.contains('active');
          nav.classList.toggle('active', state);
          overlay.classList.toggle('active', state);
          hamburger.classList.toggle('active', state);
          document.body.classList.toggle('menu-open', state);
          hamburger.setAttribute('aria-expanded', state);
        };
        hamburger.addEventListener('click', e => { e.stopPropagation(); toggle(); });
        overlay.addEventListener('click', () => toggle(false));
        closeBtn.addEventListener('click', () => toggle(false));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
        navLinks.forEach(l => l.addEventListener('click', () => toggle(false)));
      }
    }

    // Smooth scroll & nav active
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        e.preventDefault();
        setActiveNav(href.substring(1));
      });
    });

    const setActiveNav = (id) => {
      if (hasHashNav) {
        navLinks.forEach(l => l.classList.remove('active'));
        const targetLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (targetLink) targetLink.classList.add('active');
      }
      syncActiveNavAria();
      sections.forEach(s => s.classList.toggle('active', s.id === id));
      const section = document.getElementById(id);
      if (section) {
        const top = section.offsetTop - (header ? header.offsetHeight + 10 : 0);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    const initialHash = window.location.hash.slice(1);
    if (initialHash && document.getElementById(initialHash)) setActiveNav(initialHash);
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash && document.getElementById(hash)) setActiveNav(hash);
    });

    // Tabs: binds
    setupTabs('.category-tabs .tab-btn', '.bind-category', 'data-category');
    // Tabs: guides
    setupTabs('.guides-tabs .guide-tab-btn', '.guide-category', 'data-guide');
    // Interactive checklist: guides
    initGuideChecklist();
    // Filters + sort: bases
    setupBasesGrid();
    // Visual key chips for binds page
    decorateBindKeyChips();

    function initA11yEnhancements() {
      const main = document.querySelector('main');
      if (main && !main.id) main.id = 'main-content';

      if (main && !document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Перейти к содержимому';
        document.body.prepend(skipLink);
      }

      const nav = document.querySelector('header nav');
      if (nav && !nav.getAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Основная навигация');
      }
    }

    function syncActiveNavAria() {
      navLinks.forEach((link) => {
        if (link.classList.contains('active')) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function setupTabs(btnSelector, panelSelector, attr) {
      const buttons = Array.from(document.querySelectorAll(btnSelector));
      const panels = Array.from(document.querySelectorAll(panelSelector));
      if (!buttons.length || !panels.length) return;

      const tablist = buttons[0].parentElement;
      if (tablist && !tablist.hasAttribute('role')) tablist.setAttribute('role', 'tablist');

      const activate = (id, { focusButton = false } = {}) => {
        buttons.forEach((b) => {
          const selected = b.getAttribute(attr) === id;
          b.classList.toggle('active', selected);
          b.setAttribute('aria-selected', selected ? 'true' : 'false');
          b.setAttribute('tabindex', selected ? '0' : '-1');
          if (selected && focusButton) b.focus();
        });

        panels.forEach((p) => {
          const isActive = p.id === id;
          p.classList.toggle('active', isActive);
          p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
          p.toggleAttribute('hidden', !isActive);
        });
      };

      buttons.forEach((btn, index) => {
        const id = btn.getAttribute(attr);
        if (!id) return;

        const panel = panels.find((p) => p.id === id);
        const tabId = `${id}-tab`;

        btn.id = tabId;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-controls', id);

        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tabId);
        }

        btn.addEventListener('click', () => activate(id));
        btn.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const dir = event.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = (index + dir + buttons.length) % buttons.length;
            const nextId = buttons[nextIndex].getAttribute(attr);
            if (nextId) activate(nextId, { focusButton: true });
            return;
          }
          if (event.key === 'Home') {
            event.preventDefault();
            const firstId = buttons[0].getAttribute(attr);
            if (firstId) activate(firstId, { focusButton: true });
            return;
          }
          if (event.key === 'End') {
            event.preventDefault();
            const lastId = buttons[buttons.length - 1].getAttribute(attr);
            if (lastId) activate(lastId, { focusButton: true });
          }
        });
      });

      const initial = buttons.find((b) => b.classList.contains('active')) || buttons[0];
      const initialId = initial.getAttribute(attr);
      if (initialId) activate(initialId);
    }

    function initGuideChecklist() {
      const checklistItems = Array.from(document.querySelectorAll('.checklist-item'));
      if (!checklistItems.length) return;

      const syncItemState = (item, checked) => {
        item.classList.toggle('checked', checked);
        item.setAttribute('aria-checked', checked ? 'true' : 'false');

        const icon = item.querySelector('.check-icon i');
        if (!icon) return;

        icon.classList.remove('fas', 'far', 'fa-check-circle', 'fa-circle');
        if (checked) {
          icon.classList.add('fas', 'fa-check-circle');
        } else {
          icon.classList.add('far', 'fa-circle');
        }
      };

      checklistItems.forEach((item) => {
        if (item.dataset.checklistReady === 'true') return;
        item.dataset.checklistReady = 'true';

        const initialChecked = item.classList.contains('checked');
        item.setAttribute('role', 'checkbox');
        item.setAttribute('tabindex', '0');
        syncItemState(item, initialChecked);
      });

      if (checklistDelegatedHandlersBound) return;
      checklistDelegatedHandlersBound = true;

      const toggleItem = (item) => {
        const next = !item.classList.contains('checked');
        syncItemState(item, next);
      };

      document.addEventListener('click', (event) => {
        const item = event.target instanceof Element ? event.target.closest('.checklist-item') : null;
        if (!item) return;
        toggleItem(item);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const active = document.activeElement;
        if (!(active instanceof Element) || !active.classList.contains('checklist-item')) return;
        event.preventDefault();
        toggleItem(active);
      });
    }

    function initHomeNewsFeed() {
      const newsRoot = document.querySelector('[data-news-feed]');
      if (!newsRoot) return;

      const list = newsRoot.querySelector('[data-news-list]');
      const status = newsRoot.querySelector('[data-news-status]');
      const sourceUrl = newsRoot.getAttribute('data-news-src') || 'assets/data/news.json';
      if (!list) return;
      const fallbackItems = [
        {
          date: '2026-02-07T21:00:00+03:00',
          type: 'Ивент',
          title: 'Ночной PvP-турнир 2x2',
          text: 'Сбор в голосовом канале в 20:45 МСК. Победителей ждут роли и призы.',
          url: 'https://discord.gg/Q8ZfawakxS'
        },
        {
          date: '2026-02-06T19:30:00+03:00',
          type: 'Анонс',
          title: 'Обновили раздел гайдов',
          text: 'Добавили новые советы для новичков по фарму, стартовой базе и безопасным зонам.',
          url: 'guides.html'
        },
        {
          date: '2026-02-05T22:00:00+03:00',
          type: 'Вайп',
          title: 'Плановый вайп в воскресенье',
          text: 'Следующий вайп сервера запланирован на 8 февраля в 13:00 МСК.',
          url: 'https://discord.gg/Q8ZfawakxS'
        }
      ];

      const typeMeta = {
        'анонс': { label: 'Анонс', className: 'news-type-announcement' },
        'ивент': { label: 'Ивент', className: 'news-type-event' },
        'вайп': { label: 'Вайп', className: 'news-type-wipe' },
        'обновление': { label: 'Обновление', className: 'news-type-update' }
      };

      const showStatus = (text, isError) => {
        if (!status) return;
        status.textContent = text;
        status.hidden = false;
        status.classList.toggle('is-error', !!isError);
      };

      const hideStatus = () => {
        if (!status) return;
        status.hidden = true;
      };

      const parseDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
      };

      const formatDate = (dateValue) => {
        const date = parseDate(dateValue);
        if (!date) return 'Без даты';
        return date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(',', '');
      };

      const getType = (rawType) => {
        if (!rawType) return { label: 'Новость', className: 'news-type-default' };
        const key = String(rawType).trim().toLowerCase();
        return typeMeta[key] || { label: rawType, className: 'news-type-default' };
      };

      const createCard = (item) => {
        const article = document.createElement('article');
        article.className = 'news-card';

        const head = document.createElement('div');
        head.className = 'news-card-head';

        const type = getType(item.type);
        const badge = document.createElement('span');
        badge.className = `news-type ${type.className}`;
        badge.textContent = type.label;

        const date = document.createElement('time');
        date.className = 'news-date';
        date.dateTime = item.date || '';
        date.textContent = formatDate(item.date);

        head.appendChild(badge);
        head.appendChild(date);

        const title = document.createElement('h4');
        title.className = 'news-title';
        title.textContent = item.title || 'Без названия';

        article.appendChild(head);
        article.appendChild(title);

        if (item.text) {
          const text = document.createElement('p');
          text.className = 'news-text';
          text.textContent = item.text;
          article.appendChild(text);
        }

        if (item.url) {
          const link = document.createElement('a');
          link.className = 'news-link';
          link.href = item.url;
          link.textContent = 'Подробнее';
          if (/^https?:\/\//i.test(item.url)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
          article.appendChild(link);
        }

        return article;
      };

      const renderFeed = (items) => {
        list.innerHTML = '';
        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
          fragment.appendChild(createCard(item));
        });
        list.appendChild(fragment);
      };

      fetch(sourceUrl, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) throw new Error('Bad data');
          const items = data
            .filter((item) => item && item.title && item.date)
            .sort((a, b) => {
              const aDate = parseDate(a.date);
              const bDate = parseDate(b.date);
              if (!aDate && !bDate) return 0;
              if (!aDate) return 1;
              if (!bDate) return -1;
              return bDate - aDate;
            })
            .slice(0, 5);

          if (!items.length) {
            list.hidden = true;
            showStatus('Пока новостей нет. Скоро добавим обновления.', false);
            return;
          }

          renderFeed(items);
          list.hidden = false;
          hideStatus();
        })
        .catch(() => {
          if (fallbackItems.length) {
            renderFeed(fallbackItems);
            list.hidden = false;
            showStatus('Показываем встроенные новости (offline режим).', false);
            return;
          }
          list.hidden = true;
          showStatus('Не удалось загрузить новости. Проверьте файл assets/data/news.json', true);
        });
    }

    function initHomeChangelog() {
      const changelogRoot = document.querySelector('[data-changelog-feed]');
      if (!changelogRoot) return;

      const list = changelogRoot.querySelector('[data-changelog-list]');
      const status = changelogRoot.querySelector('[data-changelog-status]');
      const moreBtn = changelogRoot.querySelector('[data-changelog-more]');
      const sourceUrl = changelogRoot.getAttribute('data-changelog-src') || 'assets/data/changelog.json';
      if (!list) return;

      const fallbackItems = [
        {
          date: '2026-02-07T23:35:00+03:00',
          type: 'Фича',
          status: 'done',
          title: 'Добавили хронологию обновлений на главную',
          text: 'Новый блок показывает последние апдейты сайта в формате таймлайна.',
          url: 'index.html'
        },
        {
          date: '2026-02-07T22:50:00+03:00',
          type: 'Улучшение',
          status: 'done',
          title: 'Прокачали ленту новостей сервера',
          text: 'Лента стала более живой, а главное объявление читается заметно лучше.',
          url: 'index.html#homeNewsTitle'
        },
        {
          date: '2026-02-07T20:20:00+03:00',
          type: 'Фикс',
          status: 'done',
          title: 'Исправили чеклист в гайдах',
          text: 'Чеклист снова корректно переключается кликом и клавиатурой.',
          url: 'guides.html'
        }
      ];

      const typeMeta = {
        'фича': { label: 'Фича', className: 'changelog-type-feature' },
        'улучшение': { label: 'Улучшение', className: 'changelog-type-improve' },
        'фикс': { label: 'Фикс', className: 'changelog-type-fix' },
        'план': { label: 'План', className: 'changelog-type-plan' }
      };

      const statusMeta = {
        'done': { label: 'Готово', className: 'changelog-status-done' },
        'in_progress': { label: 'В работе', className: 'changelog-status-progress' },
        'planned': { label: 'Запланировано', className: 'changelog-status-planned' }
      };

      let allItems = [];
      let expanded = false;
      const collapsedLimit = 5;

      const showStatus = (text, isError) => {
        if (!status) return;
        status.textContent = text;
        status.hidden = false;
        status.classList.toggle('is-error', !!isError);
      };

      const hideStatus = () => {
        if (!status) return;
        status.hidden = true;
      };

      const parseDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
      };

      const formatDate = (dateValue) => {
        const date = parseDate(dateValue);
        if (!date) return 'Без даты';
        return date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(',', '');
      };

      const isThisWeek = (dateValue) => {
        const date = parseDate(dateValue);
        if (!date) return false;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      };

      const getType = (rawType) => {
        const key = String(rawType || '').trim().toLowerCase();
        return typeMeta[key] || { label: rawType || 'Обновление', className: 'changelog-type-default' };
      };

      const getStatus = (rawStatus) => {
        const key = String(rawStatus || '').trim().toLowerCase();
        return statusMeta[key] || { label: 'Готово', className: 'changelog-status-done' };
      };

      const createItem = (item) => {
        const article = document.createElement('article');
        article.className = 'changelog-item';
        if (isThisWeek(item.date)) {
          article.classList.add('is-week');
        }

        const head = document.createElement('div');
        head.className = 'changelog-item-head';

        const meta = document.createElement('div');
        meta.className = 'changelog-meta';

        const type = getType(item.type);
        const typeBadge = document.createElement('span');
        typeBadge.className = `changelog-pill ${type.className}`;
        typeBadge.textContent = type.label;

        const stage = getStatus(item.status);
        const stageBadge = document.createElement('span');
        stageBadge.className = `changelog-pill ${stage.className}`;
        stageBadge.textContent = stage.label;

        meta.appendChild(typeBadge);
        meta.appendChild(stageBadge);

        if (isThisWeek(item.date)) {
          const weekBadge = document.createElement('span');
          weekBadge.className = 'changelog-week-badge';
          weekBadge.textContent = 'Эта неделя';
          meta.appendChild(weekBadge);
        }

        const date = document.createElement('time');
        date.className = 'changelog-date';
        date.dateTime = item.date || '';
        date.textContent = formatDate(item.date);

        head.appendChild(meta);
        head.appendChild(date);

        const title = document.createElement('h4');
        title.className = 'changelog-title';
        title.textContent = item.title || 'Обновление';

        const text = document.createElement('p');
        text.className = 'changelog-text';
        text.textContent = item.text || '';

        article.appendChild(head);
        article.appendChild(title);
        article.appendChild(text);

        if (item.url) {
          const link = document.createElement('a');
          link.className = 'changelog-link';
          link.href = item.url;
          link.textContent = 'Открыть';
          if (/^https?:\/\//i.test(item.url)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
          article.appendChild(link);
        }

        return article;
      };

      const syncMoreButton = () => {
        if (!moreBtn) return;
        const canExpand = allItems.length > collapsedLimit;
        moreBtn.hidden = !canExpand;
        if (!canExpand) return;

        const icon = moreBtn.querySelector('i');
        const text = moreBtn.querySelector('span');
        if (icon) {
          icon.classList.toggle('fa-plus', !expanded);
          icon.classList.toggle('fa-minus', expanded);
        }
        if (text) {
          text.textContent = expanded ? 'Свернуть' : 'Показать ещё';
        }
      };

      const render = () => {
        const visible = expanded ? allItems : allItems.slice(0, collapsedLimit);
        list.innerHTML = '';

        if (!visible.length) {
          list.hidden = true;
          showStatus('Пока обновлений нет.', false);
          syncMoreButton();
          return;
        }

        const fragment = document.createDocumentFragment();
        visible.forEach((item) => fragment.appendChild(createItem(item)));
        list.appendChild(fragment);
        list.hidden = false;
        hideStatus();
        syncMoreButton();
      };

      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          expanded = !expanded;
          render();
        });
      }

      fetch(sourceUrl, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) throw new Error('Bad data');
          allItems = data
            .filter((item) => item && item.title && item.text && item.date)
            .sort((a, b) => {
              const aDate = parseDate(a.date);
              const bDate = parseDate(b.date);
              if (!aDate && !bDate) return 0;
              if (!aDate) return 1;
              if (!bDate) return -1;
              return bDate - aDate;
            })
            .slice(0, 12);
          render();
        })
        .catch(() => {
          allItems = fallbackItems;
          render();
          showStatus('Показываем встроенную хронологию (offline режим).', false);
        });
    }

    function initFirstVisitTour() {
      const isDesktop = window.matchMedia('(min-width: 1100px)').matches;
      if (!isDesktop) return;
      if (!document.body || document.body.getAttribute('data-page') !== 'home') return;

      const forceTour = /(?:\?|&)tour=1(?:&|$)/.test(window.location.search);
      const storageKey = 'cobalt_site_tour_seen_v1';
      let alreadySeen = false;
      try {
        alreadySeen = localStorage.getItem(storageKey) === '1';
      } catch (e) {
        alreadySeen = false;
      }
      if (alreadySeen && !forceTour) return;

      const steps = [
        {
          selector: '.nav-link[href="binds.html"]',
          title: 'Бинды',
          text: 'Здесь собраны самые полезные команды для Rust. Можно быстро скопировать и вставить в игру.'
        },
        {
          selector: '.nav-link[href="guides.html"]',
          title: 'Гайды',
          text: 'Пошаговые разборы для старта, фарма, PvP и развития. Отличная точка входа для новичков.'
        },
        {
          selector: '.nav-link[href="faq.html"]',
          title: 'FAQ',
          text: 'Ответы на частые вопросы по серверу и игровым моментам. Удобно, когда нужен быстрый ответ.'
        },
        {
          selector: '.home-news, [data-news-feed]',
          title: 'Лента новостей',
          text: 'Тут публикуются актуальные анонсы и события сервера, чтобы ты всегда был в курсе.'
        }
      ];

      const preparedSteps = steps
        .map((step) => {
          const target = document.querySelector(step.selector);
          if (!target) return null;
          return { ...step, target };
        })
        .filter(Boolean);

      if (preparedSteps.length < 3) return;

      const root = document.createElement('div');
      root.className = 'site-tour';
      root.innerHTML = `
        <div class="site-tour-backdrop" data-tour-close="true"></div>
        <div class="site-tour-spotlight" aria-hidden="true"></div>
        <section class="site-tour-panel" role="dialog" aria-modal="true" aria-label="Мини-тур по сайту">
          <div class="site-tour-head">
            <span class="site-tour-kicker"><i class="fas fa-compass"></i> Мини-тур</span>
            <button type="button" class="site-tour-skip" data-tour-skip>Пропустить</button>
          </div>
          <h4 class="site-tour-title"></h4>
          <p class="site-tour-text"></p>
          <div class="site-tour-progress" aria-hidden="true"></div>
          <div class="site-tour-controls">
            <button type="button" class="site-tour-btn is-ghost" data-tour-prev>Назад</button>
            <button type="button" class="site-tour-btn is-primary" data-tour-next>Далее</button>
          </div>
        </section>
      `;

      document.body.appendChild(root);
      document.body.classList.add('tour-open');

      const panel = root.querySelector('.site-tour-panel');
      const backdrop = root.querySelector('.site-tour-backdrop');
      const titleEl = root.querySelector('.site-tour-title');
      const textEl = root.querySelector('.site-tour-text');
      const progressEl = root.querySelector('.site-tour-progress');
      const prevBtn = root.querySelector('[data-tour-prev]');
      const nextBtn = root.querySelector('[data-tour-next]');
      const skipBtn = root.querySelector('[data-tour-skip]');

      if (!panel || !titleEl || !textEl || !progressEl || !prevBtn || !nextBtn || !skipBtn) {
        root.remove();
        document.body.classList.remove('tour-open');
        return;
      }

      let currentStep = 0;
      let currentTarget = null;
      let rafId = 0;

      const progressDots = preparedSteps.map((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'site-tour-dot';
        dot.setAttribute('data-index', String(index));
        progressEl.appendChild(dot);
        return dot;
      });
      progressEl.style.gridTemplateColumns = `repeat(${preparedSteps.length}, minmax(0, 1fr))`;

      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

      const markSeen = () => {
        try {
          localStorage.setItem(storageKey, '1');
        } catch (e) {
          // no-op
        }
      };

      const smoothBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

      const ensureTargetInView = (target) => {
        const rect = target.getBoundingClientRect();
        const outOfView = rect.top < 86 || rect.bottom > (window.innerHeight - 86);
        if (outOfView) {
          target.scrollIntoView({ behavior: smoothBehavior, block: 'center', inline: 'nearest' });
        }
      };

      const updateSpotlight = () => {
        const step = preparedSteps[currentStep];
        if (!step || !step.target) return;
        const rect = step.target.getBoundingClientRect();
        const pad = 10;
        const left = clamp(rect.left - pad, 8, window.innerWidth - 20);
        const top = clamp(rect.top - pad, 8, window.innerHeight - 20);
        const width = clamp(rect.width + pad * 2, 22, window.innerWidth - left - 8);
        const height = clamp(rect.height + pad * 2, 22, window.innerHeight - top - 8);

        root.style.setProperty('--tour-x', `${left}px`);
        root.style.setProperty('--tour-y', `${top}px`);
        root.style.setProperty('--tour-w', `${width}px`);
        root.style.setProperty('--tour-h', `${height}px`);

        const panelRect = panel.getBoundingClientRect();
        const edge = 16;
        let panelTop = rect.bottom + 18;
        if (panelTop + panelRect.height > window.innerHeight - edge) {
          panelTop = rect.top - panelRect.height - 18;
          root.classList.add('panel-above');
        } else {
          root.classList.remove('panel-above');
        }
        panelTop = clamp(panelTop, edge, window.innerHeight - panelRect.height - edge);
        let panelLeft = rect.left + rect.width / 2 - panelRect.width / 2;
        panelLeft = clamp(panelLeft, edge, window.innerWidth - panelRect.width - edge);

        panel.style.left = `${panelLeft}px`;
        panel.style.top = `${panelTop}px`;
      };

      const requestSpotlightUpdate = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateSpotlight);
      };

      const renderStep = () => {
        const step = preparedSteps[currentStep];
        if (!step) return;

        if (currentTarget) currentTarget.classList.remove('site-tour-target');
        currentTarget = step.target;
        currentTarget.classList.add('site-tour-target');

        titleEl.textContent = step.title;
        textEl.textContent = step.text;

        progressDots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentStep);
          dot.classList.toggle('is-done', index < currentStep);
        });

        prevBtn.disabled = currentStep === 0;
        nextBtn.textContent = currentStep === preparedSteps.length - 1 ? 'Готово' : 'Далее';

        ensureTargetInView(step.target);
        setTimeout(() => requestSpotlightUpdate(), 60);
      };

      const closeTour = (saveSeen) => {
        if (saveSeen) markSeen();
        cancelAnimationFrame(rafId);
        if (currentTarget) currentTarget.classList.remove('site-tour-target');
        window.removeEventListener('resize', requestSpotlightUpdate);
        window.removeEventListener('scroll', requestSpotlightUpdate, true);
        document.removeEventListener('keydown', onKeydown);
        root.classList.remove('is-open');
        document.body.classList.remove('tour-open');
        setTimeout(() => root.remove(), 180);
      };

      const goNext = () => {
        if (currentStep >= preparedSteps.length - 1) {
          closeTour(true);
          return;
        }
        currentStep += 1;
        renderStep();
      };

      const goPrev = () => {
        if (currentStep <= 0) return;
        currentStep -= 1;
        renderStep();
      };

      const onKeydown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeTour(true);
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        }
      };

      nextBtn.addEventListener('click', goNext);
      prevBtn.addEventListener('click', goPrev);
      skipBtn.addEventListener('click', () => closeTour(true));
      if (backdrop) backdrop.addEventListener('click', () => closeTour(true));

      window.addEventListener('resize', requestSpotlightUpdate);
      window.addEventListener('scroll', requestSpotlightUpdate, true);
      document.addEventListener('keydown', onKeydown);

      setTimeout(() => {
        root.classList.add('is-open');
        renderStep();
      }, 550);
    }

    function initScrollReveal() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;

      const selector = [
        '.features .feature-card',
        '.home-news .news-card',
        '.home-changelog .changelog-item',
        '#binds .bind-card',
        '#guides .guide-main-card',
        '#guides .guide-side-card',
        '#guides .guide-card',
        '#guides .pvp-card',
        '#bases .base-card',
        '#bases .info-card',
        '#faq .faq-item',
        '#team .team-card'
      ].join(', ');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.14,
        rootMargin: '0px 0px -10% 0px'
      });

      const bindTargets = () => {
        const items = Array.from(document.querySelectorAll(selector));
        items.forEach((item, index) => {
          if (item.dataset.revealReady === 'true') return;
          item.dataset.revealReady = 'true';
          item.classList.add('reveal-item');
          item.style.setProperty('--reveal-delay', `${(index % 6) * 65}ms`);
          const rect = item.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.9) {
            item.classList.add('is-revealed');
          } else {
            observer.observe(item);
          }
        });
      };

      bindTargets();

      const dynamicRoots = [
        document.querySelector('[data-news-list]'),
        document.querySelector('[data-changelog-list]')
      ].filter(Boolean);

      if (dynamicRoots.length && 'MutationObserver' in window) {
        const watcher = new MutationObserver(() => bindTargets());
        dynamicRoots.forEach((root) => watcher.observe(root, { childList: true }));
      }
    }

    function decorateBindKeyChips() {
      if (!document.body || document.body.getAttribute('data-page') !== 'binds') return;
      const bindKeyRows = document.querySelectorAll('#binds .bind-key');
      if (!bindKeyRows.length) return;

      const keyTokenRegex = /\b(F\d{1,2}|MOUSE\d|ПКМ|ЛКМ|КОЛ[ЕЁ]СИКО|[A-ZА-ЯЁ]|\d)\b/gi;
      const normalizeChip = (token) => {
        const upper = token.toUpperCase().replace('Ё', 'Е');
        if (upper === 'ПКМ') return 'RMB';
        if (upper === 'ЛКМ') return 'LMB';
        if (upper === 'КОЛЕСИКО') return 'MOUSE3';
        return upper;
      };

      bindKeyRows.forEach((row) => {
        if (row.dataset.keysDecorated === 'true') return;
        row.dataset.keysDecorated = 'true';

        const icon = row.querySelector('i');
        const iconHTML = icon ? icon.outerHTML : '<i class="fas fa-keyboard"></i>';
        const originalText = (row.textContent || '').replace(/\s+/g, ' ').trim();
        const keyText = originalText.replace(/^Клавиша:\s*/i, '').trim();
        if (!keyText) return;

        let chipCount = 0;
        const decorated = keyText.replace(keyTokenRegex, (match) => {
          chipCount += 1;
          return `<span class="key-chip">${normalizeChip(match)}</span>`;
        });

        const fallbackChip = chipCount === 0 && /консоль/i.test(keyText)
          ? ' <span class="key-chip">F1</span>'
          : '';

        row.innerHTML = `${iconHTML}<span class="key-line">${decorated}${fallbackChip}</span>`;
      });
    }

    // Copy buttons
    const copyBtns = document.querySelectorAll('.copy-btn');
    const copyNotification = document.getElementById('copyNotification');
    let notifyTimer;
    const showToast = (text, error) => {
      if (!copyNotification) return;
      copyNotification.textContent = text;
      copyNotification.style.background = error ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : 'var(--gradient-primary)';
      copyNotification.classList.remove('show');
      void copyNotification.offsetWidth;
      copyNotification.classList.add('show');
      clearTimeout(notifyTimer);
      notifyTimer = setTimeout(()=>copyNotification.classList.remove('show'), 2000);
    };
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        const txt = btn.getAttribute('data-clipboard-text') || btn.textContent;
        btn.classList.add('copied');
        const prev = btn.innerHTML;
        try {
          await navigator.clipboard.writeText(txt);
          btn.innerHTML = "<i class='fas fa-check'></i> Скопировано";
          showToast('Скопировано в буфер!');
        } catch(err) {
          btn.innerHTML = "<i class='fas fa-times'></i> Ошибка";
          showToast('Не удалось скопировать', true);
        }
        setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = prev; }, 900);
      });
    });

    // FAQ accordion + filters
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearch = document.getElementById('faqSearch');
    const faqNoResults = document.querySelector('.faq-no-results');
    const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');

    faqItems.forEach((item, index) => {
      const header = item.querySelector('.faq-header');
      const content = item.querySelector('.faq-content');
      if (!header || !content) return;

      const panelId = content.id || `faq-panel-${index + 1}`;
      const triggerId = header.id || `faq-trigger-${index + 1}`;

      content.id = panelId;
      content.hidden = true;
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', triggerId);

      header.id = triggerId;
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', panelId);
      header.setAttribute('aria-expanded', 'false');

      const activate = () => toggleFAQ(item, content);
      header.addEventListener('click', activate);
      header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
    function toggleFAQ(item, content){
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i=>{
        i.classList.remove('active');
        const h = i.querySelector('.faq-header');
        const c = i.querySelector('.faq-content');
        if (h) h.setAttribute('aria-expanded', 'false');
        if (c) {
          c.style.maxHeight = '0px';
          c.hidden = true;
        }
      });
      if (!isOpen){
        item.classList.add('active');
        const header = item.querySelector('.faq-header');
        if (header) header.setAttribute('aria-expanded', 'true');
        content.hidden = false;
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    }

    function initHeroParticles() {
      const container = document.getElementById('particles-js');
      if (!container) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        container.style.display = 'none';
        return;
      }

      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const config = {
        particles: {
          number: {
            value: isMobile ? 28 : 54,
            density: { enable: true, value_area: 900 }
          },
          color: { value: ['#00d4ff', '#3498db', '#8be9ff'] },
          shape: { type: 'circle' },
          opacity: { value: 0.42, random: true },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 140,
            color: '#00d4ff',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: isMobile ? 1.3 : 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: {
            grab: { distance: 140, line_linked: { opacity: 0.35 } },
            push: { particles_nb: 3 }
          }
        },
        retina_detect: true
      };

      const startParticles = () => {
        if (typeof window.particlesJS !== 'function') return;
        container.innerHTML = '';
        window.particlesJS('particles-js', config);
      };

      if (typeof window.particlesJS === 'function') {
        startParticles();
        return;
      }

      loadParticlesLibrary().then((loaded) => {
        if (!loaded) return;
        startParticles();
      });
    }

    function initHeroCinematicBackground() {
      const cinematic = document.querySelector('.hero-cinematic-bg');
      if (!cinematic) return;

      const video = cinematic.querySelector('.hero-bg-video');
      if (!video) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cinematic.classList.add('video-disabled');
        try {
          video.pause();
        } catch (e) {
          // no-op
        }
        return;
      }

      const markReady = () => cinematic.classList.add('video-ready');
      const markFallback = () => cinematic.classList.remove('video-ready');

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      video.addEventListener('playing', markReady, { once: true });
      video.addEventListener('canplay', markReady, { once: true });
      video.addEventListener('error', markFallback, { once: true });
      video.addEventListener('stalled', markFallback);

      if (video.readyState >= 2) markReady();

      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          markFallback();
        });
      }
    }

    function loadParticlesLibrary() {
      if (typeof window.particlesJS === 'function') return Promise.resolve(true);
      if (particlesLoaderPromise) return particlesLoaderPromise;

      particlesLoaderPromise = new Promise((resolve) => {
        const existing = document.querySelector('script[data-particles-js="true"]');
        if (existing) {
          existing.addEventListener('load', () => resolve(true), { once: true });
          existing.addEventListener('error', () => resolve(false), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'assets/js/particles.min.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-particles-js', 'true');
        script.addEventListener('load', () => resolve(true), { once: true });
        script.addEventListener('error', () => resolve(false), { once: true });
        document.head.appendChild(script);
      });

      return particlesLoaderPromise;
    }

    function setupBasesGrid() {
      const filterBtns = Array.from(document.querySelectorAll('.bases-filters .filter-btn'));
      const sortSelect = document.querySelector('.bases-sort .sort-select');
      const grid = document.querySelector('.bases-grid');
      const cards = Array.from(document.querySelectorAll('.bases-grid .base-card'));

      if (!grid || !cards.length) return;

      const originalIndex = new Map(cards.map((card, idx) => [card, idx]));
      const costRank = { low: 1, medium: 2, high: 3 };
      let currentFilter = 'all';

      const getCardRating = (card) => {
        const ratingStat = Array.from(card.querySelectorAll('.base-stats .stat'))
          .find((el) => el.textContent.includes('/10'));
        if (!ratingStat) return 0;
        const text = ratingStat.textContent.trim();
        const value = parseFloat(text.split('/')[0].replace(',', '.'));
        return Number.isFinite(value) ? value : 0;
      };

      const getCardArea = (card) => {
        const size = (card.getAttribute('data-size') || '').toLowerCase();
        const parts = size.split('x').map((n) => parseInt(n, 10));
        if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
        return parts[0] * parts[1];
      };

      const applyFilter = () => {
        cards.forEach((card) => {
          const category = card.getAttribute('data-category') || '';
          const visible = currentFilter === 'all' || category === currentFilter;
          card.style.display = visible ? '' : 'none';
        });
      };

      const applySort = () => {
        const sortMode = sortSelect ? sortSelect.value : 'newest';
        const sorted = [...cards].sort((a, b) => {
          if (sortMode === 'popular') {
            return getCardRating(b) - getCardRating(a);
          }
          if (sortMode === 'size') {
            return getCardArea(b) - getCardArea(a);
          }
          if (sortMode === 'cost') {
            const aCost = costRank[a.getAttribute('data-cost')] || 999;
            const bCost = costRank[b.getAttribute('data-cost')] || 999;
            return aCost - bCost;
          }
          // newest: keep original order from HTML
          return (originalIndex.get(a) || 0) - (originalIndex.get(b) || 0);
        });

        sorted.forEach((card) => grid.appendChild(card));
      };

      const render = () => {
        applySort();
        applyFilter();
      };

      filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          currentFilter = btn.getAttribute('data-filter') || 'all';
          filterBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          render();
        });
      });

      if (sortSelect) {
        sortSelect.addEventListener('change', render);
      }

      render();
    }
    faqFilterBtns.forEach(btn => btn.addEventListener('click', ()=>{
      const cat = btn.getAttribute('data-category');
      faqFilterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const searchTerm = faqSearch ? faqSearch.value : '';
      filterFAQ(cat, searchTerm);
    }));
    if (faqSearch) faqSearch.addEventListener('input', ()=>{
      const activeBtn = document.querySelector('.faq-filter-btn.active');
      const cat = (activeBtn && activeBtn.getAttribute('data-category')) || 'all';
      filterFAQ(cat, faqSearch.value);
    });
    function filterFAQ(cat, term){
      term = term.toLowerCase();
      let visible=0;
      faqItems.forEach(item=>{
        const matchesCat = cat==='all' || item.getAttribute('data-category')===cat;
        const text = item.textContent.toLowerCase();
        const match = matchesCat && text.includes(term);
        item.classList.toggle('hidden', !match);
        if(match) visible++;
      });
      if (faqNoResults) faqNoResults.style.display = visible? 'none':'block';
    }

    // Discord counts
    const onlineEls = document.querySelectorAll('.discord-online, #discordOnline');
    const memberEls = document.querySelectorAll('.discord-members, #discordMembers');
    if (onlineEls.length || memberEls.length){
      const url = 'https://discord.com/api/v9/invites/Q8ZfawakxS?with_counts=true&with_expiration=true';
      const update = async ()=>{
        try {
          const res = await fetch(url, {cache:'no-store'});
          if(!res.ok) throw new Error(res.statusText);
          const data = await res.json();
          const online = data.approximate_presence_count;
          const members = data.approximate_member_count;
          if(online!==undefined) onlineEls.forEach(el=>el.textContent=online);
          if(members!==undefined) memberEls.forEach(el=>el.textContent=members);
        } catch(err){
          onlineEls.forEach(el=>el.textContent='—');
          memberEls.forEach(el=>el.textContent='—');
        }
      };
      update();
      setInterval(update,120000);
    }

    // Parallax glow
    const canHoverParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHoverParallax) {
      const parallaxCards = document.querySelectorAll('.bind-card, .guide-card, .faq-item, .feature-card, .base-card');
      parallaxCards.forEach(card => {
        card.classList.add('parallax-card');
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const tiltX = ((y/r.height)-0.5)*-6;
          const tiltY = ((x/r.width)-0.5)*8;
          card.style.setProperty('--tiltX', `${tiltX}deg`);
          card.style.setProperty('--tiltY', `${tiltY}deg`);
          card.style.setProperty('--glowX', `${x}px`);
          card.style.setProperty('--glowY', `${y}px`);
        });
        card.addEventListener('mouseleave', ()=>{
          card.style.removeProperty('--tiltX');
          card.style.removeProperty('--tiltY');
          card.style.removeProperty('--glowX');
          card.style.removeProperty('--glowY');
          card.style.transform = '';
        });
      });
    }

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn){
      window.addEventListener('scroll', ()=>{
        scrollTopBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
      }, { passive: true });
      scrollTopBtn.addEventListener('click', ()=>{
        window.scrollTo({top:0, behavior:'smooth'});
      });
    }

    console.log('✓ Cobalt BAB инициализирован.');
  }
})();
