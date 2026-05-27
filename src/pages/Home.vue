<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import BannerComponent from "../components/BannerComponent.vue";
import ProductListComponent from "../components/ProductListComponent.vue";
import SaleDiscounts from "../components/SaleDiscounts.vue";
import OurStory from "../components/OurStory.vue";
import ReviewsComponent from "../components/ReviewsComponent.vue";
import ContactUsComponent from "@/components/ContactUsComponent.vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {

  if (window.lucide) {
    window.lucide.createIcons()
  }

  // GSAP ScrollTrigger Animations
  const elements = gsap.utils.toArray('.gsap-animate');
  
  elements.forEach((el, index) => {
    // For the banner (first element), we can animate it immediately without scroll
    if (index === 0) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );
    } else {
      gsap.fromTo(el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%", 
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  });
})
</script>

<template>
  <div class="min-h-screen overflow-hidden relative main-wrapper">
    <!-- Floating Background Elements -->
    <div class="wave-bg"></div>

    <!-- Nav -->
    <header class="relative z-20">
      <nav class="p-4">
        <!-- Your navigation content goes here -->
      </nav>
    </header>

    <!-- Main Content Layout Holder -->
    <main class="relative z-10">
      <!-- Add your core page content here -->
      <div class="gsap-animate"><BannerComponent /></div>
      <div class="gsap-animate"><ProductListComponent /></div>
      <div class="gsap-animate"><SaleDiscounts /></div>
      <div class="gsap-animate"><OurStory id="our-story" /></div>
      <div class="gsap-animate"><ReviewsComponent id="reviews" /></div>
      <div class="gsap-animate"><ContactUsComponent id="contact-us" /></div>
    </main>
  </div>
</template>


<style scoped>
/* Scoped styles target only this component and keep your global CSS clean */
.main-wrapper {
  background: linear-gradient(rgb(253, 232, 228), rgb(249, 201, 187));
  font-family: 'Inter', sans-serif;
}

/* Typography Overrides */
:deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6), .font-display {
  font-family: 'Yanone Kaffeesatz', sans-serif;
}

.font-cta {
  font-family: 'Montserrat', sans-serif;
}

</style>
