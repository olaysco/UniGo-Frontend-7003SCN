<template>
  <ion-page>
    <ion-content class="home-content" :fullscreen="true">
      <!-- <section class="px-5 py-10"> -->
        <div class="header-bar ion-padding">
          <div class="brand-mark">
            <div class="brand-icon">
              <ion-icon :icon="carSportOutline" aria-hidden="true" />
            </div>
            <p class="brand-name">UniGo</p>
          </div>

          <button class="profile-button" aria-label="Open profile">
            <ion-icon :icon="personCircleOutline" aria-hidden="true" />
          </button>
        </div>

        <div class="ion-padding">
          <section class="greeting-card">
          <p class="eyebrow">Good morning</p>
          <h1>{{ greeting }}</h1>
        </section>

        <section class="trips-section">
          <div class="section-head">
            <h2>Your Trips</h2>
          </div>

          <div class="trip-filter">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="filter-btn"
              :class="{ 'is-active': tab.id === activeTab }"
              type="button"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-if="filteredTrips.length" class="trip-list">
            <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
          </div>
          <div v-else class="empty-state">
            <p>No {{ activeTab }} trips yet. Start planning your next ride!</p>
          </div>
        </section>
        </div>

<ion-fab slot="fixed" vertical="bottom" horizontal="end" class="create-fab">
  <ion-fab-button color="secondary" aria-label="Create new trip" @click="openCreateTrip">
    <ion-icon :icon="add" aria-hidden="true" />
  </ion-fab-button>
</ion-fab>
      <!-- </section> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage } from '@ionic/vue';
import { add, carSportOutline, personCircleOutline } from 'ionicons/icons';
import TripCard, { TripCardData } from '@/components/TripCard.vue';

const userName = 'Alex';
const greeting = computed(() => `Good morning, ${userName}!`);

const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' }
] as const;
const activeTab = ref<typeof tabs[number]['id']>('active');

const router = useRouter();

const openCreateTrip = () => {
  router.push('/create-trip');
};

const trips = ref<TripCardData[]>([
  {
    id: 1,
    datetimeLabel: 'Today, 18:30',
    route: 'Coventry University to Leamington Spa',
    price: '£3.50',
    status: 'Confirmed',
    statusVariant: 'confirmed',
    passengers: [
      { id: 1, name: 'Emma Clarke', initials: 'EC', color: '#fdebd5' },
      { id: 2, name: 'Liam Patel', initials: 'LP', color: '#d9e8fb' }
    ],
    mapVariant: 'variant-a',
    state: 'active'
  },
  {
    id: 2,
    datetimeLabel: 'Tomorrow, 09:00',
    route: 'Warwick University to Birmingham',
    price: '£4.00',
    status: 'Pending',
    statusVariant: 'pending',
    passengers: [],
    seatsLabel: '1/3 Seats',
    mapVariant: 'variant-b',
    state: 'active'
  },
  {
    id: 3,
    datetimeLabel: 'Monday, 08:00',
    route: 'Coventry to London',
    price: '£12.00',
    status: 'Completed',
    statusVariant: 'completed',
    passengers: [],
    seatsLabel: 'Full ride',
    mapVariant: 'variant-a',
    state: 'past'
  }
]);

const filteredTrips = computed(() => trips.value.filter(trip => trip.state === activeTab.value));
</script>

<style scoped>
.home-content {
  --background: #f4f5f8;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(20, 186, 130, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-secondary);
  box-shadow: 0 10px 25px rgba(20, 186, 130, 0.15);
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #0c1220;
}

.profile-button {
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 15px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.12);
  color: #0f172a;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  color: #7c8499;
  margin-bottom: 6px;
}

.greeting-card h1 {
  /* font-size: 2.1rem; */
  line-height: 1.2;
  color: #0f172a;
  font-weight: 700;
}

.trips-section h2 {
  font-size: 1.2rem;
  color: #0f172a;
  margin-bottom: 12px;
}

.trip-filter {
  display: flex;
  gap: 0;
  background: #e2e5ec;
  border-radius: 18px;
  padding: 4px;
  margin-bottom: 16px;
}

.filter-btn {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 14px;
  padding: 10px 0;
  font-weight: 600;
  color: #7b8396;
}

.filter-btn.is-active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 12px 18px rgba(15, 23, 42, 0.12);
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8a91a5;
  font-weight: 500;
}

.create-fab {
  margin-bottom: 16px;
  margin-right: 8px;
}
</style>
