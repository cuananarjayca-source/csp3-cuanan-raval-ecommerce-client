<script setup>
    import { watch, ref, onBeforeMount } from 'vue';
    import { Notyf } from 'notyf';
    import { useRouter } from 'vue-router';
    import { useGlobalStore } from '../stores/global.js';
    import { registerUser } from '../api.js'; 

    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const mobileNo = ref("");
    const password = ref("");
    const confirmPass = ref("");
    
    const isEnabled = ref(false);
    const isRegistering = ref(false);

    const notyf = new Notyf();
    const router = useRouter();
    const globalStore = useGlobalStore();

    watch([firstName, lastName, email, mobileNo, password, confirmPass], (currentValue) => {
        const allFilled = currentValue.every(input => input.trim() !== "");
        const mobileValid = mobileNo.value.length === 11;
        const passwordValid = password.value.length >= 8;
        const passwordsMatch = password.value === confirmPass.value;

        if (allFilled && mobileValid && passwordValid && passwordsMatch) {
            isEnabled.value = true;
        } else {
            isEnabled.value = false;
        }
    });

    async function handleSubmit() {
        if (!isEnabled.value) return;

        isRegistering.value = true;
        try {
            let response = await registerUser({
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                mobileNo: mobileNo.value,
                password: password.value
            });

            if (response.status === 201) {
                notyf.success(response.data.message || "Registered successfully!");

                firstName.value = "";
                lastName.value = "";
                email.value = "";
                mobileNo.value = "";
                password.value = "";
                confirmPass.value = "";

                router.push({ path: '/login' });
            } else {
                notyf.error("Registration Failed. Please contact administrator.");
            }
        } catch (e) {
            console.error(e);
            const serverMessage = e.response?.data?.message;
            notyf.error(serverMessage || "Registration Failed. Please contact administrator.");
        } finally {
            isRegistering.value = false;
        }
    }

    onBeforeMount(() => {
        if (globalStore.user?.token) {
            router.push({ path: '/' });
        }
    });
</script>

<template>
    <div class="container py-4" style="max-width: 480px">
        <h1 class="h3 mb-3">Register</h1>
        <form @submit.prevent="handleSubmit">
            <div class="mb-3">
                <label class="form-label">First name</label>
                <input v-model="firstName" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Last name</label>
                <input v-model="lastName" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Mobile (11 digits)</label>
                <input v-model="mobileNo" type="text" maxlength="11" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
                <label class="form-label">Confirm password</label>
                <input v-model="confirmPass" type="password" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="!isEnabled || isRegistering">
                {{ isRegistering ? "Registering..." : "Register" }}
            </button>
        </form>
        <p class="mt-3 small">
            Have an account? <router-link to="/login">Login</router-link>
        </p>
    </div>
</template>