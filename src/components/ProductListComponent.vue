<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('nutrition');

// ── Products list ──────────────────────────────────────────
// image paths from src/assets/images — update filenames to match yours
const products = [
    {
        id: 1,
        name: 'TaroBerry Bliss',
        flavor: 'Strawberry Taro',
        tag: 'FEATURED',
        description: 'A vibrant fusion of sweet strawberry and earthy taro — smooth, refreshing, unforgettable.',
        accentColor: '#ee807b',
        bgColor: '#3d0300',
        image: new URL('../assets/images/product-5.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '3.5g', dv: '4%'  },
            { label: 'Sodium',      value: '85mg', dv: '4%'  },
            { label: 'Total Carbs', value: '34g',  dv: '12%' },
            { label: 'Sugars',      value: '28g'              },
            { label: 'Protein',     value: '4g'               },
            { label: 'Calcium',     value: '15%'              },
        ],
        calories: 180,
        ingredients: 'Filtered Water, Cane Sugar, Taro Powder, Skim Milk, Strawberry Puree, Black Tea Extract, Natural Flavors, Citric Acid, Carrageenan, Vitamin C.',
    },
    {
        id: 2,
        name: 'Macchiato 606',
        flavor: 'Caramel Espresso',
        tag: 'BESTSELLER',
        description: 'Smooth caramel espresso fusion with a creamy, velvety finish.',
        accentColor: '#c8854a',
        bgColor: '#2a1200',
        image: new URL('../assets/images/product-2.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '4g',   dv: '5%'  },
            { label: 'Sodium',      value: '95mg', dv: '4%'  },
            { label: 'Total Carbs', value: '38g',  dv: '14%' },
            { label: 'Sugars',      value: '30g'              },
            { label: 'Protein',     value: '5g'               },
            { label: 'Calcium',     value: '12%'              },
        ],
        calories: 200,
        ingredients: 'Filtered Water, Cane Sugar, Espresso Extract, Whole Milk, Caramel Syrup, Natural Flavors, Sodium Bicarbonate, Carrageenan.',
    },
    {
        id: 3,
        name: 'Turmeric Latte 601',
        flavor: 'Golden Turmeric',
        tag: 'NEW',
        description: 'Coffee Series spice blended into our signature velvety purple milk tea.',
        accentColor: '#d4a843',
        bgColor: '#1e1500',
        image: new URL('../assets/images/product-3.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '2.5g', dv: '3%'  },
            { label: 'Sodium',      value: '75mg', dv: '3%'  },
            { label: 'Total Carbs', value: '30g',  dv: '11%' },
            { label: 'Sugars',      value: '24g'              },
            { label: 'Protein',     value: '3g'               },
            { label: 'Calcium',     value: '18%'              },
        ],
        calories: 160,
        ingredients: 'Filtered Water, Cane Sugar, Turmeric Powder, Oat Milk, Ginger Extract, Black Pepper Extract, Natural Flavors, Citric Acid.',
    },
    {
        id: 4,
        name: 'Taro Classic 600',
        flavor: 'Original Taro',
        tag: 'ORIGINAL',
        description: 'The original taro milk tea that started it all. Pure, smooth, iconic.',
        accentColor: '#a07bc8',
        bgColor: '#150d22',
        image: new URL('../assets/images/product-4.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '3g',   dv: '4%'  },
            { label: 'Sodium',      value: '80mg', dv: '3%'  },
            { label: 'Total Carbs', value: '32g',  dv: '12%' },
            { label: 'Sugars',      value: '26g'              },
            { label: 'Protein',     value: '4g'               },
            { label: 'Calcium',     value: '14%'              },
        ],
        calories: 170,
        ingredients: 'Filtered Water, Cane Sugar, Taro Powder, Whole Milk, Black Tea Extract, Natural Flavors, Carrageenan, Sodium Citrate.',
    },
    {
        id: 5,
        name: 'Taro Creamy 600',
        flavor: 'Creamy Taro',
        tag: 'ORIGINAL',
        description: 'The original taro creamy milk tea that started it all. Pure, smooth, iconic.',
        accentColor: '#ffdeb6',
        bgColor: '#321910',
        image: new URL('../assets/images/product-1.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '3g',   dv: '4%'  },
            { label: 'Sodium',      value: '80mg', dv: '3%'  },
            { label: 'Total Carbs', value: '32g',  dv: '12%' },
            { label: 'Sugars',      value: '26g'              },
            { label: 'Protein',     value: '4g'               },
            { label: 'Calcium',     value: '14%'              },
        ],
        calories: 170,
        ingredients: 'Filtered Water, Cane Sugar, Taro Powder, Whole Milk, Black Tea Extract, Natural Flavors, Carrageenan, Sodium Citrate.',
    },
    {
        id: 5,
        name: 'Taro Alpha Matcha 600',
        flavor: 'Matcha Taro',
        tag: 'ORIGINAL',
        description: 'Your Perfect Matcha, Anytime. Creamy milk tea in a can—grab, sip, and let the zen begin!',
        accentColor: '#c1ff72',
        bgColor: '#1f1f1f',
        image: new URL('../assets/images/product-6.png', import.meta.url).href,
        nutrition: [
            { label: 'Total Fat',   value: '3g',   dv: '4%'  },
            { label: 'Sodium',      value: '80mg', dv: '3%'  },
            { label: 'Total Carbs', value: '32g',  dv: '12%' },
            { label: 'Sugars',      value: '26g'              },
            { label: 'Protein',     value: '4g'               },
            { label: 'Calcium',     value: '14%'              },
        ],
        calories: 170,
        ingredients: 'Filtered Water, Cane Sugar, Taro Powder, Whole Milk, Black Tea Extract, Natural Flavors, Carrageenan, Sodium Citrate.',
    },
];

