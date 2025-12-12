<template>
  <ion-page>
    <ion-content class="receipt-page safe-area-scroll" :fullscreen="true">
      <AppBackHeader title="Booking Receipt" subtitle="Ride confirmation" @back="goBack" />

      <div class="receipt-body ion-padding">
        <div v-if="isLoading" class="state-block">
          <ion-spinner name="crescent" aria-hidden="true" />
          <p>Preparing your receipt…</p>
        </div>
        <div v-else-if="loadError" class="state-block is-error">
          <p>{{ loadError }}</p>
          <ion-button fill="clear" color="secondary" size="small" @click="reload">Retry</ion-button>
        </div>
        <template v-else>
          <section class="status-card">
            <div class="status-icon" :class="`is-${statusState}`">
              <ion-icon :icon="statusIcon" aria-hidden="true" />
            </div>
            <p class="status-title">{{ statusTitle }}</p>
            <p class="status-subtitle">
              Your ride is set for <strong>{{ tripDate }}</strong>. We've sent a copy to your email.
            </p>
          </section>

          <section class="driver-card">
            <div class="route-preview">
              <img :src="mapImageSrc" alt="Route preview" />
              <span class="booking-ref">{{ bookingReference }}</span>
            </div>
            <div class="driver-info">
              <div class="driver-avatar">
                <span>{{ driverInitials }}</span>
              </div>
              <div class="driver-details">
                <p class="driver-name">{{ driverName }}</p>
                <p class="driver-meta">
                  <ion-icon :icon="starOutline" aria-hidden="true" />
                  <span>{{ driverRatingLabel }}</span>
                  • {{ driverVehicle }}
                </p>
              </div>
            </div>
          </section>

          <section class="itinerary-card">
            <article>
              <div class="stop-icon pickup"></div>
              <div>
                <p class="label">Pickup • {{ pickupTime }}</p>
                <p class="value">{{ pickupTitle }}</p>
                <small>{{ pickupAddress }}</small>
              </div>
            </article>
            <article>
              <div class="stop-icon drop"></div>
              <div>
                <p class="label">Drop-off • {{ dropoffTime }}</p>
                <p class="value">{{ dropoffTitle }}</p>
                <small>{{ dropoffAddress }}</small>
              </div>
            </article>
          </section>

          <section class="meta-grid">
            <article>
              <ion-icon :icon="peopleOutline" aria-hidden="true" />
              <div>
                <p class="label">Seats booked</p>
                <p class="value">{{ seatLabel }}</p>
              </div>
            </article>
            <article>
              <ion-icon :icon="calendarOutline" aria-hidden="true" />
              <div>
                <p class="label">Date booked</p>
                <p class="value">{{ dateBooked }}</p>
              </div>
            </article>
          </section>

          <section class="summary-card">
            <div>
              <p class="label">Total cost</p>
              <small>Paid with {{ paymentMethod }}</small>
            </div>
            <p class="value total">{{ totalPaid }}</p>
          </section>
        </template>
      </div>

      <div class="receipt-actions ion-padding">
        <ion-button expand="block" color="secondary" size="large" :disabled="isLoading" @click="downloadReceipt">
          <ion-icon slot="start" :icon="downloadOutline" />
          Download Receipt
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import {
  calendarOutline,
  checkmarkCircle,
  closeCircle,
  downloadOutline,
  peopleOutline,
  starOutline,
  timeOutline
} from 'ionicons/icons';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { fetchBooking, type BookingResponse } from '@/services/bookingService';
import type { Trip } from '@/services/tripService';
import { mapTripToCard } from '@/stores/tripStore';
import type { TripCardData } from '@/components/TripCard.vue';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const bookingRecord = ref<BookingResponse | null>(null);
const tripRecord = ref<Trip | null>(null);
const tripSnapshot = ref<TripCardData | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const bookingId = computed(() => route.params.id as string | undefined);
const bookingReference = computed(() => (bookingRecord.value ? `#${bookingRecord.value.id}` : 'Pending reference'));

