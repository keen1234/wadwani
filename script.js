const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

class ThreeDCarousel {
  constructor(element, options = {}) {
    this.container = element;
    this.options = {
      autoRotate: true,
      rotateInterval: 3000,
      touchThreshold: 50,
      centerActive: true,
      ...options,
    };

    this.currentIndex = 0;
    this.isRotating = this.options.autoRotate;
    this.rotationInterval = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isVisible = false;
    this.isDragging = false;

    this.carouselData = [
      {
        id: 1,
        brand: "MODEL A",
        imageTitle: "Compact Dryer",
        title: "Portable Crop Heat Dryer - Compact",
        subtitle: "Best for small farms",
        description:
          "A lightweight dryer ideal for rice, corn, and coffee batches with consistent heat distribution and low fuel usage.",
        tags: ["Rice", "Corn", "Coffee", "Portable"],
        link: "#our-products",
      },
      {
        id: 2,
        brand: "MODEL B",
        imageTitle: "Standard Dryer",
        title: "Portable Crop Heat Dryer - Standard",
        subtitle: "Balanced output and cost",
        description:
          "Designed for daily farm operations with improved airflow control and reliable moisture reduction performance.",
        tags: ["Efficient", "Durable", "Fast Dry", "Field Use"],
        link: "#our-products",
      },
      {
        id: 3,
        brand: "MODEL C",
        imageTitle: "Heavy Duty Dryer",
        title: "Portable Crop Heat Dryer - Pro",
        subtitle: "For cooperatives and large loads",
        description:
          "High-capacity drying with stable heat output, suitable for larger harvest volumes and extended operating hours.",
        tags: ["High Capacity", "Stable Heat", "Low Waste", "Farm Co-op"],
        link: "#our-products",
      },
    ];

    this.init();
  }

  init() {
    this.setupElements();
    this.createCards();
    this.createIndicators();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.updateCarousel();

    if (this.options.autoRotate) {
      this.startAutoRotate();
    }
  }

  setupElements() {
    this.track = this.container.querySelector(".carousel-track");
    this.prevBtn = this.container.querySelector(".prev-btn");
    this.nextBtn = this.container.querySelector(".next-btn");
    this.indicatorContainer = this.container.querySelector(".carousel-indicators");
    this.wrapper = this.container.querySelector(".carousel-wrapper");
  }

  createCards() {
    this.track.innerHTML = "";

    this.carouselData.forEach((item) => {
      const card = document.createElement("div");
      card.className = "carousel-card";
      card.innerHTML = `
        <div class="card-image" style="background-image: linear-gradient(135deg, #0f5132 0%, #1f7a40 55%, #6bbd51 100%);">
          <div class="card-image-content">
            <div class="card-brand">${item.brand}</div>
            <div class="card-brand-divider"></div>
            <div class="card-image-title">${item.imageTitle}</div>
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-subtitle">${item.subtitle}</p>
          <p class="card-description">${item.description}</p>
          <div class="card-tags">
            ${item.tags.map((tag) => `<span class="card-tag">${tag}</span>`).join("")}
          </div>
          <a href="${item.link}" class="card-link">
            <span class="card-link-text">View Product</span>
            <svg class="card-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7"></path>
              <path d="M7 7h10v10"></path>
            </svg>
            <div class="card-link-underline"></div>
          </a>
        </div>
      `;
      this.track.appendChild(card);
    });

    this.cards = this.track.querySelectorAll(".carousel-card");
  }

  createIndicators() {
    this.indicatorContainer.innerHTML = "";

    this.carouselData.forEach((_, index) => {
      const indicator = document.createElement("button");
      indicator.className = "carousel-indicator";
      indicator.setAttribute("aria-label", `Go to slide ${index + 1}`);
      indicator.addEventListener("click", () => this.goToSlide(index));
      this.indicatorContainer.appendChild(indicator);
    });

    this.indicators = this.indicatorContainer.querySelectorAll(".carousel-indicator");
  }

