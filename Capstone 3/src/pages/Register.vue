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
  <div class="auth-container">
    <form @submit.prevent="handleSubmit" class="register-form">
      
      <div class="form-group">
        <label>First Name:</label>
        <input v-model="firstName" type="text" placeholder="Enter your First Name" required />
      </div>

      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="lastName" type="text" placeholder="Enter your Last Name" required />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input v-model="email" type="email" placeholder="Enter your email" required />
      </div>

      <div class="form-group">
        <label>Mobile Number:</label>
        <input 
          v-model="mobileNo" 
          type="text" 
          maxlength="11" 
          placeholder="Enter your 11 digit mobile number" 
          required 
        />
      </div>

      <div class="form-group">
        <label>Password:</label>
        <input v-model="password" type="password" placeholder="Enter your password" required />
      </div>

      <div class="form-group">
        <label>Verify Password:</label>
        <input v-model="confirmPass" type="password" placeholder="Verify your password" required />
      </div>

      <div class="button-panel">
        <button 
          type="submit" 
          :disabled="!isEnabled || isRegistering"
          class="submit-btn"
          :class="{ 'btn-primary': isEnabled, 'btn-danger': !isEnabled }"
        >
          <span v-if="isRegistering">Registering...</span>
          <span v-else-if="!isEnabled">Please enter your registration details</span>
          <span v-else>Register</span>
        </button>
      </div>
      
    </form>

    <div class="login-redirect">
      Already have an account? <router-link to="/login">Click here</router-link> to log in.
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: Arial, sans-serif;
}

.register-form {
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

.login-redirect {
  text-align: center;
  margin-top: 1.2rem;
  font-size: 0.88rem;
  color: #666;
}
.login-redirect a {
  color: #337ab7;
  text-decoration: none;
}
.login-redirect a:hover {
  text-decoration: underline;
}
</style>