<script setup>
// Empty script blocks must have the 'setup' directive or be deleted entirely to compile cleanly
</script>

<template>
  <div class="container py-4 text-center">
    <div class="row align-items-center"> 
      <div class="col-md-4 text-md-start text-center"> 
        <h1 class="banner-title mb-4">Brewed Beyond Ordinary. <span class="text-hero">Taste of Originality</span></h1>
        <p class="lead mb-5">Curated coffee experiences made with <strong><em>passion</em></strong>, <strong><em>dedication</em></strong>, and <strong><em>flavor</em></strong> in every can.</p>
        <div class="d-flex gap-3 align-items-center mt-4">
          <!-- Primary Outline/Accent Button -->
          <button class="btn btn-learn">Learn More</button>
          
          <!-- Primary Solid Dark Button with Arrow -->
          <button class="btn btn-order">
            Order Now <span class="arrow-icon">➔</span>
          </button>
        </div>
      </div>
      
      <div class="col-md-8">
        <div class="hero-container">
          <img 
            src="../assets/hero-strawberry.png" 
            class="hero-strawberry img-fluid" 
            alt="Strawberry Background" 
          />
          <img 
            src="../assets/hero-can.png" 
            class="hero-can img-fluid" 
            alt="Hero Can" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.banner-title {
  font-family: "Canva-Sunday", serif;
  font-size: 5rem;
  color: #1a1a1a;
	opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: 2s;
}

.text-hero {
  color: #ee807b;
  display: block;
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

p.lead {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #4b5563;
  opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: 2s;
}

/* Hero - Button Styles */
.btn {
  border-radius: 50px;       
  font-family: inherit;      
  font-weight: 600;          
  padding: 12px 30px;        
  font-size: 1.1rem;         
  transition: all 0.3s ease; 
  opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: 2s;
}

/* Learn More Button Styles (Left) */
.btn-learn {
  background-color: #b72c2c; 
  color: #ffffff;            
  border: 2px solid #faf8f8; 
}

.btn-learn:hover {
  background-color: #942222; 
  transform: translateY(-2px);
}

/* Order Now Button Styles (Right) */
.btn-order {
  background-color: #3d1111; 
  color: #ffffff;
  border: 2px solid #ffffff;          
}

.btn-order:hover {
  background-color: #110303; 
  transform: translateY(-2px); 
}

/* Spacing layout for the inline unicode arrow */
.arrow-icon {
  margin-left: 6px;
  display: inline-block;
}


/* Responsive Structural Positioning */
.hero-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 60vh;
  overflow: hidden; 
}

/* Layer 1: Rotating Asset */
.hero-strawberry {
  position: absolute;
  z-index: 1;         
  width: 100%;
  max-width: 1200px; /* Constrained using max-width to protect column breaking */
  height: auto;
  animation: rotate-background 30s linear infinite; 
}

/* Layer 2: Main Foreground Can */
.hero-can {
  position: relative; 
  z-index: 2;         
  width: 100%;
  max-width: 1000px; /* Scaled proportionally to sit beautifully over the background graphics */
  height: auto;
  animation: fade-in-up 1.5s ease-out forwards;
}



/* Keyframes for Animations */

@keyframes fadeInOpacity {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rotate-background {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
