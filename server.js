const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
// Static files moved to end to allow server-side injection

// Enable CORS for Live Server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Storage for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original name (overwrite existing)
    }
});
const upload = multer({ storage: storage });

// API: Get Content
app.get('/api/content', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/content.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading content');
        }
        res.json(JSON.parse(data));
    });
});

// API: Save Content
app.post('/api/content', (req, res) => {
    const newContent = req.body;
    fs.writeFile(path.join(__dirname, 'data/content.json'), JSON.stringify(newContent, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving content');
        }
        res.status(200).send('Content saved');
    });
});

// API: Save Style (CSS Variables & Fonts)
app.post('/api/style', (req, res) => {
    const { cssVariables, fontUrl, fontFamily } = req.body;

    let cssContent = '';

    // 1. Add Font Import if present
    if (fontUrl) {
        cssContent += `@import url('${fontUrl}');\n`;
    }

    // 2. Add Root Variables
    cssContent += `:root {\n`;

    if (fontFamily) {
        cssContent += `    --font-primary: ${fontFamily};\n`;
    }

    for (const [key, value] of Object.entries(cssVariables)) {
        cssContent += `    ${key}: ${value};\n`;
    }
    cssContent += `}\n`;

    fs.writeFile(path.join(__dirname, 'admin/custom-style.css'), cssContent, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving style');
        }
        res.status(200).send('Style saved');
    });
});

// API: Get Blog Posts
app.get('/api/posts', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/posts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading posts');
        }
        res.json(JSON.parse(data));
    });
});

// API: Save Blog Posts
app.post('/api/posts', (req, res) => {
    const newPosts = req.body;
    fs.writeFile(path.join(__dirname, 'data/posts.json'), JSON.stringify(newPosts, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving posts');
        }
        res.status(200).send('Posts saved');
    });
});

// API: Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.status(200).send({ message: 'Image uploaded', filename: req.file.originalname });
});

// --- SEO FEATURES ---

// API: Get SEO Data
app.get('/api/seo', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/seo.json'), 'utf8', (err, data) => {
        if (err) {
            return res.json({ global: {}, pages: {} });
        }
        res.json(JSON.parse(data));
    });
});

// API: Save SEO Data
app.post('/api/seo', (req, res) => {
    const seoData = req.body;
    fs.writeFile(path.join(__dirname, 'data/seo.json'), JSON.stringify(seoData, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving SEO data');
        }
        res.status(200).send('SEO data saved');
    });
});

// Sitemap Generation
app.get('/sitemap.xml', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/seo.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading SEO config');

        const seoConfig = JSON.parse(data);
        const baseUrl = 'https://tk-design.no';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        for (const page of Object.keys(seoConfig.pages)) {
            xml += `
    <url>
        <loc>${baseUrl}/${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
    </url>`;
        }

        // Add blog posts
        try {
            const postsData = fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8');
            const posts = JSON.parse(postsData);
            posts.forEach(post => {
                xml += `
    <url>
        <loc>${baseUrl}/blog-details.html?id=${post.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
            });
        } catch (e) {
            console.log('No posts found for sitemap');
        }

        xml += `\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

// Server-Side Meta Injection
app.get(['/', '/index.html', '/blog.html', '/project-details.html', '/blog-details.html'], (req, res) => {
    let reqFile = req.path === '/' ? 'index.html' : req.path.substring(1);

    let seoData = { global: {}, pages: {} };
    try {
        seoData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/seo.json'), 'utf8'));
    } catch (e) { }

    const globalSeo = seoData.global || {};
    let title = '';
    let description = '';
    let keywords = '';

    // Specialized Logic for Blog Details
    if (reqFile === 'blog-details.html' && req.query.id) {
        try {
            const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8'));
            const post = posts.find(p => p.id == req.query.id);
            if (post) {
                title = post.seoTitle || post.title;
                description = post.seoDesc || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');
                keywords = post.seoKeywords || globalSeo.defaultKeywords || '';
            }
        } catch (e) { console.error('Error fetching post for SEO:', e); }
    }

    // Default Page Logic if not blog details or post not found
    if (!title) {
        const pageSeo = seoData.pages[reqFile] || {};
        title = pageSeo.title || '';
        description = pageSeo.description || '';
        keywords = pageSeo.keywords || globalSeo.defaultKeywords || '';
    }

    // Construct Final Title
    const finalTitle = title ? `${title} ${globalSeo.separator || '|'} ${globalSeo.siteTitle || ''}` : globalSeo.siteTitle;

    fs.readFile(path.join(__dirname, reqFile), 'utf8', (err, html) => {
        if (err) return res.status(404).send('Page not found');

        let injectedHtml = html
            .replace(/<title>.*<\/title>/, `<title>${finalTitle}</title>`)
            .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
            .replace(/<meta name="keywords" content=".*">/, `<meta name="keywords" content="${keywords}">`);

        // Inject Google Analytics if ID exists
        if (globalSeo.googleAnalyticsId) {
            const gaScript = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${globalSeo.googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${globalSeo.googleAnalyticsId}');
    </script>`;
            injectedHtml = injectedHtml.replace('</head>', `${gaScript}\n</head>`);
        }

        res.send(injectedHtml);
    });
});

// API: Generate Blog Content with Gemini AI
app.post('/api/generate-content', async (req, res) => {
    try {
        const { topic, tone = 'professional', length = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Configure length
        const lengthMap = {
            short: '2-3 paragraphs',
            medium: '4-6 paragraphs',
            long: '8-10 paragraphs'
        };

        const prompt = `Write a ${tone} blog post about "${topic}". 
        Length: ${lengthMap[length] || lengthMap.medium}.
        Format the content with proper HTML tags including <h2>, <h3>, <p>, <ul>, <li> where appropriate.
        Make it engaging, informative, and SEO-friendly.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

// API: Search Unsplash Images
app.get('/api/unsplash/search', async (req, res) => {
    try {
        const { query, page = 1, per_page = 12 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(unsplashUrl, {
            headers: {
                'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Format response to include only necessary data
        const images = data.results.map(img => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.thumb,
            description: img.description || img.alt_description,
            photographer: img.user.name,
            photographerUrl: img.user.links.html,
            downloadUrl: img.links.download_location
        }));

        res.json({ images, total: data.total });
    } catch (error) {
        console.error('Unsplash API Error:', error);
        res.status(500).json({ error: 'Failed to search images', details: error.message });
    }
});

// API: Upload Blog Image
const blogImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'img/blog';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadBlogImage = multer({
    storage: blogImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

app.post('/api/upload-blog-image', uploadBlogImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = `/img/blog/${req.file.filename}`;
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

// Static Files (as fallback)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
});
