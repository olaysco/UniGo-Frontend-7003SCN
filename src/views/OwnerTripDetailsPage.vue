<template>
  <ion-page>
    <ion-content v-if="trip" class="owner-trip-page safe-area-scroll">
      <AppBackHeader title="Trip Overview" subtitle="Trip Information" @back="goBack" />

      <div class="page-body ion-padding">
        <section class="overview-card">
          <p class="eyebrow">{{ trip.date }} · {{ trip.departure }} · {{ trip.seats }} seats</p>
          <h1>{{ trip.route }}</h1>
          <p class="earnings">Projected earnings · <strong>{{ trip.total }}</strong></p>
          <div class="chip-row">
            <ion-chip color="success" outline>
              <ion-icon :icon="checkmarkCircle" />
              <ion-label>{{ trip.status }}</ion-label>
            </ion-chip>
            <ion-chip color="secondary" outline>
              <ion-icon :icon="people" />
              <ion-label>{{ pendingCount }} requests</ion-label>
            </ion-chip>
          </div>
        </section>

        <section class="segment-card">
          <article class="segment-row">
            <div class="icon-pill">
              <ion-icon :icon="navigateOutline" />
            </div>
            <div>
              <p class="label">Pickup</p>
              <p class="value text-slate-700">{{ trip.pickup }}</p>
            </div>
          </article>
          <article class="segment-row">
            <div class="icon-pill">
              <ion-icon :icon="locationOutline" />
            </div>
            <div>
              <p class="label">Drop-off</p>
              <p class="value text-slate-700">{{ trip.dropoff }}</p>
            </div>
          </article>
        </section>

        <section class="requests-card">
          <header class="text-slate-900">
            <p>Ride requests</p>
            <small>{{ pendingCount }} pending</small>
          </header>
          <div v-if="bookingsLoading" class="state-message">
            <ion-spinner name="crescent" aria-hidden="true" />
            <p>Loading bookings...</p>
          </div>
          <div v-else-if="bookingsError" class="state-message is-error">
            <p>{{ bookingsError }}</p>
            <ion-button size="small" fill="clear" @click="loadBookings">Try again</ion-button>
          </div>
          <template v-else>
            <article v-for="request in pendingBookings" :key="request.id" class="request-card d-flex">
              <div class="request-main">
                <div class="request-avatar" :style="{ backgroundColor: request.avatarColor }">
                  <span>{{ request.initials }}</span>
                </div>
                <div>
                  <p class="name">{{ request.name }}</p>
                  <p class="meta">{{ request.seatLabel }}</p>
                </div>
              </div>
              <div class="request-actions">
                <ion-button
                  expand="block"
                  fill="outline"
                  color="medium"
                  @click="rejectRider(request.id)"
                  class="w-full"
                  :disabled="isPastTrip"
                >
                  Reject
                </ion-button>
                <ion-button
                  expand="block"
                  color="secondary"
                  @click="confirmRider(request.id)"
                  class="w-full"
                  :disabled="isPastTrip"
                >
                  Confirm
                </ion-button>
              </div>
            </article>
            <p v-if="!pendingBookings.length" class="state-message">
              All caught up—no new ride requests.
            </p>
          </template>
        </section>

        <section class="requests-card confirmed-card">
          <header class="text-slate-900">
            <p>Confirmed riders</p>
            <small>{{ confirmedCount }} joined</small>
          </header>
          <div v-if="bookingsLoading && !pendingBookings.length" class="state-message">
            <ion-spinner name="crescent" aria-hidden="true" />
            <p>Loading bookings...</p>
          </div>
          <template v-else>
            <article v-for="rider in confirmedBookings" :key="rider.id" class="request-card">
              <div class="request-main">
                <div class="request-avatar" :style="{ backgroundColor: rider.avatarColor }">
                  <span>{{ rider.initials }}</span>
                </div>
                <div>
                  <p class="name">{{ rider.name }}</p>
                  <p class="meta">{{ rider.seatLabel }}</p>
                </div>
              </div>
              <div class="request-actions">
                <ion-button expand="block" fill="outline" color="secondary" @click="messageRider(rider.id)" class="w-full">
                  Message
                </ion-button>
              </div>
            </article>
            <p v-if="!confirmedBookings.length && !bookingsLoading" class="state-message">
              No confirmed riders yet.
            </p>
          </template>
        </section>

        <section class="actions">
          <ion-button expand="block" size="large" @click="editTrip" color="danger" :disabled="isPastTrip">
            Cancel Trip
          </ion-button>
        </section>
      </div>
    </ion-content>
    <ion-content v-else class="ion-padding">
      <AppBackHeader title="Trip Not Found" @back="goBack" />
      <div class="page-body">
        <p>Could not find the requested trip.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSpinner
} from '@ionic/vue';
import { checkmarkCircle, locationOutline, navigateOutline, people } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useTripStore } from '@/stores/tripStore';
import { computed, onMounted, ref } from 'vue';
import { fetchTripBookings, type BookingResponse } from '@/services/bookingService';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();
const userStore = useUserStore();

