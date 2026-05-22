<script setup>
import { watch, ref, onBeforeMount } from "vue";
import { Notyf } from "notyf";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global.js";
import { loginUser } from "../api.js";

const email = ref("");
const password = ref("");
const isEnabled = ref(false);
const isLoggingIn = ref(false);

const notyf = new Notyf();
const router = useRouter();
const globalStore = useGlobalStore();

watch([email, password], () => {
    isEnabled.value = email.value.trim() !== "" && password.value.trim() !== "" && email.value.includes("@");
});

async function handleSubmit() {
    if (!isEnabled.value) return;
    isLoggingIn.value = true;
    try {
        const response = await loginUser({ email: email.value, password: password.value });
        if (response.status === 200) {
            const token = response.data.access;
            localStorage.setItem("token", token);
            globalStore.user.token = token;
            notyf.success(response.data.message || "Logged in successfully!");
            await globalStore.getUserDetails(token);
            router.push(globalStore.user?.isAdmin ? "/admin/dashboard" : "/");
        }
    } catch (e) {
        notyf.error(e.response?.data?.message || "Login failed.");
    } finally {
        isLoggingIn.value = false;
    }
}

onBeforeMount(() => {
    if (globalStore.user?.token) router.push("/");
});
</script>

<template>
    <div class="container py-4" style="max-width: 420px">
        <h1 class="h3 mb-3">Login</h1>
        <form @submit.prevent="handleSubmit">
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="!isEnabled || isLoggingIn">
                {{ isLoggingIn ? "Logging in..." : "Login" }}
            </button>
        </form>
        <p class="mt-3 small">
            No account? <router-link to="/register">Register</router-link>
        </p>
    </div>
</template>
