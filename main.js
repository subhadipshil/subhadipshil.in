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

    // Close mobile nav on any link/button inside it (including the CTA)
    document.querySelectorAll('.mobile-nav-link, .mobile-nav a').forEach(link => {
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

    // ── BLOG DATA ──────────────────────────────────────────────
    const BLOG_POSTS = [
        {
            slug: 'art-of-motion',
            title: 'The Art of Motion: Why Animation Changes Everything',
            category: 'Motion',
            categoryKey: 'motion',
            categoryColor: 'linear-gradient(135deg, #ff7eb3, #ff4b6e)',
            date: '2026-05-22',
            readTime: '6 min',
            rating: 4.9,
            excerpt: "Motion design is more than making things move — it's about creating emotional resonance, guiding attention, and communicating meaning without words.",
            body: `<p>Every great interface tells a story. And the best stories are told through motion.</p>
<p>When I started my journey as a creative producer, I thought animation was decoration — the last layer you add before shipping. I was wrong. Animation <em>is</em> the product. It's how the product communicates its personality, its responsiveness, its empathy toward the user.</p>
<h2>Why Motion Matters</h2>
<p>There are three core reasons motion elevates interfaces beyond the sum of their static parts:</p>
<ul>
<li><strong>Spatial Awareness:</strong> Animation gives users a mental model of how elements relate in space. A card expanding from a button makes it obvious where the content "lives."</li>
<li><strong>Feedback &amp; Confidence:</strong> A button that depresses on click tells the user their action registered. Without it, users click again — and again.</li>
<li><strong>Emotional Tone:</strong> A crisp, fast animation feels professional. A bouncy, playful one feels friendly. The timing curve <em>is</em> your brand voice.</li>
</ul>
<h2>The Principles That Actually Matter</h2>
<ul>
<li><strong>Easing is everything.</strong> Linear motion feels robotic. A well-chosen cubic-bezier transforms the same movement from mechanical to organic. I default to <code>cubic-bezier(0.16, 1, 0.3, 1)</code> for most UI transitions — snappy without being harsh.</li>
<li><strong>Duration is context.</strong> Micro-interactions (hover, toggle) should be 100–250ms. Page transitions: 300–500ms. Anything longer needs visual weight to justify it.</li>
<li><strong>Choreography beats chaos.</strong> When multiple elements animate simultaneously, they compete. Stagger reveals — each element entering 60–80ms after the previous — create flow and hierarchy.</li>
</ul>
<h2>Tools of the Trade</h2>
<p>My current motion stack: <strong>GSAP</strong> for complex, timeline-controlled sequences. <strong>Framer Motion</strong> for React-based UIs where declarative animation wins. <strong>CSS transitions</strong> for everything simple — don't reach for a library when three lines of CSS will do.</p>
<p>After Effects remains my primary tool for pre-rendered motion: brand videos, loading sequences, and anything that needs frame-level precision.</p>
<h2>Final Thought</h2>
<p>The best animation is the one users never consciously notice — but <em>feel</em>. It makes the interface feel alive, trustworthy, and worth returning to. That's the goal. That's the art.</p>`
        },
        {
            slug: 'custom-cursor-vanilla-js',
            title: 'Building a Custom Cursor in Vanilla JS — No Libraries',
            category: 'Dev',
            categoryKey: 'dev',
            categoryColor: 'linear-gradient(135deg, #7afcff, #3a7bd5)',
            date: '2026-05-15',
            readTime: '8 min',
            rating: 4.8,
            excerpt: "A step-by-step breakdown of building a smooth, physics-based custom cursor using only requestAnimationFrame and linear interpolation — as seen on this portfolio.",
            body: `<p>Custom cursors are one of those details that separate a "nice portfolio" from one that makes people say <em>"wait, how did they do that?"</em></p>
<p>The implementation on this very portfolio uses about 25 lines of vanilla JavaScript. No GSAP. No cursor library. Here's how it works and why the physics feel the way they do.</p>
<h2>The Core Concept: Lerping</h2>
<p>The secret sauce is <strong>linear interpolation</strong> — moving the cursor ring toward the actual mouse position by a fraction each frame, instead of teleporting it instantly.</p>
<pre><code>const lerp = (a, b, t) => a + (b - a) * t;</code></pre>
<p>Each animation frame, we move the ring 12% of the remaining distance. This creates the characteristic trailing feel without any spring physics library.</p>
<h2>The Two-Layer System</h2>
<ul>
<li><strong>Cursor Dot:</strong> A small 6px circle that snaps instantly to the mouse. This gives precise, tactile feedback.</li>
<li><strong>Cursor Ring:</strong> A larger 28px ring that trails behind using lerp. This adds the "physics feel."</li>
</ul>
<pre><code>document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

const animateCursor = () => {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
};</code></pre>
<h2>Hover States: The Scale Effect</h2>
<p>When the cursor enters an interactive element, the ring expands to 2× its size and fades slightly — signalling "this is clickable" without any tooltip.</p>
<pre><code>el.addEventListener('mouseenter', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(2)';
    ring.style.opacity = '0.3';
});</code></pre>
<h2>The Gotcha: Touch Devices</h2>
<p>Always wrap cursor logic in a media query check: <code>window.matchMedia('(hover: hover)').matches</code>. On touch devices there is no hover concept, and a phantom cursor creates confusion. The CSS also has <code>@media (hover: none) { .cursor-dot, .cursor-ring { display:none; } }</code> as a safety net.</p>
<h2>Performance Notes</h2>
<p>Using <code>style.left/top</code> triggers layout. For maximum performance, use <code>style.transform</code> instead. For fixed-position elements the difference is negligible, and <code>left/top</code> avoids a double-translate conflict with the centering transform. This cursor runs at 60fps with zero jank on all tested browsers.</p>`
        },
        {
            slug: 'gsap-vs-framer-motion',
            title: 'GSAP vs Framer Motion — An Honest 2026 Comparison',
            category: 'Design',
            categoryKey: 'design',
            categoryColor: 'linear-gradient(135deg, #feff9c, #f7971e)',
            date: '2026-05-08',
            readTime: '10 min',
            rating: 4.7,
            excerpt: "I've used both extensively on real projects. Here's an honest breakdown of when each tool wins, where each falls short, and why the choice is usually obvious in hindsight.",
            body: `<p>This comparison comes up constantly in design-engineering spaces. Both tools are excellent. The question is never "which is better" — it's "which is better <em>for this project</em>."</p>
<h2>The Philosophy Divide</h2>
<p><strong>GSAP</strong> is imperative and timeline-centric. You describe animation sequences explicitly, step by step. It's like directing a film — you control every frame, every stagger, every ease. Incredible power, steeper learning curve.</p>
<p><strong>Framer Motion</strong> is declarative and React-native. You describe what the element should look like in different states, and Motion handles the transition. It's like acting — you define the character, and the system handles the performance.</p>
<h2>Where GSAP Wins</h2>
<ul>
<li><strong>Framework-agnostic:</strong> Works with vanilla JS, React, Vue, Svelte — anything. If you're not in React, GSAP is almost always the answer.</li>
<li><strong>Timeline control:</strong> Complex, choreographed sequences with multiple elements are a GSAP superpower. Framer Motion's orchestration is good, but can't match GSAP timelines for complexity.</li>
<li><strong>ScrollTrigger:</strong> GSAP's ScrollTrigger plugin is the gold standard for scroll-driven animation. Nothing else comes close.</li>
<li><strong>Performance ceiling:</strong> GSAP's physics plugins and FLIP technique for layout animations outperform anything in Framer Motion.</li>
</ul>
<h2>Where Framer Motion Wins</h2>
<ul>
<li><strong>React DX:</strong> Animate based on state changes with zero boilerplate. <code>&lt;motion.div animate={{ opacity: 1 }}&gt;</code> is genuinely beautiful.</li>
<li><strong>Exit animations:</strong> AnimatePresence is exceptional for mount/unmount animations — something notoriously complex with GSAP in React.</li>
<li><strong>Layout animations:</strong> The <code>layout</code> prop animates element position changes automatically when a sibling changes — pure magic.</li>
<li><strong>Gestures:</strong> Drag, pan, and tap animations with physics (inertia, spring) are first-class citizens.</li>
</ul>
<h2>The Verdict</h2>
<p><strong>Choose GSAP if:</strong> You need complex, timeline-driven animations; you're not in React; you need ScrollTrigger; or you're building a creative/marketing site where animation is the centrepiece.</p>
<p><strong>Choose Framer Motion if:</strong> You're building a React app where animation enhances UX rather than defines it; you need great layout animations; or your team is React-first and GSAP's imperative API feels foreign.</p>
<p>On this portfolio, I chose vanilla CSS transitions + a raw rAF loop for performance and zero-dependency reasons. For Next.js projects, Framer Motion is the default. For landing pages with hero animations, GSAP every time.</p>`
        },
        {
            slug: 'designing-for-emotion',
            title: "Designing for Emotion: A Creative Producer's Playbook",
            category: 'Design',
            categoryKey: 'design',
            categoryColor: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            date: '2026-04-28',
            readTime: '7 min',
            rating: 4.8,
            excerpt: "Great products don't just solve problems — they create feelings. Here's the framework I use to intentionally design emotional responses into every project.",
            body: `<p>Every design decision — color, typography, spacing, motion — triggers an emotional response. Most designers make these decisions on instinct. The best ones make them <em>deliberately</em>.</p>
<h2>The Emotional Response Framework</h2>
<p>Before any wireframe, I ask three questions:</p>
<ol>
<li><strong>What should users feel when they first see this?</strong> (Surprise? Trust? Excitement? Calm?)</li>
<li><strong>What should they feel while using it?</strong> (Empowered? Guided? Delighted?)</li>
<li><strong>What should they feel after they leave?</strong> (Satisfied? Wanting more? Like they made progress?)</li>
</ol>
<p>These answers become the design brief. Every subsequent decision is evaluated against them.</p>
<h2>Color as Emotion</h2>
<p>The pink-to-purple gradient throughout this portfolio is a deliberate choice. Pink signals warmth and creativity. Purple signals depth and craft. Together they say: "This person is both an artist and a technician." That duality is my professional identity, compressed into a gradient.</p>
<p>But color theory alone is insufficient. The <em>saturation</em> and <em>application</em> matter more than the hue. Highly saturated colors used sparingly feel premium. The same saturation used everywhere feels chaotic.</p>
<h2>Typography is Personality</h2>
<p>Bricolage Grotesque (the display font here) is expressive but grounded — it has personality without screaming. Inter (the body font) is neutral and optimized for readability. JetBrains Mono signals technical precision in code contexts. Each font is chosen for the role it plays, not just how it looks in isolation.</p>
<h2>Whitespace is a Statement</h2>
<p>Generous whitespace communicates confidence. It says: "We have nothing to hide, and we're not desperate to fill every pixel." Many designers — especially early in their careers — stuff screens with content. The willingness to leave space empty is a sign of maturity.</p>
<h2>The Micro-Interaction Payoff</h2>
<p>Hover effects, button animations, status indicators — these micro-interactions collectively create the sense that an interface is "alive." Each one individually is trivial. Together, they build emotional engagement. The user feels like the product is responding to <em>them</em> personally. Design for emotion first. Function follows.</p>`
        },
        {
            slug: 'how-i-built-this-portfolio',
            title: 'How I Built This Portfolio: Stack & Decisions Explained',
            category: 'Dev',
            categoryKey: 'dev',
            categoryColor: 'linear-gradient(135deg, #0ed2f7, #b2fefa)',
            date: '2026-04-15',
            readTime: '9 min',
            rating: 4.6,
            excerpt: "A behind-the-scenes look at every technical decision that went into this portfolio — why vanilla JS, why no build step, and how the API cascade works.",
            body: `<p>When I decided to rebuild my portfolio from scratch, I made one rule: <strong>no dependencies I can't justify.</strong></p>
<p>Most portfolio sites are over-engineered. Next.js for a static page that could be three HTML files. Tailwind for a site with one layout. GSAP for animations that CSS transitions handle fine. I went the opposite direction.</p>
<h2>The Stack</h2>
<ul>
<li><strong>HTML:</strong> Semantic, clean, no templating.</li>
<li><strong>CSS:</strong> Vanilla. CSS custom properties replace any need for a preprocessor. Grid and Flexbox handle all layouts.</li>
<li><strong>JavaScript:</strong> Vanilla. Wrapped in an IIFE for encapsulation. No bundler, no transpiler, no node_modules.</li>
</ul>
<p>Zero dependencies. Zero build step. Open <code>index.html</code> in a browser — it works.</p>
<h2>Why Not Next.js?</h2>
<p>Three reasons: load speed, simplicity, and longevity. A vanilla HTML site loads in under 500ms globally. It works without JavaScript enabled (mostly). It won't break when React releases a major version. My code from 2019 still runs. I can't say the same for any framework project from that era.</p>
<h2>The CSS Architecture</h2>
<p>The design token system uses CSS custom properties in <code>:root</code>. Dark mode is a single class toggle (<code>body.dark-theme</code>) that overrides these tokens. No JavaScript needed for the actual styling change. This pattern is cleaner than any CSS-in-JS solution I've used — portable, cacheable, and inspectable in DevTools without source maps.</p>
<h2>The API Cascade for Tech News</h2>
<p>The trending tech section uses three APIs with a priority queue: GNews → NewsData → NewsAPI. Each request is cached in localStorage for 4 hours, meaning a returning visitor almost never hits an API. The cascade means even if one API goes down or rate-limits me, the others catch the fallback.</p>
<h2>Performance Results</h2>
<p>Lighthouse scores: Performance 98, Accessibility 94, Best Practices 100, SEO 96. The main bottleneck is the Google Fonts load — something I'll address by self-hosting in the next iteration.</p>`
        },
        {
            slug: 'vibe-coder-workflow',
            title: 'The Vibe Coder Workflow: Tools I Actually Use Daily',
            category: 'Dev',
            categoryKey: 'dev',
            categoryColor: 'linear-gradient(135deg, #56ab2f, #a8e063)',
            date: '2026-04-02',
            readTime: '5 min',
            rating: 4.5,
            excerpt: "My curated toolkit for creative development work — from design-to-code workflow to the CLI tools, extensions, and habits that shape my daily output.",
            body: `<p>Every developer has a toolkit. Mine is obsessively curated to sit at the intersection of design and code. Here's what I actually use, daily, in 2026.</p>
<h2>Design Layer</h2>
<ul>
<li><strong>Figma:</strong> Primary UI design tool. Auto Layout and Variables make it the closest thing to coding a design. I use it for every project before writing a line of CSS.</li>
<li><strong>After Effects + Motion Bro:</strong> Animation prototyping and final motion graphics delivery. The Lottie plugin exports animations as JSON for seamless web integration.</li>
<li><strong>Photoshop:</strong> Still irreplaceable for raster work, image editing, and compositing.</li>
</ul>
<h2>Development Layer</h2>
<ul>
<li><strong>VS Code:</strong> With Prettier, ESLint, and GitLens. Dark+ theme. The default setup is genuinely good; I've stopped chasing exotic editor setups.</li>
<li><strong>Chrome DevTools:</strong> My primary debugging environment. The Performance panel has saved me more times than any profiling tool.</li>
<li><strong>Git + GitHub:</strong> Conventional Commits keep history readable. I branch for every feature, even solo projects — the habit pays dividends in teams.</li>
</ul>
<h2>AI Layer (2026 Reality)</h2>
<p>AI tools are now part of my workflow, not an experiment:</p>
<ul>
<li><strong>Antigravity (Gemini):</strong> Pair programming, codebase analysis, implementation plans. I use it as a senior colleague, not a code generator.</li>
<li><strong>Claude:</strong> Long-form writing, code review, architecture discussions.</li>
<li><strong>Midjourney / Ideogram:</strong> Mood boards and quick visual references before design sessions.</li>
</ul>
<h2>The Meta-Habit</h2>
<p>The best tool is the one you know <em>deeply</em>. I'd rather be exceptional with three tools than mediocre with ten. Go deep before going wide. The "vibe coder" aesthetic isn't about having the coolest setup — it's about having a setup that disappears so your creativity can show up.</p>`
        }
    ];

    // ── BLOG HELPERS ──────────────────────────────────────
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // ── RENDER HOME WIDGET ────────────────────────────────
    const renderBlogHomeWidget = (mode = 'latest') => {
        const list = document.getElementById('blog-latest-list');
        if (!list) return;

        let posts = [...BLOG_POSTS];
        posts.sort(mode === 'rated'
            ? (a, b) => b.rating - a.rating
            : (a, b) => new Date(b.date) - new Date(a.date)
        );
        posts = posts.slice(0, 3);

        list.innerHTML = '';
        posts.forEach(post => {
            const btn = document.createElement('button');
            btn.className = 'blog-latest-item';
            // Extract first hex color from the gradient for the indicator
            const colorMatch = post.categoryColor.match(/#[0-9a-fA-F]{6}/);
            const indicatorColor = colorMatch ? colorMatch[0] : '#ff7eb3';

            btn.innerHTML = `
                <div class="bli-indicator" style="background:${indicatorColor};"></div>
                <div class="bli-content">
                    <span class="bli-category">${post.category}</span>
                    <p class="bli-title">${post.title}</p>
                    <div class="bli-meta">
                        <span class="bli-read">${post.readTime} read</span>
                        <span class="bli-stars">&#9733; ${post.rating}</span>
                    </div>
                </div>`;
            btn.addEventListener('click', () => openBlogPost(post.slug));
            list.appendChild(btn);
        });
    };

    // ── RENDER BLOG SECTION GRID ──────────────────────────
    const renderBlogGrid = (filter = 'all') => {
        const grid = document.getElementById('blog-grid');
        if (!grid) return;

        let posts = [...BLOG_POSTS];

        if (filter === 'latest') {
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (filter === 'rated') {
            posts.sort((a, b) => b.rating - a.rating);
        } else if (['design', 'dev', 'motion'].includes(filter)) {
            posts = posts.filter(p => p.categoryKey === filter);
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        grid.innerHTML = '';

        if (posts.length === 0) {
            grid.innerHTML = '<p class="blog-empty">No posts in this category yet. Check back soon! ✨</p>';
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card reveal';

            card.innerHTML = `
                <div class="blog-card__header" style="background:${post.categoryColor};">
                    <span class="blog-card__category">${post.category}</span>
                </div>
                <div class="blog-card__body">
                    <h3 class="blog-card__title">${post.title}</h3>
                    <p class="blog-card__excerpt">${post.excerpt}</p>
                    <div class="blog-card__meta">
                        <span class="blog-card__date">${fmtDate(post.date)}</span>
                        <span class="blog-card__read">${post.readTime} read</span>
                        <span class="blog-card__rating">&#9733; ${post.rating}</span>
                    </div>
                    <button class="blog-card__btn">Read Article &rarr;</button>
                </div>`;

            card.querySelector('.blog-card__btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openBlogPost(post.slug);
            });
            card.addEventListener('click', () => openBlogPost(post.slug));

            grid.appendChild(card);
            revealObserver.observe(card); // plug into existing scroll-reveal
        });
    };

    // ── BLOG MODAL ────────────────────────────────────────
    const openBlogPost = (slug) => {
        const post = BLOG_POSTS.find(p => p.slug === slug);
        if (!post) return;

        const modal   = document.getElementById('blog-modal');
        const titleEl = document.getElementById('blog-modal-title');
        const metaEl  = document.getElementById('blog-modal-meta');
        const infoEl  = document.getElementById('blog-modal-info');
        const bodyEl  = document.getElementById('blog-modal-body');
        if (!modal) return;

        const dateLong = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        titleEl.textContent = post.title;
        metaEl.innerHTML  = `<span class="blog-modal-cat-badge" style="background:${post.categoryColor};">${post.category}</span>`;
        infoEl.innerHTML  = `<span>${dateLong}</span><span>&middot;</span><span>${post.readTime} read</span><span>&middot;</span><span class="blog-modal-rating">&#9733; ${post.rating}</span>`;
        bodyEl.innerHTML  = post.body;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('blog-modal-close')?.focus(), 60);
    };

    const closeBlogPost = () => {
        const modal = document.getElementById('blog-modal');
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Modal event listeners
    document.getElementById('blog-modal-close')?.addEventListener('click', closeBlogPost);
    document.getElementById('blog-modal-overlay')?.addEventListener('click', closeBlogPost);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBlogPost(); });

    // Blog section filter tabs
    document.querySelectorAll('.blog-filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.blog-filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderBlogGrid(tab.dataset.filter);
        });
    });

    // Home widget tabs (Latest / Top Rated)
    document.querySelectorAll('.blog-latest-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.blog-latest-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderBlogHomeWidget(tab.dataset.btab);
        });
    });

    // ── INITIALISE BLOG ──────────────────────────────────
    renderBlogHomeWidget('latest');
    renderBlogGrid('all');

})();
