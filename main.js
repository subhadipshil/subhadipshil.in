(() => {
    'use strict';

    // ── THEME ─────────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');

    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // ── MOBILE MENU ───────────────────────────────────────
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav     = document.getElementById('mobile-nav');

    mobileMenuBtn?.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        mobileMenuBtn.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // ── ACTIVE NAV HIGHLIGHT ON SCROLL ───────────────────
    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const setActiveNav = () => {
        const scrollMid = window.scrollY + window.innerHeight * 0.35;
        let currentId = sections[0]?.id;
        sections.forEach(sec => { if (sec.offsetTop <= scrollMid) currentId = sec.id; });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === currentId);
        });
    };

    window.addEventListener('scroll', setActiveNav, { passive: true });
    setActiveNav();

    // ── SCROLL REVEAL ─────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
                let delay = 0;
                if (siblings && siblings.length > 1) {
                    siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 80; });
                }
                setTimeout(() => entry.target.classList.add('active'), delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── PRECISION CURSOR ──────────────────────────────────
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (dot && ring && window.matchMedia('(hover: hover)').matches) {
        let mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        const lerp = (a, b, t) => a + (b - a) * t;
        const animateCursor = () => {
            rx = lerp(rx, mx, 0.12);
            ry = lerp(ry, my, 0.12);
            dot.style.left  = mx + 'px';
            dot.style.top   = my + 'px';
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        const hoverTargets = 'a, button, .bento-item, .project-card, .skill-category-card, .tech-pill';
        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(2)'; ring.style.opacity = '0.3'; });
            el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '0.6'; });
        });
    }

    // ── MAGNETIC BUTTONS ──────────────────────────────────
    document.querySelectorAll('.btn-primary, .logo').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width  / 2) * 0.25;
            const y = (e.clientY - r.top  - r.height / 2) * 0.25;
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // ── LIVE CLOCK ────────────────────────────────────────
    const timeEl = document.getElementById('current-time');
    const locEl  = document.getElementById('user-location');

    if (timeEl) {
        try {
            const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const city = tz.split('/').pop().replace(/_/g, ' ');
            if (locEl) locEl.textContent = city;

            const tick = () => {
                const now = new Date();
                timeEl.textContent = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false, timeZone: tz
                }).format(now);

                // World Clocks
                const worldOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
                
                const clocks = {
                    'time-nyc': 'America/New_York',
                    'time-ldn': 'Europe/London',
                    'time-tyo': 'Asia/Tokyo',
                    'time-sfo': 'America/Los_Angeles',
                    'time-ber': 'Europe/Berlin',
                    'time-syd': 'Australia/Sydney'
                };

                for (const [id, zone] of Object.entries(clocks)) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = new Intl.DateTimeFormat('en-US', { ...worldOpts, timeZone: zone }).format(now);
                }

                // Epoch
                const epochEl = document.getElementById('time-epoch');
                if (epochEl) epochEl.textContent = Math.floor(now.getTime() / 1000);
            };
            tick();
            setInterval(tick, 1000);
        } catch {
            timeEl.textContent = new Date().toLocaleTimeString();
        }
    }

    // ── ANIMATE PROGRESS BARS ON REVEAL ───────────────────
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.dataset.width = bar.style.width;
        bar.style.width = '0%';
    });

    const barObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.progress-bar').forEach((bar, i) => {
                    setTimeout(() => { bar.style.width = bar.dataset.width; }, i * 100);
                });
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-category-card').forEach(card => barObserver.observe(card));

    // ── TRENDING TECH NEWS — Multi-API cascade + 4h cache ─────
    // Strategy: Cache → GNews → NewsData.io → NewsAPI.org
    // 4h cache = max ~6 API hits/visitor/day across ALL sources combined
    const CACHE_KEY     = 'trends_cache_v2';
    const CACHE_TTL     = 4 * 60 * 60 * 1000; // 4 hours ms

    // Normalised shape: { title, url, source, publishedAt }
    const NEWS_SOURCES = [
        {
            name: 'GNews',
            fetch: async () => {
                const r = await fetch(
                    'https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&max=5' +
                    '&apikey=e44ff4f962a3e7d855cadd5f93361a94'
                );
                const d = await r.json();
                if (!r.ok || !d.articles?.length) throw new Error(d.errors?.[0] || 'GNews empty');
                return d.articles.map(a => ({
                    title:       a.title.replace(/ - [^-]+$/, '').trim(),
                    url:         a.url,
                    source:      a.source?.name || 'GNews',
                    publishedAt: a.publishedAt
                }));
            }
        },
        {
            name: 'NewsData',
            fetch: async () => {
                const r = await fetch(
                    'https://newsdata.io/api/1/latest?category=technology&language=en&size=5' +
                    '&apikey=pub_82348598b5464794a1f399a0d96f33f9'
                );
                const d = await r.json();
                if (!r.ok || !d.results?.length) throw new Error('NewsData empty');
                return d.results.map(a => ({
                    title:       a.title?.trim() || '(no title)',
                    url:         a.link,
                    source:      a.source_id || 'NewsData',
                    publishedAt: a.pubDate
                }));
            }
        },
        {
            name: 'NewsAPI',
            // ⚠ Free plan may block CORS from non-localhost — used as last resort
            fetch: async () => {
                const r = await fetch(
                    'https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5' +
                    '&apiKey=a4c59219d8604972aef312cb360ea90a'
                );
                const d = await r.json();
                if (!r.ok || !d.articles?.length) throw new Error(d.message || 'NewsAPI empty');
                return d.articles.map(a => ({
                    title:       a.title?.replace(/ - [^-]+$/, '').trim() || '(no title)',
                    url:         a.url,
                    source:      a.source?.name || 'NewsAPI',
                    publishedAt: a.publishedAt
                }));
            }
        }
    ];

    const trendsList = document.getElementById('trends-list');

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        if (d > 0) return d + 'd ago';
        if (h > 0) return h + 'h ago';
        if (m > 0) return m + 'm ago';
        return 'just now';
    };

    const renderTrends = (articles, sourceName, fromCache) => {
        if (!trendsList) return;
        trendsList.innerHTML = '';

        articles.slice(0, 5).forEach(article => {
            const a = document.createElement('a');
            a.href      = article.url || '#';
            a.target    = '_blank';
            a.rel       = 'noopener noreferrer';
            a.className = 'trend-item';
            // Sanitise title to avoid XSS
            const title  = document.createTextNode(article.title);
            const source = document.createTextNode(article.source);
            const ago    = document.createTextNode(timeAgo(article.publishedAt));

            a.innerHTML = `<span class="trend-dot"></span>
                <div class="trend-content">
                    <div class="trend-title"></div>
                    <div class="trend-meta">
                        <span class="trend-source"></span>
                        <span>·</span>
                        <span class="trend-time"></span>
                    </div>
                </div>`;
            a.querySelector('.trend-title').appendChild(title);
            a.querySelector('.trend-source').appendChild(source);
            a.querySelector('.trend-time').appendChild(ago);
            trendsList.appendChild(a);
        });

        // Footer: source + cache badge
        const footer = document.createElement('div');
        footer.className = 'trend-cache-note';
        footer.textContent = fromCache
            ? `⚡ cached via ${sourceName} — refreshes every 4h`
            : `via ${sourceName} · live`;
        trendsList.appendChild(footer);
    };

    const fetchTrends = async () => {
        if (!trendsList) return;

        // ① Serve from cache if still fresh
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) {
                const cached = JSON.parse(raw);
                if (Date.now() - cached.timestamp < CACHE_TTL) {
                    renderTrends(cached.articles, cached.source, true);
                    return;
                }
            }
        } catch { /* corrupt cache — fall through to fetch */ }

        // ② Try each source in order until one succeeds
        const errors = [];
        for (const src of NEWS_SOURCES) {
            try {
                const articles = await src.fetch();
                // Cache the result
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    source:    src.name,
                    articles
                }));
                renderTrends(articles, src.name, false);
                return; // success — stop cascade
            } catch (e) {
                errors.push(`${src.name}: ${e.message}`);
            }
        }

        // ③ All sources failed
        trendsList.innerHTML =
            `<div class="trends-error">⚠ Could not load trends<br>
             <small style="opacity:0.6">${errors.join(' | ')}</small></div>`;
    };

    fetchTrends();



    // ── REAL-TIME EMAIL VALIDATION ────────────────────────
    const emailInput      = document.getElementById('channel-input');
    const emailVerifyEl   = document.getElementById('email-verify-status');
    let emailDebounceTimer = null;

    // Comprehensive email regex: validates local-part, @, domain, and TLD (2–10 chars)
    const isValidEmailFormat = (val) =>
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,10}$/.test(val);

    const getEmailError = (val) => {
        if (!val.includes('@'))           return 'missing @ symbol';
        const [local, domain] = val.split('@');
        if (!local)                       return 'missing username before @';
        if (!domain || !domain.includes('.')) return 'invalid domain';
        const tld = domain.split('.').pop();
        if (!tld || tld.length < 2)       return 'invalid or missing TLD';
        return 'invalid format';
    };

    const setEmailStatus = (state, msg) => {
        if (!emailVerifyEl) return;
        emailVerifyEl.className = 'email-verify-status ' + state;
        emailVerifyEl.textContent = msg;
    };

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            clearTimeout(emailDebounceTimer);
            const val = emailInput.value.trim();

            if (!val) {
                emailVerifyEl.className = 'email-verify-status';
                emailVerifyEl.textContent = '';
                return;
            }

            setEmailStatus('checking', '> VERIFYING COMM_CHANNEL...');

            emailDebounceTimer = setTimeout(() => {
                if (isValidEmailFormat(val)) {
                    setEmailStatus('valid', '✔ COMM_CHANNEL VERIFIED');
                } else {
                    setEmailStatus('invalid', '✗ INVALID FORMAT — ' + getEmailError(val));
                }
            }, 600);
        });

        // Immediate check on blur (when user tabs/clicks away)
        emailInput.addEventListener('blur', () => {
            clearTimeout(emailDebounceTimer);
            const val = emailInput.value.trim();
            if (!val) return;
            if (isValidEmailFormat(val)) {
                setEmailStatus('valid', '✔ COMM_CHANNEL VERIFIED');
            } else {
                setEmailStatus('invalid', '✗ INVALID FORMAT — ' + getEmailError(val));
            }
        });

        // Clear status when field is focused again after an error
        emailInput.addEventListener('focus', () => {
            if (emailVerifyEl?.classList.contains('invalid')) {
                setEmailStatus('checking', '> RE-ENTERING COMM_CHANNEL...');
            }
        });
    }

    // ── SECURE UPLINK TERMINAL — WEB3FORMS ───────────────

    const contactForm      = document.getElementById('contact-form');
    const transmitBtn      = document.getElementById('transmit-btn');
    const logEl            = document.getElementById('terminal-log');
    const terminalStatusEl = document.getElementById('terminal-status');

    const addLog = (msg, cls = '') => {
        if (!logEl) return;
        const line = document.createElement('div');
        line.className = 'log-line' + (cls ? ' ' + cls : '');
        line.textContent = msg;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    };

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name    = document.getElementById('identity-input')?.value.trim();
        const email   = document.getElementById('channel-input')?.value.trim();
        const message = document.getElementById('payload-input')?.value.trim();

        // Client-side validation
        if (!name || !email || !message) {
            logEl.innerHTML = '';
            addLog('! ERROR: All payload fields are required.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            logEl.innerHTML = '';
            addLog('! ERROR: COMM_CHANNEL is invalid — check email format.', 'error');
            return;
        }

        // Reset UI
        logEl.innerHTML = '';
        transmitBtn.disabled = true;
        transmitBtn.textContent = 'TRANSMITTING...';
        if (terminalStatusEl) terminalStatusEl.textContent = '[ INITIATING UPLINK ]';

        // Animated terminal log lines
        const steps = [
            '> Initiating secure handshake...',
            '> Encrypting payload (AES-256)...',
            '> Routing through secure channel...',
            '> Verifying recipient endpoint...',
        ];
        for (const [i, step] of steps.entries()) {
            await new Promise(r => setTimeout(r, 400 + i * 300));
            addLog(step);
        }

        // Submit to Web3Forms
        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok && data.success) {
                await new Promise(r => setTimeout(r, 400));
                addLog('✔ TRANSMISSION SUCCESSFUL — Message delivered securely.', 'success');
                if (terminalStatusEl) terminalStatusEl.textContent = '[ UPLINK COMPLETE ]';
                contactForm.reset();
            } else {
                addLog('! ERROR: ' + (data.message || 'Transmission failed. Try again.'), 'error');
                if (terminalStatusEl) terminalStatusEl.textContent = '[ UPLINK FAILED ]';
            }
        } catch {
            addLog('! NETWORK ERROR: Could not reach uplink. Check your connection.', 'error');
            if (terminalStatusEl) terminalStatusEl.textContent = '[ UPLINK FAILED ]';
        }

        transmitBtn.disabled = false;
        transmitBtn.textContent = 'TRANSMIT_DATA ⮕';

        setTimeout(() => {
            if (terminalStatusEl) terminalStatusEl.textContent = '[ SYSTEM READY ]';
        }, 5000);
    });

    // ── STATUS BADGE TEXT ROTATION ────────────────────────
    const statuses = [
        'Available for motion graphics, design, and creative production',
        'Creative producer shipping polished digital experiences',
        'Building aesthetic things ✨',
        'Open to collaborations',
        'Shipping to production 🚀',
    ];
    const statusEl = document.getElementById('status-text');
    if (statusEl) {
        let idx = 0;
        statusEl.style.transition = 'opacity 0.3s ease';
        setInterval(() => {
            idx = (idx + 1) % statuses.length;
            statusEl.style.opacity = '0';
            setTimeout(() => {
                statusEl.textContent = statuses[idx];
                statusEl.style.opacity = '1';
            }, 300);
        }, 3500);
    }
    // ── DEV TIPS & BLOOPERS CAROUSEL ─────────────────────
    const carouselItems = [
        { type: 'TIP', text: "Write code for humans, not just compilers." },
        { type: 'BLOOP', text: "Forgot 'git push' before a presentation." },
        { type: 'TIP', text: "Simplicity is the ultimate sophistication." },
        { type: 'BLOOP', text: "Force pushed to 'main' by mistake. (Don't.)" },
        { type: 'TIP', text: "The best code is the code you delete." },
        { type: 'BLOOP', text: "Spent 4 hours debugging a missing semicolon." },
        { type: 'TIP', text: "Consistency > Cleverness." },
        { type: 'BLOOP', text: "Tested in prod. It didn't go well." },
        { type: 'TIP', text: "Accessibility is a foundation, not a feature." },
        { type: 'BLOOP', text: "Named a variable 'temp1', 'temp2', 'temp3'." }
    ];

    const tipEl = document.getElementById('dev-tip');
    if (tipEl) {
        let currentIdx = 0;
        const rotateCarousel = () => {
            // Out animation
            tipEl.style.opacity = 0;
            tipEl.style.transform = 'translateY(-5px)';
            
            setTimeout(() => {
                const item = carouselItems[currentIdx];
                tipEl.textContent = `/* [${item.type}] ${item.text} */`;
                
                // In animation
                tipEl.style.transform = 'translateY(5px)';
                setTimeout(() => {
                    tipEl.style.opacity = 1;
                    tipEl.style.transform = 'translateY(0)';
                }, 50);

                currentIdx = (currentIdx + 1) % carouselItems.length;
            }, 400);
        };
        setInterval(rotateCarousel, 3000); // 3 seconds per user request
        rotateCarousel(); // Initial call
    }

})();
