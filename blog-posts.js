/**
 * subhadipshil.in — Shared Blog Posts Database
 * v5.3.0
 */

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

// Helper to format dates consistently
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// Export to window object for absolute safety in vanilla context
window.BLOG_POSTS = BLOG_POSTS;
window.fmtDate = fmtDate;
