<template>
  <!-- Main layout container uses the image asset as a background -->
  <section class="our-story-image-section">
    <div class="story-overlay-grid">
    </div>
  </section>
</template>

<style scoped>
.our-story-image-section {
  width: 102%;
  position: relative;
  background-image: url('@/assets/images/bg-vintage1.png'); 
  background-size: 100% 100%;        
  background-position: center top; 
  background-repeat: no-repeat;
  aspect-ratio: 16 / 10.5; 
}

/* 2. Responsive Proportions Map for Smaller Screens */
@media (max-width: 992px) {
  .our-story-image-section {
    aspect-ratio: 16 / 10.5; 
  }
}

@media (max-width: 768px) {
  .our-story-image-section {
    min-height: auto;
    background-size: 100% auto;
  }
}
</style>

