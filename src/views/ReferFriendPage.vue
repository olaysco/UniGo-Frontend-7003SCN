<template>
  <ion-page>
    <ion-content class="refer-page safe-area-scroll" :fullscreen="true">
      <header class="top-bar ion-padding-horizontal">
        <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>
        <h1>Refer a Friend</h1>
        <span class="icon-button placeholder" aria-hidden="true"></span>
      </header>

      <section class="refer-hero ion-padding-horizontal">
        <div class="hero-icon" aria-hidden="true">
          <ion-icon :icon="personAddOutline" />
        </div>
        <p class="hero-title">Refer a Friend &amp; Save!</p>
        <p class="hero-description">
          Invite your friends to join the carpooling community. You'll both get £5 off your next ride.
        </p>
      </section>

      <section class="code-card ion-padding-horizontal">
        <p class="code-label">Your unique referral code</p>
        <div class="code-row">
          <div class="code-icon" aria-hidden="true">
            <ion-icon :icon="shareSocialOutline" />
          </div>
          <p class="code-value" aria-live="polite">{{ referralCode }}</p>
          <button
            class="copy-button"
            type="button"
            :aria-label="`Copy referral code ${referralCode}`"
            @click="copyCode"
          >
            <ion-icon :icon="copyOutline" aria-hidden="true" />
            <span>Copy</span>
          </button>
        </div>
        <p v-if="helperMessage" class="helper-message">{{ helperMessage }}</p>
      </section>

      <section class="share-actions ion-padding-horizontal">
        <ion-button class="share-button" expand="block" shape="round" color="success" @click="shareReferral">
          Share Your Link
          <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
        </ion-button>
        <button class="terms-button" type="button" @click="openTerms">
          View terms &amp; conditions
        </button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  arrowForwardOutline,
  chevronBackOutline,
  copyOutline,
  personAddOutline,
  shareSocialOutline
} from 'ionicons/icons';

const router = useRouter();
const referralCode = 'SARAHJ24';
const helperMessage = ref('');
let helperTimeout: number | undefined;

const referralLink = `https://unigo.app/r/${referralCode}`;

const goBack = () => {
  router.back();
};

const showHelper = (message: string) => {
  helperMessage.value = message;
  if (helperTimeout) {
    window.clearTimeout(helperTimeout);
  }
  helperTimeout = window.setTimeout(() => {
    helperMessage.value = '';
  }, 3000);
};

const copyText = async (value: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

const copyCode = async () => {
  await copyText(referralCode);
  showHelper('Referral code copied');
};

const shareReferral = async () => {
  const shareData = {
    title: 'Coventry Carpool invite',
    text: 'Join me on Coventry Carpool and we both get £5 off our next ride!',
    url: referralLink
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData);
      showHelper('Share sheet opened');
      return;
    } catch {
      // User dismissed the share sheet; don't show an error
    }
  }

  await copyText(referralLink);
  showHelper('Link copied! Send it to your friends.');
};

const openTerms = () => {
  router.push('/tabs/terms-of-service');
};

onBeforeUnmount(() => {
  if (helperTimeout) {
    window.clearTimeout(helperTimeout);
  }
});
</script>

<style scoped>
.refer-page {
  --background: #f6f7fb;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 50px;
  padding-bottom: 12px;
}

.top-bar h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111c2a;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111c2a;
}

.icon-button.placeholder {
  opacity: 0;
  pointer-events: none;
}

.refer-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding-top: 20px;
}

.hero-icon {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: #def5eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a870;
}

.hero-icon ion-icon {
  font-size: 4.5rem;
}

.hero-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111c2a;
}

.hero-description {
  color: #6b738c;
  font-size: 1rem;
  max-width: 320px;
}

.code-card {
  margin-top: 32px;
}

.code-label {
  color: #78839c;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border-radius: 22px;
  padding: 16px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.code-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #e7faf1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a870;
}

.code-icon ion-icon {
  font-size: 1.5rem;
}

.code-value {
  flex: 1;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  color: #111c2a;
}

.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #03a46b;
  font-weight: 700;
}

.copy-button ion-icon {
  font-size: 1.1rem;
}

.helper-message {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #03a46b;
}

.share-actions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.share-button {
  --border-radius: 999px;
  font-weight: 700;
  font-size: 1.05rem;
  height: 56px;
}

.terms-button {
  border: none;
  background: transparent;
  color: #7b88a5;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
