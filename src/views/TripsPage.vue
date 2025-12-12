<template>
  <ion-page>
    <ion-content class="trips-page safe-area-scroll" :fullscreen="true">
      <AppBackHeader title="My Trips" subtitle="Manage your rides and journey requests" @back="goBack" />

      <section class="role-toggle ion-padding">
        <ion-segment class="pill-segment" :value="activeRole" mode="ios" @ionChange="handleRoleChange">
          <ion-segment-button v-for="role in roleOptions" :key="role.value" :value="role.value">
            <ion-label>{{ role.label }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </section>

      <section class="status-tabs ion-padding-horizontal">
        <ion-segment scrollable mode="md" :value="activeStatus" @ionChange="handleStatusChange">
          <ion-segment-button
            v-for="status in statusTabs"
            :key="status.value"
            :value="status.value"
          >
            <ion-label>
              {{ status.label }}
              <span class="count">({{ statusCounts[status.value] ?? 0 }})</span>
            </ion-label>
          </ion-segment-button>
        </ion-segment>
      </section>

      <section class="trip-list ion-padding">
        <div v-if="roleLoading" class="loading-state">
          <ion-spinner name="crescent" aria-hidden="true" />
          <p>Loading your trips...</p>
        </div>
        <div v-else-if="filteredTrips.length" class="trip-stack">
          <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" :viewer-role="activeRole" />
        </div>
        <div v-else class="empty-state">
          <p v-if="activeRoleError">{{ activeRoleError }}</p>
          <p v-else>No trips yet under this filter. Try switching roles or create a new journey.</p>
          <ion-button v-if="activeRole === 'coRider'" color="secondary" shape="round" @click="goToSearch">
            Find Trips
          </ion-button>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonContent,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue';
import type { SegmentChangeEventDetail } from '@ionic/vue';
import TripCard, { TripCardData, RoleOption, TripStatus } from '@/components/TripCard.vue';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useTripStore, mapBookedTripToCard } from '@/stores/tripStore';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { fetchUserBookedTrips } from '@/services/tripService';

const router = useRouter();
const tripStore = useTripStore();
const userStore = useUserStore();
const { tripCards, loading: ownerLoading, error: ownerError } = storeToRefs(tripStore);

const roleOptions: Array<{ value: RoleOption; label: string }> = [
  { value: 'coRider', label: 'Co-Rider' },
  { value: 'carOwner', label: 'Car Owner' }
];

const roleStatusTabs: Record<RoleOption, Array<{ value: TripStatus; label: string }>> = {
  coRider: [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'past', label: 'Past' }
  ],
  carOwner: [
    { value: 'active', label: 'Active' },
    { value: 'past', label: 'Past' }
  ]
};

const activeRole = ref<RoleOption>('coRider');
const activeStatus = ref<TripStatus>(roleStatusTabs[activeRole.value][0].value);
const statusTabs = computed(() => roleStatusTabs[activeRole.value]);

const riderTrips = ref<TripCardData[]>([]);
const riderLoading = ref(false);
const riderLoaded = ref(false);
const riderError = ref<string | null>(null);
let latestRiderRequestId = 0;

const currentUserId = computed(() => userStore.session?.user?.id ?? userStore.profile?.id ?? null);
const ownerTrips = computed(() => tripCards.value.filter(trip => trip.role === 'carOwner'));
const roleTripMap = computed<Record<RoleOption, TripCardData[]>>(() => ({
  coRider: riderTrips.value,
  carOwner: ownerTrips.value
}));

const matchesStatus = (trip: TripCardData, status: TripStatus, role: RoleOption) => {
  if (role === 'carOwner') {
    if (status === 'past') {
      return trip.state === 'past';
    }

    return trip.state === 'active';
  }

  return trip.status === status;
};

const filteredTrips = computed(() =>
  roleTripMap.value[activeRole.value].filter(trip => matchesStatus(trip, activeStatus.value, activeRole.value))
);

