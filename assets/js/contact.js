(function () {
    "use strict";

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    const projectData = {
        "full-remodel": {
            icon: "bath",
            title: "Full bathroom remodel",
            text:
                "Use this direction when you want to compare options for the whole room, including layout, shower or tub, tile, vanity, lighting, storage, and finishes.",
            badges: ["Layout", "Surfaces", "Storage"]
        },
        "shower-update": {
            icon: "shower-head",
            title: "Shower update",
            text:
                "Use this direction when the main goal is a cleaner shower area, glass doors, tile walls, waterproofing, fixtures, niches, or a walk-in feel.",
            badges: ["Walk-in shower", "Glass doors", "Tile walls"]
        },
        "new-bathtub": {
            icon: "bath",
            title: "New bathtub",
            text:
                "Use this direction if the current tub is old, stained, damaged, uncomfortable, or no longer fits the bathroom style.",
            badges: ["Tub style", "Bath surround", "Fixtures"]
        },
        "tub-to-shower": {
            icon: "waves",
            title: "Tub-to-shower conversion",
            text:
                "Use this direction when you want to compare options for removing an old bathtub and creating a cleaner, more open shower space.",
            badges: ["Tub removal", "Shower base", "Open feel"]
        },
        "tile-flooring": {
            icon: "grid-2x2",
            title: "Tile and flooring",
            text:
                "Use this direction for bathroom floors, shower wall tile, waterproof surfaces, backsplash areas, grout updates, and stone-look finishes.",
            badges: ["Floor tile", "Wall tile", "Waterproofing"]
        },
        "vanity-storage": {
            icon: "archive",
            title: "Vanity storage",
            text:
                "Use this direction when you want to compare options for vanities, cabinets, sinks, counters, mirrors, and smarter bathroom storage.",
            badges: ["Vanity", "Cabinets", "Mirrors"]
        }
    };

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

    const initProjectChoices = () => {
        const root = $("[data-contact-projects]");
        if (!root) return;

        const buttons = $$("[data-project-choice]", root);
        const panel = $("[data-project-panel]", root);
        const icon = $("[data-project-icon]", root);
        const title = $("[data-project-title]", root);
        const text = $("[data-project-text]", root);
        const badges = $("[data-project-badges]", root);

        if (!buttons.length || !panel || !icon || !title || !text || !badges) return;

        const updatePanel = (key, activeButton) => {
            const data = projectData[key];
            if (!data) return;

            setPressedState(buttons, activeButton);

            panel.classList.add("is-changing");

            icon.setAttribute("data-lucide", data.icon);
            title.textContent = data.title;
            text.textContent = data.text;

            badges.innerHTML = "";

            data.badges.forEach((item) => {
                const badge = document.createElement("span");
                badge.className = "badge";
                badge.textContent = item;
                badges.appendChild(badge);
            });

            window.setTimeout(() => {
                panel.classList.remove("is-changing");
            }, 260);

            renderIcons();
        };

        buttons.forEach((button, index) => {
            const key = button.getAttribute("data-project-choice");

            button.addEventListener("click", () => {
                updatePanel(key, button);
            });

            button.addEventListener("keydown", (event) => {
                if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
                    return;
                }

                event.preventDefault();

                const columns = window.innerWidth <= 720 ? 1 : 2;
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
        updatePanel(firstActive.getAttribute("data-project-choice"), firstActive);
    };

    const initContactForm = () => {
        const form = $("[data-contact-form]");
        const status = $("[data-form-status]", form || document);

        if (!form || !status) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                status.textContent = "Please complete the required fields before submitting.";
                status.classList.add("is-error");
                form.reportValidity();
                return;
            }

            status.classList.remove("is-error");
            status.textContent =
                "Thanks — your request details are ready. Connect this form to your backend or form service to receive submissions.";

            form.reset();

            window.setTimeout(() => {
                status.textContent = "";
            }, 7000);
        });
    };

    const initFormSelectEnhancement = () => {
        const select = $("#project-type-select");
        const message = $("#message");

        if (!select || !message) return;

        const suggestions = {
            "Full Bathroom Remodel":
                "I want to compare options for a full bathroom remodel, including layout, shower or tub, tile, vanity, lighting, and storage.",
            "Shower Remodeling":
                "I want to compare options for shower remodeling, including walk-in shower ideas, tile walls, glass doors, fixtures, and waterproofing.",
            "Bathtub Replacement":
                "I want to compare options for replacing an old bathtub with a cleaner and more comfortable bath option.",
            "Tub-to-Shower Conversion":
                "I want to compare options for converting an old bathtub into a more open shower space.",
            "Bathroom Tile & Flooring":
                "I want to compare options for bathroom tile, flooring, shower walls, waterproof surfaces, or stone-look finishes.",
            "Vanity & Cabinets":
                "I want to compare options for bathroom vanities, cabinets, sinks, mirrors, counters, and storage upgrades.",
            "Not sure yet":
                "I am not sure which bathroom service fits yet, but I want to describe what I want to change and compare local options."
        };

        select.addEventListener("change", () => {
            const value = select.value;

            if (!value || message.value.trim()) return;

            message.value = suggestions[value] || "";
        });
    };

    const initContactCardsTilt = () => {
        const cards = $$(".contact-trust-card, .request-info-card");

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                if (window.innerWidth < 900) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -2.5;
                const rotateY = ((x / rect.width) - 0.5) * 2.5;

                card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    };

    const initContactPage = () => {
        initProjectChoices();
        initContactForm();
        initFormSelectEnhancement();
        initContactCardsTilt();

        window.setTimeout(renderIcons, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initContactPage);
    } else {
        initContactPage();
    }
})();