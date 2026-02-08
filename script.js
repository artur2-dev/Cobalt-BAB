// Cobalt BAB main script (rebuilt)
(function() {
  let cobaltReadyPayload = null;
  const PAGE_BUNDLE_VERSION = 'F2C7B1AA';
  const PAGE_BUNDLE_MAP = Object.freeze({
    home: ['page-home.min.js', 'page-binds.min.js', 'page-guides.min.js', 'page-bases.min.js', 'page-faq.min.js'],
    binds: ['page-binds.min.js'],
    guides: ['page-guides.min.js'],
    bases: ['page-bases.min.js'],
    faq: ['page-faq.min.js']
  });
  const loadedPageBundles = new Set();

  window.CobaltOnReady = (callback) => {
    if (typeof callback !== 'function') return;
    if (cobaltReadyPayload) {
      callback(cobaltReadyPayload);
      return;
    }

    document.addEventListener('cobalt:ready', (event) => {
      callback(event.detail || {});
    }, { once: true });
  };

  function buildPageBundleUrl(fileName) {
    return `assets/js/${fileName}?v=${PAGE_BUNDLE_VERSION}`;
  }

  function dynamicImport(url) {
    try {
      return new Function('bundleUrl', 'return import(bundleUrl);')(url);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async function loadPageFeatureBundles(pageId) {
    const bundles = PAGE_BUNDLE_MAP[pageId];
    if (!Array.isArray(bundles) || !bundles.length) return;

    await Promise.all(bundles.map((fileName) => loadPageBundle(fileName)));
  }

  async function loadPageBundle(fileName) {
    const bundleUrl = buildPageBundleUrl(fileName);
    if (loadedPageBundles.has(bundleUrl)) return;
    loadedPageBundles.add(bundleUrl);

    const alreadyIncluded = Array.from(document.querySelectorAll('script[src]')).some((script) => {
      const src = script.getAttribute('src') || '';
      return src.indexOf(`assets/js/${fileName}`) !== -1;
    });
    if (alreadyIncluded) return;

    try {
      await dynamicImport(bundleUrl);
    } catch (error) {
      await injectPageBundleScript(bundleUrl, fileName);
    }
  }

  function injectPageBundleScript(url, fileName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.defer = true;
      script.setAttribute('data-page-bundle', fileName);
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${fileName}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  function showCinematicIntroIfNeeded(pageId) {
    const body = document.body;
    if (!body) return Promise.resolve();
    if (body.getAttribute('data-intro-disabled') === 'true') return Promise.resolve();

    const storageKey = 'cobalt_cinematic_intro_seen_v1';
    const introDuration = 3000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forceIntro = /(?:\?|&)intro=1(?:&|$)/.test(window.location.search);

    if (forceIntro && typeof window.history.replaceState === 'function') {
      try {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('intro');
        const cleanSearch = cleanUrl.searchParams.toString();
        const nextUrl = `${cleanUrl.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${cleanUrl.hash}`;
        window.history.replaceState({}, '', nextUrl);
      } catch (error) {
        // no-op
      }
    }

    if (pageId !== 'home') {
      return Promise.resolve();
    }

    let introSeen = false;
    try {
      introSeen = localStorage.getItem(storageKey) === '1';
    } catch (error) {
      introSeen = false;
    }

    const markSeen = () => {
      try {
        localStorage.setItem(storageKey, '1');
      } catch (error) {
        // no-op
      }
    };

    if (introSeen && !forceIntro) {
      return Promise.resolve();
    }

    if (reduceMotion) {
      markSeen();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const intro = document.createElement('div');
      intro.className = 'site-intro';
      intro.style.setProperty('--intro-duration', `${introDuration}ms`);
      intro.innerHTML = `
        <div class="site-intro-backdrop" data-intro-close="true"></div>
        <div class="site-intro-gradient" aria-hidden="true"></div>
        <div class="site-intro-grid" aria-hidden="true"></div>
        <div class="site-intro-rings" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div class="site-intro-embers" aria-hidden="true"></div>
        <div class="site-intro-noise" aria-hidden="true"></div>
        <div class="site-intro-scanline" aria-hidden="true"></div>
        <section class="site-intro-center" role="dialog" aria-modal="true" aria-label="Приветствие Cobalt BAB">
          <div class="site-intro-brand">
            <span class="site-intro-logo"><i class="fas fa-meteor"></i></span>
            <span class="site-intro-kicker">Cobalt BAB</span>
          </div>
          <h2 class="site-intro-title">
            <span class="site-intro-title-main">RUST</span>
            <span class="site-intro-title-sub">Command Hub</span>
          </h2>
          <p class="site-intro-sub">Бинды, гайды и база знаний для уверенной игры</p>
          <div class="site-intro-progress" aria-hidden="true"><span></span></div>
          <div class="site-intro-actions">
            <button type="button" class="site-intro-skip" data-intro-skip>Пропустить</button>
            <span class="site-intro-hint">ESC</span>
          </div>
        </section>
      `;

      const skipBtn = intro.querySelector('[data-intro-skip]');
      const backdrop = intro.querySelector('[data-intro-close="true"]');
      const embers = intro.querySelector('.site-intro-embers');
      let closeTimer = 0;
      let removeTimer = 0;
      let closed = false;

      if (embers) {
        for (let i = 0; i < 18; i += 1) {
          const spark = document.createElement('span');
          spark.style.left = `${4 + Math.random() * 92}%`;
          spark.style.animationDelay = `${Math.random() * 1.8}s`;
          spark.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
          spark.style.opacity = `${0.22 + Math.random() * 0.45}`;
          embers.appendChild(spark);
        }
      }

      const cleanup = () => {
        window.clearTimeout(closeTimer);
        window.clearTimeout(removeTimer);
        document.removeEventListener('keydown', onKeydown);
        if (backdrop) backdrop.removeEventListener('click', onSkip);
        if (skipBtn) skipBtn.removeEventListener('click', onSkip);
      };

      const closeIntro = () => {
        if (closed) return;
        closed = true;
        cleanup();
        markSeen();
        body.classList.remove('intro-open');
        intro.classList.remove('is-open');
        removeTimer = window.setTimeout(() => {
          intro.remove();
          resolve();
        }, 360);
      };

      const onSkip = () => closeIntro();
      const onKeydown = (event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          closeIntro();
        }
      };

      if (skipBtn) skipBtn.addEventListener('click', onSkip);
      if (backdrop) backdrop.addEventListener('click', onSkip);
      document.addEventListener('keydown', onKeydown);

      body.appendChild(intro);
      body.classList.add('intro-open');
      requestAnimationFrame(() => {
        intro.classList.add('is-open');
      });

      closeTimer = window.setTimeout(closeIntro, introDuration);
    });
  }


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

    const pageId = (document.body && document.body.getAttribute('data-page')) || '';
    const header = document.querySelector('header');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('.section'));
    const hasHashNav = navLinks.some(link => (link.getAttribute('href') || '').startsWith('#'));

    initPageCinematicTransitions();
    initA11yEnhancements();
    syncActiveNavAria();
    initScrollReveal();
    initSectionEnergyFrames();
    loadPageFeatureBundles(pageId).catch((error) => {
      console.warn('[Cobalt] Не удалось загрузить page-бандлы:', error);
    });

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

    function initPageCinematicTransitions() {
      const body = document.body;
      if (!body) return;

      const ENTER_DURATION = 700;
      const EXIT_DURATION = 560;
      const EXIT_NAV_FALLBACK = EXIT_DURATION + 260;
      const TRANSITION_LINK_SELECTOR = '.nav-link, .hero-btn, [data-page-transition="true"]';
      const PATH_LABEL_MAP = Object.freeze({
        '/': 'Главная',
        '/index.html': 'Главная',
        '/binds.html': 'Бинды',
        '/guides.html': 'Гайды',
        '/faq.html': 'FAQ',
        '/bases.html': 'Базы',
        '/team.html': 'Команда'
      });
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const transitionLayer = ensureTransitionLayer();
      const transitionTitle = transitionLayer ? transitionLayer.querySelector('[data-transition-title]') : null;
      const transitionSub = transitionLayer ? transitionLayer.querySelector('[data-transition-sub]') : null;
      let isNavigatingAway = false;
      let enterCleanupTimer = 0;
      let fallbackNavTimer = 0;
      let transitionEndHandler = null;

      if (transitionLayer) {
        transitionLayer.style.setProperty('--page-transition-enter', `${ENTER_DURATION}ms`);
        transitionLayer.style.setProperty('--page-transition-exit', `${EXIT_DURATION}ms`);
      }

      const setTransitionText = (title, sub) => {
        if (transitionTitle) transitionTitle.textContent = title || 'Cobalt BAB';
        if (transitionSub) transitionSub.textContent = sub || 'Переход между разделами';
      };

      const setLayerVisibility = (visible) => {
        if (!transitionLayer) return;
        transitionLayer.style.visibility = visible ? 'visible' : 'hidden';
      };

      const cancelPendingTransitionHandlers = () => {
        window.clearTimeout(enterCleanupTimer);
        window.clearTimeout(fallbackNavTimer);
        enterCleanupTimer = 0;
        fallbackNavTimer = 0;
        if (transitionLayer && transitionEndHandler) {
          transitionLayer.removeEventListener('animationend', transitionEndHandler);
        }
        transitionEndHandler = null;
      };

      const clearState = () => {
        cancelPendingTransitionHandlers();
        body.classList.remove('page-transition-in', 'page-transition-out', 'page-transition-lock');
        setLayerVisibility(false);
        isNavigatingAway = false;
      };

      // Safari/Firefox bfcache restore can keep previous classes.
      window.addEventListener('pageshow', () => {
        clearState();
      });

      if (!prefersReducedMotion) {
        setTransitionText(getPageLabelByUrl(new URL(window.location.href)) || 'Cobalt BAB', 'Раздел загружен');
        setLayerVisibility(true);
        body.classList.add('page-transition-in');
        enterCleanupTimer = window.setTimeout(() => {
          if (isNavigatingAway) return;
          body.classList.remove('page-transition-in');
          setLayerVisibility(false);
          enterCleanupTimer = 0;
        }, ENTER_DURATION);
      }

      document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!target) return;

        if (isNavigatingAway) {
          event.preventDefault();
          return;
        }

        if (isSameDocumentLink(target)) {
          event.preventDefault();
          return;
        }

        const nextUrl = getInternalNavigationTarget(target, event);
        if (!nextUrl) return;

        if (prefersReducedMotion) {
          window.location.assign(nextUrl.href);
          return;
        }

        event.preventDefault();
        cancelPendingTransitionHandlers();
        isNavigatingAway = true;
        const targetLabel = getTransitionLabel(target, nextUrl);
        setTransitionText(targetLabel, 'Открываем раздел...');
        setLayerVisibility(true);
        body.classList.remove('page-transition-in');
        body.classList.add('page-transition-out', 'page-transition-lock');

        const href = nextUrl.href;

        const navigate = () => {
          if (!isNavigatingAway) return;
          isNavigatingAway = false;
          cancelPendingTransitionHandlers();
          window.location.assign(href);
        };

        transitionEndHandler = (animationEvent) => {
          if (animationEvent.target !== transitionLayer) return;
          if (animationEvent.animationName !== 'page-cinematic-out') return;
          navigate();
        };

        if (transitionLayer) {
          transitionLayer.addEventListener('animationend', transitionEndHandler);
        }

        // Safety fallback: если animationend не сработал
        fallbackNavTimer = window.setTimeout(navigate, EXIT_NAV_FALLBACK);
      }, true);

      function ensureTransitionLayer() {
        let layer = document.querySelector('.page-cinematic-transition');
        if (layer) return layer;

        layer = document.createElement('div');
        layer.className = 'page-cinematic-transition';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `
          <span class="page-cinematic-sweep"></span>
          <span class="page-cinematic-noise"></span>
          <div class="page-cinematic-center">
            <span class="page-cinematic-kicker">Cobalt BAB</span>
            <strong class="page-cinematic-title" data-transition-title>Переход</strong>
            <span class="page-cinematic-sub" data-transition-sub>Переход между разделами</span>
            <span class="page-cinematic-bar" aria-hidden="true"></span>
          </div>
        `;
        body.appendChild(layer);
        return layer;
      }

      function getTransitionLabel(link, url) {
        const mapped = getPageLabelByUrl(url);
        if (mapped) return mapped;

        const dataLabel = (link.getAttribute('data-transition-label') || '').trim();
        if (dataLabel) return dataLabel;

        const textLabel = (link.textContent || '').replace(/\s+/g, ' ').trim();
        return textLabel || 'Раздел';
      }

      function getPageLabelByUrl(url) {
        const path = normalizePath(url.pathname || '/');
        return PATH_LABEL_MAP[path] || '';
      }

      function normalizePath(pathname) {
        const normalized = (pathname || '/').replace(/\/+$/, '');
        return normalized || '/';
      }

      function isSameDocumentLink(link) {
        const rawHref = (link.getAttribute('href') || '').trim();
        if (!rawHref || rawHref.startsWith('#')) return false;
        if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return false;

        let url;
        try {
          url = new URL(link.href, window.location.href);
        } catch (error) {
          return false;
        }

        if (!/^https?:$/i.test(url.protocol)) return false;
        if (url.origin !== window.location.origin) return false;

        const current = new URL(window.location.href);
        const samePath = normalizePath(url.pathname) === normalizePath(current.pathname);
        const sameSearch = url.search === current.search;
        const sameHash = url.hash === current.hash;
        return samePath && sameSearch && sameHash;
      }

      function getInternalNavigationTarget(link, event) {
        if (event.defaultPrevented) return null;
        if (event.button !== 0) return null;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
        if (!link.matches(TRANSITION_LINK_SELECTOR)) return null;
        if (link.hasAttribute('download')) return null;
        if (link.dataset.noTransition === 'true') return null;

        const targetAttr = (link.getAttribute('target') || '').toLowerCase();
        if (targetAttr && targetAttr !== '_self') return null;

        const rawHref = (link.getAttribute('href') || '').trim();
        if (!rawHref || rawHref.startsWith('#')) return null;
        if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return null;

        let url;
        try {
          url = new URL(link.href, window.location.href);
        } catch (e) {
          return null;
        }

        if (!/^https?:$/i.test(url.protocol)) return null;
        if (url.origin !== window.location.origin) return null;

        const samePath = url.pathname === window.location.pathname;
        const sameSearch = url.search === window.location.search;
        if (samePath && sameSearch && url.hash) return null;
        if (url.href === window.location.href) return null;

        return url;
      }
    }

    function initScrollReveal() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!('IntersectionObserver' in window)) return;

      const selector = [
        '.features .feature-card',
        '.home-news .news-card',
        '.home-changelog .changelog-item',
        '.home-quote',
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

    function initSectionEnergyFrames() {
      const targets = document.querySelectorAll([
        'main > section.section',
        'body[data-page="home"] .home-news',
        'body[data-page="home"] .home-changelog',
        'body[data-page="home"] .home-quote'
      ].join(', '));

      if (!targets.length) return;

      targets.forEach((section) => {
        if (!section || section.classList.contains('energy-frame')) return;
        section.classList.add('energy-frame');
      });

      // Блок "Почему игроки выбирают нас?" оставляем без энергетической рамки.
      document.querySelectorAll('body[data-page="home"] .features').forEach((section) => {
        section.classList.remove('energy-frame');
      });
    }

    // Copy buttons
    const copyBtns = document.querySelectorAll('.copy-btn');
    const copyNotification = document.getElementById('copyNotification');
    let toastHost = null;

    const ensureToastHost = () => {
      if (!document.body) return null;
      if (toastHost && document.body.contains(toastHost)) return toastHost;

      const existing = document.querySelector('.premium-toast-host');
      if (existing) {
        toastHost = existing;
        return toastHost;
      }

      toastHost = document.createElement('div');
      toastHost.className = 'premium-toast-host';
      toastHost.setAttribute('aria-live', 'polite');
      toastHost.setAttribute('aria-atomic', 'false');
      document.body.appendChild(toastHost);
      return toastHost;
    };

    const showToast = (text, error) => {
      const host = ensureToastHost();
      if (!host) {
        if (!copyNotification) return;
        copyNotification.textContent = text;
        copyNotification.style.background = error ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : 'var(--gradient-primary)';
        copyNotification.classList.remove('show');
        void copyNotification.offsetWidth;
        copyNotification.classList.add('show');
        window.setTimeout(() => copyNotification.classList.remove('show'), 2000);
        return;
      }

      const tone = error ? 'error' : 'success';
      const icon = error ? 'fa-triangle-exclamation' : 'fa-check';
      const title = error ? 'Ошибка' : 'Скопировано';
      const description = text || (error ? 'Не удалось выполнить действие.' : 'Готово');

      const toast = document.createElement('div');
      toast.className = `premium-toast premium-toast-${tone}`;
      toast.innerHTML = `
        <div class="premium-toast-icon"><i class="fas ${icon}"></i></div>
        <div class="premium-toast-content">
          <p class="premium-toast-title">${title}</p>
          <p class="premium-toast-text">${description}</p>
        </div>
        <button class="premium-toast-close" type="button" aria-label="Закрыть уведомление">
          <i class="fas fa-xmark"></i>
        </button>
        <span class="premium-toast-progress" aria-hidden="true"></span>
      `;

      host.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('is-visible'));

      const closeToast = () => {
        if (toast.classList.contains('is-leaving')) return;
        toast.classList.add('is-leaving');
        window.setTimeout(() => toast.remove(), 260);
      };

      const closeBtn = toast.querySelector('.premium-toast-close');
      if (closeBtn) closeBtn.addEventListener('click', closeToast);

      let remaining = 3000;
      let startedAt = Date.now();
      let autoTimer = window.setTimeout(closeToast, remaining);

      toast.addEventListener('mouseenter', () => {
        clearTimeout(autoTimer);
        remaining -= Date.now() - startedAt;
      });

      toast.addEventListener('mouseleave', () => {
        startedAt = Date.now();
        autoTimer = window.setTimeout(closeToast, Math.max(220, remaining));
      });

      const activeToasts = host.querySelectorAll('.premium-toast');
      if (activeToasts.length > 4) {
        const oldest = activeToasts[0];
        oldest.classList.add('is-leaving');
        window.setTimeout(() => oldest.remove(), 220);
      }
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
          showToast('Команда добавлена в буфер.');
        } catch(err) {
          btn.innerHTML = "<i class='fas fa-times'></i> Ошибка";
          showToast('Не удалось скопировать команду.', true);
        }
        setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = prev; }, 900);
      });
    });

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
    const canHoverParallax =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canHoverParallax) {
      const parallaxSelector = [
        '.bind-card',
        '.guide-main-card',
        '.guide-side-card',
        '.guide-card',
        '.faq-item',
        '.feature-card',
        '.base-card',
        '.news-card',
        '.changelog-item'
      ].join(', ');

      const bindParallax = (card) => {
        if (!card || card.dataset.parallaxReady === 'true') return;
        card.dataset.parallaxReady = 'true';
        card.classList.add('parallax-card');

        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const tiltX = ((y / r.height) - 0.5) * -4;
          const tiltY = ((x / r.width) - 0.5) * 5;
          card.style.setProperty('--tiltX', `${tiltX}deg`);
          card.style.setProperty('--tiltY', `${tiltY}deg`);
          card.style.setProperty('--glowX', `${x}px`);
          card.style.setProperty('--glowY', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
          card.style.removeProperty('--tiltX');
          card.style.removeProperty('--tiltY');
          card.style.removeProperty('--glowX');
          card.style.removeProperty('--glowY');
          card.style.transform = '';
        });
      };

      const bindParallaxCards = (root) => {
        const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
        const cards = scope.querySelectorAll(parallaxSelector);
        cards.forEach((card) => bindParallax(card));
      };

      bindParallaxCards(document);

      const dynamicRoots = [
        document.querySelector('[data-news-list]'),
        document.querySelector('[data-changelog-list]')
      ].filter(Boolean);

      if (dynamicRoots.length && 'MutationObserver' in window) {
        const observer = new MutationObserver(() => bindParallaxCards(document));
        dynamicRoots.forEach((root) => observer.observe(root, { childList: true, subtree: true }));
      }
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

    const finalizeReady = () => {
      const readyPayload = {
        page: pageId
      };
      cobaltReadyPayload = readyPayload;
      document.dispatchEvent(new CustomEvent('cobalt:ready', { detail: readyPayload }));
      console.log('✓ Cobalt BAB инициализирован.');
    };

    showCinematicIntroIfNeeded(pageId).then(finalizeReady).catch(finalizeReady);
  }
})();
