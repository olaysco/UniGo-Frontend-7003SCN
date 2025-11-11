<template>
  <ion-page>
    <ion-content :fullscreen="true" class="onboarding-content">
      <div class="relative flex min-h-screen flex-col overflow-hidden">
        <div class="absolute inset-0">
          <img
            src="/school-bg.jpg"
            alt="City buildings with sunlit walkway"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-white/80 to-white"
          ></div>
        </div>

        <div class="relative z-10 flex flex-1 flex-col px-6 pt-16 pb-12 text-center">
          <div class="mx-auto mb-10 flex w-full max-w-sm flex-col items-center">
            <div
              class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-emerald-900/15"
            >
              <img src="/logoshort.png" alt="Uni Go Logo" class="h-16" />
            </div>

            <span class="font-display text-4xl font-extrabold text-slate-900">
              UniGo
            </span>
            <p class="text-lg text-slate-500">
              Smarter travel, together.
            </p>
          </div>

          <div class="flex w-full flex-col gap-4">
            <ion-button expand="block" class="register-btn h-14" router-link="/register">
              Register
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              class="login-btn h-14"
              router-link="/login"
            >
              Log In
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonPage } from '@ionic/vue';
</script>

<style scoped>
.onboarding-content {
  --background: transparent;
}

ion-content::part(scroll) {
  padding-top: 0;
}

.register-btn {
  --background: #1fb16a;
  --background-activated: #199457;
  --padding-start: 18px;
  --padding-end: 18px;
  --box-shadow: 0 25px 35px rgba(19, 139, 86, 0.25);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #fff;
}

.login-btn {
  --background: #fff;
  --border-color: transparent;
  --color: #111318;
  --padding-start: 18px;
  --padding-end: 18px;
  --box-shadow: 0 18px 40px rgba(15, 24, 40, 0.12);
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
