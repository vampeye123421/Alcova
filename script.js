(() => {
    "use strict";

    const config = window.ALCOVA_CONFIG || {};

    function getConfigValue(path, fallbackValue = "") {
        return path.split(".").reduce((obj, key) => (obj && key in obj ? obj[key] : fallbackValue), config);
    }

    function setAnchorHref(selector, value, shouldHideWhenMissing = false) {
        document.querySelectorAll(selector).forEach((link) => {
            if (value) {
                link.href = value;
            } else if (shouldHideWhenMissing) {
                link.classList.add("is-hidden");
            }
        });
    }

    function applyRuntimeConfig() {
        const menuUrl = getConfigValue("menu.brunchUrl");
        const instagramUrl = getConfigValue("contact.instagramUrl");
        const tiktokUrl = getConfigValue("contact.tiktokUrl");
        const mapEmbedUrl = getConfigValue("contact.mapEmbedUrl");

        setAnchorHref("[data-menu-link]", menuUrl, true);
        setAnchorHref("[data-instagram-link]", instagramUrl, true);
        setAnchorHref("[data-tiktok-link]", tiktokUrl, true);

        const mapIframe = document.querySelector("[data-map-embed]");
        if (mapIframe && mapEmbedUrl) {
            mapIframe.src = mapEmbedUrl;
        }
    }

    function initCookieBanner() {
        const cookieFeatureEnabled = Boolean(getConfigValue("features.cookieBanner", true));
        if (!cookieFeatureEnabled) {
            return;
        }

        const cookieBanner = document.getElementById("cookie-banner");
        const acceptCookiesBtn = document.getElementById("accept-cookies");
        if (!cookieBanner || !acceptCookiesBtn) {
            return;
        }

        if (!localStorage.getItem("cookiesAccepted")) {
            window.setTimeout(() => {
                cookieBanner.classList.add("show");
            }, 700);
        }

        acceptCookiesBtn.addEventListener("click", () => {
            localStorage.setItem("cookiesAccepted", "true");
            cookieBanner.classList.remove("show");
        });
    }

    function initGoogleTranslate() {
        const translateFeatureEnabled = Boolean(getConfigValue("features.googleTranslate", true));
        const translateContainer = document.getElementById("google_translate_element");
        const languageSelector = document.querySelector(".language-selector");

        if (!translateFeatureEnabled || !translateContainer) {
            if (languageSelector) {
                languageSelector.classList.add("is-hidden");
            }
            return;
        }

        const pageLanguage = getConfigValue("i18n.defaultLanguage", "it");
        const includedLanguages = getConfigValue("i18n.translateLanguages", ["en", "fr", "de", "es"]).join(",");

        window.googleTranslateElementInit = () => {
            if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
                return;
            }

            // Google Translate global is loaded from the official script.
            // eslint-disable-next-line no-undef
            new google.translate.TranslateElement(
                {
                    pageLanguage,
                    includedLanguages,
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                },
                "google_translate_element"
            );
        };

        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        script.defer = true;
        script.referrerPolicy = "no-referrer-when-downgrade";
        document.body.appendChild(script);
    }

    function initDeferredElfsight() {
        const widget = document.querySelector("[data-elfsight-widget]");
        if (!widget) {
            return;
        }

        const loadButton = document.querySelector("[data-load-reviews]");
        const isMobileLike =
            window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(pointer: coarse)").matches;
        let hasLoaded = false;

        const loadWidgetScript = () => {
            if (hasLoaded) {
                return;
            }

            hasLoaded = true;
            widget.hidden = false;

            if (loadButton) {
                const loader = loadButton.closest(".reviews-loader");
                if (loader) {
                    loader.classList.add("is-hidden");
                } else {
                    loadButton.classList.add("is-hidden");
                }
            }

            if (document.querySelector("script[data-elfsight-platform]")) {
                return;
            }

            const script = document.createElement("script");
            script.src = "https://elfsightcdn.com/platform.js";
            script.async = true;
            script.defer = true;
            script.setAttribute("data-elfsight-platform", "true");
            document.head.appendChild(script);
        };

        if (loadButton) {
            loadButton.addEventListener(
                "click",
                () => {
                    loadButton.disabled = true;
                    loadButton.textContent = "Caricamento recensioni...";
                    loadWidgetScript();
                },
                { once: true }
            );
        }

        if (isMobileLike) {
            return;
        }

        if ("IntersectionObserver" in window) {
            const observeTarget = widget.closest("#recensioni") || widget.parentElement || widget;
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        observer.disconnect();
                        loadWidgetScript();
                    }
                },
                { rootMargin: "120px 0px", threshold: 0.1 }
            );

            observer.observe(observeTarget);
            return;
        }

        loadWidgetScript();
    }

    function initMobileMenu() {
        const hamburger = document.querySelector(".hamburger");
        const navLinks = document.querySelector(".nav-links");
        if (!hamburger || !navLinks) {
            return;
        }

        let isMenuOpen = false;

        const closeMenu = () => {
            isMenuOpen = false;
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            navLinks.classList.remove("nav-open");
            document.body.classList.remove("menu-open");
        };

        const openMenu = () => {
            isMenuOpen = true;
            hamburger.classList.add("active");
            hamburger.setAttribute("aria-expanded", "true");
            navLinks.classList.add("nav-open");
            document.body.classList.add("menu-open");
        };

        hamburger.addEventListener("click", () => {
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {
            const clickedOutside = !navLinks.contains(event.target) && !hamburger.contains(event.target);
            if (isMenuOpen && clickedOutside) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isMenuOpen) {
                closeMenu();
                hamburger.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll("a[href^='#']").forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const href = anchor.getAttribute("href");
                if (!href || href === "#") {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    function initNavbarState() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) {
            return;
        }

        let lastScroll = 0;
        let rafPending = false;

        const updateNavbar = () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }

            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.classList.add("nav-hidden");
            } else {
                navbar.classList.remove("nav-hidden");
            }

            lastScroll = currentScroll;
            rafPending = false;
        };

        updateNavbar();

        window.addEventListener(
            "scroll",
            () => {
                if (rafPending) {
                    return;
                }

                rafPending = true;
                window.requestAnimationFrame(updateNavbar);
            },
            { passive: true }
        );
    }

    function initHeroAtmosphere() {
        const hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }

        if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            window.matchMedia("(pointer: coarse)").matches
        ) {
            return;
        }

        let rafId = 0;

        const updatePointer = (clientX, clientY) => {
            const bounds = hero.getBoundingClientRect();
            const x = ((clientX - bounds.left) / bounds.width) * 100;
            const y = ((clientY - bounds.top) / bounds.height) * 100;
            hero.style.setProperty("--pointer-x", `${Math.max(0, Math.min(100, x))}%`);
            hero.style.setProperty("--pointer-y", `${Math.max(0, Math.min(100, y))}%`);
            rafId = 0;
        };

        hero.addEventListener("pointermove", (event) => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }

            rafId = window.requestAnimationFrame(() => updatePointer(event.clientX, event.clientY));
        });

        hero.addEventListener("pointerleave", () => {
            hero.style.setProperty("--pointer-x", "72%");
            hero.style.setProperty("--pointer-y", "28%");
        });
    }

    function initActiveSectionLinks() {
        const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
        const sections = Array.from(document.querySelectorAll("header[id], main section[id]"));
        if (!navLinks.length || !sections.length) {
            return;
        }

        const setActiveLink = (id) => {
            navLinks.forEach((link) => {
                const href = String(link.getAttribute("href") || "").replace(/^#/, "");
                link.classList.toggle("active", href === id);
            });
        };

        setActiveLink("home");

        if (!("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((firstEntry, secondEntry) => secondEntry.intersectionRatio - firstEntry.intersectionRatio)[0];

                if (!visibleEntry) {
                    return;
                }

                const id = visibleEntry.target.getAttribute("id");
                if (id) {
                    setActiveLink(id);
                }
            },
            {
                rootMargin: "-35% 0px -45% 0px",
                threshold: [0.2, 0.4, 0.6]
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    const GALLERY_MANIFEST_PATH = "data/gallery-manifest.json";
    const GALLERY_LAYOUT_CYCLE = [
        "hero",
        "portrait",
        "vertical",
        "tall",
        "landscape",
        "square",
        "wide",
        "vertical",
        "landscape",
        "square",
        "wide",
        "tall",
        "portrait",
        "square"
    ];

    function hashString(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return Math.abs(hash >>> 0);
    }

    function normalizeGalleryText(value, fallback = "Atmosfera Alcova") {
        const cleaned = String(value || "")
            .replace(/\s+/g, " ")
            .trim();
        return cleaned || fallback;
    }

    function getOrientationHint(fileName) {
        const normalized = String(fileName || "").toLowerCase();
        if (!normalized) {
            return "neutral";
        }

        if (/(portrait|vertical|tania|team|staff|wa\d+|persona|people)/.test(normalized)) {
            return "portrait";
        }

        if (/(lounge|drink|food|menu|bar|cocktail|2024|interno|atmosfera|panorama)/.test(normalized)) {
            return "landscape";
        }

        return "neutral";
    }

    function getGalleryVariant(entry, index, previousVariant) {
        if (index === 0) {
            return "hero";
        }

        const fileName = String(entry && entry.filename ? entry.filename : "");
        const hash = hashString(fileName || `item-${index}`);
        const cycleIndex = hash % GALLERY_LAYOUT_CYCLE.length;
        let variant = GALLERY_LAYOUT_CYCLE[cycleIndex];
        const orientationHint = getOrientationHint(fileName);

        if (orientationHint === "portrait" && ["wide", "landscape"].includes(variant)) {
            const portraitPool = ["portrait", "vertical", "tall", "square"];
            variant = portraitPool[hash % portraitPool.length];
        } else if (orientationHint === "landscape" && ["portrait", "vertical", "tall"].includes(variant)) {
            const landscapePool = ["wide", "landscape", "square"];
            variant = landscapePool[hash % landscapePool.length];
        }

        if (variant === previousVariant) {
            const fallbackPool =
                orientationHint === "portrait"
                    ? ["portrait", "vertical", "square"]
                    : orientationHint === "landscape"
                      ? ["landscape", "wide", "square"]
                      : ["square", "landscape", "vertical", "wide"];
            variant = fallbackPool[(hash + 1) % fallbackPool.length];
        }

        return variant;
    }

    function buildGalleryItem(entry, index, variant) {
        const imageSrc = String(entry && entry.src ? entry.src : "").trim();
        if (!imageSrc || !imageSrc.startsWith("images/")) {
            return null;
        }

        const caption = normalizeGalleryText(entry && entry.caption ? entry.caption : "", "Atmosfera Alcova");
        const altText = normalizeGalleryText(entry && entry.alt ? entry.alt : caption, caption);

        const figure = document.createElement("figure");
        figure.className = `gallery-item gallery-item--${variant} reveal`;
        figure.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 60, 240)}ms`);

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "gallery-trigger";
        trigger.setAttribute("data-gallery-trigger", "");
        trigger.setAttribute("aria-label", `Apri immagine: ${caption}`);

        const image = document.createElement("img");
        image.src = imageSrc;
        image.alt = altText;
        image.loading = index < 2 ? "eager" : "lazy";
        image.decoding = "async";
        if (index < 2) {
            image.fetchPriority = "high";
        }

        const zoomLabel = document.createElement("span");
        zoomLabel.className = "gallery-zoom";
        zoomLabel.textContent = "Apri";
        zoomLabel.setAttribute("aria-hidden", "true");

        const captionElement = document.createElement("figcaption");
        captionElement.textContent = caption;

        trigger.appendChild(image);
        trigger.appendChild(zoomLabel);
        figure.appendChild(trigger);
        figure.appendChild(captionElement);

        return figure;
    }

    async function initGalleryFromManifest() {
        const galleryGrid = document.querySelector("[data-gallery-grid]");
        if (!galleryGrid) {
            return;
        }

        const galleryEmpty = document.querySelector("[data-gallery-empty]");
        galleryGrid.innerHTML = "";
        if (galleryEmpty) {
            galleryEmpty.classList.add("is-hidden");
        }

        try {
            const response = await fetch(GALLERY_MANIFEST_PATH, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Manifest request failed (${response.status})`);
            }

            const manifest = await response.json();
            const images = Array.isArray(manifest && manifest.images) ? manifest.images : [];
            if (!images.length) {
                if (galleryEmpty) {
                    galleryEmpty.classList.remove("is-hidden");
                }
                return;
            }

            const fragment = document.createDocumentFragment();
            let previousVariant = "";

            images.forEach((entry, index) => {
                const variant = getGalleryVariant(entry, index, previousVariant);
                const item = buildGalleryItem(entry, index, variant);
                if (!item) {
                    return;
                }

                previousVariant = variant;
                fragment.appendChild(item);
            });

            if (!fragment.childNodes.length) {
                if (galleryEmpty) {
                    galleryEmpty.classList.remove("is-hidden");
                }
                return;
            }

            galleryGrid.appendChild(fragment);
        } catch (error) {
            if (galleryEmpty) {
                galleryEmpty.classList.remove("is-hidden");
            }
            console.error("Impossibile caricare la galleria dal manifest.", error);
        }
    }

    function initGalleryLightbox() {
        const lightbox = document.querySelector("[data-lightbox]");
        const triggers = Array.from(document.querySelectorAll("[data-gallery-trigger]"));
        if (!lightbox || !triggers.length) {
            return;
        }

        const imageElement = lightbox.querySelector("[data-lightbox-image]");
        const captionElement = lightbox.querySelector("[data-lightbox-caption]");
        const closeControls = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));
        const closeButton = lightbox.querySelector(".lightbox-close");
        let lastTrigger = null;

        if (!imageElement || !captionElement || !closeButton) {
            return;
        }

        const closeLightbox = () => {
            if (lightbox.hidden) {
                return;
            }

            lightbox.hidden = true;
            document.body.classList.remove("lightbox-open");
            imageElement.src = "";
            imageElement.alt = "";
            captionElement.textContent = "";

            if (lastTrigger) {
                lastTrigger.focus();
            }
        };

        const openLightbox = (trigger) => {
            const figure = trigger.closest(".gallery-item");
            const sourceImage = figure ? figure.querySelector("img") : null;
            const sourceCaption = figure ? figure.querySelector("figcaption") : null;

            if (!sourceImage) {
                return;
            }

            lastTrigger = trigger;
            imageElement.src = sourceImage.currentSrc || sourceImage.src;
            imageElement.alt = sourceImage.alt;
            captionElement.textContent = sourceCaption ? sourceCaption.textContent.trim() : sourceImage.alt;
            lightbox.hidden = false;
            document.body.classList.add("lightbox-open");
            closeButton.focus();
        };

        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => openLightbox(trigger));
        });

        closeControls.forEach((control) => {
            control.addEventListener("click", closeLightbox);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !lightbox.hidden) {
                closeLightbox();
            }
        });
    }

    function setFormStatus(form, message, isError = false) {
        const statusElement = form.querySelector("[data-form-status]");
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.classList.toggle("error", isError);
    }

    function initBookingForm() {
        const bookingForm = document.querySelector(".booking-form");
        if (!bookingForm) {
            return;
        }

        const bookingDate = bookingForm.querySelector("input[name='date']");
        if (bookingDate) {
            const now = new Date();
            const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
            bookingDate.min = localToday;
        }

        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(bookingForm);
            const name = String(formData.get("name") || "").trim();
            const date = String(formData.get("date") || "").trim();
            const time = String(formData.get("time") || "").trim();
            const people = String(formData.get("people") || "").trim();
            const notes = String(formData.get("notes") || "").trim();

            if (!name || !date || !time || !people) {
                setFormStatus(bookingForm, "Compila tutti i campi obbligatori prima di continuare.", true);
                return;
            }

            const locale = getConfigValue("site.locale", "it-IT");
            const parsedDate = new Date(date);
            const formattedDate = Number.isNaN(parsedDate.getTime())
                ? date
                : new Intl.DateTimeFormat(locale, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                  }).format(parsedDate);

            const phoneNumber = String(getConfigValue("contact.whatsappNumber", "")).replace(/\D+/g, "");
            if (!phoneNumber) {
                setFormStatus(bookingForm, "Configurazione WhatsApp non valida. Aggiorna config.js.", true);
                return;
            }

            const message =
                "Salve, vorrei prenotare un tavolo\n\n" +
                `Nome: ${name}\n` +
                `Data: ${formattedDate}\n` +
                `Ora: ${time}\n` +
                `Persone: ${people}` +
                (notes ? `\nNote: ${notes}` : "");

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            setFormStatus(bookingForm, "Richiesta pronta: WhatsApp si apre in una nuova scheda.");
            bookingForm.reset();
        });
    }

    function initRevealAnimations() {
        const revealElements = Array.from(
            new Set(
                Array.from(
                    document.querySelectorAll(
                        ".reveal, .section-heading, .menu-card, .gallery-item, .about-content > div, .booking-shell, .contact-info, .contact-stack"
                    )
                )
            )
        );

        if (!revealElements.length) {
            return;
        }

        const isMobileLike =
            window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(pointer: coarse)").matches;

        if (isMobileLike) {
            revealElements.forEach((element) => {
                element.classList.add("reveal");
                element.classList.add("visible");
            });
            return;
        }

        revealElements.forEach((element, index) => {
            element.classList.add("reveal");
            element.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 60, 240)}ms`);
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            revealElements.forEach((element) => element.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        revealElements.forEach((element) => {
            const { top } = element.getBoundingClientRect();
            if (top < window.innerHeight * 0.92) {
                element.classList.add("visible");
            } else {
                observer.observe(element);
            }
        });
    }

    function initSingleLineTitleFit() {
        const titles = Array.from(document.querySelectorAll(".single-line-title"));
        if (!titles.length) {
            return;
        }

        const TRACKING_STEP_PX = 0.15;
        const MIN_TRACKING_PX = -1.2;
        const getMinReadableSize = (title) => {
            const isSmallViewport = window.innerWidth <= 520;
            if (title.tagName === "H1") {
                return isSmallViewport ? 18 : 22;
            }
            if (title.tagName === "H2") {
                return isSmallViewport ? 14 : 16;
            }
            return isSmallViewport ? 13 : 15;
        };

        const FINE_TUNE_STEP_PX = 0.25;

        const fitTitles = () => {
            titles.forEach((title) => {
                title.style.removeProperty("font-size");
                title.style.removeProperty("letter-spacing");
                title.style.removeProperty("line-height");
                title.style.whiteSpace = "nowrap";

                const parentWidth = title.parentElement ? title.parentElement.getBoundingClientRect().width : 0;
                const availableWidth = parentWidth || title.getBoundingClientRect().width;
                if (!availableWidth) {
                    return;
                }

                const computedStyles = window.getComputedStyle(title);
                const computedSize = parseFloat(computedStyles.fontSize);
                if (!Number.isFinite(computedSize)) {
                    return;
                }

                const computedTracking = parseFloat(computedStyles.letterSpacing);
                let nextTracking = Number.isFinite(computedTracking) ? computedTracking : 0;

                if (title.scrollWidth <= availableWidth + 1) {
                    return;
                }

                const minReadableSize = getMinReadableSize(title);
                const proportionalSize = (computedSize * availableWidth) / title.scrollWidth;
                let nextSize = Math.max(minReadableSize, proportionalSize);

                title.style.fontSize = `${nextSize}px`;

                while (title.scrollWidth > availableWidth + 1 && nextSize > minReadableSize) {
                    nextSize = Math.max(minReadableSize, nextSize - FINE_TUNE_STEP_PX);
                    title.style.fontSize = `${nextSize}px`;
                }

                while (title.scrollWidth > availableWidth + 1 && nextTracking > MIN_TRACKING_PX) {
                    nextTracking -= TRACKING_STEP_PX;
                    title.style.letterSpacing = `${nextTracking}px`;
                }

                const stillOverflowing = title.scrollWidth > availableWidth + 1;
                if (stillOverflowing && window.innerWidth <= 420) {
                    // Graceful fallback only when a single line is no longer sustainable.
                    title.style.whiteSpace = "normal";
                    title.style.lineHeight = "1.1";
                    title.style.letterSpacing = "normal";
                    title.style.textWrap = "balance";
                }
            });
        };

        fitTitles();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(fitTitles);
        }

        let resizeRaf = 0;
        window.addEventListener("resize", () => {
            if (resizeRaf) {
                window.cancelAnimationFrame(resizeRaf);
            }

            resizeRaf = window.requestAnimationFrame(() => {
                fitTitles();
                resizeRaf = 0;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.classList.add("js-enabled");
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                document.body.classList.add("page-ready");
            });
        });
        applyRuntimeConfig();
        initCookieBanner();
        initGoogleTranslate();
        initDeferredElfsight();
        initMobileMenu();
        initSmoothScroll();
        initNavbarState();
        initHeroAtmosphere();
        initActiveSectionLinks();
        initBookingForm();

        const runTitleFit = () => {
            initSingleLineTitleFit();
        };

        initGalleryFromManifest()
            .catch((error) => {
                console.error("Errore durante l'inizializzazione della galleria.", error);
            })
            .finally(() => {
                initGalleryLightbox();
                initRevealAnimations();

                const isMobileLike =
                    window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(pointer: coarse)").matches;
                if (isMobileLike) {
                    window.addEventListener(
                        "load",
                        () => {
                            const scheduleIdle =
                                window.requestIdleCallback ||
                                ((callback) => {
                                    window.setTimeout(callback, 900);
                                });
                            scheduleIdle(runTitleFit);
                        },
                        { once: true }
                    );
                } else {
                    runTitleFit();
                }
            });
    });
})();
