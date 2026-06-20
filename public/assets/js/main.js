const memo = {
    domId: "#memos",
    nextPage: null,
};

if (typeof memos !== "undefined") {
    for (const key in memos) {
        if (memos[key]) {
            memo[key] = memos[key];
        }
    }
}

const memoDom = document.querySelector(memo.domId);
if (!memoDom) {
    console.error(`Element with ID '${memo.domId}' not found.`);
}

memoDom.insertAdjacentHTML(
    "afterend",
    '<button class="load-btn button-load" id="load-more">努力加载中…</button>',
);
const loadMoreBtn = document.getElementById("load-more");

function decodeHTMLEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sanitizeSlugSegment(value, fallback = "item") {
    const normalized = String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return normalized || fallback;
}

function buildCommentSlug(item) {
    let hostname = "mastodon";
    try {
        const sourceUrl = item.uri || item.url || memo.host || window.location.origin;
        hostname = new URL(sourceUrl).hostname;
    } catch (error) {
        hostname = "mastodon";
    }

    const accountSegment = sanitizeSlugSegment(
        item.account?.acct || item.account?.username || item.account?.id || "author",
        "author",
    );

    return `mastodon-${sanitizeSlugSegment(hostname, "mastodon")}-${accountSegment}-${item.id}`;
}

function getRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat(memos.language || "zh-CN", {
        numeric: "auto",
        style: "short",
    });
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return rtf.format(-years, "year");
    }
    if (months > 0) {
        return rtf.format(-months, "month");
    }
    if (days > 0) {
        return rtf.format(-days, "day");
    }
    if (hours > 0) {
        return rtf.format(-hours, "hour");
    }
    if (minutes > 0) {
        return rtf.format(-minutes, "minute");
    }
    return rtf.format(-seconds, "second");
}