// ── State ──────────────────────────────────────────────────
const selectedIndex = ref(0);
const isTransitioning = ref(false);

const selectedProduct = computed(() => products[selectedIndex.value]);

// ── Navigation ─────────────────────────────────────────────
function selectProduct(index) {
    if (index === selectedIndex.value || isTransitioning.value) return;
    isTransitioning.value = true;
    setTimeout(() => {
        selectedIndex.value = index;
        activeTab.value = 'nutrition';
        isTransitioning.value = false;
    }, 220);
}

function navUp() {
    const prev = selectedIndex.value > 0
        ? selectedIndex.value - 1
        : products.length - 1;
    selectProduct(prev);
}

function navDown() {
    const next = selectedIndex.value < products.length - 1
        ? selectedIndex.value + 1
        : 0;
    selectProduct(next);
}

function goToProducts() {
    router.push('/products');
}

function goToBuy() {
    router.push(`/products/${selectedProduct.value.id}`);
}
</script>

<template>
    <section class="product-section">
        <div class="ps-container container">

            <div class="section-top-bar">
                <div class="section-header">
                    <span class="section-eyebrow">OUR LINEUP</span>
                    <h2 class="section-title">
                        <span class="title-primary">Crafted for</span>
                        <span class="title-accent"> Every Craving</span>
                    </h2>
                </div>

                <div class="carousel-header">
                    <span class="carousel-label">MORE FLAVORS</span>
                    <button class="carousel-see-all" @click="goToProducts">
                        See all <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="row g-4 align-items-start">

                <div class="col-hero col-12 col-md-6 col-lg-5">
                    <div
                        class="hero-product-card"
                        :class="{ transitioning: isTransitioning }"
                        :style="{ '--accent': selectedProduct.accentColor }"
                    >
                        <div class="flavor-badge">
                            <span class="badge-dot" :style="{ background: selectedProduct.accentColor }"></span>
                            {{ selectedProduct.flavor }}
                        </div>

                        <div class="hero-img-wrap">
                            <div class="hero-img-glow" :style="{ background: `radial-gradient(circle, ${selectedProduct.accentColor}30 0%, transparent 70%)` }"></div>
                            <img
                                :src="selectedProduct.image"
                                :alt="selectedProduct.name"
                                class="hero-product-img"
                            />
                            <div class="hero-img-shadow"></div>
                        </div>

                        <div class="hero-product-info">
                            <h3 class="hero-product-name">{{ selectedProduct.name }}</h3>
                            <p class="hero-product-desc">{{ selectedProduct.description }}</p>

                            <div class="hero-actions">
                                <button
                                    class="hero-buy-btn"
                                    :style="{ background: selectedProduct.bgColor }"
                                    @click="goToBuy"
                                >
                                    <i class="bi bi-bag-fill"></i>
                                    Buy Now
                                </button>
                                <button class="hero-shop-btn" @click="goToProducts">
                                    Shop All
                                    <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        <div class="hero-dots">
                            <button
                                v-for="(p, i) in products"
                                :key="p.id"
                                class="hero-dot"
                                :class="{ active: i === selectedIndex }"
                                :style="i === selectedIndex ? { background: selectedProduct.accentColor } : {}"
                                @click="selectProduct(i)"
                                :aria-label="`Select ${p.name}`"
                            ></button>
                        </div>
                    </div>
                </div>

                <div class="col-nutrition col-12 col-md-6 col-lg-3">
                    <div class="nutrition-card" :class="{ transitioning: isTransitioning }">

                        <div class="tab-row">
                            <button
                                class="tab-btn"
                                :class="{ active: activeTab === 'nutrition' }"
                                @click="activeTab = 'nutrition'"
                            >Nutrition</button>
                            <button
                                class="tab-btn"
                                :class="{ active: activeTab === 'ingredients' }"
                                @click="activeTab = 'ingredients'"
                            >Ingredients</button>
                        </div>

                        <div v-if="activeTab === 'nutrition'" class="tab-content">
                            <div class="nf-header">
                                <span class="nf-title">Nutrition Facts</span>
                                <span class="nf-serving">Per 1 can (355ml)</span>
                            </div>
                            <div class="nf-calories-row">
                                <span class="nf-cal-label">Calories</span>
                                <span class="nf-cal-val">{{ selectedProduct.calories }}</span>
                            </div>
                            <div class="nf-dv-header">% Daily Value*</div>
                            <div
                                v-for="(item, i) in selectedProduct.nutrition"
                                :key="i"
                                class="nf-row"
                            >
                                <span class="nf-row-label">{{ item.label }}</span>
                                <span class="nf-row-right">
                                    <span class="nf-row-val">{{ item.value }}</span>
                                    <span v-if="item.dv" class="nf-row-dv">{{ item.dv }}</span>
                                </span>
                            </div>
                            <p class="nf-disclaimer">* Percent Daily Values based on a 2,000 calorie diet.</p>
                        </div>

                        <div v-if="activeTab === 'ingredients'" class="tab-content">
                            <div class="nf-header">
                                <span class="nf-title">Ingredients</span>
                            </div>
                            <p class="ingredients-text">{{ selectedProduct.ingredients }}</p>
                            <div class="allergen-box">
                                <span class="allergen-label">
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                    Allergens
                                </span>
                                <p class="allergen-text">Contains <strong>Milk</strong>. May contain traces of <strong>Soy</strong> and <strong>Tree Nuts</strong>.</p>
                            </div>
                        </div>

                    </div>

                    <div class="volume-badge">
                        <i class="bi bi-droplet-fill"></i>
                        355ml · 12 fl oz
                    </div>
                </div>

                <div class="col-carousel col-12 col-lg-4">
                    
                    <button
                        class="nav-arrow nav-arrow--up"
                        @click="navUp"
                        :disabled="isTransitioning"
                        aria-label="Previous product"
                    >
                        <i class="bi bi-chevron-up"></i>
                    </button>

                    <div class="carousel-list">
                        <div
                            v-for="(product, index) in products"
                            :key="product.id"
                            class="carousel-card"
                            :class="{ 'carousel-card--active': index === selectedIndex }"
                            :style="{
                                background: product.bgColor,
                                '--card-accent': product.accentColor,
                                borderColor: index === selectedIndex ? product.accentColor : 'rgba(255,255,255,0.08)'
                            }"
                            @click="selectProduct(index)"
                            :aria-current="index === selectedIndex"
                        >
                            <div class="card-img-wrap">
                                <img
                                    :src="product.image"
                                    :alt="product.name"
                                    class="card-product-img"
                                    loading="lazy"
                                />
                            </div>

                            <div class="card-body">
                                <span class="card-tag" :style="{ color: product.accentColor }">{{ product.tag }}</span>
                                <h4 class="card-name">{{ product.name }}</h4>
                                <p class="card-desc">{{ product.description }}</p>
                                <span class="card-cta" :style="{ color: product.accentColor }">
                                    {{ index === selectedIndex ? 'Currently Viewing' : 'View Product' }}
                                    <i class="bi bi-arrow-right card-arrow" v-if="index !== selectedIndex"></i>
                                    <i class="bi bi-check2 card-arrow" v-else></i>
                                </span>
                            </div>

                            <div
                                v-if="index === selectedIndex"
                                class="card-active-bar"
                                :style="{ background: product.accentColor }"
                            ></div>
                        </div>
                    </div>

                    <button
                        class="nav-arrow nav-arrow--down"
                        @click="navDown"
                        :disabled="isTransitioning"
                        aria-label="Next product"
                    >
                        <i class="bi bi-chevron-down"></i>
                    </button>

                    <div class="nav-counter">
                        <span class="counter-current">{{ String(selectedIndex + 1).padStart(2, '0') }}</span>
                        <span class="counter-sep">/</span>
                        <span class="counter-total">{{ String(products.length).padStart(2, '0') }}</span>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>