const tripId = route.params.id as string;
const trip = computed(() => tripStore.tripCards.find(t => String(t.id) === tripId));
const isPastTrip = computed(() => trip.value?.state === 'past');

type BookingStatus = 'pending' | 'confirmed' | 'past';

interface BookingCardItem {
  id: string | number;
  name: string;
  initials: string;
  seatLabel: string;
  status: BookingStatus;
  avatarColor: string;
}

const bookingStatusMap: Record<number, BookingStatus> = {
  0: 'pending',
  1: 'pending',
  2: 'confirmed',
  3: 'past'
};

const bookingColors = ['#d9ecf7', '#fde7d9', '#e5e7ff', '#fce5ff', '#ddf7e8'];

const normalizeBookingStatus = (status: BookingResponse['status'] | string | null | undefined): BookingStatus => {
  if (typeof status === 'number' && bookingStatusMap[status]) {
    return bookingStatusMap[status];
  }

  const numeric = Number(status);
  if (!Number.isNaN(numeric) && bookingStatusMap[numeric]) {
    return bookingStatusMap[numeric];
  }

  const value = String(status ?? '').toLowerCase();
  if (value.includes('confirm')) {
    return 'confirmed';
  }
  if (value.includes('past') || value.includes('complete')) {
    return 'past';
  }
  return 'pending';
};

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(part => part.charAt(0).toUpperCase()).join('') || '??';
};

const formatSeatLabel = (seat: number) => {
  const count = Number(seat) || 0;
  if (count <= 1) {
    return '1 seat requested';
  }
  return `${count} seats requested`;
};

const mapBookingToCard = (booking: BookingResponse, index: number): BookingCardItem => {
  const name = booking.user?.name?.trim() || `Rider #${booking.user_id}`;
  return {
    id: booking.id,
    name,
    initials: getInitials(name),
    seatLabel: formatSeatLabel(booking.seat),
    status: normalizeBookingStatus(booking.status),
    avatarColor: bookingColors[index % bookingColors.length]
  };
};

const bookings = ref<BookingCardItem[]>([]);
const bookingsLoading = ref(false);
const bookingsError = ref<string | null>(null);

const loadBookings = async () => {
  const token = userStore.session?.token;
  if (!tripId || !token) {
    bookings.value = [];
    return;
  }

  bookingsLoading.value = true;
  bookingsError.value = null;
  try {
    const response = await fetchTripBookings(tripId, token);
    bookings.value = response.map(mapBookingToCard);
  } catch (error) {
    bookingsError.value = error instanceof Error ? error.message : 'Unable to load bookings.';
  } finally {
    bookingsLoading.value = false;
  }
};

onMounted(() => {
  void loadBookings();
});

const pendingBookings = computed(() => bookings.value.filter(booking => booking.status === 'pending'));
const confirmedBookings = computed(() =>
  bookings.value.filter(booking => booking.status === 'confirmed' || booking.status === 'past')
);
const pendingCount = computed(() => pendingBookings.value.length);
const confirmedCount = computed(() => confirmedBookings.value.length);

const goBack = () => {
  router.back();
};

const editTrip = () => {
  console.info('Navigate to edit trip');
};

const messageRider = (id: string | number) => {
  console.info('message rider', id);
};

const confirmRider = (id: string | number) => {
  console.info('confirm rider', id);
};

const rejectRider = (id: string | number) => {
  console.info('reject rider', id);
};
</script>

<style scoped>
.owner-trip-page {
  --background: #f5f6fa;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card {
  background: #101b2c;
  color: #ffffff;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 25px 60px rgba(7, 10, 24, 0.35);
}

.overview-card .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 6px;
}

.overview-card h1 {
  margin: 0 0 12px;
  font-size: 1.4rem;
}

.overview-card .earnings {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}

.chip-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.segment-card,
.requests-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 14px 32px rgba(34, 42, 62, 0.08);
}

.segment-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.segment-row + .segment-row {
  margin-top: 16px;
}

.icon-pill {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: #ecf2ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3555ff;
}

.segment-card .label {
  margin: 0;
  color: #7a859e;
}

.segment-card .value {
  margin: 2px 0 0;
  font-weight: 600;
}

.requests-card header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-weight: 600;
}

.request-card {
  align-items: center;
  justify-content: space-between;
  border-radius: 22px;
  padding: 14px 16px;
  margin: 0;
}

.requests-card .request-card + .request-card {
  border-top: 1px solid #e4e9f3;
  margin-top: 18px;
  padding-top: 18px;
}

.request-main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.request-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  font-weight: 700;
}

.request-main .name {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.request-main .meta {
  margin: 2px 0 0;
  color: #8890a7;
  font-size: 0.9rem;
}

.request-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: #6b7280;
  text-align: center;
}

.state-message.is-error {
  color: #b91c1c;
}

.state-message ion-spinner {
  --color: #6b7280;
}



.actions ion-button {
  --border-radius: 20px;
}
</style>
