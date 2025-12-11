<template>
  <ion-page>
    <ion-content class="trip-details safe-area-scroll" :fullscreen="true">
      <div class="page-stack">
        <header class="top-bar ion-padding">
          <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
            <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
          </button>
          <h1>Trip Details</h1>
          <span class="icon-button placeholder" aria-hidden="true"></span>
        </header>

        <main class="details-body">
          <section class="map-card" aria-label="Trip route preview">
            <div class="map-visual"> <img src="/map-placeholder.png" alt=""></div>
            <div class="route-chip">
              <ion-icon :icon="navigateOutline" aria-hidden="true" />
              <span>{{ routeChipLabel }}</span>
            </div>
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

          <section class="detail-list">
            <article
              v-for="item in detailItems"
              :key="item.id"
              class="detail-row"
            >
              <div class="icon-chip" :class="`is-${item.accent}`">
                <ion-icon :icon="item.icon" aria-hidden="true" />
              </div>
              <div class="detail-copy">
                <p class="detail-label">{{ item.label }}</p>
                <p class="detail-value" :class="{ 'is-accent': item.highlight }">{{ item.value }}</p>
                <p v-if="item.helper" class="detail-helper">{{ item.helper }}</p>
              </div>
            </article>
          </section>
        </main>
      </div>
    </ion-content>

    <ion-footer class="cta-footer">
      <div class="cta-panel ion-padding">
        <ion-button
          expand="block"
          size="large"
          color="secondary"
          :disabled="isBooking"
          @click="openPickupSheet"
        >
          <span v-if="!isBooking">Book Seat for {{ priceLabel }}</span>
          <span v-else>Booking…</span>
        </ion-button>
      </div>
    </ion-footer>
    <BookingConfirmSheet
      :is-open="pickupSheetOpen"
      :base-pickup-label="basePickupSnapshot.label"
      :base-pickup-coords="basePickupSnapshot.coords"
      :current-pickup-label="trip.pickup"
      :max-distance-km="MAX_CUSTOM_DISTANCE_KM"
      @close="closePickupSheet"
      @confirm="handlePickupConfirmed"
    />
    <ion-alert
      header="Booking confirmed"
      message="Your seat has been secured."
      :is-open="bookingSuccessAlert"
      :buttons="[{ text: 'View booking', role: 'confirm' }]"
      @didDismiss="handleSuccessAlertDismiss"
    />
    <ion-toast
      :is-open="Boolean(bookingError)"
      :message="bookingError || ''"
      color="danger"
      duration="2500"
      @didDismiss="clearBookingError"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonAlert, IonButton, IonContent, IonFooter, IonIcon, IonPage, IonToast } from '@ionic/vue';
import {
  calendarOutline,
  cashOutline,
  chevronBackOutline,
  flagOutline,
  navigateOutline,
  peopleOutline,
  star
} from 'ionicons/icons';
import type { TripCardData } from '@/components/TripCard.vue';
import { mapTripToCard, useTripStore } from '@/stores/tripStore';
import type { Trip } from '@/services/tripService';
import BookingConfirmSheet from '@/components/BookingConfirmSheet.vue';
import { createBooking } from '@/services/bookingService';
import { useUserStore } from '@/stores/userStore';

type TripDetailsPayload = TripCardData & {
  driver?: {
    name?: string | null;
    initials?: string | null;
    vehicle?: string | null;
    rating?: number | null;
  };
  pickupCoords?: Coordinates | null;
};

type Coordinates = {
  lat: number;
  lng: number;
};

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();
const userStore = useUserStore();

const createFallbackTrip = (): TripDetailsPayload => ({
  id: Number(route.params.id ?? 0) || 0,
  datetimeLabel: 'Date & time to be confirmed',
  route: 'Trip route pending',
  price: '£0.00',
  status: 'pending',
  statusVariant: 'pending',
  passengers: [],
  seatsLabel: undefined,
  mapVariant: 'variant-a',
  state: 'active',
  role: 'coRider',
  depPointPlaceId: undefined,
  arrPointPlaceId: undefined,
  requests: [],
  confirmed: [],
  total: '£0.00',
  pickup: 'Pickup location pending',
  dropoff: 'Destination pending',
  date: 'Date TBD',
  departure: 'Time TBD',
  seats: 0,
  pickupCoords: null,
  driver: {
    name: 'Driver details coming soon',
    initials: 'DD',
    vehicle: 'Vehicle to be confirmed',
    rating: null
  }
});

const tripId = route.params.id as string;

