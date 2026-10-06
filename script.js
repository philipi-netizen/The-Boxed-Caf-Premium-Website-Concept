/* =========================================================
   THE BOXED CAFÉ
   Premium Interaction System
   Vanilla JavaScript
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     01. CONFIGURATION
     ========================================================= */

  const CONFIG = {
    whatsappNumber: "265995405577",
    scrollThreshold: 24,
    scrollDelta: 4,
    parallaxStrength: 0.035,
    mobileBreakpoint: 767
  };

  /* =========================================================
     02. DOM REFERENCES
     Only selectors from the shared HTML contract are used.
     ========================================================= */

  const header = document.querySelector("#site-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const hero = document.querySelector(".hero");
  const heroVideo = document.querySelector(".hero-video");
  const revealElements = document.querySelectorAll(".reveal");
  const staggerGroups = document.querySelectorAll(".stagger-group");
  const staggerItems = document.querySelectorAll(".stagger-item");
  const whatsappFloat = document.querySelector(".whatsapp-float");
  const sections = document.querySelectorAll(".section");

  /* =========================================================
     03. STATE
     ========================================================= */

  const state = {
    lastScrollY: window.scrollY,
    ticking: false,
    menuOpen: false,
    heroParallaxFrame: null,
    heroParallaxY: 0
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* =========================================================
     04. PRELOADER
     ---------------------------------------------------------
     The HTML/CSS already provide the preloader. We intentionally
     do not add new selectors or classes here.
     ========================================================= */

  const finishLoading = () => {
    const preloader = document.querySelector(".preloader");

    if (!preloader) {
      return;
    }

    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    preloader.style.pointerEvents = "none";

    window.setTimeout(() => {
      preloader.remove();
    }, 800);
  };

  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, 250);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(finishLoading, 250);
    }, { once: true });
  }

  /* =========================================================
     05. NAVIGATION / SCROLL DIRECTION
     ========================================================= */

  const updateHeader = () => {
    if (!header) {
      return;
    }

    const currentScrollY = window.scrollY;
    const difference = currentScrollY - state.lastScrollY;

    if (currentScrollY > CONFIG.scrollThreshold) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
      header.classList.remove("is-hidden");
    }

    if (
      currentScrollY > CONFIG.scrollThreshold &&
      Math.abs(difference) >= CONFIG.scrollDelta
    ) {
      if (difference > 0) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }

      state.lastScrollY = currentScrollY;
    }

    if (currentScrollY <= CONFIG.scrollThreshold) {
      state.lastScrollY = currentScrollY;
    }

    state.ticking = false;
  };

  const requestHeaderUpdate = () => {
    if (state.ticking) {
      return;
    }

    state.ticking = true;

    window.requestAnimationFrame(updateHeader);
  };

  window.addEventListener("scroll", requestHeaderUpdate, {
    passive: true
  });

  /* =========================================================
     06. MOBILE MENU
     ========================================================= */

  const setMenuState = (open, restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) {
      return;
    }

    state.menuOpen = open;

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );

    mobileMenu.setAttribute("aria-hidden", String(!open));

    document.body.style.overflow = open ? "hidden" : "";

    if (!open && restoreFocus) {
      window.requestAnimationFrame(() => {
        menuToggle.focus();
      });
    }
  };

  const openMenu = () => {
    setMenuState(true);
  };

  const closeMenu = (restoreFocus = false) => {
    setMenuState(false, restoreFocus);
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (state.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  /*
   * Close the mobile menu when clicking outside its visible
   * navigation area.
   */
  document.addEventListener("click", (event) => {
    if (!state.menuOpen || !mobileMenu || !menuToggle) {
      return;
    }

    const target = event.target;

    if (
      !mobileMenu.contains(target) &&
      !menuToggle.contains(target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.menuOpen) {
      closeMenu(true);
    }
  });

  /* =========================================================
     07. SMOOTH ANCHOR SCROLLING
     ========================================================= */

  const getHeaderOffset = () => {
    if (!header) {
      return 0;
    }

    return header.getBoundingClientRect().height + 16;
  };

  const scrollToTarget = (target) => {
    if (!target) {
      return;
    }

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderOffset();

    if (prefersReducedMotion.matches) {
      window.scrollTo(0, targetTop);
      return;
    }

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });
  };

  const handleAnchorClick = (event) => {
    const link = event.currentTarget;
    const href = link.getAttribute("href");

    if (!href || href === "#" || !href.startsWith("#")) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    closeMenu();

    scrollToTarget(target);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", handleAnchorClick);
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", handleAnchorClick);
  });

  /* =========================================================
     08. ACTIVE NAVIGATION
     ========================================================= */

  const navigationTargets = Array.from(navLinks)
    .map((link) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return null;
      }

      const section = document.querySelector(href);

      if (!section) {
        return null;
      }

      return {
        link,
        section
      };
    })
    .filter(Boolean);

  const setActiveNavigation = (activeSection) => {
    navigationTargets.forEach(({ link, section }) => {
      const isActive = section === activeSection;

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (navigationTargets.length) {
    const navigationObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visibleEntries.length) {
          return;
        }

        setActiveNavigation(visibleEntries[0].target);
      },
      {
        root: null,
        rootMargin: `-${getHeaderOffset()}px 0px -45% 0px`,
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    );

    navigationTargets.forEach(({ section }) => {
      navigationObserver.observe(section);
    });
  }

  /* =========================================================
     09. SECTION REVEALS
     ========================================================= */

  if (prefersReducedMotion.matches) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    staggerItems.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

    staggerItems.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /*
   * Keep stagger groups referenced so the interaction system
   * explicitly understands them without introducing selectors.
   */
  staggerGroups.forEach((group) => {
    group.setAttribute(
      "data-stagger-ready",
      "true"
    );
  });

  /* =========================================================
     10. HERO VIDEO
     ========================================================= */

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;

    const attemptPlayback = () => {
      const playback = heroVideo.play();

      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          /*
           * Autoplay can be blocked by the browser.
           * The poster image remains available as fallback.
           */
        });
      }
    };

    if (heroVideo.readyState >= 2) {
      attemptPlayback();
    } else {
      heroVideo.addEventListener(
        "canplay",
        attemptPlayback,
        { once: true }
      );
    }

    heroVideo.addEventListener("error", () => {
      heroVideo.pause();
    });
  }

  /* =========================================================
     11. SUBTLE HERO PARALLAX
     ========================================================= */

  const canUseParallax = () => {
    return (
      Boolean(hero) &&
      Boolean(heroVideo) &&
      window.innerWidth > CONFIG.mobileBreakpoint &&
      !prefersReducedMotion.matches
    );
  };

  const updateHeroParallax = () => {
    state.heroParallaxFrame = null;

    if (!canUseParallax()) {
      if (heroVideo) {
        heroVideo.style.transform = "";
      }

      return;
    }

    const rect = hero.getBoundingClientRect();

    /*
     * Only calculate while the hero is close to the viewport.
     */
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight
    ) {
      return;
    }

    const viewportCenter = window.innerHeight / 2;
    const heroCenter = rect.top + rect.height / 2;

    const distance =
      (heroCenter - viewportCenter) /
      window.innerHeight;

    state.heroParallaxY =
      distance * CONFIG.parallaxStrength * 100;

    heroVideo.style.transform =
      `translate3d(0, ${state.heroParallaxY}px, 0)`;
  };

  const requestHeroParallax = () => {
    if (state.heroParallaxFrame !== null) {
      return;
    }

    state.heroParallaxFrame =
      window.requestAnimationFrame(updateHeroParallax);
  };

  window.addEventListener(
    "scroll",
    requestHeroParallax,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestHeroParallax,
    { passive: true }
  );

  /*
   * Re-evaluate if the user changes their reduced-motion
   * preference while the page is open.
   */
  if (
    typeof prefersReducedMotion.addEventListener ===
    "function"
  ) {
    prefersReducedMotion.addEventListener(
      "change",
      () => {
        if (prefersReducedMotion.matches && heroVideo) {
          heroVideo.style.transform = "";
        }
      }
    );
  }

  /* =========================================================
     12. WHATSAPP SYSTEM
     ========================================================= */

  const createWhatsAppUrl = (message) => {
    const encodedMessage =
      encodeURIComponent(message);

    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
  };

  const generalWhatsAppMessage =
    "Hi, I'd like to enquire about The Boxed Café.";

  /*
   * Only configure the floating WhatsApp button here.
   * Existing contextual WhatsApp links are intentionally
   * preserved.
   */
  if (whatsappFloat) {
    const existingHref =
      whatsappFloat.getAttribute("href");

    if (
      !existingHref ||
      existingHref === "#" ||
      !existingHref.includes("wa.me")
    ) {
      whatsappFloat.setAttribute(
        "href",
        createWhatsAppUrl(generalWhatsAppMessage)
      );
    }

    whatsappFloat.setAttribute(
      "target",
      "_blank"
    );

    whatsappFloat.setAttribute(
      "rel",
      "noopener noreferrer"
    );
  }

  /*
   * Protect contextual WhatsApp links from being overwritten.
   * Links that already point to wa.me are left untouched.
   */
  const contextualWhatsAppLinks =
    document.querySelectorAll(
      'a[href*="wa.me"]'
    );

  contextualWhatsAppLinks.forEach((link) => {
    link.addEventListener("click", () => {
      /*
       * Deliberately do not preventDefault.
       * WhatsApp must open normally.
       */
    });
  });

  /* =========================================================
     13. RESPONSIVE MENU SAFETY
     ========================================================= */

  const handleViewportChange = () => {
    if (
      window.innerWidth > CONFIG.mobileBreakpoint &&
      state.menuOpen
    ) {
      closeMenu();
    }

    if (
      window.innerWidth <= CONFIG.mobileBreakpoint &&
      heroVideo
    ) {
      heroVideo.style.transform = "";
    }
  };

  window.addEventListener(
    "resize",
    handleViewportChange,
    { passive: true }
  );

  /* =========================================================
     14. INITIAL STATE
     ========================================================= */

  if (header && window.scrollY <= CONFIG.scrollThreshold) {
    header.classList.remove("is-scrolled");
    header.classList.remove("is-hidden");
  }

  if (mobileMenu) {
    mobileMenu.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  if (menuToggle) {
    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

})();