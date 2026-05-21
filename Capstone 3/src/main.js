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
import ProductCatalogPage from "./pages/ProductCatalog.vue";
import ProductDetailPage from "./pages/ProductDetail.vue";
import RegisterPage from "./pages/Register.vue";



import { createRouter, createWebHistory } from 'vue-router';

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
  }
],
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');