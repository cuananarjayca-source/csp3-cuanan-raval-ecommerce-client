<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import BannerComponent from "../components/BannerComponent.vue";

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

/* Background Wave Vector Styling */
.wave-bg {
  position: absolute; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  height: 40%;
  background: linear-gradient(135deg, #c0392b33 0%, #e8a09033 50%, #f5cdc033 100%);
  border-radius: 60% 80% 0 0 / 100% 100% 0 0;
  z-index: 1;
}

/* Custom Floating Animations */
.float-1 { animation: float1 4s ease-in-out infinite; }
.float-2 { animation: float2 5s ease-in-out infinite; }
.float-3 { animation: float3 3.5s ease-in-out infinite; }

@keyframes float1 { 
  0%, 100% { transform: translateY(0) rotate(0deg); } 
  50% { transform: translateY(-12px) rotate(5deg); } 
}
@keyframes float2 { 
  0%, 100% { transform: translateY(0) rotate(0deg); } 
  50% { transform: translateY(-18px) rotate(-8deg); } 
}
@keyframes float3 { 
  0%, 100% { transform: translateY(0) rotate(0deg); } 
  50% { transform: translateY(-10px) rotate(10deg); } 
}
</style>