<style scoped>
/* ── Section ────────────────────────────── */
.product-section {
    position: relative;
    padding: 5rem 0 4rem;
    overflow: hidden;
}

/* 1. Dedicated Background Layer */
.section-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('../assets/product-section-bg.png');
    background-size: cover;
    background-position: center;
    z-index: 0;
}

/* 2. The Glass Container */
.ps-container {
    position: relative;
    z-index: 1;
    
    /* The Glass Effect */
    background: rgba(255, 255, 255, 0.2); /* Semi-transparent white */
    backdrop-filter: blur(20px);         /* The blur intensity */
    -webkit-backdrop-filter: blur(20px);  /* Safari support */
    
    /* Styling the glass */
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 30px;
    padding: 3rem; /* Add padding so content doesn't touch the edges */
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* ── Top Bar & Headers ──────────────────── */
.section-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.section-header {
    font-family: 'Canva-Sunday', serif;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0;
}

.section-eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.25em;
    color: #ee807b;
    text-transform: uppercase;
}

.section-title {
    font-family: 'Canva-Sunday', serif;
    font-size: clamp(2.4rem, 4vw, 3.5rem);
    font-weight: 700;
    line-height: 1;
    margin: 0;
}

.title-primary { color: #111827; }
.title-accent  { color: #3d0300; }

.carousel-header {
    display: flex;
    align-items: center;
    gap: 1.5rem; 
    margin-bottom: 0.3rem; 
}

.carousel-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #9ca3af;
}

.carousel-see-all {
    background: none;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: #3d0300;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0;
    transition: color 0.2s ease, gap 0.2s ease;
}

.carousel-see-all:hover { color: #ee807b; gap: 0.5rem; }


/* ── LEFT: Hero card ────────────────────── */

.hero-product-card {
    /* 1. Translucent Background */
    background: rgba(250, 249, 252, 0.65);
    /* 2. Glass Blur */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    /* 3. Soft Glass Border */
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 28px;
    padding: 2rem 1.5rem 1.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 8px 32px rgba(61,3,0,0.08); /* Slightly deeper shadow for glass */
    position: relative;
    overflow: hidden;
    transition: opacity 0.22s ease;
}

.hero-product-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 15%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 65%);
    pointer-events: none;
    transition: background 0.4s ease;
}

