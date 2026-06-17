(function () {
    "use strict";

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

    const initMarqueeAccessibility = () => {
        const marquee = $("[data-marquee]");
        if (!marquee) return;

        const track = $(".about-marquee__track", marquee);
        if (!track) return;

        marquee.addEventListener("focusin", () => {
            track.style.animationPlayState = "paused";
        });

        marquee.addEventListener("focusout", () => {
            track.style.animationPlayState = "";
        });
    };

    const initCompareCardGlow = () => {
        const cards = $$(".about-compare-card");

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                if (window.innerWidth < 900) return;

                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;

                card.style.setProperty("--glow-x", `${x}%`);
                card.style.setProperty("--glow-y", `${y}%`);
            });

            card.addEventListener("pointerleave", () => {
                card.style.removeProperty("--glow-x");
                card.style.removeProperty("--glow-y");
            });
        });
    };

    const initMatchingPanels = () => {
        const panels = $$("[data-tab-panel]");

        panels.forEach((panel) => {
            const observer = new MutationObserver(() => {
                if (!panel.hidden) {
                    panel.classList.remove("is-active");
                    window.requestAnimationFrame(() => {
                        panel.classList.add("is-active");
                    });
                }
            });

            observer.observe(panel, {
                attributes: true,
                attributeFilter: ["hidden"]
            });
        });
    };

    const initAbout = () => {
        initMarqueeAccessibility();
        initCompareCardGlow();
        initMatchingPanels();

        window.setTimeout(renderIcons, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAbout);
    } else {
        initAbout();
    }
})();