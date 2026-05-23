<template>
    <footer class="site-footer">
        <div class="footer-container">
            <!-- Brand Column -->
            <div class="footer-col brand-col">
                <h3 class="brand-tagline">TASTE IS BETTER</h3>
                <img src="../assets/images/taro-logo.png" alt="Taro 606 Logo" class="footer-logo" />
            </div>

            <!-- Address Column -->
            <div class="footer-col">
                <h5>Address</h5>
                <p>3483 Jessie Street<br />Newark, OH 43055<br />740-670-7242</p>
            </div>

            <!-- Links Column -->
            <div class="footer-col">
                <h5>Quick Links</h5>
                <ul>
                    <li><RouterLink to="/">Home</RouterLink></li>
                    <li><RouterLink to="/products">Products</RouterLink></li>
                    <li><RouterLink to="/policies">Policies</RouterLink></li>
                    <li><RouterLink to="/faq">Frequently Asked Questions</RouterLink></li>
                </ul>
            </div>

            <!-- About Column -->
            <div class="footer-col">
                <h5>About us</h5>
                <ul>
                    <li><RouterLink to="/blog">Blog Posts</RouterLink></li>
                    <li><RouterLink to="/careers">Careers</RouterLink></li>
                    <li><RouterLink to="/deals">Flash Deals</RouterLink></li>
                </ul>
            </div>

            <!-- Social/QR Column -->
            <div class="footer-col qr-col">
                <h5>Follow Us!</h5>
                <div class="social-icons">
                    <i class="bi bi-linkedin"></i>
                    <i class="bi bi-facebook"></i>
                    <i class="bi bi-twitter-x"></i>
                    <i class="bi bi-instagram"></i>
                    <i class="bi bi-tiktok"></i>
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

<style scoped>
.site-footer {
    background: #dcd7d4; 
    color: #3d0300;
    padding: 2.5rem 2rem 1rem;
    font-family: 'Inter', sans-serif;
}

.footer-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* Typography & Spacing adjustments */
.brand-tagline {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
    color: #3d0300;
}

.footer-col h5 {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
}

.footer-col p, .footer-col a {
    font-size: 0.8rem;
    line-height: 1.4;
}

.footer-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-col ul li { margin-bottom: 0.3rem; }

.footer-col a {
    color: #3d0300;
    text-decoration: none;
}

.footer-logo { 
    width: 90px; /* Made significantly smaller to match image_dbcac3.png */
}

/* Social & QR */
.social-icons {
    display: flex;
    gap: 0.6rem;
    font-size: 1rem;
    margin-bottom: 0.4rem;
}

.scan-text { font-size: 0.75rem; font-weight: 600; margin: 0.3rem 0; }
.qr-code { width: 70px; border: 1px solid #3d0300; }

.footer-bottom {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.75rem;
    padding-top: 0.8rem;
}

/* Responsive */
@media (max-width: 992px) {
    .footer-container { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 576px) {
    .footer-container { grid-template-columns: 1fr; text-align: center; }
}
</style>