(function () {
    "use strict";

    const $ = (selector, scope = document) => scope.querySelector(selector);

    const renderIcons = () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons({
                attrs: {
                    "stroke-width": 1.8
                }
            });
        }
    };

    const initServicesSwiper = () => {
        const swiperElement = $("[data-services-swiper]");

        if (!swiperElement || typeof window.Swiper === "undefined") {
            return;
        }

        const swiper = new window.Swiper(swiperElement, {
            loop: true,
            speed: 650,
            spaceBetween: 18,
            grabCursor: true,
            watchOverflow: true,

            slidesPerView: 1,
            centeredSlides: false,

            navigation: {
                nextEl: ".services-swiper-next",
                prevEl: ".services-swiper-prev"
            },

            keyboard: {
                enabled: true,
                onlyInViewport: true
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 18
                },
                700: {
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                1100: {
                    slidesPerView: 3,
                    spaceBetween: 24
                }
            },

            on: {
                init() {
                    renderIcons();
                },
                slideChangeTransitionEnd() {
                    renderIcons();
                }
            }
        });

        const prevButton = $(".services-swiper-prev");
        const nextButton = $(".services-swiper-next");

        [prevButton, nextButton].forEach((button) => {
            if (!button) return;

            button.addEventListener("click", () => {
                window.setTimeout(renderIcons, 0);
            });
        });

        return swiper;
    };

    const initServiceCardKeyboard = () => {
        const cards = document.querySelectorAll(".service-slide__card");

        cards.forEach((card) => {
            card.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;

                event.preventDefault();
                card.click();
            });
        });
    };

    const initGoalCards = () => {
        const cards = document.querySelectorAll(".goal-card, .project-type-card");

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

    const initServicesPage = () => {
        initServicesSwiper();
        initServiceCardKeyboard();
        initGoalCards();

        window.setTimeout(renderIcons, 0);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initServicesPage);
    } else {
        initServicesPage();
    }
})();