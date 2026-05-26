<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import BannerComponent from "../components/BannerComponent.vue";
import ProductListComponent from "../components/ProductListComponent.vue";
import SaleDiscounts from "../components/SaleDiscounts.vue";
import OurStory from "../components/OurStory.vue";

onMounted(() => {

  if (window.lucide) {
    window.lucide.createIcons()
  }
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
      <BannerComponent />
      <ProductListComponent />
      <SaleDiscounts />
      <OurStory />
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
