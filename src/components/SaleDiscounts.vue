<template>
  <section class="banner-section-wrapper">
    <div class="container-fluid px-md-5">
      
      <!-- Main White Rounded Card -->
      <div class="banner-glass-card row align-items-center position-relative">
        
        <!-- Left Side: Text Details -->
        <div class="col-12 col-md-7 text-content-side">
          <h1 class="sale-title">SPRING SALE UP TO 30% OFF</h1>
          <p class="sale-subtitle">
            It's the classic tea <span class="highlight-text">shop experience</span>, 
            canned for your convenience. Clean, complex, and perfectly balanced.
          </p>
        </div>

        <!-- Right Side: Overlapping Product Images Grid Frame -->
        <div class="col-12 col-md-5 visual-assets-side">
          <div class="cans-display-track">
            <img src="../assets/strawberry-can.png" class="product-can can-red" alt="Strawberry 604" />
            <img src="../assets/matcha-can.png" class="product-can can-white-dark" alt="Matcha 605" />
            <img src="../assets/vanilla-can.png" class="product-can can-white-light" alt="Vanilla 608" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Main Background wrapper container */
.banner-section-wrapper {
  width: 100%;
  padding: 60px 0;
  background-color: #dcd9d4; 
  overflow: visible; 
}

/* The core Glassmorphism banner container box frame */
.banner-glass-card {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 1300px;
  padding: 3.5rem 3rem;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 15px 40px rgba(61, 3, 0, 0.05); 
}


/* Typography elements alignment rules */
.text-content-side {
  padding-right: 2rem;
}

.sale-title {
  font-family: "Canva-Sunday", "Impact", serif; 
  font-size: clamp(2.5rem, 5vw, 4.2rem); 
  color: #2e0101; 
  letter-spacing: 1.5px;
  margin-bottom: 1.2rem;
  line-height: 1.1;
  text-transform: uppercase;
}

.sale-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  color: #616267; 
  line-height: 1.6;
  max-width: 580px;
}

.highlight-text {
  font-style: italic;
  font-weight: 700;
  color: #4b4c52;
}

/* Right Side Graphic Container Frame */
.visual-assets-side {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 160px; 
}

/* Layered relative/absolute overlapping track strip configuration */
.cans-display-track {
  position: absolute;
  bottom: -90px; 
  right: 20px;
  display: flex;
  align-items: flex-end;
  z-index: 10;
}

/* Global product image parameters */
.product-can {
  width: auto;
  height: 200px; 
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(4px 12px 20px rgba(0, 0, 0, 0.18)); 
}

/* ==========================================
   UPDATED PRODUCT CANS OVERLAP GRID
   ========================================== */

/* 1. Add this to make sure your outer container clusters them tightly to the right side */
.cans-display-track {
  position: absolute;
  bottom: -120px; /* Pulls the assets past the bottom card border */
  right: -90px;   /* Sets your right hand margin boundary line padding */
  display: flex;
  align-items: flex-end;
  width: auto;   /* Forces the width to tightly wrap only around the images */
  z-index: 10;
}

/* 2. Left Can (TaroBerry Bliss Red Can) */
.can-red {
  width: auto;
  height: 300px; /* Slightly taller to create a dynamic layered effect */
  transform: rotate(-40deg) translateY(20px);
  margin-right: -430px; /* DEEPER NEGATIVE MARGIN: Pulls the middle can directly beneath it */
  z-index: 3;          /* Foremost element layer */
}

/* 3. Middle Can (Violet Verve Purple Can) */
.can-white-dark {
  height: 300px;
  transform: rotate(-4deg) translateY(-45px);
  margin-right: -430px; 
  z-index: 2;          
}

/* 4. Right Can (Alfabar Green Can) */
.can-white-light {
  height: 300px;
  transform: rotate(25deg) translateY(25px);
  z-index: 1;          /* Background element layer */
}


/* Hover dynamic micro-interactions (optional polish effect) */
.product-can:hover {
  transform: translateY(-15px) scale(2.05) rotate(0deg);
  z-index: 20; 
}

/* ==========================================================================
   MEDIUM SCREENS & TABLETS (max-width: 1199.98px)
   Reduces huge negative margins and sizes before it clips outside the card
   ========================================================================== */
@media (max-width: 1199.98px) {
  .cans-display-track {
    bottom: -90px;
    right: -30px;
  }

  .can-red, .can-white-dark, .can-white-light {
    height: 240px; /* Scales down from 300px to prevent viewport spilling */
  }

  .can-red {
    transform: rotate(-30deg) translateY(15px);
    margin-right: -320px; /* Scales down layout pulling math relative to asset height */
  }

  .can-white-dark {
    transform: rotate(-4deg) translateY(-30px);
    margin-right: -320px;
  }

  .can-white-light {
    transform: rotate(20deg) translateY(20px);
  }
}

/* ==========================================================================
   SMALL SCREENS & MOBILE (max-width: 767.98px)
   Completely normalizes the grid layout context so everything sits beautifully
   ========================================================================== */
@media (max-width: 767.98px) {
  .banner-glass-card {
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
  
  .text-content-side {
    padding-right: 0;
    margin-bottom: 3rem; /* Extra breathing room below typography block */
  }

  .sale-subtitle {
    margin: 0 auto;
  }

  .visual-assets-side {
    justify-content: center;
    min-height: 220px; /* Stable container footprint height limits */
    overflow: visible;
  }

  /* Reset layout position properties from absolute to tight content wrap flex */
  .cans-display-track {
    position: relative;
    bottom: 0;
    right: 0;
    margin: 30px auto 0 auto;
    justify-content: center;
    width: 100%;
  }

  /* Compact size adjustments so three tilted cans look cohesive on phones */
  .can-red, .can-white-dark, .can-white-light {
    height: 160px !important; /* Locks small phone proportions seamlessly */
  }

  .can-red {
    transform: rotate(-25deg) translateY(10px);
    margin-right: -210px; /* Half the size of desktop pulling constraints */
  }

  .can-white-dark {
    transform: rotate(-4deg) translateY(-15px);
    margin-right: -210px;
  }

  .can-white-light {
    transform: rotate(18deg) translateY(15px);
  }

  /* Scales down hover burst so it doesn't cover up entire phone interface text */
  .product-can:hover {
    transform: translateY(-10px) scale(1.3) rotate(0deg);
  }
}
</style>

