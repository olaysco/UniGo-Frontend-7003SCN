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
        <div v-if="filteredTrips.length" class="trip-stack">
          <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" :viewer-role="activeRole" />
        </div>
        <div v-else class="empty-state">
          <p>No trips yet under this filter. Try switching roles or create a new journey.</p>
          <ion-button color="secondary" shape="round" @click="goToSearch">
            Find Trips
          </ion-button>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonContent,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue';
import type { SegmentChangeEventDetail } from '@ionic/vue';
import TripCard, { TripCardData } from '@/components/TripCard.vue';
import AppBackHeader from '@/components/AppBackHeader.vue';

type RoleOption = 'coRider' | 'carOwner';
type TripStatus = 'pending' | 'confirmed' | 'past' | 'active' | 'upcoming';

interface TripRecord extends TripCardData {
  status: TripStatus;
  role: RoleOption;
}

const router = useRouter();

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
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ]
};

const activeRole = ref<RoleOption>('coRider');
const activeStatus = ref<TripStatus>(roleStatusTabs[activeRole.value][0].value);
const statusTabs = computed(() => roleStatusTabs[activeRole.value]);

const trips = ref<TripRecord[]>([
  {
    id: 101,
    datetimeLabel: 'Tue, 28 May · 08:30 AM',
    route: 'Coventry to Birmingham',
    price: '£5.00',
    status: 'pending',
    statusVariant: 'pending',
    passengers: [
      { id: 1, name: 'Alex Doe', initials: 'AD', color: '#fde7d9' }
    ],
    seatsLabel: 'Waiting for driver',
    mapVariant: 'variant-a',
    state: 'active',
    role: 'coRider'
  },
  {
    id: 102,
    datetimeLabel: 'Thu, 30 May · 17:00 PM',
    route: 'Leamington Spa to Coventry',
    price: '£4.20',
    status: 'confirmed',
    statusVariant: 'confirmed',
    passengers: [
      { id: 2, name: 'Jamie W', initials: 'JW', color: '#d9ecf7' }
    ],
    seatsLabel: '1/3 seats',
    mapVariant: 'variant-b',
    state: 'active',
    role: 'coRider'
  },
  {
    id: 201,
    datetimeLabel: 'Mon, 03 Jun · 07:30 AM',
    route: 'Coventry Campus to Rugby',
    price: '£6.50',
    status: 'active',
    statusVariant: 'active',
    passengers: [],
    seatsLabel: '2/3 seats requested',
    mapVariant: 'variant-b',
    state: 'active',
    role: 'carOwner'
  },
  {
    id: 202,
    datetimeLabel: 'Fri, 17 May · 18:10 PM',
    route: 'Coventry to London',
    price: '£12.00',
    status: 'past',
    statusVariant: 'completed',
    passengers: [],
    seatsLabel: 'Completed ride',
    mapVariant: 'variant-a',
    state: 'past',
    role: 'coRider'
  },
  {
    id: 203,
    datetimeLabel: 'Sat, 08 Jun · 10:00 AM',
    route: 'Coventry Centre to BHX Airport',
    price: '£8.00',
    status: 'upcoming',
    statusVariant: 'upcoming',
    passengers: [],
    seatsLabel: '1/4 seats booked',
    mapVariant: 'variant-a',
    state: 'active',
    role: 'carOwner'
  },
  {
    id: 204,
    datetimeLabel: 'Wed, 01 May · 12:00 PM',
    route: 'Coventry to Warwick',
    price: '£4.80',
    status: 'past',
    statusVariant: 'completed',
    passengers: [],
    seatsLabel: 'Completed ride',
    mapVariant: 'variant-b',
    state: 'past',
    role: 'carOwner'
  }
]);

const filteredTrips = computed(() =>
  trips.value.filter(
    trip => trip.role === activeRole.value && trip.status === activeStatus.value
  )
);

const statusCounts = computed<Record<TripStatus, number>>(() => {
  return statusTabs.value.reduce((acc, tab) => {
    acc[tab.value] = trips.value.filter(
      trip => trip.role === activeRole.value && trip.status === tab.value
    ).length;
    return acc;
  }, {} as Record<TripStatus, number>);
});

const handleRoleChange = (event: CustomEvent<SegmentChangeEventDetail>) => {
  if (!event.detail.value) return;
  activeRole.value = event.detail.value as RoleOption;
  const nextTabs = roleStatusTabs[activeRole.value];
  const existing = nextTabs.find(tab => tab.value === activeStatus.value);
  activeStatus.value = (existing?.value ?? nextTabs[0].value) as TripStatus;
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
</script>

<style scoped>
.trips-page {
  --background: #f5f6fa;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7c8598;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
