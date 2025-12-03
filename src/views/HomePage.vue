<template>
  <ion-page>
    <ion-content class="home-content safe-area-scroll" :fullscreen="true">
      <div class="header-bar ion-padding">
        <BrandMark />

        <button class="profile-button" aria-label="Open profile" @click="openProfile">
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
            <button v-for="tab in tabs" :key="tab.id" class="filter-btn" :class="{ 'is-active': tab.id === activeTab }"
              type="button" @click="activeTab = tab.id">
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
    </ion-content>
    <ion-toast
      :is-open="toastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2500"
      @didDismiss="closeToast"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage, IonToast } from '@ionic/vue';
import { add, personCircleOutline } from 'ionicons/icons';
import BrandMark from '@/components/BrandMark.vue';
import TripCard, { RoleOption, TripCardData, TripStatus } from '@/components/TripCard.vue';
import { useUserStore } from '@/stores/userStore';
import { useTripStore } from '@/stores/tripStore';
import { storeToRefs } from 'pinia';
import { useToast } from '@/composables/useToast';
import type { Trip } from '@/services/tripService';

const userStore = useUserStore();
const userFirstName = computed(() => {
  const sourceName = userStore.profile?.name || userStore.session?.user?.name;
  if (!sourceName) {
    return 'there';
  }

  const [first] = sourceName.trim().split(/\s+/);
  return first || 'there';
});
const greeting = computed(() => `Good morning, ${userFirstName.value}!`);

const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' }
] as const;
const activeTab = ref<typeof tabs[number]['id']>('active');

const router = useRouter();

const openCreateTrip = () => {
  router.push('/create-trip');
};

const openProfile = () => {
  router.push('/tabs/profile');
};

const tripStore = useTripStore();
const { trips } = storeToRefs(tripStore);
const { toastMessage, toastColor, toastOpen, showToast, closeToast } = useToast('danger');

const currentUserId = computed(() => userStore.session?.user?.id ?? userStore.profile?.id ?? null);

const statusVariantMap: Record<TripStatus, TripCardData['statusVariant']> = {
  pending: 'pending',
  confirmed: 'confirmed',
  past: 'completed',
  active: 'active',
  upcoming: 'upcoming'
};

const normalizeStatus = (status: Trip['status']): TripStatus => {
  const value = String(status ?? '').toLowerCase();
  if (value.includes('pending')) return 'pending';
  if (value.includes('confirm')) return 'confirmed';
  if (value.includes('past') || value.includes('complete')) return 'past';
  if (value.includes('upcoming')) return 'upcoming';
  return 'active';
};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPrice = (amount: number) => `£${(Number.isFinite(amount) ? amount : Number(amount) || 0).toFixed(2)}`;

const mapTripToCard = (trip: Trip, index: number): TripCardData => {
  const status = normalizeStatus(trip.status);
  const departureDate = new Date(trip.departureTime);
  const isPast = status === 'past' || departureDate.getTime() < Date.now();
  const role: RoleOption = currentUserId.value && trip.userId !== null && trip.userId !== undefined &&
    String(trip.userId) === String(currentUserId.value)
    ? 'carOwner'
    : 'coRider';

  const origin = trip.departureLocation || 'Pickup TBD';
  const destination = trip.arrivalLocation || 'Destination TBD';

  return {
    id: typeof trip.id === 'string' ? Number(trip.id) || trip.id : trip.id,
    datetimeLabel: formatDateLabel(trip.departureTime),
    route: `${origin} to ${destination}`,
    price: formatPrice(trip.price),
    status,
    statusVariant: statusVariantMap[status] ?? 'active',
    passengers: [],
    seatsLabel: trip.availability ? `${trip.availability} seats available` : undefined,
    mapVariant: index % 2 === 0 ? 'variant-a' : 'variant-b',
    state: isPast ? 'past' : 'active',
    role
  };
};

const tripCards = computed(() => trips.value.map(mapTripToCard));
const filteredTrips = computed(() => tripCards.value.filter(trip => trip.state === activeTab.value));

const ensureTripsLoaded = async () => {
  if (tripStore.loaded || tripStore.loading) {
    return;
  }

  try {
    await tripStore.fetchTrips();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load trips.';
    showToast(message, 'danger');
  }
};

onMounted(() => {
  ensureTripsLoaded();
});
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