.hero-product-card.transitioning {
    opacity: 0;
}

/* Flavor badge */
.flavor-badge {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-family: 'Canva-Sunday', serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 0.04em;
    /* Glassy Badge */
    background: rgba(243, 244, 246, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 0.3rem 0.75rem;
    border-radius: 20px;
    transition: color 0.3s ease;
}

.badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
    transition: background 0.3s ease;
}

@keyframes pulse {
    0%, 100% { transform: scale(1);   opacity: 1;   }
    50%       { transform: scale(1.5); opacity: 0.6; }
}

/* Hero image */
.hero-img-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 260px;
}

.hero-img-glow {
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: background 0.4s ease;
}

.hero-product-img {
    width: 250px;
    height: auto;
    object-fit: contain;
    transform: rotate(30deg);
    filter: drop-shadow(0 24px 36px rgba(0,0,0,0.18));
    animation: floatHero 4s ease-in-out infinite;
    position: relative;
    z-index: 1;
    transition: opacity 0.2s ease;
}

@keyframes floatHero {
    0%, 100% { transform: rotate(30deg) translateY(0);    }
    50%       { transform: rotate(30deg) translateY(-14px); }
}

.hero-img-shadow {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 18px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%);
    border-radius: 50%;
}

/* Product info */
.hero-product-info {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.hero-product-name {
    font-family: 'Canva-Sunday', serif;
    font-size: 2.1rem;
    font-weight: 700;
    color: #3d0300;
    margin: 0;
    transition: color 0.3s ease;
}

.hero-product-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
    max-width: 270px;
}