function buildMediaPatterns() {
    return {
        bilibili: {
            reg: /https?:\/\/(?:www\.)?bilibili\.com\/video\/(?:av(\d+)|BV([a-zA-Z0-9]+))[\/?]?/i,
            transform: (match, av, bv) => {
                const vid = bv || `av${av}`;
                return `<div class="video-wrapper"><iframe src="//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${vid}&as_wide=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position:absolute;height:100%;width:100%;"></iframe></div>`;
            },
        },
        netease: {
            reg: /https?:\/\/music\.163\.com\/(?:#\/)?(?:song|playlist|album)\?id=(\d+)/i,
            transform: (match, id) => `<meting-js auto="https://music.163.com/#/song?id=${id}"></meting-js>`,
        },
        qqmusic: {
            reg: /https?:\/\/y\.qq\.com\/(?:[^?]+)\/([^?.]+)(?:\.html)?/i,
            transform: (match, id) => `<meting-js auto="https://y.qq.com/n/yqq/song${id}.html"></meting-js>`,
        },
        qqvideo: {
            reg: /https?:\/\/v\.qq\.com\/(?:[^?]+)\/([a-z0-9]+)(?:\.html)?/i,
            transform: (match, id) => `<div class="video-wrapper"><iframe src="//v.qq.com/iframe/player.html?vid=${id}" allowfullscreen="true" frameborder="no"></iframe></div>`,
        },
        spotify: {
            reg: /https?:\/\/open\.spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/i,
            transform: (match, type, id) => `<div class="spotify-wrapper"><iframe style="border-radius:12px" src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0" width="100%" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`,
        },
        youku: {
            reg: /https?:\/\/v\.youku\.com\/.*\/id_([a-zA-Z0-9=]+)(?:\.html)?/i,
            transform: (match, id) => `<div class="video-wrapper"><iframe src="https://player.youku.com/embed/${id}" frameborder="0" allowfullscreen="true"></iframe></div>`,
        },
        youtube: {
            reg: /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i,
            transform: (match, id) => `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
        },
    };
}

function getPlainContent(decodedContent) {
    return decodedContent.replace(/<[^>]+>/g, (match) => {
        if (match.startsWith('<a href="') && match.includes("</a>")) {
            const hrefMatch = match.match(/href="([^"]+)"/);
            return hrefMatch ? hrefMatch[1] : "";
        }
        return "";
    });
}

function processContent(item, plainContent) {
    let processedContent = plainContent;
    const patterns = buildMediaPatterns();

    for (const pattern of Object.values(patterns)) {
        processedContent = processedContent.replace(pattern.reg, pattern.transform);
    }

    if (item.emojis && item.emojis.length > 0) {
        item.emojis.forEach((emoji) => {
            const regex = new RegExp(`:${emoji.shortcode}:`, "g");
            processedContent = processedContent.replace(
                regex,
                `<img src="${emoji.url}" alt="${emoji.shortcode}" class="emoji" style="height: 2em; width: 2em; vertical-align: middle;">`,
            );
        });
    }

    if (typeof window.processLinkCards === "function") {
        processedContent = window.processLinkCards(processedContent);
    }

    if (item.media_attachments && item.media_attachments.length > 0) {
        let imgUrl = "";
        item.media_attachments.forEach((attachment) => {
            if (attachment.type === "image") {
                imgUrl += `<div class="resimg"><img loading="lazy" src="${attachment.preview_url}"/></div>`;
            }
        });
        if (imgUrl) {
            processedContent += `<div class="resource-wrapper"><div class="images-wrapper">${imgUrl}</div></div>`;
        }
    }

    return processedContent;
}

function buildApplicationInfo(item) {
    if (item.application?.name) {
        return `From·<a href="${item.url}" target="_blank">${item.application.name}</a>`;
    }
    return `From·<a href="${item.url}" target="_blank">Mastodon</a>`;
}

function renderMemoItem(item) {
    const decodedContent = decodeHTMLEntities(item.content);
    const plainContent = getPlainContent(decodedContent);
    const processedContent = processContent(item, plainContent);
    const relativeTime = getRelativeTime(new Date(item.created_at));
    const commentSlug = buildCommentSlug(item);
    const commentMountId = `momo-comment-${item.id}`;
    const commentPanelId = `memo-comments-${item.id}`;
    const commentTitle = `${item.account?.display_name || "Mastodon"} #${item.id}`;
    const applicationInfo = buildApplicationInfo(item);

    return `
        <li class="timeline" id="${item.id}">
            <div class="memos__content" style="--avatar-url: url('${item.account.avatar}')">
                <div class="memos__text">
                    <div class="memos__userinfo">
                        <div>${item.account.display_name}</div>
                        <div>
                            <svg viewBox="0 0 24 24" aria-label="认证账号" class="memos__verify">
                                <g>
                                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="memos__id">@<a href="${item.account.url}" target="_blank">${item.account.acct}</a></div>
                    </div>
                    <p>${processedContent}</p>
                    <div class="memos__meta">
                        <small class="memos__date">${relativeTime} · ${applicationInfo}</small>
                    </div>
                    <div class="memo-social">
                        <button
                            class="memo-social__action memo-comment-toggle"
                            type="button"
                            data-comment-target="${commentPanelId}"
                            aria-expanded="false"
                        >
                            <span class="memo-social__icon" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v8A2.5 2.5 0 0 1 17.5 15H9.414l-4.707 4.707A1 1 0 0 1 3 19v-4.69A2.5 2.5 0 0 1 1.5 12V4.5zM6.5 4a.5.5 0 0 0-.5.5v8c0 .098.028.19.076.268L6.5 13h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11z"/></svg>
                            </span>
                            <span>评论</span>
                        </button>
                    </div>
                    <section class="memo-comment-thread" id="${commentPanelId}" hidden>
                        <div class="memo-comment-thread__shell">
                            <div class="memo-comment-thread__header">
                                <strong>评论区</strong>
                                <span>独立评论线程</span>
                            </div>
                            <div
                                id="${commentMountId}"
                                class="memo-comment-thread__mount"
                                data-comment-slug="${escapeHtml(commentSlug)}"
                                data-comment-title="${escapeHtml(commentTitle)}"
                            ></div>
                        </div>
                    </section>
                </div>
            </div>
        </li>
    `;
}

function updateHTML(data) {
    const memoItems = data.map(renderMemoItem).join("");
    const resultAll = `<ul>${memoItems}</ul>`;
    memoDom.insertAdjacentHTML("beforeend", resultAll);

    if (window.ViewImage) {
        ViewImage.init(".container img");
    }
}

async function fetchDataAndUpdate(url = "/api/memos?limit=10", isLoadMore = false) {
    try {
        loadMoreBtn.textContent = "加载中...";
        loadMoreBtn.disabled = true;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const linkHeader = response.headers.get("Link");
        if (linkHeader) {
            const links = linkHeader.split(",");
            const nextLink = links.find((link) => link.includes('rel="next"'));
            if (nextLink) {
                const matches = nextLink.match(/<(.+?)>/);
                memo.nextPage = matches ? matches[1] : null;
            } else {
                memo.nextPage = null;
            }
        } else {
            memo.nextPage = null;
        }

        const data = await response.json();
        const filteredData = data.filter((toot) => !toot.reblog && !toot.in_reply_to_id);

        if (!isLoadMore) {
            memoDom.innerHTML = "";
        }

        updateHTML(filteredData);

        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = "加载更多";
        loadMoreBtn.style.display = memo.nextPage ? "inline-block" : "none";
    } catch (error) {
        console.error("Error fetching data:", error);
        loadMoreBtn.textContent = "加载失败，点击重试";
        loadMoreBtn.disabled = false;
    }
}

loadMoreBtn.addEventListener("click", () => {
    if (memo.nextPage) {
        fetchDataAndUpdate(memo.nextPage, true);
    }
});

fetchDataAndUpdate();
