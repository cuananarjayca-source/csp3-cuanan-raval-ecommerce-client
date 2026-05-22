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
import AdminDashboardPage from "./pages/AdminDashboard.vue";
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
      path: '/admin/dashboard', 
      name: 'AdminDashboard',
      component: AdminDashboardPage 
    }
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