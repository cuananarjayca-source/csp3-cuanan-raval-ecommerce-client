<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "../stores/global.js";

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const isAuthenticated = computed(() => Boolean(user.value?.token));

onMounted(() => {
    const token = localStorage.getItem("token");
    if (token && !user.value?.email) {
        globalStore.getUserDetails(token);
    }
});
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <RouterLink class="navbar-brand" to="/">Taro606</RouterLink>
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mainNav"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div id="mainNav" class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/">Home</RouterLink>
                    </li >
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="/products">Products</RouterLink>
                    </li>
                    <template v-if="!isAuthenticated">
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/login">Login</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/register">Register</RouterLink>
                        </li>
                    </template>
                    <template v-else>
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/logout">Logout</RouterLink>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </nav>
</template>