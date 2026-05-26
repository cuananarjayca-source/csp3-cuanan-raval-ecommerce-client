<template>
  <section id= "reviews" class="reviews-section" aria-labelledby="reviews-heading">
    <div class="container position-relative">
      <header class="reviews-header d-flex justify-content-center align-items-center">
        <span class="reviews-header-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="2"
              width="28"
              height="28"
              rx="4"
              transform="rotate(45 16 16)"
              fill="#3d0300"
              fill-opacity="0.2"
            />
            <path d="M11 9 L24 16 L11 23 Z" fill="#3d0300" />
          </svg>
        </span>
        <h2 id="reviews-heading" class="reviews-title mb-0">REVIEWS</h2>
      </header>

      <div class="row g-4 justify-content-center reviews-grid">
        <div
          v-for="(review, index) in formattedReviews"
          :key="review.name"
          class="col-12 col-md-6 col-lg-4 d-flex justify-content-center"
          :class="{ 'offset-md-3 offset-lg-0': index === 2 }"
        >
          <article class="review-card">
            <div class="review-avatar-wrap">
              <div class="review-avatar">
                <img
                  :src="review.avatar"
                  :alt="`${review.name} portrait`"
                  class="review-avatar-img"
                  width="130"
                  height="130"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <h3 class="review-name">{{ review.name }}</h3>

            <div
              class="review-stars"
              role="img"
              :aria-label="`Rated 5 out of 5 stars`"
            >
              <i
                v-for="star in 5"
                :key="star"
                class="bi bi-star-fill review-star"
                aria-hidden="true"
              />
            </div>

            <p class="review-text">
              <template
                v-for="(segment, index) in review.segments"
                :key="`${review.name}-segment-${index}`"
              >
                <strong v-if="segment.bold" class="review-text-bold">{{
                  segment.text
                }}</strong>
                <span v-else>{{ segment.text }}</span>
              </template>
            </p>
          </article>
        </div>
      </div>
    </div>

    <div class="reviews-footer-accent" aria-hidden="true" />
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import reviewer1 from "@/assets/reviews/reviewer-1.jpg";
import reviewer2 from "@/assets/reviews/reviewer-2.jpg";
import reviewer3 from "@/assets/reviews/reviewer-3.jpg";

const reviews = ref([
  {
    name: "Manny Paksiw",
    avatar: reviewer1,
    review:
      "You can actually taste the **quality of the brew**—it's not just sugar and water.",
  },
  {
    name: "Elizabeth Pokwang",
    avatar: reviewer2,
    review:
      "It's creamy, the **caffeine kick is real**, and the checkout process on the site was so fast once I made an account. Huge fan of the 'Dirty Purple' too!",
  },
  {
    name: "Tuesday Pepito",
    avatar: reviewer3,
    review:
      "I love the **Taro606 aesthetic** but I can't do caffeine after 4 PM. The Ube Dream is literally a dessert in a can. It's so velvety and rich.",
  },
]);

function parseReviewSegments(text) {
  const segments = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ bold: false, text: text.slice(lastIndex, match.index) });
    }
    segments.push({ bold: true, text: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ bold: false, text: text.slice(lastIndex) });
  }

  return segments;
}

const formattedReviews = computed(() =>
  reviews.value.map((item) => ({
    ...item,
    segments: parseReviewSegments(item.review),
  })),
);
</script>

<style scoped>
.reviews-section {
  position: relative;
  overflow: hidden;
  background-color: #f8f5ef;
  padding: 4rem 1rem 7.5rem;
}

.reviews-header {
  gap: 0.8rem;
}

.reviews-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reviews-header-icon svg {
  width: 1.8rem;
  height: 1.8rem;
}

.reviews-title {
  font-family: "Canva-Sunday", serif;
  font-weight: 700;
  letter-spacing: 0.12rem;
  font-size: 2.4rem;
  color: #3d0300;
  text-transform: uppercase;
}

.reviews-grid {
  margin-top: 5rem;
}

.review-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  min-height: 420px;
  padding: 5rem 2rem 2rem;
  border: 3px solid #ffffff;
  border-radius: 24px;
  background: #3d0300;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

.review-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 28px 50px rgba(0, 0, 0, 0.18);
}

.review-avatar-wrap {
  position: absolute;
  top: -65px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.review-avatar {
  width: 130px;
  height: 130px;
  padding: 6px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  animation: avatar-float 4.5s ease-in-out infinite;
}

.review-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

@keyframes avatar-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.review-name {
  margin-top: 0.5rem;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #faf9fc;
}

.review-stars {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  margin: 1rem 0;
}

.review-star {
  font-size: 1.2rem;
  color: #facc15;
  filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.8));
}

.review-text {
  margin-top: 1rem;
  margin-bottom: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.98rem;
  font-weight: 400;
  line-height: 1.8;
  color: #faf9fc;
}

.review-text-bold {
  font-weight: 700;
  color: #ffffff;
}

.reviews-footer-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'%3E%3Cpath d='M0 28 L14 0 L28 28 L42 0 L56 28' fill='none' stroke='%23000000' stroke-width='1.25' stroke-linejoin='miter'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-size: 56px 28px;
  background-position: bottom center;
}

@media (min-width: 768px) {
  .reviews-section {
    padding: 5rem 1.5rem 7.5rem;
  }

  .reviews-title {
    font-size: 3rem;
  }
}

@media (min-width: 992px) {
  .reviews-section {
    padding: 7rem 2rem 7.5rem;
  }

  .reviews-title {
    font-size: 4rem;
  }
}

@media (max-width: 767.98px) {
  .review-avatar {
    width: 100px;
    height: 100px;
  }

  .review-avatar-wrap {
    top: -50px;
  }

  .review-card {
    min-height: 380px;
    padding-top: 4.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-card,
  .review-avatar {
    transition: none;
    animation: none;
  }

  .review-card:hover {
    transform: none;
  }
}
</style>