const formatDate = (value?: string | null, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const bookingStatus = computed(() => Number(bookingRecord.value?.status ?? 0));
const statusState = computed<'confirmed' | 'pending' | 'cancelled'>(() => {
  if (bookingStatus.value === 1) return 'cancelled';
  if (bookingStatus.value === 2 || bookingStatus.value === 3) return 'confirmed';
  return 'pending';
});
const statusIcon = computed(() => {
  switch (statusState.value) {
    case 'cancelled':
      return closeCircle;
    case 'pending':
      return timeOutline;
    case 'confirmed':
    default:
      return checkmarkCircle;
  }
});
const statusTitle = computed(() => {
  switch (statusState.value) {
    case 'cancelled':
      return 'Booking Cancelled';
    case 'pending':
      return 'Awaiting Confirmation';
    case 'confirmed':
    default:
      return 'Booking Confirmed';
  }
});

const tripDate = computed(() =>
  formatDate(tripRecord.value?.departureTime, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
);
const pickupTitle = computed(() => tripSnapshot.value?.pickup ?? 'Pickup TBD');
const dropoffTitle = computed(() => tripSnapshot.value?.dropoff ?? 'Drop-off TBD');
const pickupTime = computed(
  () => formatDate(tripRecord.value?.departureTime, { hour: '2-digit', minute: '2-digit' }) || 'Time TBD'
);
const dropoffTime = computed(
  () => formatDate(tripRecord.value?.arrivalTime, { hour: '2-digit', minute: '2-digit' }) || 'Time TBD'
);
const pickupAddress = computed(() => tripSnapshot.value?.pickup ?? '');
const dropoffAddress = computed(() => tripSnapshot.value?.dropoff ?? '');
const seatLabel = computed(() => {
  const seats = bookingRecord.value?.seat ?? 0;
  if (!seats) return '—';
  return seats === 1 ? '1 seat' : `${seats} seats`;
});
const dateBooked = computed(() => formatDate(bookingRecord.value?.created_at));
const totalPaid = computed(() => {
  const amount = Number(bookingRecord.value?.price ?? 0);
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
});
const paymentMethod = computed(() => bookingRecord.value?.payment_method ?? 'Visa •••• 4242');
const driverName = computed(() => tripRecord.value?.user?.name ?? 'Trip host');
const driverInitials = computed(() =>
  driverName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'DR'
);
const driverVehicle = computed(() => {
  const vehicle = tripRecord.value?.vehicle;
  if (!vehicle) return 'Vehicle details pending';
  return [vehicle.color, vehicle.model, vehicle.plate_number].filter(Boolean).join(' · ') || 'Vehicle details pending';
});
const driverRatingLabel = computed(() => '4.9');
const mapImageSrc = computed(() => '/map-placeholder.png');

const loadBooking = async () => {
  const token = userStore.session?.token;
  const id = bookingId.value;
  if (!token || !id) {
    loadError.value = 'Booking reference missing.';
    return;
  }
  isLoading.value = true;
  loadError.value = null;
  try {
    const booking = await fetchBooking(id, token);
    bookingRecord.value = booking;
    tripRecord.value = booking.trip ?? null;
    if (booking.trip) {
      const currentUserId = userStore.session?.user?.id ?? userStore.profile?.id ?? null;
      tripSnapshot.value = mapTripToCard(booking.trip, 0, currentUserId);
    } else {
      tripSnapshot.value = null;
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to load receipt.';
  } finally {
    isLoading.value = false;
  }
};

const downloadReceipt = () => {
  window.print();
};

const reload = () => {
  void loadBooking();
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  void loadBooking();
});

watch(
  () => route.params.id,
  () => {
    void loadBooking();
  }
);
</script>

<style scoped>
.receipt-page {
  --background: #f6f8fb;
}

.receipt-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.state-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #6b7280;
}

.state-block.is-error {
  color: #b91c1c;
}

.status-card {
  background: #e9f7ef;
  border-radius: 32px;
  padding: 28px 20px;
  text-align: center;
}

.status-icon {
  width: 66px;
  height: 66px;
  border-radius: 24px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #0f9d58;
  background: #d1fae5;
}

.status-icon.is-pending {
  color: #f59e0b;
  background: #fef3c7;
}

.status-icon.is-cancelled {
  color: #ef4444;
  background: #fee2e2;
}

.status-title {
  font-size: 1.5rem;
  margin: 0;
  color: #0f172a;
}

.status-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
}

.driver-card {
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.route-preview {
  position: relative;
}

.route-preview img {
  width: 100%;
  display: block;
}

.booking-ref {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.driver-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  gap: 14px;
}

.driver-avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1e1b4b;
}

.driver-details {
  flex: 1;
}

.driver-name {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.driver-meta {
  margin: 4px 0 0;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.driver-meta ion-icon {
  color: #f5a524;
}

.itinerary-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 18px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.itinerary-card article {
  display: flex;
  gap: 12px;
}

.stop-icon {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin-top: 4px;
}

.stop-icon.pickup {
  background: #0ea854;
}

.stop-icon.drop {
  background: #0ea5e9;
}

.itinerary-card .label {
  margin: 0;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.itinerary-card .value {
  margin: 4px 0 0;
  font-weight: 700;
  color: #0f172a;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.meta-grid article {
  background: #ffffff;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.meta-grid ion-icon {
  font-size: 1.4rem;
  color: #0ea854;
}

.meta-grid .label {
  margin: 0;
  color: #6b7280;
}

.meta-grid .value {
  margin: 4px 0 0;
  font-weight: 700;
  color: #0f172a;
}

.summary-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.summary-card .label {
  margin: 0;
  color: #6b7280;
}

.summary-card .total {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0ea854;
}

.receipt-actions {
  position: sticky;
  bottom: 0;
  background: linear-gradient(0deg, #f6f8fb 80%, rgba(246, 248, 251, 0));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media print {
  ion-button,
  .receipt-actions,
  .safe-area-scroll::after {
    display: none !important;
  }
  .receipt-body {
    padding: 0 20px;
  }
}
</style>
