(function () {
    "use strict";

    const config = () => window.MODBATH_CONFIG || {};

    const $ = (selector, scope = document) => scope.querySelector(selector);

    const $$ = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    const renderIcons = () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons({
                attrs: {
                    "stroke-width": 1.8
                }
            });
        }
    };

    const setPressedState = (buttons, activeButton) => {
        buttons.forEach((button) => {
            const isActive = button === activeButton;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    };

    const initProblemFinder = () => {
        const root = $("[data-problem-finder]");
        if (!root) return;

        const items = config().problemFinder || [];
        const buttons = $$("[data-problem-card]", root);

        const title = $("[data-problem-result-title]", root);
        const text = $("[data-problem-result-text]", root);
        const link = $("[data-problem-result-link]", root);
        const linkText = $("[data-problem-result-link-text]", root);
        const result = $("[data-problem-result]", root);

        if (!items.length || !buttons.length || !title || !text || !link || !linkText) {
            return;
        }

        const updateResult = (key, activeButton) => {
            const item = items.find((entry) => entry.key === key);
            if (!item) return;

            setPressedState(buttons, activeButton);

            result?.classList.add("is-changing");

            title.textContent = item.resultTitle;
            text.textContent = item.resultText;
            link.href = item.serviceUrl;
            linkText.textContent = `Explore ${item.serviceTitle}`;

            window.setTimeout(() => {
                result?.classList.remove("is-changing");
            }, 260);
        };

        buttons.forEach((button, index) => {
            const key = button.getAttribute("data-problem-card");

            button.addEventListener("click", () => {
                updateResult(key, button);
            });

            button.addEventListener("keydown", (event) => {
                if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
                    return;
                }

                event.preventDefault();

                const columns = window.innerWidth <= 720 ? 2 : 3;
                let nextIndex = index;

                if (event.key === "ArrowRight") nextIndex = index + 1;
                if (event.key === "ArrowLeft") nextIndex = index - 1;
                if (event.key === "ArrowDown") nextIndex = index + columns;
                if (event.key === "ArrowUp") nextIndex = index - columns;

                if (nextIndex < 0) nextIndex = buttons.length - 1;
                if (nextIndex >= buttons.length) nextIndex = 0;

                buttons[nextIndex].focus();
                buttons[nextIndex].click();
            });
        });

        const firstActive = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
        updateResult(firstActive.getAttribute("data-problem-card"), firstActive);
    };

    const initStyleSwitcher = () => {
        const root = $("[data-style-switcher]");
        if (!root) return;

        const items = config().styleMaterials || [];
        const buttons = $$("[data-style-card]", root);

        const panel = $("[data-style-panel]", root);
        const image = $("[data-style-image]", root);
        const title = $("[data-style-title]", root);
        const text = $("[data-style-text]", root);
        const details = $("[data-style-details]", root);

        if (!items.length || !buttons.length || !panel || !image || !title || !text || !details) {
            return;
        }

        const updatePanel = (key, activeButton) => {
            const item = items.find((entry) => entry.key === key);
            if (!item) return;

            setPressedState(buttons, activeButton);

            panel.classList.add("is-changing");

            image.src = item.image;
            image.alt = `${item.title} bathroom remodeling style`;
            title.textContent = item.title;
            text.textContent = item.text;

            details.innerHTML = "";

            item.details.forEach((detail) => {
                const badge = document.createElement("span");
                badge.className = "badge badge--dark";
                badge.textContent = detail;
                details.appendChild(badge);
            });

            window.setTimeout(() => {
                panel.classList.remove("is-changing");
            }, 280);
        };

        buttons.forEach((button, index) => {
            const key = button.getAttribute("data-style-card");

            button.addEventListener("click", () => {
                updatePanel(key, button);
            });

            button.addEventListener("keydown", (event) => {
                if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
                    return;
                }

                event.preventDefault();

                const columns = window.innerWidth <= 720 ? 2 : 1;
                let nextIndex = index;

                if (event.key === "ArrowRight") nextIndex = index + 1;
                if (event.key === "ArrowLeft") nextIndex = index - 1;
                if (event.key === "ArrowDown") nextIndex = index + columns;
                if (event.key === "ArrowUp") nextIndex = index - columns;

                if (nextIndex < 0) nextIndex = buttons.length - 1;
                if (nextIndex >= buttons.length) nextIndex = 0;

                buttons[nextIndex].focus();
                buttons[nextIndex].click();
            });
        });

        const firstActive = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
        updatePanel(firstActive.getAttribute("data-style-card"), firstActive);
    };

    const initReviewCardTilt = () => {
        const cards = $$(".review-card");

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                if (window.innerWidth < 900) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -3;
                const rotateY = ((x / rect.width) - 0.5) * 3;

                card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    };

    const initHome = () => {
        initProblemFinder();
        initStyleSwitcher();
        initReviewCardTilt();

        window.setTimeout(renderIcons, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHome);
    } else {
        initHome();
    }
})();