/* CTA buttons */
.hero-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.3rem;
}

.hero-buy-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #faf9fc;
    border: none;
    border-radius: 14px;
    padding: 0.65rem 1.4rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.hero-buy-btn:hover {
    opacity: 0.85;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.hero-shop-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    /* Glassy Shop Button */
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    border: 1.5px solid rgba(209, 213, 219, 0.6);
    border-radius: 14px;
    padding: 0.65rem 1.2rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: border-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.hero-shop-btn:hover {
    border-color: #3d0300;
    color: #3d0300;
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
}

/* Progress dots */
.hero-dots {
    display: flex;
    gap: 0.45rem;
    align-items: center;
}

.hero-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: #d1d5db;
    cursor: pointer;
    padding: 0;
    transition: background 0.3s ease, transform 0.2s ease, width 0.3s ease;
}

.hero-dot.active {
    width: 22px;
    border-radius: 4px;
    transform: scale(1);
}

/* ── CENTER: Nutrition ─────────────────── */
.col-nutrition {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nutrition-card {
    /* Glassy Nutrition Card */
    background: rgba(250, 249, 252, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 22px;
    padding: 1.4rem;
    box-shadow: 0 8px 32px rgba(61,3,0,0.06);
    transition: opacity 0.22s ease;
}

.nutrition-card.transitioning { opacity: 0.4; }

.tab-row {
    display: flex;
    gap: 0.25rem;
    /* Glassy Tab Row */
    background: rgba(243, 244, 246, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 3px;
    margin-bottom: 1.2rem;
}

.tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    border-radius: 10px;
    padding: 0.45rem 0;
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: #9ca3af;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}

.tab-btn.active {
    /* Slightly more opaque when active */
    background: rgba(255, 255, 255, 0.85);
    color: #3d0300;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.nf-header {
    display: flex;
    flex-direction: column;
    border-bottom: 6px solid #111827;
    padding-bottom: 0.3rem;
    margin-bottom: 0.3rem;
}

.nf-title {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #111827;
    line-height: 1;
}

.nf-serving {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    color: #6b7280;
    margin-top: 0.2rem;
}

.nf-calories-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.35rem 0;
    border-bottom: 3px solid #111827;
}

.nf-cal-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    color: #111827;
}

.nf-cal-val {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    line-height: 1;
}

.nf-dv-header {
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem;
    color: #6b7280;
    text-align: right;
    margin: 0.3rem 0 0.1rem;
}

.nf-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.3rem 0;
    border-bottom: 1px solid rgba(243, 244, 246, 0.8);
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
}

