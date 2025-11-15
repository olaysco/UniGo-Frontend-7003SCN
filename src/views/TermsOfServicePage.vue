<template>
  <ion-page>
    <ion-content class="terms-page safe-area-scroll" :fullscreen="true">
      <header class="top-bar ion-padding">
        <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>
        <div class="title-stack">
          <p class="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
        </div>
        <span class="icon-button placeholder" aria-hidden="true"></span>
      </header>

      <section class="intro ion-padding">
        <p class="effective">Effective from: 18 March 2024</p>
        <p class="body">
          UniGo connects riders and drivers especially students in the West Midlands. These terms describe your rights
          and responsibilities when using the UniGo app.
        </p>
      </section>

      <main class="sections ion-padding">
        <article v-for="section in sections" :key="section.id" class="terms-section">
          <h2>{{ section.heading }}</h2>
          <p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p>

          <ul v-if="section.bulletPoints">
            <li v-for="(item, idx) in section.bulletPoints" :key="idx">{{ item }}</li>
          </ul>
        </article>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';

interface TermsSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

const sections: TermsSection[] = [
  {
    id: 'eligibility',
    heading: 'Eligibility & Accounts',
    paragraphs: [
      'You must be 18 or older to open an account. Provide accurate information when registering, and keep your login credentials secure.',
      'We may suspend or close your account if activity breaches these terms or local transport regulations.'
    ]
  },
  {
    id: 'rides',
    heading: 'Booking & Ride Conduct',
    paragraphs: [
      'Bookings are not confirmed until the driver accepts. Always meet at the agreed pickup point on time to avoid cancellation fees.',
      'Treat fellow riders with respect. Aggressive behaviour, discrimination, and damage to vehicles are prohibited.'
    ],
    bulletPoints: [
      'Drivers choose whether to accept a request.',
      'Late arrival beyond 10 minutes may be marked as a no-show.',
      'Report safety issues through the in-app support form or emergency contacts.'
    ]
  },
  {
    id: 'payments',
    heading: 'Payments & Fees',
    paragraphs: [
      'Fares are displayed before you confirm a ride. Depending on availability, you can pay via card, PayPal, or cash if enabled.',
      'Service fees help cover platform costs. In rare cases, adjustments may be applied after a ride if distance or duration differs significantly.'
    ]
  },
  {
    id: 'liability',
    heading: 'Liability',
    paragraphs: [
      'UniGo facilitates carpooling but does not own vehicles. Drivers are responsible for valid insurance and road-worthiness.',
      'To the extent permitted by law, UniGo is not liable for indirect or incidental damages arising from use of the service.'
    ]
  },
  {
    id: 'changes',
    heading: 'Changes & Contact',
    paragraphs: [
      'We may update these terms. We will notify you in-app or by email before material changes take effect.',
      'Questions? Email legal@unigo.com or visit the FAQ section for more details.'
    ]
  }
];

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.terms-page {
  --background: #f8f9fb;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-button {
  border: none;
  background: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.12);
}

.icon-button.placeholder {
  opacity: 0;
  box-shadow: none;
}

.title-stack {
  text-align: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #9aa2b5;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

h1 {
  font-size: 1.3rem;
  margin: 0;
  color: #111c2e;
}

.intro {
  background: #ffffff;
  margin: 0 20px;
  margin-top: 12px;
  border-radius: 24px;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
}

.intro .effective {
  font-weight: 600;
  color: #04a056;
  margin-bottom: 10px;
}

.intro .body {
  color: #5e677c;
  line-height: 1.6;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 12px;
}

.terms-section {
  background: #ffffff;
  border-radius: 22px;
  padding: 20px 22px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.terms-section h2 {
  margin: 0 0 12px;
  font-size: 1.1rem;
  color: #0e182a;
}

.terms-section p {
  margin: 0 0 12px;
  color: #5e677c;
  line-height: 1.6;
}

.terms-section ul {
  padding-left: 20px;
  margin: 0;
  color: #5e677c;
  line-height: 1.6;
}
</style>
