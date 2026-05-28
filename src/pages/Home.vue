<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import BannerComponent from "../components/BannerComponent.vue";
import ProductSection from "../components/ProductSection.vue";
import SaleDiscounts from "../components/SaleDiscounts.vue";
import OurStory from "../components/OurStory.vue";
import ReviewsComponent from "../components/ReviewsComponent.vue";
import ContactUsComponent from "@/components/ContactUsComponent.vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  const sections = gsap.utils.toArray('.gsap-animate');
  
  sections.forEach((section, index) => {
    // Skip pinning the last section so the footer doesn't get stuck forever
    if (index === sections.length - 1) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",      /* Pins when the top of the section hits the top of the screen */
      pin: true,             /* Freezes the section in place */
      pinSpacing: false,     /* Allows the next section to ride up directly over it */
      scrub: true
    });
  });
});
</script>

<template>
  <div class="min-h-screen overflow-hidden relative main-wrapper">
    
    <!-- 1. Combined Header & Banner inside the Video Container -->
    <div class="gsap-animate banner-video-container">
      <video autoplay muted loop playsinline class="background-video">
        <source src="../assets/wave-animation.mp4" type="video/mp4">
      </video>

      <!-- Nav now overlays perfectly on top of the same video background -->
      <header class="relative z-20">
        <nav class="p-4">
          <!-- Your navigation content goes here -->
        </nav>
      </header>

      <BannerComponent />
    </div>

    <!-- Main Content Layout Holder (Rest of your sections remain below) -->
    <main class="relative z-10">
      <div class="gsap-animate"><ProductSection /></div>
      <div class="gsap-animate"><SaleDiscounts /></div>
      <div class="gsap-animate"><OurStory id="our-story" /></div>
      <div class="gsap-animate"><ReviewsComponent id="reviews" /></div>
      <div class="gsap-animate"><ContactUsComponent id="contact-us" /></div>
    </main>
  </div>
</template>

<style scoped>
.banner-video-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0; 
}

.main-wrapper {
  background: #dcd9d4;
}

/* Force both header and BannerComponent content layers above the video canvas */
:deep(.banner-video-container > header),
:deep(.banner-video-container > div) {
  position: relative;
  z-index: 1;
}

/* Typography Overrides */
:deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6), .font-display {
  font-family: 'Yanone Kaffeesatz', sans-serif;
}

.font-cta {
  font-family: 'Montserrat', sans-serif;
}
</style>


