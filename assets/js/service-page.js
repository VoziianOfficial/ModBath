(function () {
    "use strict";

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    const getConfig = () => window.MODBATH_CONFIG || {};

    const getCurrentPage = () => {
        const path = window.location.pathname.split("/").pop();
        return path || "bathroom-remodeling.html";
    };

    const getService = () => {
        const services = getConfig().services || [];
        return services.find((service) => service.url === getCurrentPage()) || services[0];
    };

    const setText = (selector, value) => {
        $$(selector).forEach((element) => {
            element.textContent = value || "";
        });
    };

    const setHref = (selector, value) => {
        $$(selector).forEach((element) => {
            element.href = value || "#";
        });
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

    const serviceIconMap = {
        "Full Bathroom Remodel": "bath",
        "Shower Remodeling": "shower-head",
        "Bathtub Replacement": "bath",
        "Tub-to-Shower Conversion": "waves",
        "Bathroom Tile & Flooring": "grid-2x2",
        "Vanity & Bathroom Cabinets": "archive"
    };

    const includeIconMap = [
        "ruler",
        "shower-head",
        "grid-2x2",
        "archive",
        "sparkles",
        "wrench"
    ];

    const createIcon = (name, className) => {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", name);
        icon.setAttribute("aria-hidden", "true");

        if (className) {
            icon.className = className;
        }

        return icon;
    };

    const renderIncludes = (service) => {
        const grid = $("[data-service-includes]");
        if (!grid || !service?.includes) return;

        grid.innerHTML = "";

        service.includes.forEach((item, index) => {
            const article = document.createElement("article");
            article.className = "include-card premium-card";

            const icon = createIcon(includeIconMap[index % includeIconMap.length], "card-icon");

            const title = document.createElement("h3");
            title.textContent = item;

            const text = document.createElement("p");
            text.textContent =
                "Compare local provider options connected to this part of the bathroom project.";

            article.append(icon, title, text);
            grid.appendChild(article);
        });
    };

    const renderOverviewPoints = (service) => {
        const list = $("[data-service-overview-points]");
        if (!list || !service?.includes) return;

        list.innerHTML = "";

        service.includes.slice(0, 4).forEach((item) => {
            const point = document.createElement("span");
            point.textContent = item;
            list.appendChild(point);
        });
    };

    const renderOptionBadges = (service) => {
        const badges = $("[data-service-option-badges]");
        if (!badges || !service?.includes) return;

        badges.innerHTML = "";

        service.includes.slice(0, 4).forEach((item) => {
            const badge = document.createElement("span");
            badge.className = "badge";
            badge.textContent = item;
            badges.appendChild(badge);
        });
    };

    const renderRelated = (service) => {
        const container = $("[data-related-services]");
        if (!container || !service?.related) return;

        const services = getConfig().services || [];
        container.innerHTML = "";

        service.related.forEach((title) => {
            const related = services.find((item) => item.title === title);
            if (!related) return;

            const link = document.createElement("a");
            link.className = "related-card";
            link.href = related.url;

            const icon = createIcon(related.icon || serviceIconMap[related.title] || "bath", "card-icon");

            const heading = document.createElement("h3");
            heading.textContent = related.title;

            const text = document.createElement("p");
            text.textContent = related.relatedDescription || related.description;

            link.append(icon, heading, text);
            container.appendChild(link);
        });
    };

    const renderFaq = (service) => {
        const faq = $("[data-service-faq]");
        if (!faq || !service) return;

        const questions = [
            {
                question: `Is ModBath a ${service.title.toLowerCase()} company?`,
                answer:
                    "No. ModBath is an independent request platform. Independent providers handle the work if a homeowner chooses to hire them."
            },
            {
                question: `Can I compare local pros for ${service.title.toLowerCase()}?`,
                answer:
                    "Yes. You can start a request and compare local independent provider options related to this bathroom project category."
            },
            {
                question: "Is the request free?",
                answer:
                    "Yes. ModBath is a free service for homeowners starting a bathroom remodeling request."
            },
            {
                question: "Do I have to hire someone through ModBath?",
                answer:
                    "No. Homeowners stay in control and decide whether they want to contact or hire any independent provider."
            }
        ];

        faq.innerHTML = "";

        questions.forEach((item, index) => {
            const article = document.createElement("article");
            article.className = index === 0 ? "faq-item is-open" : "faq-item";
            article.setAttribute("data-accordion-item", "");

            const button = document.createElement("button");
            button.className = "faq-button";
            button.type = "button";
            button.setAttribute("data-accordion-button", "");
            button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
            button.innerHTML = `
        ${item.question}
        <span class="faq-button__icon" aria-hidden="true"></span>
      `;

            const panel = document.createElement("div");
            panel.className = "faq-panel";
            panel.setAttribute("data-accordion-panel", "");

            const inner = document.createElement("div");
            inner.className = "faq-panel__inner";
            inner.textContent = item.answer;

            panel.appendChild(inner);
            article.append(button, panel);
            faq.appendChild(article);
        });
    };

    const renderPageMeta = (service) => {
        if (!service) return;

        const metaDescription = document.querySelector('meta[name="description"]');

        document.title = `${service.title} | ModBath`;

        if (metaDescription) {
            metaDescription.setAttribute("content", service.description);
        }
    };

    const updateImages = (service) => {
        if (!service) return;

        const overviewImageMap = {
            "Full Bathroom Remodel": "assets/images/home/small-bathroom.jpg",
            "Shower Remodeling": "assets/images/home/shower-remodeling-preview.jpg",
            "Bathtub Replacement": "assets/images/home/luxury-bathroom-finish.jpg",
            "Tub-to-Shower Conversion": "assets/images/home/double-vanity.jpg",
            "Bathroom Tile & Flooring": "assets/images/service-pages/bathtub-replacement-hero.jpg",
            "Vanity & Bathroom Cabinets": "assets/images/about/about-hero-bathroom.jpg"
        };

        $$("[data-service-image]").forEach((image) => {
            const type = image.getAttribute("data-service-image");

            if (type === "hero") {
                image.src = `assets/images/service-pages/${getCurrentPage().replace(".html", "")}-hero.jpg`;
                image.alt = "";
            }

            if (type === "overview") {
                image.src = overviewImageMap[service.title] || image.getAttribute("src");
                image.alt = `${service.title} bathroom project overview`;
            }

            if (type === "options") {
                image.src = `assets/images/service-pages/${getCurrentPage().replace(".html", "")}-options.jpg`;
                image.alt = `${service.title} bathroom options`;
            }
        });
    };

    const updateIcons = (service) => {
        const iconName = service?.icon || serviceIconMap[service?.title] || "bath";

        $$("[data-service-icon]").forEach((icon) => {
            icon.setAttribute("data-lucide", iconName);
        });
    };

    const initServicePage = () => {
        const service = getService();

        if (!service) return;

        renderPageMeta(service);

        setText("[data-service-title]", service.title);
        setText("[data-service-description]", service.description);
        setText("[data-service-options-title]", service.optionsTitle);
        setText("[data-service-compare-left]", service.comparisonLeftTitle);
        setText("[data-service-compare-right]", service.comparisonRightTitle);

        setHref("[data-current-service-link]", service.url);

        updateImages(service);
        updateIcons(service);

        renderOverviewPoints(service);
        renderIncludes(service);
        renderOptionBadges(service);
        renderRelated(service);
        renderFaq(service);

        window.dispatchEvent(new Event("resize"));

        window.setTimeout(() => {
            renderIcons();

            if (typeof window.MODBATH_REINIT_ACCORDIONS === "function") {
                window.MODBATH_REINIT_ACCORDIONS();
            }
        }, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initServicePage);
    } else {
        initServicePage();
    }
})();
