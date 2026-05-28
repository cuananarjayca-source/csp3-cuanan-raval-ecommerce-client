<template>
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-col brand-col">
                <h3 class="brand-tagline">TASTE IS BETTER</h3>
                <img src="../assets/images/taro-logo.png" alt="Taro 606 Logo" class="footer-logo" />
            </div>

            <div class="footer-col">
                <h5>Address</h5>
                <p>3483 Jessie Street<br />Newark, OH 43055<br />740-670-7242</p>
            </div>

            <div class="footer-col">
                <h5>Quick Links</h5>
                <ul>
                    <li><RouterLink to="/">Home</RouterLink></li>
                    <li><RouterLink to="/products">Products</RouterLink></li>
                    <li><RouterLink to="/#contact-us">Policies</RouterLink></li>
                    <li><RouterLink to="/#contact-us">Frequently Asked Questions</RouterLink></li>
                </ul>
            </div>

            <div class="footer-col">
                <h5>About us</h5>
                <ul>
                    <li><RouterLink to="/products">Blog Posts</RouterLink></li>
                    <li><RouterLink to="/products">Careers</RouterLink></li>
                    <li><RouterLink to="/products">Flash Deals</RouterLink></li>
                </ul>
            </div>

            <div class="footer-col qr-col">
                <h5>Follow Us!</h5>
                <div class="social-icons">
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <i class="bi bi-linkedin"></i>
                    </a>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <i class="bi bi-facebook"></i>
                    </a>
                    <a href="https://www.x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter X">
                        <i class="bi bi-twitter-x"></i>
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <i class="bi bi-instagram"></i>
                    </a>
                    <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <i class="bi bi-tiktok"></i>
                    </a>
                </div>
                <p class="scan-text">Scan Me!</p>
                <img src="../assets/images/taro-qr.png" alt="Taro QR Code" class="qr-code" />
            </div>
        </div>

        <div class="footer-bottom">
            &copy; 2026 TARO606. All Rights Reserved.
        </div>
    </footer>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.site-footer {
    background: #dcd7d4; 
    color: #3d0300;
    padding: 2.5rem 1.5rem 1rem;
    font-family: 'Inter', sans-serif;
}

.footer-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* Brand Column Alignment Base */
.brand-col {
    display: flex;
    flex-direction: column;
    align-items: center;    
    text-align: center;
}

.brand-tagline {
    font-family: 'Canva-Sunday', sans-serif;
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
    color: #3d0300;
}

/* Typography & General Spacing */
.footer-col h5 {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
}

.footer-col p {
    font-size: 0.85rem;
    line-height: 1.4;
}

.footer-col a {
    font-size: 0.85rem;
    line-height: 1.4;
    color: #3d0300;
    text-decoration: none;
    display: inline-block;
    transition: all 0.25s ease-in-out;
}

.footer-col a:hover {
    color: #ee807b;
    transform: translateX(3px);
}

.footer-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-col ul li { margin-bottom: 0.4rem; }

.footer-logo { 
    width: auto;
    height: 220px; 
    display: block;
    margin: 0 auto;         
    position: relative; 
    z-index: 1;
}

/* Social & QR Wrapper Base */
.qr-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.social-icons {
    display: flex;
    gap: 0.8rem;
    font-size: 1.2rem;
    margin-bottom: 0.4rem;
}

/* Target the anchor icons cleanly inside the social container wrapper */
.social-icons a {
    color: inherit;
    text-decoration: none;
    display: inline-flex;
}

.social-icons i {
    color: #3d0300;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-icons a:hover i {
    color: #ee807b;
    transform: translateY(-4px) scale(1.15);
}

.scan-text { font-size: 0.75rem; font-weight: 600; margin: 0.3rem 0; }
.qr-code { width: 250px; height: auto; display: block; margin-left: -60px; }

.footer-bottom {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.75rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(61, 3, 0, 0.1);
}

/* ==========================================================================
   FIXED RESPONSIVE BREAKPOINTS (BUMPED UP FOR EARLY STACKING)
   ========================================================================== */

@media (max-width: 1024px) {
    .footer-container { 
        grid-template-columns: repeat(3, 1fr); 
        gap: 2.5rem 1.5rem;
    }
}

@media (max-width: 768px) {
    .footer-container { 
        grid-template-columns: 1fr; 
        text-align: center; 
        gap: 2.5rem;
    }

    .footer-col {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .footer-col a:hover {
        transform: scale(1.05);
    }

    .social-icons {
        justify-content: center;
        width: 100%;
        margin-bottom: 0.8rem;
    }

    .footer-logo {
        margin-bottom: 1rem;
        height: 200px; 
    }
    
    .qr-code {
        margin: 0 auto;
    }
}
</style>