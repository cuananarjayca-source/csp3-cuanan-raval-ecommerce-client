<template>
  <section id= "our-story" class="our-story-section" aria-labelledby="our-story-heading">
    <div
      ref="stageRef"
      class="xray-stage"
      :class="{ 'xray-stage--active': isHovering }"
      @mouseenter="onMouseEnter"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <div class="layer bg-layer" aria-hidden="true">
        <img
          :src="bgImage"
          alt=""
          class="bg-image"
          width="1920"
          height="1080"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div
        class="layer products-layer"
        :style="productsClipStyle"
        aria-hidden="true"
      >
        <div class="products-magnify" :style="magnifyStyle">
          <img
            v-for="(can, index) in scatteredCans"
            :key="index"
            :src="can.src"
            :alt="can.alt"
            class="floating-can"
            :style="can.style"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div
        v-show="isHovering"
        class="xray-lens"
        :style="lensStyle"
        aria-hidden="true"
      />
    </div>

    <div id="our-story-heading" class="visually-hidden">
      <p>OUR STORY</p>
      <h2>More Than a Drink.</h2>
      <p>A journey of passion, purpose, and perseverance.</p>

      <h3>Where It All Started</h3>
      <p>
        It all began in a small kitchen with a simple idea: to create a better tasting,
        real ingredient strawberry milk tea. We believed in quality, simplicity, and the
        joy that comes from something made with care.
      </p>
      <p>First recipe. Big dreams.</p>
      <p>The very first can. The start of something real.</p>

      <h3>The Journey</h3>
      <p>
        From day one, our mission was clear: craft unforgettable drinks using real ingredients
        and honest flavors. We started small, but with your support, we grew. Each can represents
        countless hours, experimentation, and a relentless drive to get better.
      </p>
      <p>New flavors. New milestones. Same passion.</p>
      <ul>
        <li>Real ingredients</li>
        <li>Made with care</li>
        <li>Quality first</li>
        <li>Community driven</li>
      </ul>

      <h3>The Struggle</h3>
      <p>
        The road wasn't easy. There were doubts, late nights, financial setbacks, and moments when
        we wondered if we should give up. But we stayed true to our why.
      </p>
      <p>Every challenge made us stronger.</p>
      <p>What kept us going:</p>
      <ul>
        <li>Our belief in better ingredients</li>
        <li>Support from our early fans</li>
        <li>A dream bigger than ourselves</li>
      </ul>
      <p>We didn't just build a brand. We built a promise.</p>
      <p>Thank you for being part of our story. This is only the beginning.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import bgImage from "@/assets/our-story-bg.png";
import strawberryCan from "@/assets/strawberry-can.png";
import matchaCan from "@/assets/matcha-can.png";
import vanillaCan from "@/assets/vanilla-can.png";
import productCan from "@/assets/images/product-6.png";

const stageRef = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);
const isHovering = ref(false);
const lensRadius = ref(120);
const lensZoom = ref(1.75);
const scatteredCans = ref([]);

let rafId = null;
let pendingX = 0;
let pendingY = 0;
let resizeObserver = null;

const productsClipStyle = computed(() => {
  const r = isHovering.value ? lensRadius.value : 0;
  return {
    clipPath: `circle(${r}px at ${mouseX.value}px ${mouseY.value}px)`,
    WebkitClipPath: `circle(${r}px at ${mouseX.value}px ${mouseY.value}px)`,
  };
});

const magnifyStyle = computed(() => ({
  transform: isHovering.value
    ? `translate3d(0, 0, 0) scale(${lensZoom.value})`
    : "translate3d(0, 0, 0) scale(1)",
  transformOrigin: `${mouseX.value}px ${mouseY.value}px`,
}));

const lensStyle = computed(() => {
  const size = lensRadius.value * 2;
  return {
    width: `${size}px`,
    height: `${size}px`,
    transform: `translate3d(${mouseX.value - lensRadius.value}px, ${mouseY.value - lensRadius.value}px, 0)`,
  };
});

function syncLensTokens() {
  const el = stageRef.value;
  if (!el) return;
  const styles = getComputedStyle(el);
  const radius = parseFloat(styles.getPropertyValue("--lens-radius"));
  const zoom = parseFloat(styles.getPropertyValue("--lens-zoom"));
  if (!Number.isNaN(radius)) lensRadius.value = radius;
  if (!Number.isNaN(zoom)) lensZoom.value = zoom;
}

function setPointerPosition(clientX, clientY) {
  const el = stageRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  mouseX.value = clientX - rect.left;
  mouseY.value = clientY - rect.top;
}

function schedulePointerUpdate(clientX, clientY) {
  pendingX = clientX;
  pendingY = clientY;
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    setPointerPosition(pendingX, pendingY);
  });
}

function onMouseEnter(event) {
  isHovering.value = true;
  setPointerPosition(event.clientX, event.clientY);
}

function onMouseMove(event) {
  schedulePointerUpdate(event.clientX, event.clientY);
}