const trip = ref<TripDetailsPayload>(createFallbackTrip());
const basePickupSnapshot = ref<{ label: string; coords: Coordinates | null }>({
  label: trip.value.pickup,
  coords: trip.value.pickupCoords ?? null
});
const pickupSheetOpen = ref(false);
const MAX_CUSTOM_DISTANCE_KM = 10;
const isBooking = ref(false);
const bookingSuccessAlert = ref(false);
const bookingError = ref<string | null>(null);
const lastBookingId = ref<number | null>(null);
const pendingSelection = ref<{ label: string; coords: Coordinates | null; mode: 'current' | 'custom' } | null>(null);

type BookingSelection = {
  label: string;
  coords: Coordinates | null;
  mode: 'current' | 'custom';
};

const deriveInitials = (value: string | null | undefined) => {
  if (!value) {
    return 'DD';
  }

  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'DD';
};

const formatDriverName = (tripEntity: Trip): string | null => {
  const rawName = tripEntity.user?.name;
  if (typeof rawName === 'string') {
    const trimmed = rawName.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return null;
};

const formatVehicleLabel = (vehicle: Trip['vehicle']): string | null => {
  if (!vehicle) {
    return null;
  }

  const parts = [vehicle.color, vehicle.model, vehicle.plate_number]
    .map(value => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  return parts.length ? parts.join(' · ') : null;
};

const toTripDetailsPayload = (tripEntity: Trip): TripDetailsPayload => {
  const { userId } = tripStore.getSessionContext();
  const driverName = formatDriverName(tripEntity);
  const vehicleLabel = formatVehicleLabel(tripEntity.vehicle) ?? 'Vehicle details coming soon';
  const normalizedLat = Number(tripEntity.departureLat);
  const normalizedLng = Number(tripEntity.departureLng);
  const hasLat = Number.isFinite(normalizedLat);
  const hasLng = Number.isFinite(normalizedLng);
  const pickupCoords = hasLat && hasLng
    ? {
        lat: normalizedLat,
        lng: normalizedLng
      }
    : null;

  return {
    ...mapTripToCard(tripEntity, 0, userId ?? null),
    driver: {
      name: driverName,
      initials: driverName ? deriveInitials(driverName) : null,
      vehicle: vehicleLabel,
      rating: null
    },
    pickupCoords
  };
};

const routeChipLabel = computed(() => {
  if (trip.value.route && trip.value.route !== 'Trip route pending') {
    return trip.value.route;
  }

  return `${trip.value?.departure} → ${trip.value?.dropoff}`;
});

const formattedDate = computed(() => {
  if (trip.value.datetimeLabel && trip.value.datetimeLabel !== 'Date & time to be confirmed') {
    return trip.value.datetimeLabel;
  }

  const segments = [trip.value.date, trip.value.departure].filter(Boolean);
  return segments.length ? segments.join(' · ') : 'Date & time to be confirmed';
});

const pickupLabel = computed(() => trip.value.pickup || 'Pickup location pending');
const dropoffLabel = computed(() => trip.value.dropoff || 'Destination pending');
const priceLabel = computed(() => trip.value.price || '£0.00');
const seatsLabel = computed(() => {
  if (typeof trip.value.seats === 'number' && trip.value.seats > 0) {
    return `${trip.value.seats} seat${trip.value.seats === 1 ? '' : 's'} available`;
  }

  return trip.value.seatsLabel ?? 'Seat availability not provided';
});

const detailItems = computed(() => [
  {
    id: 'datetime',
    label: 'Date & Time',
    value: formattedDate.value,
    icon: calendarOutline,
    accent: 'mint'
  },
  {
    id: 'pickup',
    label: 'Pickup Point',
    value: pickupLabel.value,
    icon: navigateOutline,
    accent: 'mint',
    helper: 'Pickup is confirmed during booking'
  },
  {
    id: 'destination',
    label: 'Destination',
    value: dropoffLabel.value,
    icon: flagOutline,
    accent: 'mint'
  },
  {
    id: 'price',
    label: 'Price per Seat',
    value: priceLabel.value,
    icon: cashOutline,
    accent: 'mint'
  },
  {
    id: 'seats',
    label: 'Available Seats',
    value: seatsLabel.value,
    icon: peopleOutline,
    accent: 'sunny',
    highlight: true
  }
]);

const driverName = computed(() => trip.value.driver?.name ?? (trip.value.role === 'carOwner' ? 'Your trip' : 'Trip host'));
const driverInitials = computed(() => trip.value.driver?.initials ?? deriveInitials(driverName.value));
const driverVehicle = computed(() => trip.value.driver?.vehicle ?? 'Vehicle details coming soon');
const driverRating = computed(() => {
  const rating = trip.value.driver?.rating;
  return typeof rating === 'number' && !Number.isNaN(rating) ? rating.toFixed(1) : null;
});

const openPickupSheet = () => {
  pickupSheetOpen.value = true;
};

const closePickupSheet = () => {
  pickupSheetOpen.value = false;
};

const parsePriceValue = (value: string) => {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
};

const buildPickupPayload = (selection: BookingSelection | null) => {
  if (!selection || selection.mode !== 'custom' || !selection.coords) {
    return {};
  }

  return {
    pickup_point: {
      label: selection.label,
      lat: selection.coords.lat,
      lng: selection.coords.lng
    },
    pickup_lat_lng: `${selection.coords.lat},${selection.coords.lng}`
  };
};

const submitBooking = async () => {
  if (isBooking.value) {
    return;
  }

  const token = userStore.session?.token;
  if (!token) {
    bookingError.value = 'Please sign in to book a seat.';
    return;
  }

  const selection = pendingSelection.value;
  const { pickup_point, pickup_lat_lng } = buildPickupPayload(selection);

  const payload = {
    tripId: trip.value.id,
    seat: 1,
    price: parsePriceValue(trip.value.price),
    pickup_point,
    pickup_lat_lng
  };

  try {
    isBooking.value = true;
    const booking = await createBooking(payload, token);
    lastBookingId.value = booking.id;
    bookingSuccessAlert.value = true;
  } catch (error) {
    console.error('Booking failed', error);
    bookingError.value = error instanceof Error ? error.message : 'Unable to complete booking.';
  } finally {
    isBooking.value = false;
  }
};

const handlePickupConfirmed = (payload: BookingSelection) => {
  pendingSelection.value = payload;
  trip.value.pickup = payload.label;
  trip.value.pickupCoords = payload.coords;
  closePickupSheet();
  void submitBooking();
};

const handleSuccessAlertDismiss = () => {
  bookingSuccessAlert.value = false;
  if (lastBookingId.value) {
    router.replace({ name: 'booked-trip-details', params: { id: lastBookingId.value } });
  }
};

const clearBookingError = () => {
  bookingError.value = null;
};

const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.replace('/tabs/home');
  }
};


