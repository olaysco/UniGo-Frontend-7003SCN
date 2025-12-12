<template>
  <ion-page>
    <ion-content class="booked-trip-page safe-area-scroll">
      <AppBackHeader title="Booking Details" :subtitle="statusSubtitle" @back="goBack" />
      <div v-if="isLoading" class="page-body ion-padding page-message">
        <ion-spinner name="crescent" />
        <p>Loading booking details…</p>
      </div>
      <div v-else-if="loadError" class="page-body ion-padding page-message">
        <p class="error-text">{{ loadError }}</p>
        <ion-button color="secondary" fill="clear" @click="reloadBooking">Retry</ion-button>
      </div>
      <div v-else class="page-body ion-padding">
        <section v-if="showStatusBanner" class="status-banner">
          <ion-icon :icon="checkmarkCircle" aria-hidden="true" />
          <div>
            <p class="status-title">Booking Confirmed! You're all set.</p>
            <p class="status-subtitle">Reference {{ bookingReference }} • {{ bookingStatusLabel }}</p>
          </div>
        </section>

        <section class="map-card">
          <img :src="mapImageSrc" alt="Route preview map" />
        </section>

        <section class="detail-card">
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="calendarOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">{{ tripDateLabel }}</p>
              <p class="detail-meta">{{ departureTimeLabel }} · Est. Arrival {{ arrivalTimeLabel }}</p>
            </div>
          </article>
          <hr />
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="navigateOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">Pickup: {{ pickupTitle }}</p>
              <p v-if="pickupAddress" class="detail-meta">{{ pickupAddress }}</p>
            </div>
          </article>
          <hr />
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="locationOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">Drop-off: {{ dropoffTitle }}</p>
              <p v-if="dropoffAddress" class="detail-meta">{{ dropoffAddress }}</p>
            </div>
          </article>
        </section>

        <section class="driver-card">
          <div class="driver-meta">
            <div class="driver-avatar" role="img" :aria-label="`${driverName} avatar`">
              <span>{{ driverInitials }}</span>
            </div>
            <div>
              <p class="driver-name">{{ driverName }}</p>
              <p class="driver-car">{{ driverVehicle }}</p>
            </div>
          </div>
          <div
            v-if="driverRating"
            class="driver-rating"
            :aria-label="`Driver rating ${driverRating} out of 5`"
          >
            <ion-icon :icon="star" aria-hidden="true" />
            <span>{{ driverRating }}</span>
          </div>
        </section>

        <section class="driver-contact-card">
          <p v-if="driverNote" class="driver-note">{{ driverNote }}</p>
          <div class="driver-actions">
            <ion-button expand="block" fill="outline" color="secondary" @click="contactDriver('message')">
              <ion-icon slot="start" :icon="chatbubbleEllipses" />
              Message
            </ion-button>
            <ion-button expand="block" color="secondary" @click="contactDriver('call')">
              <ion-icon slot="start" :icon="call" />
              Call
            </ion-button>
          </div>
        </section>

        <section class="summary-card">
          <header class="summary-header">
            <p>Booking Summary</p>
            <ion-chip color="secondary" outline>
              <ion-icon :icon="people" />
              <ion-label>{{ seatChipLabel }}</ion-label>
            </ion-chip>
          </header>
          <div v-if="bookingSummary.length" class="summary-list">
            <div v-for="item in bookingSummary" :key="item.label" class="summary-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
          <div class="summary-total">
            <span>Total Paid</span>
            <p>{{ totalPaid }}</p>
          </div>
          <ion-button v-if="showReceiptButton" expand="block" color="secondary" size="large" @click="viewReceipt">
            View Receipt
          </ion-button>
          <ion-button
            v-if="showCancelButton"
            class="mt-4"
            expand="block"
            color="danger"
            size="large"
            @click="cancelTrip"
          >
            Cancel Trip
          </ion-button>
          <ion-button
            v-if="showRateButton"
            class="mt-4"
            expand="block"
            color="secondary"
            size="large"
            @click="rateTrip"
          >
            Rate Trip
          </ion-button>
        </section>
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
import {
  calendarOutline,
  call,
  chatbubbleEllipses,
  checkmarkCircle,
  locationOutline,
  navigateOutline,
  people,
  star
} from 'ionicons/icons';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useUserStore } from '@/stores/userStore';
import { mapTripToCard, useTripStore } from '@/stores/tripStore';
import type { TripCardData } from '@/components/TripCard.vue';
import type { Trip } from '@/services/tripService';
import { fetchBooking, type BookingResponse } from '@/services/bookingService';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tripStore = useTripStore();

