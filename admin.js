/**
 * subhadipshil.in — Blog Workspace Admin Portal JS
 * v5.3.0
 */

(() => {
    'use strict';

    // ── CONFIGURATION & CLIENT CHECK ──────────────────────
    let supabaseClient = null;
    let localPosts = []; // Local memory of posts
    let activePost = null; // Currently selected post for editing

    // Elements
    const warningBanner = document.getElementById('config-warning-banner');
    const loginSection  = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const headerActions = document.getElementById('header-user-actions');
    const userEmailDisplay = document.getElementById('user-email-display');
    const postsListTarget = document.getElementById('posts-list-target');
    const editorActionTitle = document.getElementById('editor-action-title');

    // Form inputs
    const editorForm    = document.getElementById('editor-form');
    const editPostId    = document.getElementById('edit-post-id');
    const postTitle     = document.getElementById('post-title');
    const postSlug      = document.getElementById('post-slug');
    const postCategory  = document.getElementById('post-category');
    const postReadTime  = document.getElementById('post-read-time');
    const postRating    = document.getElementById('post-rating');
    const postDate      = document.getElementById('post-date');
    const postExcerpt   = document.getElementById('post-excerpt');
    const postBody      = document.getElementById('post-body');

    // Buttons
    const btnAddNew     = document.getElementById('btn-add-new');
    const btnAutoSlug   = document.getElementById('btn-auto-slug');
    const btnDeletePost = document.getElementById('btn-delete-post');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnLogout     = document.getElementById('btn-logout');

    // Tabs
    const tabButtons    = document.querySelectorAll('.editor-tab');
    const editPane      = document.getElementById('edit-pane');
    const previewPane   = document.getElementById('preview-pane');

    // Preview Elements
    const previewTitle  = document.getElementById('preview-title');
    const previewMeta   = document.getElementById('preview-meta');
    const previewInfo   = document.getElementById('preview-info');
    const previewBody   = document.getElementById('preview-body');

    // Toast
    const toastEl       = document.getElementById('admin-toast');
    const toastIcon     = document.getElementById('toast-icon');
    const toastMessage  = document.getElementById('toast-message');

    // ── TOAST NOTIFICATION UTILITY ────────────────────────
    const showToast = (message, type = 'success') => {
        if (!toastEl) return;
        toastEl.className = `admin-toast show ${type}`;
        toastIcon.textContent = type === 'success' ? '✔' : type === 'error' ? '✗' : 'ℹ';
        toastMessage.textContent = message;

        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3500);
    };

    // ── PRECISION TRAIL CURSOR ─────────────────────────────
    const initCursor = () => {
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

            // Wire hover animations
            const wireHovers = () => {
                document.querySelectorAll('a, button, select, input, textarea, .post-list-item').forEach(el => {
                    el.addEventListener('mouseenter', () => {
                        ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
                        ring.style.opacity = '0.3';
                    });
                    el.addEventListener('mouseleave', () => {
                        ring.style.transform = 'translate(-50%,-50%) scale(1)';
                        ring.style.opacity = '0.6';
                    });
                });
            };
            wireHovers();

            // Rewire hovers dynamically when new elements are injected
            window.addEventListener('content-changed', wireHovers);
        }
    };

    // ── CATEGORY PRESETS ───────────────────────────────────
    const CATEGORIES = {
        'Dev': { key: 'dev', color: 'linear-gradient(135deg, #7afcff, #3a7bd5)' },
        'Design': { key: 'design', color: 'linear-gradient(135deg, #feff9c, #f7971e)' },
        'Motion': { key: 'motion', color: 'linear-gradient(135deg, #ff7eb3, #ff4b6e)' }
    };

    // ── SLUGIFIER ──────────────────────────────────────────
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    // Auto-generate slug click handler
    btnAutoSlug?.addEventListener('click', () => {
        if (!postTitle.value) {
            showToast('Enter a title first to generate a slug', 'info');
            return;
        }
        postSlug.value = slugify(postTitle.value);
    });

    // ── TABS NAVIGATION ────────────────────────────────────
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const tab = button.dataset.tab;
            if (tab === 'edit') {
                editPane.style.display = 'block';
                previewPane.style.display = 'none';
            } else {
                editPane.style.display = 'none';
                previewPane.style.display = 'block';
                renderLivePreview();
            }
        });
    });

    const renderLivePreview = () => {
        const titleVal = postTitle.value || 'Untitled Article';
        const dateVal = postDate.value ? new Date(postDate.value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD';
        const readVal = postReadTime.value || '1 min';
        const ratingVal = postRating.value || '5.0';
        const catVal = postCategory.value;
        const catSettings = CATEGORIES[catVal] || { color: '#ff7eb3', key: 'motion' };

        previewTitle.textContent = titleVal;
        previewMeta.innerHTML = `<span class="blog-modal-cat-badge" style="background:${catSettings.color};">${catVal}</span>`;
        previewInfo.innerHTML = `<span>${dateVal}</span><span>&middot;</span><span>${readVal} read</span><span>&middot;</span><span class="blog-modal-rating">&#9733; ${ratingVal}</span>`;
        previewBody.innerHTML = postBody.value || '<p style="opacity:0.5; font-style:italic;">Write body HTML to preview...</p>';
    };

    // ── AUTHENTICATION ENGINE ──────────────────────────────
    const checkAuth = async () => {
        supabaseClient = window.getSupabaseClient();
        
        if (!supabaseClient) {
            // Unconfigured sandbox state
            warningBanner.style.display = 'block';
            showToast('Running in sandbox preview mode. Setup Supabase config to save.', 'info');
            
            // Show dashboard but disable actual persistence actions
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            headerActions.style.display = 'flex';
            userEmailDisplay.textContent = 'sandbox@local';
            
            // Load local posts fallback in sidebar
            localPosts = window.BLOG_POSTS || [];
            renderSidebar();
            resetForm();
            return;
        }

        try {
            // Check session
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session) {
                // Logged in
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                headerActions.style.display = 'flex';
                userEmailDisplay.textContent = session.user.email;
                
                await loadDashboardData();
            } else {
                // Logged out
                loginSection.style.display = 'block';
                dashboardSection.style.display = 'none';
                headerActions.style.display = 'none';
            }
        } catch (err) {
            console.error('Auth check error:', err);
            showToast('Auth synchronization failed.', 'error');
        }
    };

    // Login Form Submit
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!supabaseClient) {
            showToast('Fill in credentials in supabase-config.js first!', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'CONNECTING...';

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) throw error;

            showToast('Authenticated successfully');
            checkAuth(); // Refreshes page state
        } catch (err) {
            console.error('Login error:', err);
            showToast(err.message || 'Credentials invalid', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'AUTHENTICATE ⮕';
        }
    });

    // Logout Click
    btnLogout?.addEventListener('click', async () => {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
            showToast('Signed out');
            checkAuth();
        } else {
            showToast('Sandbox mode: reload to log in', 'info');
        }
    });

    // ── DATABASE OPERATIONS (CRUD) ─────────────────────────
    const loadDashboardData = async () => {
        if (!supabaseClient) return;

        try {
            // Retrieve all rows
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            
            localPosts = data || [];
            renderSidebar();
            resetForm();
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to load posts from Supabase. Falling back to local.', 'error');
            localPosts = window.BLOG_POSTS || [];
            renderSidebar();
        }
    };

    // Render Posts in Sidebar
    const renderSidebar = () => {
        postsListTarget.innerHTML = '';
        
        if (localPosts.length === 0) {
            postsListTarget.innerHTML = '<p style="padding:1rem; font-size:0.75rem; text-align:center; opacity:0.5;">No articles found. Add your first post!</p>';
            return;
        }

        localPosts.forEach(post => {
            const item = document.createElement('button');
            item.className = 'post-list-item';
            if (activePost && (activePost.id === post.id || activePost.slug === post.slug)) {
                item.classList.add('active');
            }

            const cat = post.category || 'Motion';
            const catSettings = CATEGORIES[cat] || { key: 'motion', color: '#ff7eb3' };

            // Consistently format date
            const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';

            item.innerHTML = `
                <span class="pli-title">${escapeHTML(post.title)}</span>
                <div class="pli-meta">
                    <span class="pli-badge" style="background:${catSettings.color};">${cat}</span>
                    <span>${dateStr}</span>
                </div>
            `;

            item.addEventListener('click', () => selectPost(post));
            postsListTarget.appendChild(item);
        });

        // Notify cursor engine to update listeners
        window.dispatchEvent(new Event('content-changed'));
    };

    // Selecting a post to edit
    const selectPost = (post) => {
        activePost = post;
        renderSidebar(); // Refreshes active class

        // Populate fields
        editPostId.value = post.id || '';
        postTitle.value  = post.title || '';
        postSlug.value   = post.slug || '';
        postCategory.value = post.category || 'Motion';
        postReadTime.value = post.readTime || post.read_time || '';
        postRating.value   = post.rating || 5.0;
        
        // Date formatting to YYYY-MM-DD for input
        if (post.date) {
            const dateObj = new Date(post.date);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            postDate.value = `${y}-${m}-${d}`;
        } else {
            postDate.value = '';
        }

        postExcerpt.value = post.excerpt || '';
        postBody.value    = post.body || '';

        // UI state edits
        editorActionTitle.textContent = 'Edit Article';
        btnDeletePost.style.display = 'inline-flex';

        // Scroll editor top
        document.querySelector('.editor-panel').scrollIntoView({ behavior: 'smooth' });
        
        // Reset tabs to Editor
        tabButtons[0].click();
    };

    // Resetting form back to pristine state
    const resetForm = () => {
        activePost = null;
        editorForm.reset();
        editPostId.value = '';
        
        // Defaults
        postRating.value = '5.0';
        postCategory.value = 'Motion';
        // Default to today
        postDate.valueAsDate = new Date();

        editorActionTitle.textContent = 'Create New Article';
        btnDeletePost.style.display = 'none';
        
        renderSidebar();
        tabButtons[0].click();
    };

    btnAddNew?.addEventListener('click', resetForm);
    btnCancelEdit?.addEventListener('click', resetForm);

    // Form Submit (Save / Insert)
    editorForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleVal = postTitle.value.trim();
        const slugVal  = postSlug.value.trim();
        const catVal   = postCategory.value;
        const readVal  = postReadTime.value.trim();
        const ratingVal = parseFloat(postRating.value);
        const dateVal  = postDate.value;
        const excVal   = postExcerpt.value.trim();
        const bodyVal  = postBody.value.trim();

        // Basic validations
        if (!titleVal || !slugVal || !excVal || !bodyVal) {
            showToast('All fields are required', 'error');
            return;
        }

        const catSettings = CATEGORIES[catVal];

        // Format database row (snake_case)
        const dbRow = {
            slug: slugVal,
            title: titleVal,
            category: catVal,
            category_key: catSettings.key,
            category_color: catSettings.color,
            date: dateVal,
            read_time: readVal,
            rating: ratingVal,
            excerpt: excVal,
            body: bodyVal
        };

        const saveBtn = document.getElementById('btn-save-post');
        saveBtn.disabled = true;
        saveBtn.textContent = 'SAVING...';

        if (!supabaseClient) {
            // Sandbox mode simulation
            showToast('Sandbox mode: simulated save. Set credentials to persist changes.', 'info');
            saveBtn.disabled = false;
            saveBtn.textContent = 'PUBLISH_ARTIFACT ⮕';
            return;
        }

        try {
            const isEditing = !!editPostId.value;
            
            if (isEditing) {
                // Update
                const { error } = await supabaseClient
                    .from('posts')
                    .update(dbRow)
                    .eq('id', editPostId.value);

                if (error) throw error;
                showToast('Article updated successfully');
            } else {
                // Insert
                const { error } = await supabaseClient
                    .from('posts')
                    .insert([dbRow]);

                if (error) throw error;
                showToast('Article published successfully');
            }

            await loadDashboardData(); // Refresh sidebar and reset form
        } catch (err) {
            console.error('Save error:', err);
            showToast(err.message || 'Failed to save article', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'PUBLISH_ARTIFACT ⮕';
        }
    });

    // Delete post
    btnDeletePost?.addEventListener('click', async () => {
        if (!editPostId.value) return;

        if (!confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
            return;
        }

        if (!supabaseClient) {
            showToast('Sandbox mode: simulated delete', 'info');
            resetForm();
            return;
        }

        btnDeletePost.disabled = true;
        btnDeletePost.textContent = 'DELETING...';

        try {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', editPostId.value);

            if (error) throw error;

            showToast('Article deleted successfully');
            await loadDashboardData();
        } catch (err) {
            console.error('Delete error:', err);
            showToast(err.message || 'Failed to delete article', 'error');
        } finally {
            btnDeletePost.disabled = false;
            btnDeletePost.textContent = 'Delete Post';
        }
    });

    // Sanitization helper
    const escapeHTML = (str) => {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // ── INIT ───────────────────────────────────────────────
    checkAuth();
    initCursor();

})();
