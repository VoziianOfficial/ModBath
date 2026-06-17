(function () {
    "use strict";

    const SELECTORS = {
        header: "[data-site-header]",
        menuToggle: "[data-menu-toggle]",
        mobileMenu: "[data-mobile-menu]",
        mobileMenuClose: "[data-mobile-menu-close]",
        serviceList: "[data-service-list]",
        navList: "[data-nav-list]",
        legalList: "[data-legal-list]",
        cookieConsent: "[data-cookie-consent]",
        accordion: "[data-accordion]"
    };

    const COOKIE_KEY = "modbath_cookie_consent";

    const getConfig = () => window.MODBATH_CONFIG || {};

    const $ = (selector, scope = document) => scope.querySelector(selector);

    const $$ = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    const getCurrentPage = () => {
        const path = window.location.pathname.split("/").pop();
        return path || "index.html";
    };

    const normalizeEmail = (email) => String(email || "").replace(/^mailto:/, "").trim();

    const toTelLink = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;

    const toMailLink = (email) => `mailto:${normalizeEmail(email)}`;

    const createIcon = (name, className) => {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", name);
        icon.setAttribute("aria-hidden", "true");

        if (className) {
            icon.className = className;
        }

        return icon;
    };

    const createArrow = () => {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "arrow-up-right");
        icon.setAttribute("aria-hidden", "true");
        return icon;
    };

    const clearNode = (node) => {
        if (!node) return;
        while (node.firstChild) node.removeChild(node.firstChild);
    };

    const setText = (selector, value) => {
        $$(selector).forEach((element) => {
            element.textContent = value || "";
        });
    };

    const setHref = (selector, value) => {
        $$(selector).forEach((element) => {
            element.setAttribute("href", value || "#");
        });
    };

    const setAriaLabel = (selector, value) => {
        $$(selector).forEach((element) => {
            element.setAttribute("aria-label", value || "");
        });
    };

    const DEFAULT_COMPANY_DATA = {
        companyName: "ModBath",
        companyId: "MB-48291",
        phone: "+1 555 248 6093",
        phoneCompact: "+15552486093",
        email: "support@modbath.com",
        address: "1287 Harbor View Drive, Tampa, FL 33602, USA",
        serviceArea: "United States"
    };

    const escapeHTML = (value) =>
        String(value || "").replace(/[&<>"']/g, (char) => {
            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return map[char];
        });

    const buildBrandMarkup = () => {
        const config = getConfig();

        const companyName = config.companyName || DEFAULT_COMPANY_DATA.companyName;
        const accentPart = config.brandAccentPart || "Bath";

        const brand = document.createElement("span");
        brand.className = "brand__name";

        const lowerName = companyName.toLowerCase();
        const lowerAccent = accentPart.toLowerCase();

        if (accentPart && lowerName.endsWith(lowerAccent)) {
            const normalPart = companyName.slice(0, companyName.length - accentPart.length);
            const accentText = companyName.slice(companyName.length - accentPart.length);

            brand.innerHTML = `${escapeHTML(normalPart)}<span>${escapeHTML(accentText)}</span>`;
        } else {
            brand.textContent = companyName;
        }

        return brand;
    };

    const updateBrandEverywhere = () => {
        const config = getConfig();
        const companyName = config.companyName || DEFAULT_COMPANY_DATA.companyName;

        $$(".brand").forEach((brandLink) => {
            brandLink.setAttribute("aria-label", `${companyName} home`);
        });

        $$(".brand__name").forEach((oldBrand) => {
            oldBrand.replaceWith(buildBrandMarkup());
        });

        $$("[data-brand-wordmark]").forEach((element) => {
            clearNode(element);
            element.appendChild(buildBrandMarkup());
        });
    };

    const replaceTextNodes = (pairs) => {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const parent = node.parentElement;

                    if (!parent) return NodeFilter.FILTER_REJECT;

                    if (parent.closest("script, style, svg, noscript")) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach((node) => {
            let text = node.nodeValue;

            pairs.forEach(([oldValue, newValue]) => {
                if (!oldValue || !newValue || oldValue === newValue) return;
                text = text.split(oldValue).join(newValue);
            });

            node.nodeValue = text;
        });
    };

    const replaceAttributes = (pairs) => {
        const attributes = [
            "href",
            "aria-label",
            "title",
            "alt",
            "content",
            "placeholder",
            "value"
        ];

        $$("*").forEach((element) => {
            if (element.closest("script, style, svg, noscript")) return;

            attributes.forEach((attribute) => {
                if (!element.hasAttribute(attribute)) return;

                let value = element.getAttribute(attribute);

                pairs.forEach(([oldValue, newValue]) => {
                    if (!oldValue || !newValue || oldValue === newValue) return;
                    value = value.split(oldValue).join(newValue);
                });

                element.setAttribute(attribute, value);
            });
        });

        if (document.title) {
            let title = document.title;

            pairs.forEach(([oldValue, newValue]) => {
                if (!oldValue || !newValue || oldValue === newValue) return;
                title = title.split(oldValue).join(newValue);
            });

            document.title = title;
        }
    };

    const updateSmartContactLinks = () => {
        const config = getConfig();

        const phone = config.phone || DEFAULT_COMPANY_DATA.phone;
        const email = normalizeEmail(config.email || DEFAULT_COMPANY_DATA.email);

        $$("a[data-phone-link], a[href^='tel:']").forEach((link) => {
            link.setAttribute("href", toTelLink(phone));
            link.setAttribute("aria-label", `${config.phoneLabel || "Call"} ${phone}`);
        });

        $$("a[data-email-link], a[href^='mailto:']").forEach((link) => {
            link.setAttribute("href", toMailLink(email));
            link.setAttribute("aria-label", `Email ${email}`);
        });
    };

    const autoReplaceOldCompanyData = () => {
        const config = getConfig();

        const companyName = config.companyName || DEFAULT_COMPANY_DATA.companyName;
        const companyId = config.companyId || DEFAULT_COMPANY_DATA.companyId;
        const phone = config.phone || DEFAULT_COMPANY_DATA.phone;
        const phoneCompact = String(phone).replace(/[^\d+]/g, "");
        const email = normalizeEmail(config.email || DEFAULT_COMPANY_DATA.email);
        const address = config.address || DEFAULT_COMPANY_DATA.address;
        const serviceArea = config.serviceArea || DEFAULT_COMPANY_DATA.serviceArea;

        const pairs = [
            [DEFAULT_COMPANY_DATA.companyName, companyName],
            [DEFAULT_COMPANY_DATA.companyId, companyId],
            [DEFAULT_COMPANY_DATA.phone, phone],
            [DEFAULT_COMPANY_DATA.phoneCompact, phoneCompact],
            [DEFAULT_COMPANY_DATA.email, email],
            [DEFAULT_COMPANY_DATA.address, address],
            [DEFAULT_COMPANY_DATA.serviceArea, serviceArea],
            [`mailto:${DEFAULT_COMPANY_DATA.email}`, toMailLink(email)],
            [`tel:${DEFAULT_COMPANY_DATA.phoneCompact}`, toTelLink(phone)]
        ];

        replaceTextNodes(pairs);
        replaceAttributes(pairs);
    };

    const renderCompanyData = () => {
        const config = getConfig();
        const currentYear = new Date().getFullYear();

        const companyName = config.companyName || DEFAULT_COMPANY_DATA.companyName;
        const companyId = config.companyId || DEFAULT_COMPANY_DATA.companyId;
        const phone = config.phone || DEFAULT_COMPANY_DATA.phone;
        const phoneLabel = config.phoneLabel || "Call Now";
        const email = normalizeEmail(config.email || DEFAULT_COMPANY_DATA.email);
        const address = config.address || DEFAULT_COMPANY_DATA.address;
        const serviceArea = config.serviceArea || DEFAULT_COMPANY_DATA.serviceArea;

        setText("[data-company-name]", companyName);
        setText("[data-company-id]", companyId);
        setText("[data-company-phone]", phone);
        setText("[data-company-phone-label]", phoneLabel);
        setText("[data-company-email]", email);
        setText("[data-company-address]", address);
        setText("[data-company-disclaimer]", config.disclaimer);
        setText("[data-footer-text]", config.footerText);
        setText("[data-service-area]", serviceArea);
        setText("[data-current-year]", currentYear);

        setHref("[data-phone-link]", toTelLink(phone));
        setHref("[data-email-link]", toMailLink(email));

        setAriaLabel("[data-phone-link]", `${phoneLabel} ${phone}`);
        setAriaLabel("[data-email-link]", `Email ${email}`);

        updateBrandEverywhere();
        updateSmartContactLinks();
        autoReplaceOldCompanyData();
    };
    const createTextLink = (item, options = {}) => {
        const link = document.createElement("a");
        link.href = item.url || "#";
        link.textContent = item.label || item.title || "Link";

        if (options.withArrow) {
            link.appendChild(createArrow());
        }

        if (options.className) {
            link.className = options.className;
        }

        return link;
    };

    const renderNavigationLists = () => {
        const config = getConfig();
        const currentPage = getCurrentPage();

        $$(SELECTORS.navList).forEach((list) => {
            clearNode(list);

            (config.navigation || []).forEach((item) => {
                const li = document.createElement("li");
                const link = createTextLink(item);

                if (item.url === currentPage) {
                    link.classList.add("is-active");
                    link.setAttribute("aria-current", "page");
                }

                li.appendChild(link);
                list.appendChild(li);
            });
        });

        $$(SELECTORS.legalList).forEach((list) => {
            clearNode(list);

            (config.legalLinks || []).forEach((item) => {
                const li = document.createElement("li");
                const link = createTextLink(item);

                if (item.url === currentPage) {
                    link.classList.add("is-active");
                    link.setAttribute("aria-current", "page");
                }

                li.appendChild(link);
                list.appendChild(li);
            });
        });
    };

    const renderServiceLists = () => {
        const config = getConfig();
        const services = config.services || [];
        const currentPage = getCurrentPage();

        $$(SELECTORS.serviceList).forEach((list) => {
            const type = list.getAttribute("data-service-list") || "default";
            clearNode(list);

            services.forEach((service) => {
                const li = document.createElement("li");
                const link = document.createElement("a");

                link.href = service.url;
                link.textContent = service.title;

                if (service.url === currentPage) {
                    link.classList.add("is-active");
                    link.setAttribute("aria-current", "page");
                }

                if (type === "cards") {
                    link.className = "service-mini-card premium-card";
                    link.textContent = "";

                    const icon = createIcon(service.icon || "bath", "card-icon");
                    const title = document.createElement("span");
                    const text = document.createElement("small");

                    title.textContent = service.title;
                    text.textContent = service.description;

                    link.append(icon, title, text);
                }

                if (type === "mobile") {
                    link.appendChild(createArrow());
                }

                li.appendChild(link);
                list.appendChild(li);
            });
        });
    };

    const setActiveHeaderLinks = () => {
        const currentPage = getCurrentPage();

        $$(".header-nav__link, .footer-links a, .mobile-menu a").forEach((link) => {
            const href = link.getAttribute("href");

            if (!href || href.startsWith("#")) return;

            if (href === currentPage) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
        });
    };

    const initStickyHeader = () => {
        const header = $(SELECTORS.header);
        if (!header) return;

        const update = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    };

    const initMobileMenu = () => {
        const toggle = $(SELECTORS.menuToggle);
        const menu = $(SELECTORS.mobileMenu);
        const closeButtons = $$(SELECTORS.mobileMenuClose);

        if (!toggle || !menu) return;

        const openMenu = () => {
            document.body.classList.add("is-menu-open");
            menu.classList.add("is-open");
            menu.removeAttribute("hidden");
            toggle.setAttribute("aria-expanded", "true");
            menu.setAttribute("aria-hidden", "false");
        };

        const closeMenu = () => {
            document.body.classList.remove("is-menu-open");
            menu.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");

            window.setTimeout(() => {
                if (!menu.classList.contains("is-open")) {
                    menu.setAttribute("hidden", "");
                }
            }, 260);
        };

        const toggleMenu = () => {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        toggle.addEventListener("click", toggleMenu);

        closeButtons.forEach((button) => {
            button.addEventListener("click", closeMenu);
        });

        menu.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (link) closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && menu.classList.contains("is-open")) {
                closeMenu();
                toggle.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1100 && menu.classList.contains("is-open")) {
                closeMenu();
            }
        });
    };

    const initHeaderDropdown = () => {
        const dropdownWrap = $(".header-services");
        const trigger = $(".header-services__trigger");
        const dropdown = $(".header-services__dropdown");

        if (!dropdownWrap || !trigger || !dropdown) return;

        const links = $$("a", dropdown);

        const openDropdown = () => {
            trigger.setAttribute("aria-expanded", "true");
        };

        const closeDropdown = () => {
            trigger.setAttribute("aria-expanded", "false");
        };

        dropdownWrap.addEventListener("mouseenter", openDropdown);
        dropdownWrap.addEventListener("mouseleave", closeDropdown);
        dropdownWrap.addEventListener("focusin", openDropdown);
        dropdownWrap.addEventListener("focusout", (event) => {
            if (!dropdownWrap.contains(event.relatedTarget)) {
                closeDropdown();
            }
        });

        trigger.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                openDropdown();
                links[0]?.focus();
            }

            if (event.key === "Escape") {
                closeDropdown();
                trigger.focus();
            }
        });

        links.forEach((link, index) => {
            link.addEventListener("keydown", (event) => {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    links[index + 1]?.focus() || links[0]?.focus();
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    links[index - 1]?.focus() || links[links.length - 1]?.focus();
                }

                if (event.key === "Escape") {
                    closeDropdown();
                    trigger.focus();
                }
            });
        });
    };

    const initSmoothAnchors = () => {
        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const hash = link.getAttribute("href");

                if (!hash || hash === "#") return;

                const target = document.querySelector(hash);

                if (!target) return;

                event.preventDefault();

                const headerHeight = $(SELECTORS.header)?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

                window.scrollTo({
                    top,
                    behavior: "smooth"
                });

                history.pushState(null, "", hash);
            });
        });
    };

    const initAccordions = () => {
        $$(SELECTORS.accordion).forEach((accordion) => {
            if (typeof accordion._modbathAccordionCleanup === "function") {
                accordion._modbathAccordionCleanup();
            }

            const singleMode = accordion.getAttribute("data-accordion") !== "multi";
            const items = $$("[data-accordion-item]", accordion);

            const closeItem = (item) => {
                const button = $("[data-accordion-button]", item);
                const panel = $("[data-accordion-panel]", item);

                item.classList.remove("is-open");
                button?.setAttribute("aria-expanded", "false");

                if (panel) {
                    panel.style.maxHeight = "0px";
                }
            };

            const openItem = (item) => {
                const button = $("[data-accordion-button]", item);
                const panel = $("[data-accordion-panel]", item);

                item.classList.add("is-open");
                button?.setAttribute("aria-expanded", "true");

                if (panel) {
                    panel.style.maxHeight = `${panel.scrollHeight}px`;
                }
            };

            items.forEach((item, index) => {
                const button = $("[data-accordion-button]", item);
                const panel = $("[data-accordion-panel]", item);

                if (!button || !panel) return;

                const panelId = panel.id || `accordion-panel-${Math.random().toString(36).slice(2)}`;

                panel.id = panelId;
                button.setAttribute("aria-controls", panelId);

                if (!button.id) {
                    button.id = `accordion-button-${Math.random().toString(36).slice(2)}`;
                }

                panel.setAttribute("role", "region");
                panel.setAttribute("aria-labelledby", button.id);

                if (item.classList.contains("is-open") || index === 0) {
                    openItem(item);
                } else {
                    closeItem(item);
                }
            });

            const onClick = (event) => {
                const button = event.target.closest("[data-accordion-button]");
                if (!button || !accordion.contains(button)) return;

                const item = button.closest("[data-accordion-item]");
                if (!item) return;

                const isOpen = item.classList.contains("is-open");

                if (singleMode) {
                    items.forEach((otherItem) => {
                        if (otherItem !== item) closeItem(otherItem);
                    });
                }

                if (isOpen) {
                    closeItem(item);
                } else {
                    openItem(item);
                }
            };

            const onResize = () => {
                items.forEach((item) => {
                    const panel = $("[data-accordion-panel]", item);

                    if (item.classList.contains("is-open") && panel) {
                        panel.style.maxHeight = `${panel.scrollHeight}px`;
                    }
                });
            };

            accordion.addEventListener("click", onClick);
            window.addEventListener("resize", onResize);

            onResize();

            accordion._modbathAccordionCleanup = () => {
                accordion.removeEventListener("click", onClick);
                window.removeEventListener("resize", onResize);
                delete accordion._modbathAccordionCleanup;
            };
        });
    };

    window.MODBATH_REINIT_ACCORDIONS = initAccordions;
    const initCookieConsent = () => {
        if (localStorage.getItem(COOKIE_KEY)) return;

        let consent = $(SELECTORS.cookieConsent);

        if (!consent) {
            consent = document.createElement("div");
            consent.className = "cookie-consent";
            consent.setAttribute("data-cookie-consent", "");
            consent.innerHTML = `
        <div class="cookie-consent__card" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <div class="cookie-consent__text">
            <strong>Cookie preferences</strong>
            <p>
              This site uses basic cookies to keep the experience working smoothly.
              Review our <a href="privacy-policy.html">Privacy Policy</a>,
              <a href="cookie-policy.html">Cookie Policy</a>, and
              <a href="terms-of-service.html">Terms of Service</a>.
            </p>
          </div>
          <div class="cookie-consent__actions">
            <button class="cookie-btn cookie-btn--cancel" type="button" data-cookie-cancel>Cancel</button>
            <button class="cookie-btn cookie-btn--accept" type="button" data-cookie-accept>Accept</button>
          </div>
        </div>
      `;

            document.body.appendChild(consent);
        }

        const acceptButton = $("[data-cookie-accept]", consent);
        const cancelButton = $("[data-cookie-cancel]", consent);

        const closeConsent = (value) => {
            localStorage.setItem(COOKIE_KEY, value);
            consent.classList.remove("is-visible");
        };

        window.requestAnimationFrame(() => {
            consent.classList.add("is-visible");
        });

        acceptButton?.addEventListener("click", () => closeConsent("accepted"));
        cancelButton?.addEventListener("click", () => closeConsent("cancelled"));
    };

    const buildFaqSchemaFromDom = () => {
        const schemaTarget = $("[data-faq-schema]");
        if (!schemaTarget) return;

        const faqRoot = schemaTarget.closest("section") || document;
        const items = $$("[data-accordion-item]", faqRoot);

        const questions = items
            .map((item) => {
                const question = $("[data-accordion-button]", item)?.textContent.trim();
                const answer = $("[data-accordion-panel]", item)?.textContent.trim();

                if (!question || !answer) return null;

                return {
                    "@type": "Question",
                    name: question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: answer
                    }
                };
            })
            .filter(Boolean);

        if (!questions.length) return;

        const existing = $("#faq-json-ld");
        if (existing) existing.remove();

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "faq-json-ld";
        script.textContent = JSON.stringify(
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: questions
            },
            null,
            2
        );

        document.head.appendChild(script);
    };

    const initDataTabs = () => {
        $$("[data-tabs]").forEach((tabs) => {
            const buttons = $$("[data-tab-button]", tabs);
            const panels = $$("[data-tab-panel]", tabs);

            const activate = (key) => {
                buttons.forEach((button) => {
                    const isActive = button.getAttribute("data-tab-button") === key;
                    button.classList.toggle("is-active", isActive);
                    button.setAttribute("aria-pressed", String(isActive));
                });

                panels.forEach((panel) => {
                    const isActive = panel.getAttribute("data-tab-panel") === key;
                    panel.classList.toggle("is-active", isActive);
                    panel.hidden = !isActive;
                });
            };

            buttons.forEach((button, index) => {
                const key = button.getAttribute("data-tab-button");

                if (!button.hasAttribute("type")) {
                    button.setAttribute("type", "button");
                }

                button.setAttribute("aria-pressed", index === 0 ? "true" : "false");

                button.addEventListener("click", () => activate(key));

                button.addEventListener("keydown", (event) => {
                    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;

                    event.preventDefault();

                    const direction = event.key === "ArrowRight" ? 1 : -1;
                    const nextIndex = (index + direction + buttons.length) % buttons.length;

                    buttons[nextIndex].focus();
                    buttons[nextIndex].click();
                });
            });

            const firstKey =
                buttons.find((button) => button.classList.contains("is-active"))?.getAttribute("data-tab-button") ||
                buttons[0]?.getAttribute("data-tab-button");

            if (firstKey) activate(firstKey);
        });
    };

    const initIconRendering = () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons({
                attrs: {
                    "stroke-width": 1.8
                }
            });
        }
    };

    const initExternalLinks = () => {
        $$('a[href^="http"]').forEach((link) => {
            const isSameHost = link.hostname === window.location.hostname;

            if (!isSameHost) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
            }
        });
    };

    const init = () => {
        renderCompanyData();
        renderNavigationLists();
        renderServiceLists();

        initStickyHeader();
        initMobileMenu();
        initHeaderDropdown();
        initSmoothAnchors();
        initAccordions();
        initDataTabs();
        initCookieConsent();
        initExternalLinks();

        setActiveHeaderLinks();

        window.setTimeout(() => {
            buildFaqSchemaFromDom();
            initIconRendering();
        }, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
