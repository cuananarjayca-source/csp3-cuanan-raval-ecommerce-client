<script setup>
    import { watch, ref, onBeforeMount } from 'vue';
    import { Notyf } from 'notyf';
    import { useRouter } from 'vue-router';
    import { useGlobalStore } from '../stores/global.js';
    import { loginUser } from '../api.js';

    const email = ref("");
    const password = ref("");
    
    const isEnabled = ref(false);
    const isLoggingIn = ref(false);

    const notyf = new Notyf();
    const router = useRouter();
    const globalStore = useGlobalStore();

    watch([email, password], (currentValue) => {
        const allFilled = currentValue.every(input => input.trim() !== "");
        const emailValid = email.value.includes("@");

        if (allFilled && emailValid) {
            isEnabled.value = true;
        } else {
            isEnabled.value = false;
        }
    });

    async function handleSubmit() {
        if (!isEnabled.value) return;

        isLoggingIn.value = true;
        let loginSuccess = false;
        let token = null;

        try {
            // 1. Authenticate with the backend
            let response = await loginUser({
                email: email.value,
                password: password.value
            });

            if (response.status === 200) {
                token = response.data.access;
                localStorage.setItem("token", token);
                globalStore.user.token = token;
                
                notyf.success(response.data.message || "Logged in successfully!");
                loginSuccess = true;

                email.value = "";
                password.value = "";
            } else {
                notyf.error("Login Failed. Please check your credentials.");
            }
        } catch (e) {
            console.error("Authentication phase error:", e);
            const serverMessage = e.response?.data?.message;
            notyf.error(serverMessage || "Login Failed. Incorrect credentials.");
        }

        if (loginSuccess && token) {
            try {
                await globalStore.getUserDetails(token);
            } catch (profileError) {
                console.error("Profile hydration failed, proceeding with basic redirect:", profileError);
            }

            if (globalStore.user?.isAdmin) {
                router.push({ path: '/admin/dashboard' });
            } else {
                router.push({ path: '/' });
            }
        }

        isLoggingIn.value = false;
    }

    onBeforeMount(() => {
        if (globalStore.user?.token) {
            router.push({ path: '/' });
        }
    });
</script>

<template>
  <div class="auth-container">
    <form @submit.prevent="handleSubmit" class="login-form">
      
      <div class="form-group">
        <label>Email Address:</label>
        <input v-model="email" type="email" placeholder="Enter your email" required />
      </div>

      <div class="form-group">
        <label>Password:</label>
        <input v-model="password" type="password" placeholder="Enter your password" required />
      </div>

      <div class="button-panel">
        <button 
          type="submit" 
          :disabled="!isEnabled || isLoggingIn"
          class="submit-btn"
          :class="{ 'btn-primary': isEnabled, 'btn-danger': !isEnabled }"
        >
          <span v-if="isLoggingIn">Logging in...</span>
          <span v-else-if="!isEnabled">Please enter your login details</span>
          <span v-else>Login</span>
        </button>
      </div>
      
    </form>

    <div class="register-redirect">
      Don't have an account yet? <router-link to="/register">Click here</router-link> to register.
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: Arial, sans-serif;
}

.login-form {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  background: #fff;
  padding-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: #555;
}

.form-group input {
  padding: 0.6rem;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
}

.form-group input::placeholder {
  color: #b3b3b3;
}

.button-panel {
  background-color: #f7f7f7;
  padding: 1rem 1.5rem;
  border-top: 1px solid #ededed;
  margin-top: 1.5rem;
}

.submit-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  text-align: left;
  transition: all 0.2s ease;
}

.btn-danger {
  background-color: #ff6575;
  cursor: not-allowed;
  display: inline-block;
}

.btn-primary {
  background-color: #007bff;
  cursor: pointer;
  display: inline-block;
}
.btn-primary:hover {
  background-color: #0062cc;
}

.register-redirect {
  text-align: center;
  margin-top: 1.2rem;
  font-size: 0.88rem;
  color: #666;
}
.register-redirect a {
  color: #337ab7;
  text-decoration: none;
}
.register-redirect a:hover {
  text-decoration: underline;
}
</style>