function onMouseLeave() {
  isHovering.value = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function onTouchStart(event) {
  if (!event.touches.length) return;
  isHovering.value = true;
  const touch = event.touches[0];
  setPointerPosition(touch.clientX, touch.clientY);
}

function onTouchMove(event) {
  if (!event.touches.length) return;
  const touch = event.touches[0];
  schedulePointerUpdate(touch.clientX, touch.clientY);
}

function onTouchEnd() {
  isHovering.value = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function buildScatteredCans() {
  const catalog = [
    { src: strawberryCan, alt: "Strawberry milk tea can", size: 96 },
    { src: matchaCan, alt: "Matcha milk tea can", size: 100 },
    { src: vanillaCan, alt: "Vanilla milk tea can", size: 94 },
    { src: productCan, alt: "604 beverage can", size: 98 },
    { src: strawberryCan, alt: "", size: 80 },
    { src: matchaCan, alt: "", size: 86 },
    { src: vanillaCan, alt: "", size: 78 },
  ];

  const placements = [
    { left: 8, top: 18 },
    { left: 72, top: 12 },
    { left: 38, top: 58 },
    { left: 82, top: 52 },
    { left: 22, top: 78 },
    { left: 58, top: 28 },
    { left: 14, top: 44 },
  ];

  scatteredCans.value = catalog.map((item, index) => {
    const placement = placements[index % placements.length];
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 8;
    const rotation = Math.round((Math.random() - 0.5) * 50);
    const zIndex = Math.floor(Math.random() * 8) + 1;

    return {
      src: item.src,
      alt: item.alt,
      style: {
        left: `${placement.left + jitterX}%`,
        top: `${placement.top + jitterY}%`,
        width: `${item.size}px`,
        "--can-rotate": `${rotation}deg`,
        zIndex: String(zIndex),
        animationDelay: `${(Math.random() * 2).toFixed(2)}s`,
      },
    };
  });
}

onMounted(() => {
  buildScatteredCans();
  syncLensTokens();

  resizeObserver = new ResizeObserver(() => syncLensTokens());
  if (stageRef.value) resizeObserver.observe(stageRef.value);
  window.addEventListener("resize", syncLensTokens, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", syncLensTokens);
  resizeObserver?.disconnect();
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.our-story-section {
  background-color: #f8f5ef;
  overflow: hidden;
  padding: clamp(24px, 4vw, 48px) clamp(12px, 2.5vw, 32px);
}

.xray-stage {
  /* Bootstrap-aligned breakpoints; JS reads these via getComputedStyle */
  --lens-radius: 120px;
  --lens-zoom: 1.85;
  position: relative;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  aspect-ratio: 1920 / 1080;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  transform: translate3d(0, 0, 0);
  border-radius: 2px;
  box-shadow: 0 12px 40px rgba(61, 3, 0, 0.08);
}

.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-layer {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f5ef;
}

.bg-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transform: translate3d(0, 0, 0);
}

.products-layer {
  z-index: 2;
  will-change: clip-path;
  transition: clip-path 0.15s ease-out;
  transform: translate3d(0, 0, 0);
}

.products-magnify {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: transform 0.12s linear;
  transform: translate3d(0, 0, 0);
}

.floating-can {
  position: absolute;
  height: auto;
  opacity: 0.95;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
  will-change: transform;
  transform: translate3d(-50%, -50%, 0) rotate(var(--can-rotate, 0deg));
  animation: can-float 7s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes can-float {
  0%,
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(var(--can-rotate, 0deg));
  }
  50% {
    transform: translate3d(-50%, calc(-50% - 10px), 0) rotate(var(--can-rotate, 0deg));
  }
}

.xray-lens {
  z-index: 3;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  pointer-events: none;
  
  /* --- REMOVED GLASSMORPHISM --- */
  /* Replaced with a clean, solid border and a subtle drop shadow for visibility */
  border: 2px solid #ffffff; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
  background: transparent;
  
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* lg and below — tablet landscape / small laptop */
@media (max-width: 1199.98px) {
  .xray-stage {
    --lens-radius: 100px;
    --lens-zoom: 1.7;
  }
}

/* md and below — tablet portrait */
@media (max-width: 991.98px) {
  .xray-stage {
    --lens-radius: 90px;
    --lens-zoom: 1.6;
  }
}

/* sm and below — large phones */
@media (max-width: 767.98px) {
  .our-story-section {
    padding: 20px 10px;
  }

  .xray-stage {
    --lens-radius: 80px;
    --lens-zoom: 1.5;
    cursor: default;
  }
}

/* xs — small phones */
@media (max-width: 575.98px) {
  .xray-stage {
    --lens-radius: 68px;
    --lens-zoom: 1.42;
  }

  .floating-can {
    width: clamp(52px, 16vw, 76px) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-can {
    animation: none;
  }

  .products-layer,
  .products-magnify {
    transition: none;
  }
}
</style>