const bookingRecord = ref<BookingResponse | null>(null);
const tripRecord = ref<Trip | null>(null);
const tripSnapshot = ref<TripCardData | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const bookingId = computed(() => route.params.id as string | undefined);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number.isFinite(amount) ? amount : 0);

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return 'Date pending';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date pending';
  }
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
};

const formatTimeLabel = (value?: string | null) => {
  if (!value) {
    return 'Time TBD';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Time TBD';
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const deriveInitials = (value: string | null | undefined) => {
  if (!value) {
    return 'DR';
  }
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'DR';
};

const getPointField = (point: unknown, field: 'label' | 'address'): string | null => {
  if (!point || typeof point !== 'object') {
    return null;
  }
  const data = point as Record<string, unknown>;
  const value = data[field];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const loadBookingDetails = async () => {
  const token = userStore.session?.token;
  const id = bookingId.value;

  if (!id) {
    loadError.value = 'Booking reference is missing.';
    return;
  }

  if (!token) {
    loadError.value = 'Please sign in to view this booking.';
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    const booking = await fetchBooking(id, token);
    bookingRecord.value = booking;
    console.log('Loaded booking', booking);

    if (booking.trip_id) {
      try {
        const trip = await tripStore.getTripById(booking.trip_id);
        tripRecord.value = trip;
        if (trip) {
          const { userId } = tripStore.getSessionContext();
          tripSnapshot.value = mapTripToCard(trip, 0, userId ?? null);
        } else {
          tripSnapshot.value = null;
        }
      } catch (tripError) {
        console.warn('Unable to fetch trip for booking', tripError);
        tripRecord.value = null;
        tripSnapshot.value = null;
      }
    } else {
      tripRecord.value = null;
      tripSnapshot.value = null;
    }
  } catch (error) {
    console.error('Unable to load booking', error);
    loadError.value = error instanceof Error ? error.message : 'Unable to load booking.';
    bookingRecord.value = null;
    tripRecord.value = null;
    tripSnapshot.value = null;
  } finally {
    isLoading.value = false;
  }
};

const reloadBooking = () => {
  void loadBookingDetails();
};

onMounted(() => {
  void loadBookingDetails();
});

watch(
  () => bookingId.value,
  next => {
    if (next) {
      void loadBookingDetails();
    }
  }
);

const bookingReference = computed(() => (bookingRecord.value ? `#${bookingRecord.value.id}` : 'Pending reference'));
const bookingStatusLabel = computed(() => bookingRecord.value?.status_text ?? 'Pending confirmation');
const statusSubtitle = computed(() => bookingStatusLabel.value);
const seatCount = computed(() => bookingRecord.value?.seat ?? 0);
const seatChipLabel = computed(() => {
  const seats = seatCount.value;
  if (!seats) {
    return 'No seats';
  }
  return `${seats} Seat${seats === 1 ? '' : 's'}`;
});

const tripDateLabel = computed(() => formatDateLabel(tripRecord.value?.departureTime));
const departureTimeLabel = computed(() => formatTimeLabel(tripRecord.value?.departureTime));
const arrivalTimeLabel = computed(() => formatTimeLabel(tripRecord.value?.arrivalTime));

const pickupTitle = computed(() => getPointField(bookingRecord.value?.pickup_point ?? null, 'label') ?? tripSnapshot.value?.pickup ?? 'Pickup location pending');
const pickupAddress = computed(() => getPointField(bookingRecord.value?.pickup_point ?? null, 'address') ?? '');
const dropoffTitle = computed(() => tripSnapshot.value?.dropoff ?? 'Destination pending');
const dropoffAddress = computed(() => '');

const driverName = computed(() => {
  const rawName = tripRecord.value?.user?.name;
  if (typeof rawName === 'string' && rawName.trim()) {
    return rawName.trim();
  }
  return 'Trip host';
});
const driverInitials = computed(() => deriveInitials(driverName.value));
const driverVehicle = computed(() => {
  const vehicle = tripRecord.value?.vehicle;
  if (!vehicle) {
    return 'Vehicle details coming soon';
  }
  const parts = [vehicle.color, vehicle.model, vehicle.plate_number]
    .map(value => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Vehicle details coming soon';
});
const driverRating = computed(() => null);
const driverNote = computed(() => null);

const bookingSummary = computed(() => {
  const items: { label: string; value: string }[] = [];
  if (tripSnapshot.value?.price) {
    items.push({ label: 'Fare per seat', value: tripSnapshot.value.price });
  }
  if (seatCount.value) {
    items.push({ label: 'Seats booked', value: `${seatCount.value}` });
  }
  return items;
});

const totalPaid = computed(() => formatCurrency(Number(bookingRecord.value?.price ?? 0)));
const mapImageSrc = computed(() => '/map-placeholder.png');

const hasBooking = computed(() => Boolean(bookingRecord.value));
const isPastTrip = computed(() => tripSnapshot.value?.state === 'past');
const showStatusBanner = computed(() => hasBooking.value && !isLoading.value && !loadError.value);
const showReceiptButton = computed(() => hasBooking.value && !loadError.value);
const showRateButton = computed(() => showReceiptButton.value && isPastTrip.value);
const showCancelButton = computed(() => showReceiptButton.value && !isPastTrip.value);

const goBack = () => {
  router.back();
};

const contactDriver = (type: 'call' | 'message') => {
  console.info(`Contact driver via ${type}`);
};

const viewReceipt = async () => {
  const id = bookingId.value;
  const token = userStore.session?.token;

  if (!id || !token) {
    return;
  }

  const url = `/bookings/${id}/receipt?format=pdf`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Unable to load receipt.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.target = '_blank';
    anchor.download = `booking-${id}-receipt.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Unable to download receipt', error);
  }
};

const cancelTrip = () => {
  const bookingIdValue = bookingId.value || 'current';
  router.push({ name: 'cancel-trip', params: { id: bookingIdValue } });
};

const rateTrip = () => {
  const bookingIdValue = bookingId.value || 'current';
  router.push({ name: 'rate-trip', params: { id: bookingIdValue } });
};
</script>

<style scoped>
.booked-trip-page {
  --background: #f6f7fb;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 90px;
}

.page-message {
  min-height: 60vh;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
}

.page-message ion-spinner {
  width: 36px;
  height: 36px;
}

.page-message p {
  margin: 0;
  color: #4a5568;
}

.error-text {
  color: #c53030;
  font-weight: 600;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 22px;
  background: #e7f6ef;
  padding: 16px;
}

.status-banner ion-icon {
  color: #1fb16a;
  font-size: 1.4rem;
}

.status-title {
  margin: 0;
  font-weight: 600;
  color: #0a1c2b;
}

.status-subtitle {
  margin: 2px 0 0;
  color: #5a697f;
  font-size: 0.9rem;
}

.map-card img {
  width: 100%;
  display: block;
  border-radius: 22px;
}

.detail-card,
.driver-card,
.driver-contact-card,
.summary-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(78, 99, 120, 0.08);
}

.detail-row {
  display: flex;
  gap: 14px;
}

.icon-pill {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: #eaf5ef;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1fb16a;
}

.detail-title {
  margin: 0;
  font-weight: 600;
  color: #111b2b;
}

.detail-meta {
  margin: 2px 0 0;
  color: #6c7a92;
}

.detail-card hr {
  border: 0;
  border-top: 1px solid #e9edf5;
  margin: 16px 0;
}

.driver-card {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.driver-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.driver-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, #eaf3ff, #d5f2e6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.driver-avatar span {
  font-size: 1rem;
}

.driver-name {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.driver-car {
  margin: 4px 0 0;
  color: #6b738a;
  font-size: 0.9rem;
}

.driver-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 14px;
  background: #fff7df;
  color: #d68006;
  font-weight: 700;
}

.driver-contact-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.driver-note {
  margin: 0;
  color: #6c7a92;
}

.driver-actions {
  display: flex;
  gap: 12px;
}

.driver-actions ion-button {
  --border-radius: 16px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #101b2c;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #5a697f;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #101b2c;
}

.summary-card ion-button {
  --border-radius: 18px;
}
</style>
