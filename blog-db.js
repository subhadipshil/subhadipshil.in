/**
 * subhadipshil.in — Blog Database Operations
 * Integrates Supabase with dynamic fallback functionality.
 */

(() => {
    'use strict';

    let supabaseInstance = null;

    // Initialize Supabase Client if configured
    const getSupabaseClient = () => {
        if (supabaseInstance) return supabaseInstance;

        const config = window.SUPABASE_CONFIG;
        if (!config || !config.url || config.url === 'YOUR_SUPABASE_URL' || !config.anonKey || config.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
            return null;
        }

        if (!window.supabase) {
            console.warn('Supabase SDK not loaded in the browser. Fallback active.');
            return null;
        }

        try {
            supabaseInstance = window.supabase.createClient(config.url, config.anonKey);
            return supabaseInstance;
        } catch (err) {
            console.error('Failed to initialize Supabase client:', err);
            return null;
        }
    };

    // Helper to map DB row to JS Object
    const mapPost = (dbPost) => ({
        slug: dbPost.slug,
        title: dbPost.title,
        category: dbPost.category,
        categoryKey: dbPost.category_key,
        categoryColor: dbPost.category_color,
        date: dbPost.date,
        readTime: dbPost.read_time,
        rating: parseFloat(dbPost.rating || 5.0),
        excerpt: dbPost.excerpt,
        body: dbPost.body
    });

    // Main fetch routine
    const getBlogPosts = async () => {
        const client = getSupabaseClient();
        if (!client) {
            console.log('Using local fallback database (blog-posts.js)');
            return window.BLOG_POSTS || [];
        }

        try {
            const { data, error } = await client
                .from('posts')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                console.log(`Successfully fetched ${data.length} posts from Supabase.`);
                return data.map(mapPost);
            } else {
                console.log('Supabase table is empty. Seeding local defaults.');
                return window.BLOG_POSTS || [];
            }
        } catch (err) {
            console.error('Error fetching from Supabase. Falling back to local data:', err);
            return window.BLOG_POSTS || [];
        }
    };

    // Expose functions globally
    window.getBlogPosts = getBlogPosts;
    window.getSupabaseClient = getSupabaseClient;

})();
