(() => {
  const root = document.documentElement;
  const body = document.body;
  const pageLoader = document.getElementById("pageLoader");
  const button = document.getElementById("bookButton");
  const menuButton = document.getElementById("menuButton");
  const stayButton = document.getElementById("stayButton");
  const hamburgerButton = document.getElementById("hamburgerButton");
  const siteMenu = document.getElementById("siteMenu");
  const menuBackdrop = document.getElementById("menuBackdrop");
  const menuLinks = document.querySelectorAll(".site-menu__link");
  const main = document.querySelector("main");
  const sections = main ? Array.from(main.querySelectorAll(":scope > section")) : [];
  const loaderStart = performance.now();
  const minLoaderDuration = 2500;
  const loaderLoopMode = false;
  const loaderLoopVisibleMs = 2500;
  const loaderLoopHiddenMs = 900;
  let isSectionScrolling = false;
  let wheelUnlockTimer = null;
  let sectionScrollFrame = null;
  let currentSectionTargetIndex = -1;
  const enableDesktopSectionPaging = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const showLoader = () => {
    root.classList.remove("is-ready");
    body.classList.add("is-loading");
    if (pageLoader) {
      pageLoader.setAttribute("aria-hidden", "false");
    }
  };

  if (pageLoader) {
    showLoader();
  }

  const finishLoader = () => {
    root.classList.add("is-ready");
    body.classList.remove("is-loading");
    if (pageLoader) {
      pageLoader.setAttribute("aria-hidden", "true");
      if (!loaderLoopMode) {
        window.setTimeout(() => {
          pageLoader.remove();
        }, 500);
      }
    }
  };

  window.addEventListener("load", () => {
    if (loaderLoopMode && pageLoader) {
      const runLoop = () => {
        showLoader();
        window.setTimeout(() => {
          finishLoader();
          window.setTimeout(runLoop, loaderLoopHiddenMs);
        }, loaderLoopVisibleMs);
      };

      runLoop();
      return;
    }

    const elapsed = performance.now() - loaderStart;
    const delay = Math.max(0, minLoaderDuration - elapsed);
    window.setTimeout(finishLoader, delay);
  });

  window.addEventListener("pageshow", () => {
    if (!pageLoader) {
      return;
    }

    showLoader();
    window.setTimeout(finishLoader, minLoaderDuration);
  });

  const openExternal = (element, dataKey) => {
    if (!element) {
      return;
    }

    element.addEventListener("click", () => {
      const url = element.dataset[dataKey];
      if (!url) {
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  openExternal(button, "bookingUrl");
  openExternal(menuButton, "menuUrl");
  openExternal(stayButton, "stayUrl");

  const getScrollableAncestor = (target) => {
    let current = target instanceof Element ? target : null;

    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const canScrollY =
        /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 2;
      const canScrollX =
        /(auto|scroll)/.test(style.overflowX) && current.scrollWidth > current.clientWidth + 2;

      if (canScrollY || canScrollX) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  };

  const canElementConsumeScroll = (element, deltaX, deltaY) => {
    if (!element) {
      return false;
    }

    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      const movingDown = deltaY > 0;
      const maxScrollTop = element.scrollHeight - element.clientHeight;

      if (maxScrollTop > 0) {
        if (movingDown && element.scrollTop < maxScrollTop - 2) {
          return true;
        }

        if (!movingDown && element.scrollTop > 2) {
          return true;
        }
      }
    } else {
      const movingRight = deltaX > 0;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;

      if (maxScrollLeft > 0) {
        if (movingRight && element.scrollLeft < maxScrollLeft - 2) {
          return true;
        }

        if (!movingRight && element.scrollLeft > 2) {
          return true;
        }
      }
    }

    return false;
  };

  const getCurrentSectionIndex = () => {
    if (!sections.length) {
      return -1;
    }

    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const sectionCenter = section.offsetTop + section.offsetHeight / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length) {
      return;
    }

    const target = sections[index];

    if (!target) {
      return;
    }

    isSectionScrolling = true;
    body.classList.add("is-section-scrolling");
    window.clearTimeout(wheelUnlockTimer);
    if (sectionScrollFrame !== null) {
      window.cancelAnimationFrame(sectionScrollFrame);
      sectionScrollFrame = null;
    }
    currentSectionTargetIndex = index;
    const startY = window.scrollY;
    const targetY = target.offsetTop;
    const distance = targetY - startY;
    const duration = 580;
    const startTime = performance.now();

    const easeInOutCubic = (t) => {
      if (t < 0.5) {
        return 4 * t * t * t;
      }

      return 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateScroll = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, Math.round(startY + distance * eased));

      if (progress < 1) {
        sectionScrollFrame = window.requestAnimationFrame(animateScroll);
        return;
      }

      window.scrollTo(0, targetY);
      sectionScrollFrame = null;
      wheelUnlockTimer = window.setTimeout(() => {
        isSectionScrolling = false;
        body.classList.remove("is-section-scrolling");
      }, 20);
    };

    sectionScrollFrame = window.requestAnimationFrame(animateScroll);
  };

  const stepSection = (direction) => {
    if (sections.length < 2 || body.classList.contains("menu-open")) {
      return;
    }

    const currentIndex =
      isSectionScrolling && currentSectionTargetIndex !== -1
        ? currentSectionTargetIndex
        : getCurrentSectionIndex();

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));

    if (nextIndex === currentIndex) {
      return;
    }

    scrollToSection(nextIndex);
  };

  if (sections.length > 1 && enableDesktopSectionPaging) {
    window.addEventListener(
      "wheel",
      (event) => {
        const scrollableAncestor = getScrollableAncestor(event.target);

        if (canElementConsumeScroll(scrollableAncestor, event.deltaX, event.deltaY)) {
          return;
        }

        if (Math.abs(event.deltaY) < 18 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
          return;
        }

        event.preventDefault();
        stepSection(event.deltaY > 0 ? 1 : -1);
      },
      { passive: false }
    );
  }

  if (!hamburgerButton || !siteMenu || !menuBackdrop) {
    return;
  }

  const setMenuState = (isOpen) => {
    hamburgerButton.classList.toggle("is-open", isOpen);
    siteMenu.classList.toggle("is-open", isOpen);
    menuBackdrop.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    hamburgerButton.setAttribute("aria-expanded", String(isOpen));
    hamburgerButton.setAttribute("aria-label", isOpen ? "Chiudi menu" : "Apri menu");
    siteMenu.setAttribute("aria-hidden", String(!isOpen));
  };

  hamburgerButton.addEventListener("click", () => {
    const isOpen = hamburgerButton.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  menuBackdrop.addEventListener("click", () => {
    setMenuState(false);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
})();