.nf-row-label { color: #374151; font-weight: 500; }

.nf-row-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nf-row-val  { color: #111827; font-weight: 600; }

.nf-row-dv {
    color: #3d0300;
    font-weight: 700;
    min-width: 28px;
    text-align: right;
}

.nf-disclaimer {
    font-family: 'Inter', sans-serif;
    font-size: 0.65rem;
    color: #9ca3af;
    margin: 0.6rem 0 0;
    line-height: 1.4;
}

.ingredients-text {
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    color: #374151;
    line-height: 1.7;
    margin: 0.8rem 0 1rem;
}

.allergen-box {
    background: rgba(61,3,0,0.04);
    border: 1px solid rgba(61,3,0,0.12);
    border-radius: 12px;
    padding: 0.75rem 1rem;
}

.allergen-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    color: #3d0300;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.3rem;
}

.allergen-text {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
}

.volume-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    /* Deep Glass Badge */
    background: rgba(61, 3, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #faf9fc;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    align-self: flex-start;
    letter-spacing: 0.04em;
}

/* ── RIGHT: Controlled gallery ──────────── */
.col-carousel {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

/* Nav arrows */
.nav-arrow {
    width: 100%;
    height: 36px;
    /* Glass Arrows */
    background: rgba(250, 249, 252, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1.5px solid rgba(229, 231, 235, 0.8);
    border-radius: 12px;
    color: #3d0300;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.nav-arrow:hover:not(:disabled) {
    background: rgba(61, 3, 0, 0.9);
    border-color: #3d0300;
    color: #faf9fc;
    transform: scaleY(1.05);
}

.nav-arrow:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* Cards list */
.carousel-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(61,3,0,0.15) transparent;
    padding: 2px;
}

.carousel-list::-webkit-scrollbar { width: 3px; }
.carousel-list::-webkit-scrollbar-track { background: transparent; }
.carousel-list::-webkit-scrollbar-thumb { background: rgba(61,3,0,0.15); border-radius: 3px; }

/* Card */
.carousel-card {
    /* Add Blur to the colored dynamic background */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 1rem 1.1rem;
    border: 1.5px solid rgba(255,255,255,0.2); /* Made slightly more visible for glass edge */
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
}

.carousel-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 90% 10%, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
}

.carousel-card:hover:not(.carousel-card--active) {
    transform: translateX(-4px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.15);
}

.carousel-card--active {
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    transform: translateX(-6px);
}

/* Active left bar */
.card-active-bar {
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
}

/* Thumbnail */
.card-img-wrap {
    width: 54px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-product-img {
    width: 54px;
    height: 70px;
    object-fit: contain;
    transform: rotate(15deg);
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
    transition: transform 0.3s ease;
}

.carousel-card:hover .card-product-img,
.carousel-card--active .card-product-img {
    transform: rotate(10deg) scale(1.06);
}

/* Card body */
.card-body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
}

.card-tag {
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.card-name {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #faf9fc;
    margin: 0;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    color: rgba(250,249,252,0.55);
    line-height: 1.45;
    margin: 0.15rem 0 0.3rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-cta {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    letter-spacing: 0.02em;
    transition: gap 0.25s ease;
}

.carousel-card:hover .card-cta { gap: 0.5rem; }

.card-arrow { transition: transform 0.25s ease; font-size: 0.75rem; }
.carousel-card:hover .card-arrow { transform: translateX(2px); }

/* Step counter */
.nav-counter {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
    font-family: 'Yanone Kaffeesatz', sans-serif;
}

.counter-current {
    font-size: 1.6rem;
    font-weight: 700;
    color: #3d0300;
    line-height: 1;
}

.counter-sep {
    font-size: 1rem;
    color: #d1d5db;
}

.counter-total {
    font-size: 1rem;
    color: #9ca3af;
}

/* ── Responsive (Bootstrap Breakpoints) ── */

/* Medium Screens & Below (Tablets, < 992px) */
@media (max-width: 991.98px) {
    /* Prevents the vertical carousel from becoming too wide when it drops below the other columns */
    .col-carousel {
        max-width: 450px;
        margin: 0 auto; 
    }
}

/* Small Screens (Mobile, < 768px) */
@media (max-width: 767.98px) {
    .product-section { padding: 3rem 0 2.5rem; }
    .ps-container    { padding: 0 1rem; }

    .hero-product-img { width: 150px; }
    .hero-img-wrap    { min-height: 200px; }

    /* Let the carousel take up the full width on small phones */
    .col-carousel {
        max-width: 100%;
    }
}
</style>