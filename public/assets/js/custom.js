const themeToggle = document.querySelector(".theme-toggle");
const backToTopBtn = document.getElementById("backToTopBtn");

function resolveTheme() {
    const savedTheme = window.localStorage && window.localStorage.getItem("theme");
    if (savedTheme === "light-theme" || savedTheme === "dark-theme") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark-theme"
        : "light-theme";
}

function applyTheme(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(theme);
    document.documentElement.setAttribute(
        "data-theme",
        theme === "dark-theme" ? "dark" : "light",
    );

    if (window.localStorage) {
        window.localStorage.setItem("theme", theme);
    }

    if (themeToggle) {
        const isDark = theme === "dark-theme";
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode",
        );
        themeToggle.setAttribute("title", isDark ? "Light mode" : "Dark mode");
    }
}

applyTheme(resolveTheme());

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-theme")
            ? "light-theme"
            : "dark-theme";
        applyTheme(nextTheme);
    });
}

function updateBackToTopVisibility() {
    if (!backToTopBtn) {
        return;
    }

    const shouldShow = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
    backToTopBtn.style.display = shouldShow ? "flex" : "none";
}

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}

window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
window.addEventListener("load", updateBackToTopVisibility);