const statusCounts = computed<Record<TripStatus, number>>(() => {
  const roleTrips = roleTripMap.value[activeRole.value];
  return statusTabs.value.reduce((acc, tab) => {
    acc[tab.value] = roleTrips.filter(trip => matchesStatus(trip, tab.value, activeRole.value)).length;
    return acc;
  }, {} as Record<TripStatus, number>);
});

const roleLoading = computed(() =>
  activeRole.value === 'coRider' ? riderLoading.value : ownerLoading.value
);

const activeRoleError = computed(() =>
  activeRole.value === 'coRider' ? riderError.value : ownerError.value
);

const loadRiderTrips = async (force = false) => {
  if (riderLoading.value || (riderLoaded.value && !force)) {
    return riderTrips.value;
  }

  const token = userStore.session?.token ?? null;
  const userId = currentUserId.value;
  if (!token || userId === null || userId === undefined) {
    riderTrips.value = [];
    riderLoaded.value = true;
    return riderTrips.value;
  }

  riderLoading.value = true;
  riderError.value = null;
  const requestId = ++latestRiderRequestId;

  try {
    const bookings = await fetchUserBookedTrips(userId, token);
    if (requestId !== latestRiderRequestId) {
      return riderTrips.value;
    }

    riderTrips.value = bookings.map((trip, index) => mapBookedTripToCard(trip, index, userId));
    riderLoaded.value = true;
    return riderTrips.value;
  } catch (error) {
    if (requestId !== latestRiderRequestId) {
      return riderTrips.value;
    }

    const message = error instanceof Error ? error.message : 'Unable to load trips.';
    riderError.value = message;
    console.error('Unable to load rider trips', error);
    return riderTrips.value;
  } finally {
    if (requestId === latestRiderRequestId) {
      riderLoading.value = false;
    }
  }
};

const ensureRoleTrips = async (role: RoleOption, force = false) => {
  if (role === 'carOwner') {
    try {
      await tripStore.fetchTrips(force);
    } catch (error) {
      console.error('Unable to load owner trips', error);
    }
    return;
  }

  await loadRiderTrips(force);
};

const handleRoleChange = (event: CustomEvent<SegmentChangeEventDetail>) => {
  if (!event.detail.value) return;
  activeRole.value = event.detail.value as RoleOption;
  const nextTabs = roleStatusTabs[activeRole.value];
  const existing = nextTabs.find(tab => tab.value === activeStatus.value);
  activeStatus.value = (existing?.value ?? nextTabs[0].value) as TripStatus;
  void ensureRoleTrips(activeRole.value);
};

const handleStatusChange = (event: CustomEvent<SegmentChangeEventDetail>) => {
  if (!event.detail.value) return;
  activeStatus.value = event.detail.value as TripStatus;
};

const goToSearch = () => {
  router.push('/tabs/search');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  void ensureRoleTrips('coRider');
  void ensureRoleTrips('carOwner');
});

onIonViewWillEnter(() => {
  void ensureRoleTrips('coRider', true);
  void ensureRoleTrips('carOwner', true);
});
</script>

<style scoped>
.trips-page {
  --background: #f8f9fb;
}

.pill-segment {
  --background: #e2e5ec;
  border-radius: 20px;
  padding: 4px;
}

.pill-segment ion-segment-button {
  --indicator-color: transparent;
  --color: #7b8396;
  --color-checked: #0f172a;
  --indicator-box-shadow: 0 12px 18px rgba(15, 23, 42, 0.12);
  min-height: 44px;
  font-weight: 600;
}

.pill-segment ion-segment-button::part(indicator) {
  border-radius: 14px;
  background: #ffffff;
}


.status-tabs ion-segment {
  --background: transparent;
}

.status-tabs ion-segment-button {
  --color: #7c849a;
  --color-checked: #1c2742;
  --indicator-color: #1fb6ff;
  font-weight: 600;
}

.status-tabs .count {
  color: #9ca6ba;
  font-weight: 500;
  font-size: 0.85rem;
}

.trip-list {
  min-height: 50vh;
}

.trip-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #7c8598;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7c8598;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
