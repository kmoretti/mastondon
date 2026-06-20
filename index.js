require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

const Host = process.env.HOST || 'https://mastodon.social/';
const UserId = process.env.USERID || '110710864910866001';
const Tittle = process.env.TITTLE || 'Retirement Memos';
const Description = process.env.DESCRIPTION || '愿爱无忧! peace & love !';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="referrer" content="no-referrer">
        <link rel="icon" href="/assets/img/logo.webp" type="image/*" />
        <link href="assets/css/style.css" rel="stylesheet" type="text/css">
        <link href="assets/css/APlayer.min.css" rel="stylesheet" type="text/css">
        <link href="assets/css/highlight.github.min.css" rel="stylesheet" type="text/css">
        <link href="assets/css/custom.css" rel="stylesheet" type="text/css">
        <link href="assets/css/link-card.css" rel="stylesheet" type="text/css">
        <title>${Tittle}</title>
        <link rel="stylesheet" href="https://cdn.0tz.top/lxgw-wenkai-screen-webfont/style.css" />
        <style>body{font-family:"LXGW WenKai Screen",sans-serif;}</style>
    </head>
    <body>
        <div class="site-shell">
            <aside class="side-toolbar" aria-label="Page tools">
                <button class="theme-toggle side-tool" type="button" aria-label="Toggle theme">
                    <span class="theme-icon theme-icon--light" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 72 72"><path fill="#fcea2b" d="m66 36l-10.676 5.182l6.658 9.824l-11.84-.864l.864 11.84l-9.825-6.658L36 66l-5.182-10.676l-9.824 6.658l.864-11.84l-11.84.864l6.658-9.825L6 36l10.677-5.182l-6.659-9.824l11.84.864l-.864-11.84l9.825 6.658L36 6l5.182 10.677l9.824-6.659l-.864 11.84l11.84-.864l-6.658 9.825z"/><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"><circle cx="36" cy="35.95" r="19.828"/><path d="m66 36l-10.676 5.182l6.658 9.824l-11.84-.864l.864 11.84l-9.825-6.658L36 66l-5.182-10.676l-9.824 6.658l.864-11.84l-11.84.864l6.658-9.825L6 36l10.677-5.182l-6.659-9.824l11.84.864l-.864-11.84l9.825 6.658L36 6l5.182 10.677l9.824-6.659l-.864 11.84l11.84-.864l-6.658 9.825z"/></g></svg>
                    </span>
                    <span class="theme-icon theme-icon--dark" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 80 80"><g fill="none"><path fill="#9b51e0" fill-rule="evenodd" d="M49.633 16.064a24.785 24.785 0 0 0-32.593 13.5l-.123.302a25.57 25.57 0 0 0 0 19.268l.123.303a24.784 24.784 0 0 0 33.209 13.23c1.769-.804 1-3.391-.876-3.9a19.47 19.47 0 0 1-12.948-11.46l-.097-.237a20.1 20.1 0 0 1 0-15.14l.097-.237a19.47 19.47 0 0 1 12.948-11.46c1.875-.509 2.645-3.095.876-3.899a25 25 0 0 0-.616-.27" clip-rule="evenodd"/><path fill="#9b51e0" d="m30.365 16.064l-.777-1.842zm19.268 0l.778-1.842zm-32.593 13.5l-1.852-.754zm-.123.302l1.853.753zm0 19.268l1.853-.753zm.123.303l-1.852.753zm13.325 13.499l-.777 1.842zm19.268 0l.778 1.842zm-2.739-5.022l-.777 1.842zm-10.47-10.607l-1.852.754zm-.096-.237l1.853-.754zm0-15.14l-1.853-.753zm.097-.237l1.853.753zm10.47-10.606l.777 1.842zm3.354-4.753l-.827 1.821zm0 46.332l-.828-1.82zm-.876-3.898l.523-1.93zm-18.23-40.86a22.8 22.8 0 0 1 17.713 0l1.555-3.686a26.8 26.8 0 0 0-20.823 0zm-12.25 12.409a22.8 22.8 0 0 1 12.25-12.41l-1.555-3.685a26.8 26.8 0 0 0-14.4 14.588zm-.123.302l.123-.302l-3.705-1.507l-.123.303zm0 17.762a23.57 23.57 0 0 1 0-17.762l-3.705-1.506a27.57 27.57 0 0 0 0 20.775zm.123.302l-.123-.302l-3.705 1.507l.123.302zm12.25 12.41a22.8 22.8 0 0 1-12.25-12.41l-3.705 1.507a26.8 26.8 0 0 0 14.4 14.588zm17.713 0a22.8 22.8 0 0 1-17.714 0l-1.554 3.685a26.78 26.78 0 0 0 20.823 0zm.566-.248q-.282.128-.566.248l1.555 3.685q.335-.14.665-.29zm.474-4.008a17.5 17.5 0 0 1-2.224-.766l-1.555 3.685q1.343.566 2.733.942zm-2.224-.766a17.47 17.47 0 0 1-9.394-9.517l-3.706 1.507a21.47 21.47 0 0 0 11.545 11.695zm-9.394-9.517l-.097-.238l-3.706 1.507l.097.238zm-.097-.238a18.1 18.1 0 0 1 0-13.632l-3.706-1.507a22.1 22.1 0 0 0 0 16.646zm0-13.632l.097-.238l-3.706-1.507l-.097.238zm.097-.238a17.47 17.47 0 0 1 9.394-9.517l-1.555-3.685a21.47 21.47 0 0 0-11.545 11.695zm9.394-9.517q1.092-.46 2.224-.766l-1.046-3.861c-.926.25-1.84.565-2.733.942zm1.184-5.022q.285.12.566.248l1.654-3.642a27 27 0 0 0-.665-.291zm1.04 4.256c1.695-.46 2.853-1.83 3.22-3.277c.189-.743.194-1.602-.14-2.427c-.348-.856-1.01-1.541-1.9-1.946l-1.654 3.642c.01.004-.019-.007-.06-.049a.5.5 0 0 1-.093-.144c-.04-.098-.013-.128-.03-.06a.6.6 0 0 1-.144.247a.53.53 0 0 1-.245.153zm1.18 42.324c.89-.404 1.552-1.09 1.9-1.946c.334-.825.329-1.684.14-2.427c-.367-1.447-1.525-2.817-3.22-3.277l-1.046 3.861a.6.6 0 0 1 .39.4c.016.068-.011.038.029-.06a.5.5 0 0 1 .093-.144c.041-.042.07-.053.06-.049z"/><path fill="#f2f2f2" fill-rule="evenodd" d="M31.279 19.813a3.77 3.77 0 1 1 2.886 6.966a3.77 3.77 0 0 1-2.886-6.966m-9.756 13.682a6.5 6.5 0 1 1 4.975 12.011a6.5 6.5 0 0 1-4.975-12.011m16.024 22.303a1.473 1.473 0 1 0-1.128 2.72a1.473 1.473 0 0 0 1.128-2.72" clip-rule="evenodd"/></g></svg>
                    </span>
                </button>
                <a class="side-tool" href="${Host}" target="_blank" rel="noreferrer" aria-label="Visit host">
                    <span class="side-tool__icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M14 3h7v7h-2V6.414l-8.293 8.293l-1.414-1.414L17.586 5H14z"/><path fill="currentColor" d="M5 5h6v2H7v10h10v-4h2v6H5z"/></svg>
                    </span>
                </a>
            </aside>

            <section class="hero-card">
                <div class="hero-cover"></div>
                <div class="hero-footer">
                    <div class="hero-copy">
                        <div class="hero-title">${Tittle}</div>
                        <p class="hero-description">${Description}</p>
                    </div>
                    <img class="hero-avatar" src="https://q2.qlogo.cn/headimg_dl?dst_uin=3149261770&spec=0" alt="${Tittle}">
                </div>
            </section>

            <main id="main" class="feed-shell container">
                <div class="feed-stack">
                    <div id="memos" class="memos">
                        <!-- Memos Container -->
                    </div>
                </div>
            </main>

            <button id="backToTopBtn" title="Go to top" aria-label="Back to top">
                <span class="back-to-top__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#000000" d="M11 8.414V18h2V8.414l4.293 4.293l1.414-1.414L12 4.586l-6.707 6.707l1.414 1.414z"/></svg>
                </span>
            </button>

            <footer class="footer">
                <p>Copyright @
                    <script>
                        document.write(new Date().getFullYear())
                    </script>
                    ${Tittle} All Rights Reserved.
                </p>
            </footer>
        </div>
        <script type="text/javascript" src="assets/js/view-image.min.js"></script>
        <script type="text/javascript" src="assets/js/APlayer.min.js"></script>
        <script type="text/javascript" src="assets/js/Meting.min.js"></script>
        <script type="text/javascript" src="assets/js/main.js"></script>
        <script type="text/javascript" src="assets/js/link-card.js"></script>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@motues/momo-comment@1.4.x/dist/momo-comment.min.js"></script>
        <script type="text/javascript" src="assets/js/comments.js"></script>
        <script type="text/javascript" src="assets/js/custom.js"></script>
    </body>
    </html>
    `;

    res.send(html);
});

app.get('/api/link-preview', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: '缺少URL参数' });
    }

    try {
        const https = require('https');
        const axiosInstance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const response = await axiosInstance.get(url);
        const html = response.data;

        const title = matchMeta(html, ['og:title', 'title']) || getDomain(url);
        const description = matchMeta(html, ['og:description', 'description']) || '';
        const image = matchMeta(html, ['og:image', 'image']);
        const siteName = matchMeta(html, ['og:site_name']) || getDomain(url);

        res.json({
            title,
            description,
            image,
            siteName,
            url,
        });
    } catch (error) {
        console.error(`获取链接预览失败 (${url}):`, error.message);
        res.json({
            title: getDomain(url),
            description: '点击访问网站',
            image: '',
            siteName: getDomain(url),
            url,
        });
    }
});

function matchMeta(html, names) {
    for (const name of names) {
        const patterns = [
            new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
            new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
            new RegExp(`<title[^>]*>([^<]+)</title>`, 'i'),
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    }
    return null;
}

function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return url;
    }
}

app.get('/api/memos', async (req, res) => {
    const host = process.env.HOST.replace(/\/$/, '');
    const userId = process.env.USERID;
    const token = process.env.TOKEN;

    const limit = req.query.limit || 10;
    const params = [
        'exclude_replies=true',
        'only_public=true',
    ];
    if (req.query.max_id) params.push(`max_id=${req.query.max_id}`);
    if (req.query.since_id) params.push(`since_id=${req.query.since_id}`);

    const url = `${host}/api/v1/accounts/${userId}/statuses?${params.join('&')}`;

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(url, {
            headers,
            timeout: 5000,
        });
        if (response.headers.link) {
            res.set('Link', response.headers.link);
        }
        res.json(response.data);
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            res.status(504).json({ error: '请求第三方API超时' });
        } else {
            res.status(500).json({ error: 'API 代理失败', detail: err.message });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