onMounted(async () => {
  const foundTrip = await tripStore.getTripById(tripId);
  if (foundTrip) {
    const details = toTripDetailsPayload(foundTrip);
    trip.value = details;
    basePickupSnapshot.value = {
      label: details.pickup,
      coords: details.pickupCoords ?? null
    };
  } else {
    console.warn(`Trip with ID ${tripId} not found in store.`);
  }
});
</script>

<style scoped>
.trip-details {
  --background: #f6f8fb;
}

.page-stack {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.top-bar h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.icon-button {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: #ffffff;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111b2b;
}

.icon-button.placeholder {
  opacity: 0;
  pointer-events: none;
  box-shadow: none;
}

.details-body {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.map-card {
  position: relative;
  border-radius: var(--box-radius-lg);
  overflow: hidden;
  box-shadow: 0 30px 55px rgba(15, 23, 42, 0.15);
}

.map-visual {
  position: relative;
  height: 210px;
  background: radial-gradient(circle at 20% 30%, #e8f8ef 0%, #d4ebff 40%, #c0dcff 75%);
}



.map-visual::before {
  inset: 40px;
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.08);
}

.route-chip {
  position: absolute;
  left: 24px;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.16);
}

.driver-card {
  background: #ffffff;
  border-radius: var(--box-radius-lg);
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

.detail-list {
  display: flex;
  flex-direction: column;
  border-radius: var(--box-radius-lg);
  background-color: #ffffff;
}

.detail-row {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  align-items: center;
}

.icon-chip {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f8a64;
  background: #e6f8ef;
}

.icon-chip.is-sunny {
  background: #fff4e2;
  color: #d98006;
}

.detail-label {
  margin: 0;
  color: #7b849c;
  font-size: 0.85rem;
}

.detail-value {
  margin: 2px 0 0;
  font-weight: 600;
  color: #15213b;
}

.detail-value.is-accent {
  color: #d98006;
}

.detail-helper {
  margin: 6px 0 0;
  font-size: 0.75rem;
  color: #7b849c;
}

.cta-footer {
  --background: transparent;
  /* padding-bottom: env(safe-area-inset-bottom); */
}

.cta-panel {
  background: #ffffff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -18px 36px rgba(15, 23, 42, 0.08);
}

.price-info {
  min-width: 110px;
}

.price-heading {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.price-sub {
  margin: 4px 0 0;
  color: #7b839c;
  font-size: 0.85rem;
}

</style>
