<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import { useGlobalStore } from "../stores/global.js";

const router = useRouter();
const globalStore = useGlobalStore();
const notyf = new Notyf();

onMounted(() => {
    localStorage.removeItem("token");
    globalStore.user.token = null;
    globalStore.user.email = null;
    globalStore.user.isAdmin = false;

    notyf.success("You have been logged out.");
    router.replace({ path: "/login" });
});
</script>

<template>
    <div class="container py-5 text-center text-muted">
        <p class="mb-0">Signing you out…</p>
    </div>
</template>
