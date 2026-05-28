import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'notyf/notyf.min.css';
import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import HomePage from "./pages/Home.vue";
import LoginPage from "./pages/Login.vue";
import LogoutPage from "./pages/Logout.vue";
import ProductCatalogPage from "./pages/ProductCatalog.vue";
import ProductDetailPage from "./pages/ProductDetail.vue";
import RegisterPage from "./pages/Register.vue";
import CartPage from "./pages/CartPage.vue";
import AdminOrdersView from './pages/AdminOrderView.vue';
import AdminStockPage from "./pages/AdminStockPage.vue";
import AdminPaymentPage from './pages/AdminPaymentPage.vue';
import AdminCustomerPage from './pages/AdminCustomerPage.vue';
import AdminReviewPage from './pages/AdminReviewPage.vue';
import CheckoutPage from "./pages/CheckoutPage.vue";
import MyOrdersPage from "./pages/MyOrdersPage.vue";
import OrderDetailPage from "./pages/OrderDetailPage.vue"
import PaymentPage from "./pages/PaymentPage.vue";
import MyPaymentsPage from "./pages/MyPaymentsPage.vue";
import { createRouter, createWebHistory } from 'vue-router';
import { useGlobalStore } from './stores/global';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'Home',
      component: HomePage 
    },
    { 
      path: '/login', 
      name: 'Login',
      component: LoginPage 
    },
    { 
      path: '/logout', 
      name: 'Logout',
      component: LogoutPage 
    },
    { 
      path: '/register', 
      name: 'Register',
      component: RegisterPage 
    },
    { 
      path: '/products', 
      name: 'Products',
      component: ProductCatalogPage 
    },
    { 
      path: '/products/:id', 
      component: ProductDetailPage,
      props: true 
    },
    { 
      path: '/cart', 
      name: 'Cart',
      component: CartPage 
    },
    {
      path: '/admin/orders',
      name: 'AdminOrders',
      component: AdminOrdersView
    },
    {
      path: '/admin/stock',
      name: 'AdminStock',
      component: AdminStockPage
    },
    {
      path: '/admin/payments',
      name: 'AdminPayments',
      component: AdminPaymentPage
    },
    {
      path: '/admin/customers',
      name: 'AdminCustomer',
      component: AdminCustomerPage
    },
    {
      path: '/admin/reviews',
      name: 'AdminReview',
      component: AdminReviewPage
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: CheckoutPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'MyOrders',
      component: MyOrdersPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/:id',
      name: 'OrderDetail',
      component: OrderDetailPage,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment/:orderId',
      name: 'Payment',
      component: PaymentPage,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-payments',
      name: 'MyPayments',
      component: MyPaymentsPage,
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.name === 'AdminDashboard') {
    const token = localStorage.getItem('token');

    // No token at all — send to login
    if (!token) return next('/login');

    const store = useGlobalStore();

    // Re-hydrate store if needed (e.g. after page refresh)
    if (!store.user.email) {
      await store.getUserDetails(token);
    }

    // Token exists but user is not an admin
    if (!store.user.isAdmin) return next('/login');
  }

  next();
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');