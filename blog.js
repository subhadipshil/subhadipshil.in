/**
 * subhadipshil.in — Standalone Blog Workspace Engine
 * v5.3.0
 */

(() => {
    'use strict';

    // ── COOL STANDALONE PRELOADER ANIMATION ───────────────
    const animatePreloader = () => {
        const preloader = document.getElementById('blog-preloader');
        const bar = document.getElementById('preloader-bar');
        const text = document.getElementById('preloader-text');
        if (!preloader || !bar || !text) return;

        const steps = [
            { pct: 25, text: 'INITIALIZING DATA LAYER...' },
            { pct: 55, text: 'SYNCHRONIZING CURSOR PHYSICS...' },
            { pct: 85, text: 'RENDERING CREATIVE ENGINE...' },
            { pct: 100, text: 'WELCOME TO THE VIBE WORKSPACE' }
        ];

        let stepIndex = 0;
        const runStep = () => {
            if (stepIndex >= steps.length) {
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    document.body.style.overflow = ''; // Restore page scrolling
                    setTimeout(() => preloader.remove(), 800);
                }, 350);
                return;
            }

            const current = steps[stepIndex];
            bar.style.width = current.pct + '%';
            text.textContent = current.text;

            stepIndex++;
            const timeouts = [220, 260, 280, 200];
            setTimeout(runStep, timeouts[stepIndex - 1]);
        };

        document.body.style.overflow = 'hidden';
        setTimeout(runStep, 120);
    };
    animatePreloader();

    // ── THEME SYNC ─────────────────────────────────────────
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    // Default to dark theme unless user explicitly saved light theme
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }

    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // ── PRECISION TRAIL CURSOR ─────────────────────────────
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (dot && ring && window.matchMedia('(hover: hover)').matches) {
        let mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

        const lerp = (a, b, t) => a + (b - a) * t;

        const animateCursor = () => {
            rx = lerp(rx, mx, 0.12);
            ry = lerp(ry, my, 0.12);
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Wire interactive hover scale animations
        const updateHoverListeners = () => {
            const targets = 'a, button, .blog-card, .star-option, .blog-search-input';
            document.querySelectorAll(targets).forEach(el => {
                // Remove duplicates if re-rendered
                el.removeEventListener('mouseenter', onMouseEnter);
                el.removeEventListener('mouseleave', onMouseLeave);

                el.addEventListener('mouseenter', onMouseEnter);
                el.addEventListener('mouseleave', onMouseLeave);
            });
        };

        const onMouseEnter = () => {
            ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
            ring.style.opacity = '0.3';
        };

        const onMouseLeave = () => {
            ring.style.transform = 'translate(-50%,-50%) scale(1)';
            ring.style.opacity = '0.6';
        };

        // Initialize hover scale states
        updateHoverListeners();
        window.addEventListener('blog-grid-rendered', updateHoverListeners);
    }

    // ── SCROLL REVEAL ──────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
                let delay = 0;
                if (siblings && siblings.length > 1) {
                    siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 60; });
                }
                setTimeout(() => entry.target.classList.add('active'), delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── DYNAMIC SEARCH & FILTER ENGINE ─────────────────────
    let currentFilter = 'all';
    let searchQuery = '';
    let blogPosts = [];

    const searchInput = document.getElementById('blog-search');
    const filterTabs = document.querySelectorAll('.blog-filter-tab');

    // Handle search keystrokes
    searchInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterAndRenderGrid();
    });

    // Handle category pill toggles
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            filterAndRenderGrid();
        });
    });

    // Combined query filter processor
    const filterAndRenderGrid = () => {
        const grid = document.getElementById('blog-grid');
        if (!grid) return;

        let posts = [...blogPosts];

        // 1. Process Category filters
        if (currentFilter === 'latest') {
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentFilter === 'rated') {
            posts.sort((a, b) => b.rating - a.rating);
        } else if (['design', 'dev', 'motion'].includes(currentFilter)) {
            posts = posts.filter(p => p.categoryKey === currentFilter);
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            // "all" — sort by date newest first
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // 2. Process Text search queries
        if (searchQuery) {
            posts = posts.filter(post => {
                return post.title.toLowerCase().includes(searchQuery) ||
                    post.category.toLowerCase().includes(searchQuery) ||
                    post.excerpt.toLowerCase().includes(searchQuery) ||
                    post.body.toLowerCase().includes(searchQuery);
            });
        }

        // Render card results
        grid.innerHTML = '';
        if (posts.length === 0) {
            grid.innerHTML = `<div class="blog-empty reveal active">
                <span style="font-size:1.8rem; display:block; margin-bottom:0.75rem;">🔍</span>
                No articles match your search or filter criteria. Try something else!
            </div>`;
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card reveal active';

            card.innerHTML = `
                <div class="blog-card__header" style="background:${post.categoryColor};">
                    <span class="blog-card__category">${post.category}</span>
                </div>
                <div class="blog-card__body">
                    <h3 class="blog-card__title">${post.title}</h3>
                    <p class="blog-card__excerpt">${post.excerpt}</p>
                    <div class="blog-card__meta">
                        <span class="blog-card__date">${window.fmtDate(post.date)}</span>
                        <span class="blog-card__read">${post.readTime} read</span>
                        <span class="blog-card__rating">&#9733; ${post.rating}</span>
                    </div>
                    <button class="blog-card__btn">Read Article &rarr;</button>
                </div>`;

            // Setup click events
            card.querySelector('.blog-card__btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openBlogPost(post.slug);
            });
            card.addEventListener('click', () => openBlogPost(post.slug));

            grid.appendChild(card);
            revealObserver.observe(card);
        });

        // Trigger custom cursor update on new nodes
        window.dispatchEvent(new Event('blog-grid-rendered'));
    };

    // ── DEEP LINK AUTO-OPEN ────────────────────────────────
    const checkHashOnLoad = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            // Find post matching hash/slug
            const post = blogPosts.find(p => p.slug === hash);
            if (post) {
                openBlogPost(hash);
            }
        }
    };

    // ── SHARE clipboard ENGINE ─────────────────────────────
    const toast = document.getElementById('blog-toast');
    const shareBtn = document.getElementById('blog-share-btn');
    let activePostSlug = '';

    shareBtn?.addEventListener('click', () => {
        if (!activePostSlug) return;

        // Generate full deep link address
        const shareUrl = `${window.location.origin}${window.location.pathname}#${activePostSlug}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            // Show toast micro-interaction
            toast?.classList.add('show');
            setTimeout(() => {
                toast?.classList.remove('show');
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
        });
    });

    // ── IMMERSIVE REVIEW & COMMENTS ENGINE ─────────────────
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');
    const starOptions = document.querySelectorAll('.star-option');
    let activeUserRating = 5;

    // Seed Reviews Database to populate comments visually on load
    const SEED_COMMENTS = {
        'art-of-motion': [
            { name: 'Alex D.', rating: 5, text: 'This explanation of timing curves is absolutely spectacular! I finally understand the visual differences between linear and ease-in-out. Brilliant graphics.', date: '2026-05-23' },
            { name: 'Sarah Jenkins', rating: 5, text: 'As a UX animator, I super appreciate the choreography rules mentioned here. Dynamic staggers change everything.', date: '2026-05-24' }
        ],
        'custom-cursor-vanilla-js': [
            { name: 'David Miller', rating: 5, text: 'Using requestAnimationFrame for physics is flawless. The trailing effect is so smooth. Replaced my cursor package with your custom solution!', date: '2026-05-18' },
            { name: 'Chloe Kim', rating: 4, text: 'Works perfectly on Chrome and Safari! One question: how do you disable cursor custom scales on small screen widths?', date: '2026-05-20' }
        ],
        'gsap-vs-framer-motion': [
            { name: 'Marcus Brody', rating: 5, text: 'Thank you for an honest breakdown! Framer is great for swift state-driven react apps, but for landing pages with absolute ScrollTrigger sequences, GSAP is still king.', date: '2026-05-10' }
        ],
        'designing-for-emotion': [
            { name: 'Sophia Ricci', rating: 5, text: 'Emotion-driven design is so crucial. The explanation of whitespace being a statement is beautiful. Subhadip, your aesthetics are elite.', date: '2026-05-01' }
        ],
        'how-i-built-this-portfolio': [
            { name: 'Vikram Singh', rating: 5, text: 'No-dependency design wins! 98 Performance Lighthouse scores speak volumes. Thanks for sharing the technical architecture.', date: '2026-04-18' }
        ],
        'vibe-coder-workflow': [
            { name: 'Elena Rostova', rating: 4, text: 'Love the VS Code and Figma configuration details! Deep focus over wide toolboxes is an underrated advice.', date: '2026-04-05' }
        ]
    };

    // Rating selector interactivity
    starOptions.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val, 10);
            activeUserRating = val;

            starOptions.forEach(s => {
                const sVal = parseInt(s.dataset.val, 10);
                s.classList.toggle('active', sVal <= val);
                s.setAttribute('aria-checked', sVal === val ? 'true' : 'false');
            });
        });

        // Hover effect for visual polish
        star.addEventListener('mouseover', () => {
            const val = parseInt(star.dataset.val, 10);
            starOptions.forEach(s => {
                const sVal = parseInt(s.dataset.val, 10);
                if (sVal <= val) {
                    s.style.color = '#ffd066';
                }
            });
        });

        star.addEventListener('mouseout', () => {
            starOptions.forEach(s => {
                s.style.color = ''; // Restore standard CSS toggled classes
            });
        });
    });

    // Form submission
    commentForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const authorInput = document.getElementById('comment-author');
        const textInput = document.getElementById('comment-text');

        if (!authorInput || !textInput) return;

        const newComment = {
            name: authorInput.value.trim(),
            rating: activeUserRating,
            text: textInput.value.trim(),
            date: new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
        };

        // Save review
        saveComment(activePostSlug, newComment);

        // Reset inputs
        authorInput.value = '';
        textInput.value = '';

        // Reset stars to 5
        activeUserRating = 5;
        starOptions.forEach(s => {
            s.classList.add('active');
            s.setAttribute('aria-checked', s.dataset.val === '5' ? 'true' : 'false');
        });

        // Re-render reviews list
        renderCommentsList(activePostSlug);
    });

    // Retrieve comments by slug (LocalStorage + Seeds fallback)
    const getComments = (slug) => {
        const localData = localStorage.getItem(`blog_comments_${slug}`);
        if (localData) {
            try {
                return JSON.parse(localData);
            } catch (e) {
                console.error('Error reading comments cache: ', e);
            }
        }
        // Fallback to seed comments or empty array
        return SEED_COMMENTS[slug] || [];
    };

    // Persist comment local + trigger backend hooks
    const saveComment = (slug, comment) => {
        const comments = getComments(slug);
        comments.unshift(comment); // Prepends to keep newest reviews at top

        localStorage.setItem(`blog_comments_${slug}`, JSON.stringify(comments));

        // Connect backend API later hooks
        saveCommentToBackend(slug, comment)
            .then(res => console.log('Backend sync status: Mock success. Ready for real API connection!', res))
            .catch(err => console.error('Backend sync error: ', err));
    };

    // MOCK BACKEND INTEGRATION HOOK
    // You can replace this fetch implementation with your actual server API database route!
    const saveCommentToBackend = async (slug, comment) => {
        /*
        // Example integration:
        const response = await fetch('https://api.subhadipshil.in/v1/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, name: comment.name, rating: comment.rating, text: comment.text })
        });
        return await response.json();
        */
        return { success: true, message: 'Mock comment synced with backend' };
    };

    // Render Comments UI
    const renderCommentsList = (slug) => {
        if (!commentsList || !commentsCount) return;

        const comments = getComments(slug);
        commentsCount.textContent = comments.length;

        if (comments.length === 0) {
            commentsList.innerHTML = `<p class="blog-empty" style="padding:1.5rem; font-size:0.78rem;">No comments yet. Be the first to share your thoughts! 🌟</p>`;
            return;
        }

        commentsList.innerHTML = '';
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';

            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += i <= c.rating ? '★' : '☆';
            }

            item.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${escapeHTML(c.name)}</span>
                    <div class="comment-meta">
                        <span class="comment-stars">${starsHTML}</span>
                        <span class="comment-date">${window.fmtDate(c.date)}</span>
                    </div>
                </div>
                <p class="comment-body">${escapeHTML(c.text)}</p>`;

            commentsList.appendChild(item);
        });

        // Trigger cursor scaling hover listeners on new comments
        window.dispatchEvent(new Event('blog-grid-rendered'));
    };

    // Helper to sanitize html string inputs
    const escapeHTML = (str) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // ── ARTICLE READER MODAL LOGIC ───────────────────────────
    const openBlogPost = (slug) => {
        const post = blogPosts.find(p => p.slug === slug);
        if (!post) return;

        const modal = document.getElementById('blog-modal');
        const titleEl = document.getElementById('blog-modal-title');
        const metaEl = document.getElementById('blog-modal-meta');
        const infoEl = document.getElementById('blog-modal-info');
        const bodyEl = document.getElementById('blog-modal-body');
        if (!modal) return;

        activePostSlug = slug;
        const dateLong = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        titleEl.textContent = post.title;
        metaEl.innerHTML = `<span class="blog-modal-cat-badge" style="background:${post.categoryColor};">${post.category}</span>`;
        infoEl.innerHTML = `<span>${dateLong}</span><span>&middot;</span><span>${post.readTime} read</span><span>&middot;</span><span class="blog-modal-rating">&#9733; ${post.rating}</span>`;
        bodyEl.innerHTML = post.body;

        // Render reviews matching post
        renderCommentsList(slug);

        // Update URL hash without reload
        history.replaceState(null, null, `#${slug}`);

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Accessibility focus trap setup
        setTimeout(() => document.getElementById('blog-modal-close')?.focus(), 60);
    };

    const closeBlogPost = () => {
        const modal = document.getElementById('blog-modal');
        if (!modal) return;

        modal.classList.remove('open');
        document.body.style.overflow = '';
        activePostSlug = '';

        // Clear hash from address bar gracefully
        history.replaceState(null, null, ' ');
    };

    // Setup close listeners
    document.getElementById('blog-modal-close')?.addEventListener('click', closeBlogPost);
    document.getElementById('blog-modal-overlay')?.addEventListener('click', closeBlogPost);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBlogPost();
    });

    // ── INITIALISE DYNAMIC PAGE ACTIONS ─────────────────────
    const initPage = async () => {
        blogPosts = await window.getBlogPosts();
        filterAndRenderGrid();
        checkHashOnLoad();
    };
    initPage();

    // Watch URL hashes changes dynamically
    window.addEventListener('hashchange', checkHashOnLoad);

})();