  setupEventListeners() {
    this.prevBtn?.addEventListener("click", () => this.previous());
    this.nextBtn?.addEventListener("click", () => this.next());

    this.wrapper.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true });
    this.wrapper.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
    this.wrapper.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: true });

    this.wrapper.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.wrapper.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.wrapper.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.wrapper.addEventListener("mouseleave", this.handleMouseUp.bind(this));

    this.container.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.wrapper.addEventListener("mouseenter", () => this.pauseAutoRotate());
    this.wrapper.addEventListener("mouseleave", () => this.resumeAutoRotate());

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseAutoRotate();
      } else if (this.isVisible) {
        this.resumeAutoRotate();
      }
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (entry.isIntersecting && this.options.autoRotate) {
            this.startAutoRotate();
          } else {
            this.stopAutoRotate();
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(this.container);
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchEndX = this.touchStartX;
    this.isDragging = true;
    this.wrapper.classList.add("swiping");
    this.pauseAutoRotate();
  }

  handleTouchMove(e) {
    if (!this.isDragging) {
      return;
    }

    this.touchEndX = e.touches[0].clientX;
    const deltaX = this.touchStartX - this.touchEndX;

    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd() {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.wrapper.classList.remove("swiping");

    const deltaX = this.touchStartX - this.touchEndX;

    if (Math.abs(deltaX) > this.options.touchThreshold) {
      if (deltaX > 0) {
        this.next();
      } else {
        this.previous();
      }
    }

    this.resumeAutoRotate();
  }

  handleMouseDown(e) {
    this.touchStartX = e.clientX;
    this.touchEndX = this.touchStartX;
    this.isDragging = true;
    this.wrapper.classList.add("swiping");
    this.pauseAutoRotate();
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging) {
      return;
    }
    this.touchEndX = e.clientX;
  }

  handleMouseUp() {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.wrapper.classList.remove("swiping");

    const deltaX = this.touchStartX - this.touchEndX;

    if (Math.abs(deltaX) > this.options.touchThreshold) {
      if (deltaX > 0) {
        this.next();
      } else {
        this.previous();
      }
    }

    this.resumeAutoRotate();
  }

  handleKeyDown(e) {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.previous();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.next();
        break;
      case " ":
        e.preventDefault();
        this.toggleAutoRotate();
        break;
      default:
        break;
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.carouselData.length;
    this.updateCarousel();
  }

  previous() {
    this.currentIndex = this.currentIndex === 0 ? this.carouselData.length - 1 : this.currentIndex - 1;
    this.updateCarousel();
  }

  goToSlide(index) {
    if (index >= 0 && index < this.carouselData.length) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    const totalCards = this.cards.length;

    this.cards.forEach((card, index) => {
      card.classList.remove("active", "next", "prev", "hidden");

      if (index === this.currentIndex) {
        card.classList.add("active");
      } else if (index === (this.currentIndex + 1) % totalCards) {
        card.classList.add("next");
      } else if (index === (this.currentIndex - 1 + totalCards) % totalCards) {
        card.classList.add("prev");
      } else {
        card.classList.add("hidden");
      }
    });

    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === this.currentIndex);
    });

    this.cards.forEach((card, index) => {
      card.setAttribute("aria-hidden", index !== this.currentIndex);
    });
  }

  startAutoRotate() {
    if (!this.options.autoRotate || !this.isVisible) {
      return;
    }

    this.stopAutoRotate();
    this.isRotating = true;
    this.rotationInterval = setInterval(() => {
      if (this.isRotating && this.isVisible && !this.isDragging) {
        this.next();
      }
    }, this.options.rotateInterval);

    this.wrapper.classList.remove("paused");
  }

  stopAutoRotate() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
    this.isRotating = false;
  }

  pauseAutoRotate() {
    this.isRotating = false;
    this.wrapper.classList.add("paused");
  }

  resumeAutoRotate() {
    if (this.options.autoRotate && this.isVisible) {
      this.isRotating = true;
      this.wrapper.classList.remove("paused");
      if (!this.rotationInterval) {
        this.startAutoRotate();
      }
    }
  }

  toggleAutoRotate() {
    if (this.options.autoRotate) {
      if (this.isRotating) {
        this.pauseAutoRotate();
      } else {
        this.resumeAutoRotate();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const carouselElement = document.querySelector(".threed-carousel-container");
  if (carouselElement) {
    window.carousel = new ThreeDCarousel(carouselElement, {
      autoRotate: true,
      rotateInterval: 4000,
      touchThreshold: 50,
      centerActive: true,
    });
  }

  const ring = document.getElementById("teamRing");
  const images = document.querySelectorAll(".team-ring-image");
  const cards = document.querySelectorAll(".team-card");
  const lightbox = document.getElementById("teamLightbox");
  const lbMedia = document.querySelector(".team-lightbox-media");
  const lbTitle = document.querySelector(".team-lightbox-title");
  const lbDesc = document.querySelector(".team-lightbox-description");
  const closeEls = document.querySelectorAll("[data-team-close]");

  if (ring && images.length) {
    const imageCount = images.length;
    const angleStep = 360 / imageCount;
    const imageDistance = 360;
    let rotationY = 0;
    let isAutoRotating = true;
    const autoRotateSpeed = 0.08;
    let isDragging = false;
    let velocity = 0;
    let startX = 0;
    let lastX = 0;
    let animationFrame;

    images.forEach((img, i) => {
      const angle = i * angleStep;
      img.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${imageDistance}px)`;
    });

    const rotateRing = () => {
      if (isAutoRotating && !isDragging && !lightbox?.classList.contains("open")) {
        rotationY += autoRotateSpeed;
        ring.style.transform = `rotateY(${rotationY}deg)`;
      }
      requestAnimationFrame(rotateRing);
    };

    requestAnimationFrame(rotateRing);

    const openLightboxFromCard = (card) => {
      const front = card.querySelector(".team-front");
      const title = card.querySelector(".team-back-content h4")?.textContent || "";
      const detail = Array.from(card.querySelectorAll(".team-back-content p"))
        .map((p) => p.textContent || "")
        .join(" ");
      const bg = front ? getComputedStyle(front).backgroundImage : "none";

      if (lbMedia) {
        lbMedia.style.backgroundImage = bg;
      }
      if (lbTitle) {
        lbTitle.textContent = title;
      }
      if (lbDesc) {
        lbDesc.textContent = detail;
      }
      if (lightbox) {
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      }
      ring.style.pointerEvents = "none";
      isAutoRotating = false;
    };

    const closeLightbox = () => {
      if (lightbox) {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
      }
      ring.style.pointerEvents = "";
      isAutoRotating = true;
    };

    cards.forEach((card) => {
      card.addEventListener("mousedown", (e) => e.stopPropagation());
      card.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
      card.addEventListener("click", () => {
        if (!isDragging) {
          openLightboxFromCard(card);
        }
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightboxFromCard(card);
        }
      });
    });

    closeEls.forEach((el) => el.addEventListener("click", closeLightbox));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox?.classList.contains("open")) {
        closeLightbox();
      }
    });

    ring.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        rotationY += delta * 0.2;
        ring.style.transform = `rotateY(${rotationY}deg)`;
      },
      { passive: false }
    );

    ring.addEventListener("mouseenter", () => {
      isAutoRotating = false;
    });

    ring.addEventListener("mouseleave", () => {
      if (!lightbox?.classList.contains("open")) {
        isAutoRotating = true;
      }
    });

    const startDrag = (e) => {
      isDragging = true;
      isAutoRotating = false;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      lastX = startX;
      ring.style.cursor = "grabbing";
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };

    const onDrag = (e) => {
      if (!isDragging) {
        return;
      }
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = x - lastX;
      velocity = deltaX * 0.5;
      rotationY += velocity;
      ring.style.transform = `rotateY(${rotationY}deg)`;
      lastX = x;
    };

    const inertia = () => {
      velocity *= 0.95;
      rotationY += velocity;
      ring.style.transform = `rotateY(${rotationY}deg)`;
      if (Math.abs(velocity) > 0.1) {
        animationFrame = requestAnimationFrame(inertia);
      }
    };

    const endDrag = () => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      ring.style.cursor = "grab";
      if (!lightbox?.classList.contains("open")) {
        isAutoRotating = true;
      }
      inertia();
    };

    ring.addEventListener("mousedown", startDrag);
    ring.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag, { passive: true });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    images.forEach((img) => {
      img.style.opacity = "1";
    });
  }
});
