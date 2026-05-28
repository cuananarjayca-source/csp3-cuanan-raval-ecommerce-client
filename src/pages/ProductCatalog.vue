<script setup>
import { computed } from 'vue';
import { useGlobalStore } from '../stores/global';
import AdminProductView from './AdminProductView.vue';
import UserProductView from './UserProductView.vue';

const store = useGlobalStore();
const isAdmin = computed(() => store.user.isAdmin);
</script>

<template>
    <AdminProductView v-if="isAdmin" />
    <UserProductView v-else />
</template>