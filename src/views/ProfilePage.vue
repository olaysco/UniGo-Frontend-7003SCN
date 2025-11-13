<template>
  <ion-page>
    <ion-content class="profile-page safe-area-scroll" :fullscreen="true">
      <header class="hero">
        <div class="avatar-shell" role="img" aria-label="Charlie Smith avatar">
          <img src="https://i.pravatar.cc/200?img=12" alt="Charlie Smith" />
        </div>
        <p class="hero-name">Charlie Smith</p>
        <div class="rating-chip">
          <ion-icon :icon="star" aria-hidden="true" />
          <span>{{ rating.toFixed(1) }}</span>
        </div>
      </header>

      <main class="sections">
        <section class="section">
          <p class="section-title">Personal</p>
          <ul class="option-card">
            <ProfileRow
              icon="personCircleOutline"
              label="Profile Details"
              @click="openOption('profile-details')"
            />
            <ProfileRow icon="locationOutline" label="Addresses" @click="openOption('addresses')" />
          </ul>
        </section>

        <section class="section">
          <p class="section-title">Services</p>
          <ul class="option-card">
            <ProfileRow icon="cardOutline" label="Wallet" @click="openOption('wallet')" />
            <ProfileRow icon="giftOutline" label="Referrals" @click="openOption('referrals')" />
          </ul>
        </section>

        <section class="section">
          <p class="section-title">Support</p>
          <ul class="option-card">
            <ProfileRow icon="cardOutline" label="FAQ & Help" @click="openOption('faq')" />
            <ProfileRow icon="giftOutline" label="Terms of Service" @click="openOption('terms-of-service')" />
          </ul>
        </section>

        <section>
          <button class="logout-row" type="button" @click="logout">
            <ion-icon :icon="logOutOutline" aria-hidden="true" />
            <span>Logout</span>
            <ion-icon :icon="chevronForward" aria-hidden="true" class="chevron" />
          </button>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { chevronForward, logOutOutline, star } from 'ionicons/icons';
import ProfileRow from '@/components/ProfileRow.vue';
import router from '@/router';

const rating = 5.0;

const openOption = (key: string) => {
  console.log(`/tabs/${key}`)
  router.push(`/tabs/${key}`);
};

const logout = () => {
  console.info('Logout tapped');
};
</script>

<style scoped>
.profile-page {
  --background: #f6f7fb;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44px 24px 24px;
  text-align: center;
}

.hero h1 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #111c2a;
}

.avatar-shell {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(180deg, #fde8d3, #f7f2eb);
  padding: 6px;
  box-shadow: 0 25px 35px rgba(15, 23, 42, 0.12);
  margin-bottom: 16px;
}

.avatar-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.hero-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111c2a;
  margin-bottom: 10px;
}

.rating-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  background: #fff4da;
  color: #e4941c;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(228, 148, 28, 0.25);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 20px 40px;
}

.section-title {
  color: #7c869f;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin-bottom: 12px;
}

.option-card {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.logout-row {
  width: 100%;
  border: none;
  background: #ffffff;
  border-radius: 28px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #e7473c;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(231, 71, 60, 0.15);
}

.logout-row .chevron {
  color: rgba(17, 28, 42, 0.35);
}
</style>
