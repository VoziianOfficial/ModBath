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

    const initLegalToc = () => {
        const tocLinks = $$(".legal-toc a");

        if (!tocLinks.length) return;

        const sections = tocLinks
            .map((link) => {
                const id = link.getAttribute("href");
                if (!id || !id.startsWith("#")) return null;

                const section = $(id);
                if (!section) return null;

                return {
                    link,
                    section
                };
            })
            .filter(Boolean);

        if (!sections.length) return;

        const setActiveLink = (activeLink) => {
            tocLinks.forEach((link) => {
                link.classList.toggle("is-active", link === activeLink);
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visibleEntry) return;

                const activeItem = sections.find(
                    (item) => item.section === visibleEntry.target
                );

                if (activeItem) {
                    setActiveLink(activeItem.link);
                }
            },
            {
                root: null,
                rootMargin: "-22% 0px -64% 0px",
                threshold: [0.08, 0.16, 0.32, 0.5]
            }
        );

        sections.forEach(({ section }) => observer.observe(section));

        setActiveLink(sections[0].link);
    };

    const initLegalCopyContact = () => {
        const contactLists = $$(".legal-contact-list");

        contactLists.forEach((list) => {
            const email = $("[data-company-email]", list);
            const phone = $("[data-company-phone]", list);

            if (email) {
                email.setAttribute("title", "Email ModBath");
            }

            if (phone) {
                phone.setAttribute("title", "Call ModBath");
            }
        });
    };

    const initLegalCardsGlow = () => {
        const cards = $$(".legal-mini-card, .legal-block, .legal-hero__card");

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                if (window.innerWidth < 900) return;

                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;

                card.style.setProperty("--legal-glow-x", `${x}%`);
                card.style.setProperty("--legal-glow-y", `${y}%`);
            });

            card.addEventListener("pointerleave", () => {
                card.style.removeProperty("--legal-glow-x");
                card.style.removeProperty("--legal-glow-y");
            });
        });
    };

    const initLegalPage = () => {
        initLegalToc();
        initLegalCopyContact();
        initLegalCardsGlow();

        window.setTimeout(renderIcons, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLegalPage);
    } else {
        initLegalPage();
    }
})();