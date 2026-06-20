const MOMO_COMMENT_API_URL = "https://comment.081531.xyz";

function mountMomoComments(target) {
    if (!target || target.dataset.commentInitialized === "true") {
        return;
    }

    if (!window.momo || typeof window.momo.init !== "function") {
        target.innerHTML = '<p class="memo-comment-thread__error">评论组件加载失败，请稍后刷新重试。</p>';
        return;
    }

    const slugId = target.dataset.commentSlug;
    const title = target.dataset.commentTitle || document.title;

    if (!slugId) {
        target.innerHTML = '<p class="memo-comment-thread__error">评论标识缺失，无法初始化评论区。</p>';
        return;
    }

    window.momo.init({
        el: `#${target.id}`,
        apiUrl: MOMO_COMMENT_API_URL,
        slugId,
        lang: "zh-cn",
        title,
    });

    target.dataset.commentInitialized = "true";
}

document.addEventListener("click", (event) => {
    const button = event.target.closest(".memo-comment-toggle");
    if (!button) {
        return;
    }

    const panelId = button.dataset.commentTarget;
    if (!panelId) {
        return;
    }

    const panel = document.getElementById(panelId);
    if (!panel) {
        return;
    }

    const nextExpanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(nextExpanded));
    button.classList.toggle("is-open", nextExpanded);
    panel.hidden = !nextExpanded;

    if (!nextExpanded) {
        return;
    }

    const target = panel.querySelector(".memo-comment-thread__mount");
    mountMomoComments(target);
});
