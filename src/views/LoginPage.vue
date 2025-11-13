<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content safe-area-scroll">
      <div class="min-h-screen w-full bg-[#f5f6f8] ion-padding">
        <div class="mx-auto w-full max-w-md">
          <header class="mb-10 flex items-center gap-3">
            <BrandMark />
          </header>

          <section class="rounded-3xl bg-white px-6 py-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div class="mb-6 space-y-2">
              <p class="text-2xl font-semibold text-slate-900">Welcome back!</p>
              <p class="text-base text-slate-500">Sign in to continue your journey.</p>
            </div>

            <form class="space-y-5">
              <div class="form-field">
                <label for="login-email">Email Address</label>
                <div class="input-shell" :class="{ success: emailValid }">
                  <ion-input
                    id="login-email"
                    v-model="email"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                    inputmode="email"
                    class="text-input"
                  />
                  <ion-icon v-if="emailValid" :icon="checkmarkCircle" class="text-emerald-500" />
                </div>
              </div>

              <div class="form-field">
                <label for="login-password">Password</label>
                <div class="input-shell" :class="{ error: passwordTouched && !isPasswordValid }">
                  <ion-input
                    :type="passwordVisible ? 'text' : 'password'"
                    id="login-password"
                    v-model="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    class="text-input"
                    @ion-input="passwordTouched = true"
                  />
                  <button type="button" class="icon-button" @click="togglePassword">
                    <ion-icon :icon="passwordVisible ? eye : eyeOff" />
                  </button>
                </div>
                <p v-if="passwordTouched && !isPasswordValid" class="error-text">
                  Password must be at least 8 characters.
                </p>
              </div>

              <div class="text-right">
                <button type="button" class="text-sm font-semibold text-emerald-600">Forgot password?</button>
              </div>

              <ion-button expand="block" class="login-btn h-14 text-white" @click="handleLogin">
                Log In
              </ion-button>

              <div class="or-divider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>

              <div class="social-buttons">
                <button type="button" class="social-btn text-slate-700">
                  <img src="/google-icon.svg" alt="Google logo" />
                  Continue with Google
                </button>
                <button type="button" class="social-btn text-slate-700">
                  <img src="/apple-icon.svg" alt="Apple logo" />
                  Continue with Apple
                </button>
              </div>

              <p class="text-center text-base text-slate-500">
                New to UniGo?
                <router-link to="/register" class="text-emerald-600 font-semibold">
                  Create an account
                </router-link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BrandMark from '@/components/BrandMark.vue';
import { IonButton, IonContent, IonIcon, IonInput, IonPage } from '@ionic/vue';
import { checkmarkCircle, eye, eyeOff } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const passwordVisible = ref(false);
const passwordTouched = ref(false);
const router = useRouter();

const emailValid = computed(() => /.+@.+\..+/.test(email.value));
const isPasswordValid = computed(() => password.value.length >= 8);

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handleLogin = () => {
  router.push('/tabs/home');
};
</script>

<style scoped>
.login-content {
  --background: #f5f6f8;
}

section {
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #101828;
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-radius: 18px;
  background: #fff;
  border: 1.5px solid #dbe0e9;
  height: 58px;
}

.input-shell:focus-within {
  border-color: #1fb16a;
  box-shadow: 0 0 0 1px rgba(31, 177, 106, 0.2);
}

.text-input {
  flex: 1;
  font-size: 1rem;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: transparent;
  --color: #0f172a;
  --placeholder-color: #b2b9c7;
}

.input-shell.success {
  border-color: #33b36f;
  box-shadow: 0 0 0 1px rgba(51, 179, 111, 0.25);
}

.input-shell.error {
  border-color: #f25b5b;
  box-shadow: 0 0 0 1px rgba(242, 91, 91, 0.2);
}

.icon-button {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

.error-text {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #e14444;
}

.login-btn {
  --background: #1fb16a;
  --background-activated: #199457;
  --padding-start: 18px;
  --padding-end: 18px;
  --box-shadow: 0 30px 45px rgba(19, 139, 86, 0.25);
  font-weight: 600;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b0b7c4;
  font-weight: 600;
}

.or-divider span {
  flex: 1;
  height: 1px;
  background: #dbe0e9;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1.5px solid #dbe0e9;
  border-radius: 18px;
  padding: 12px;
  background: #fff;
  font-weight: 600;
  font-size: 1rem;
}

.social-btn img {
  width: 24px;
  height: 24px;
}

button {
  cursor: pointer;
}
</style>
