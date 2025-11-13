<template>
  <ion-page>
    <ion-content :fullscreen="true" class="register-content safe-area-scroll">
      <div class="min-h-screen w-full bg-[#f5f6f8] ion-padding">
        <div class="mx-auto w-full max-w-md">
          <header class="mb-10 flex items-center gap-3">
            <BrandMark />
          </header>

          <section class="rounded-3xl bg-white px-6 py-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div class="mb-6 space-y-3">
              <p class="text-2xl font-semibold text-slate-900">Create an Account</p>
              <p class="text-base text-slate-500">I am a...</p>

              <div class="role-toggle">
                <button
                  type="button"
                  :class="['role-option', role === 'owner' ? 'active' : 'inactive']"
                  @click="() => (role = 'owner')"
                >
                  Car Owner
                </button>
                <button
                  type="button"
                  :class="['role-option', role === 'rider' ? 'active' : 'inactive']"
                  @click="() => (role = 'rider')"
                >
                  Co-Rider
                </button>
              </div>
            </div>

            <form class="space-y-5">
              <div class="form-field">
                <label for="fullName">Full Name</label>
                <div class="input-shell">
                  <ion-input
                    id="fullName"
                    v-model="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    autocomplete="name"
                    class="text-input"
                    clear-input
                  />
                </div>
              </div>

              <div class="form-field">
                <label for="email">Email Address</label>
                <div class="input-shell" :class="{ success: emailValid }">
                  <ion-input
                    id="email"
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
                <label for="password">Password</label>
                <div class="input-shell">
                  <ion-input
                    :type="passwordVisible ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    placeholder="Enter your password"
                    autocomplete="new-password"
                    class="text-input"
                  />
                  <button type="button" class="icon-button" @click="togglePassword">
                    <ion-icon :icon="passwordVisible ? eye : eyeOff" />
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label for="phone">Phone Number</label>
                <div class="input-shell" :class="{ error: !isPhoneValid }">
                  <ion-input
                    id="phone"
                    v-model="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    autocomplete="tel"
                    inputmode="tel"
                    class="text-input"
                    @ion-input="phoneTouched = true"
                  />
                </div>
                <p v-if="phoneTouched && !isPhoneValid" class="error-text">
                  Please enter a valid phone number.
                </p>
              </div>

              <p class="text-center text-sm text-slate-500">
                By registering, you agree to our
                <button type="button" class="text-emerald-600 font-medium">Terms of Service</button>.
              </p>

              <ion-button expand="block" class="register-btn h-14 text-white">
                Register
              </ion-button>

              <p class="text-center text-base text-slate-500">
                Already have an account?
                <router-link to="/login" class="text-emerald-600 font-semibold">Sign In</router-link>
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
import { car, checkmarkCircle, eye, eyeOff } from 'ionicons/icons';

const role = ref<'owner' | 'rider'>('owner');
const fullName = ref('');
const email = ref('user@example.com');
const password = ref('');
const passwordVisible = ref(false);
const phone = ref('');
const phoneTouched = ref(true);

const emailValid = computed(() => /.+@.+\..+/.test(email.value));
const isPhoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 10);

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};
</script>

<style scoped>
.register-content {
  --background: #f5f6f8;
}

section {
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.role-toggle {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: 20px;
  background: #e7eaf1;
}

.role-option {
  flex: 1;
  height: 50px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  transition: 0.2s ease;
}

.role-option.active {
  background: #ffffff;
  color: #0e9f6e;
  box-shadow: 0 12px 30px rgba(14, 159, 110, 0.18);
}

.form-field label {
  display: block;
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
}

.error-text {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #e14444;
}

.register-btn {
  --background: #1fb16a;
  --background-activated: #199457;
  --padding-start: 18px;
  --padding-end: 18px;
  --box-shadow: 0 30px 45px rgba(19, 139, 86, 0.25);
  font-weight: 600;
}

button {
  cursor: pointer;
}
</style>
