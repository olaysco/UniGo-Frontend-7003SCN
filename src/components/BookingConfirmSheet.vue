<template>
  <ion-modal
    class="pickup-modal"
    :is-open="isOpen"
    :initial-breakpoint="0.6"
    :breakpoints="[0, 0.45, 0.6, 0.9]"
    handle-behavior="cycle"
    @didDismiss="emitClose"
  >
    <ion-content class="pickup-sheet">
      <div class="pickup-sheet__inner ion-padding">
        <p class="pickup-sheet__eyebrow">Booking detail</p>
        <h2 class="pickup-sheet__title font-black">Confirm pickup location and seats</h2>
        <p class="pickup-sheet__base">Trip pickup: {{ baseLabel }}</p>

        <ion-segment
          :value="pickupMode"
          class="pickup-sheet__segment"
          @ionChange="handlePickupModeChange"
        >
          <ion-segment-button value="current">
            <span>Use trip pickup</span>
          </ion-segment-button>
          <ion-segment-button value="custom" :disabled="!allowsCustomPickup">
            <span>Set new pickup</span>
          </ion-segment-button>
        </ion-segment>

        <div v-if="pickupMode === 'custom'" class="pickup-form">
          <label class="pickup-form__label" for="pickup-search">Search pickup</label>
          <div class="pickup-form__field">
            <GoogleMapsAutocomplete
              id="pickup-search"
              v-model="pickupSearchQuery"
              placeholder="Search for a nearby pickup"
              @place_changed="handlePlaceSelected"
            />
          </div>
          <p class="pickup-form__hint">New pickup must be within {{ displayMaxDistance }} km of the trip pickup.</p>
        </div>

        <p class="pickup-sheet__status" :class="{ 'is-error': pickupMode === 'custom' && !isCustomDistanceValid }">
          {{ pickupStatusLabel }}
        </p>

        <div class="seat-picker">
          <label class="seat-picker__label" for="seat-count">Seats to book</label>
          <div class="seat-picker__field">
            <span class="seat-picker__prefix">Seats</span>
            <input
              id="seat-count"
              v-model.number="seatCount"
              type="number"
              inputmode="numeric"
              :min="hasSeatOptions ? 1 : 0"
              :max="maxSelectableSeats"
              :disabled="!hasSeatOptions"
              class="seat-picker__input"
            />
          </div>
          <p v-if="hasSeatOptions" class="seat-picker__hint">
            Up to {{ maxSelectableSeats }} seat{{ maxSelectableSeats === 1 ? '' : 's' }} available.
          </p>
          <p v-else class="seat-picker__hint seat-picker__hint--error">
            No seats are available for this trip.
          </p>
        </div>

        <div class="pickup-sheet__actions">
          <ion-button fill="clear" color="medium" @click="emitClose">Cancel</ion-button>
          <ion-button color="secondary" expand="block" :disabled="!canSubmitPickup" @click="emitConfirm">
            Confirm pickup
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  IonButton,
  IonContent,
  IonModal,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue';
import GoogleMapsAutocomplete from '@/components/GoogleMapsAutocomplete.vue';

type Coordinates = {
  lat: number;
  lng: number;
};

type PickupMode = 'current' | 'custom';

interface ConfirmPayload {
  label: string;
  coords: Coordinates | null;
  seat: number;
}

interface AutocompletePlace {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    basePickupLabel?: string;
    basePickupCoords: Coordinates | null;
    currentPickupLabel?: string;
    maxDistanceKm?: number;
    availableSeats?: number;
  }>(),
  {
    basePickupLabel: '',
    currentPickupLabel: '',
    maxDistanceKm: 2,
    availableSeats: 1
  }
);

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'confirm', payload: ConfirmPayload & { mode: PickupMode }): void;
}>();

const pickupMode = ref<PickupMode>('current');
const pickupSearchQuery = ref('');
const lastSelectedQuery = ref('');
const customCoords = ref<Coordinates | null>(null);
const seatCount = ref(1);

const baseLabel = computed(() => props.basePickupLabel || 'Pickup location pending');
const allowsCustomPickup = computed(() => Boolean(props.basePickupCoords));
const displayMaxDistance = computed(() => props.maxDistanceKm);
const maxSelectableSeats = computed(() => {
  const seats = Number(props.availableSeats);
  if (!Number.isFinite(seats)) {
    return 0;
  }
  return Math.max(0, Math.floor(seats));
});
const hasSeatOptions = computed(() => maxSelectableSeats.value > 0);

const resetForm = () => {
  pickupMode.value = 'current';
  pickupSearchQuery.value = props.currentPickupLabel?.trim() || baseLabel.value;
  lastSelectedQuery.value = pickupSearchQuery.value;
  customCoords.value = null;
  seatCount.value = hasSeatOptions.value ? 1 : 0;
};

watch(
  () => props.isOpen,
  value => {
    if (value) {
      resetForm();
    }
  }
);

watch(maxSelectableSeats, seats => {
  if (seats <= 0) {
    seatCount.value = 0;
    return;
  }

  if (seatCount.value <= 0) {
    seatCount.value = 1;
    return;
  }

  if (seatCount.value > seats) {
    seatCount.value = seats;
  }
});

watch(pickupSearchQuery, value => {
  if (pickupMode.value === 'custom' && value !== lastSelectedQuery.value) {
    customCoords.value = null;
  }
});

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getLatLngFromPlace = (place: AutocompletePlace): Coordinates | null => {
  const lat = place?.geometry?.location?.lat?.();
  const lng = place?.geometry?.location?.lng?.();

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }

  return null;
};

const calculateDistanceKm = (start: Coordinates, end: Coordinates) => {
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const customPickupCoords = computed<Coordinates | null>(() => {
  if (pickupMode.value !== 'custom') {
    return null;
  }

  return customCoords.value;
});

const customPickupDistance = computed(() => {
  if (pickupMode.value !== 'custom' || !props.basePickupCoords || !customPickupCoords.value) {
    return null;
  }

  return calculateDistanceKm(props.basePickupCoords, customPickupCoords.value);
});

const isCustomDistanceValid = computed(() => {
  if (pickupMode.value !== 'custom') {
    return true;
  }

  if (!props.basePickupCoords) {
    return false;
  }

  const distance = customPickupDistance.value;
  return distance !== null && distance <= props.maxDistanceKm;
});

const canSubmitPickup = computed(() => {
  const seatIsValid = hasSeatOptions.value && seatCount.value >= 1 && seatCount.value <= maxSelectableSeats.value;

  if (pickupMode.value === 'current') {
    return seatIsValid;
  }

  const hasLabel = Boolean(pickupSearchQuery.value.trim());
  return seatIsValid && hasLabel && customPickupCoords.value !== null && isCustomDistanceValid.value;
});

const pickupStatusLabel = computed(() => {
  if (pickupMode.value === 'current') {
    return `Using trip pickup: ${baseLabel.value}`;
  }

  if (!allowsCustomPickup.value) {
    return 'Trip pickup coordinates are unavailable, so new locations cannot be validated.';
  }

  if (!customPickupCoords.value) {
    return 'Search for a pickup location to check the distance.';
  }

  if (!isCustomDistanceValid.value && customPickupDistance.value !== null) {
    return `New location is ${customPickupDistance.value.toFixed(2)} km away. Please stay within ${props.maxDistanceKm} km.`;
  }

  if (customPickupDistance.value !== null) {
    return `New location is ${customPickupDistance.value.toFixed(2)} km away from the trip pickup.`;
  }

  return 'Enter coordinates to calculate the distance.';
});

const handlePickupModeChange = (event: CustomEvent) => {
  const nextValue = event.detail?.value as PickupMode | undefined;
  if (!nextValue) {
    return;
  }
  pickupMode.value = nextValue;
  if (nextValue === 'current') {
    customCoords.value = null;
    pickupSearchQuery.value = props.currentPickupLabel?.trim() || baseLabel.value;
    lastSelectedQuery.value = pickupSearchQuery.value;
  }
};

const handlePlaceSelected = (place: AutocompletePlace) => {
  const coords = getLatLngFromPlace(place);
  const description = place.formatted_address ?? place.name ?? pickupSearchQuery.value;
  pickupSearchQuery.value = description;
  lastSelectedQuery.value = description;
  customCoords.value = coords;
};

const emitClose = () => {
  emit('close');
};

const emitConfirm = () => {
  if (!canSubmitPickup.value) {
    return;
  }

  if (pickupMode.value === 'current') {
    emit('confirm', {
      label: baseLabel.value,
      coords: props.basePickupCoords ?? null,
      mode: pickupMode.value,
      seat: seatCount.value
    });
    return;
  }

  if (customPickupCoords.value) {
    emit('confirm', {
      label: pickupSearchQuery.value.trim(),
      coords: customPickupCoords.value,
      mode: pickupMode.value,
      seat: seatCount.value
    });
  }
};
</script>

<style scoped>
ion-modal.pickup-modal::part(content) {
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  overflow: hidden;
  min-height: 45vh;
  box-shadow: 0 -20px 40px rgba(15, 23, 42, 0.12);
}

ion-modal.pickup-modal::part(handle) {
  width: 72px;
  height: 4px;
  border-radius: 999px;
  background: #cfd6e8;
  margin-top: 12px;
}

.pickup-sheet {
  --background: #f6f8fb;
}

.pickup-sheet__inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pickup-sheet__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #7b849c;
}

.pickup-sheet__title {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: bold;
}

.pickup-sheet__base {
  margin: 0;
  color: #526082;
}

.pickup-sheet__segment {
  background: #e9edf5;
  border-radius: 18px;
  padding: 6px;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.pickup-sheet__segment ion-segment-button {
  --color: #7b849c;
  --color-checked: #0f172a;
  --background: transparent;
  --background-checked: #ffffff;
  --indicator-color: transparent;
  --indicator-box-shadow: none;
  font-weight: 600;
  text-transform: none;
}

.pickup-sheet__segment ion-segment-button::part(native) {
  border-radius: 12px;
  box-shadow: none;
}

.pickup-sheet__segment ion-segment-button[aria-selected='true']::part(native) {
  box-shadow: 0 8px 18px rgba(16, 24, 64, 0.12);
}

.pickup-sheet__segment ion-segment-button[disabled] {
  opacity: 0.45;
}

.pickup-form {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pickup-form__label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #6b738a;
}

.pickup-form__field {
  width: 100%;
}

.pickup-form__field :deep(input) {
  width: 100%;
  border: none;
  background: #f7f9fd;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.95rem;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
}

.pickup-form__field :deep(input:focus-visible) {
  box-shadow: inset 0 0 0 2px #0ac36c;
}

.pickup-form__hint {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #7b849c;
}

.pickup-sheet__status {
  margin: 0;
  font-size: 0.85rem;
  color: #1b3b5a;
}

.pickup-sheet__status.is-error {
  color: #c53030;
}

.pickup-sheet__actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.seat-picker {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seat-picker__label {
  margin: 0;
  font-size: 0.8rem;
  color: #6b738a;
}

.seat-picker__field {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7f9fd;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
}

.seat-picker__prefix {
  font-size: 0.9rem;
  color: #6b738a;
  font-weight: 600;
}

.seat-picker__input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #0f172a;
  appearance: textfield;
}

.seat-picker__input:focus-visible {
  outline: none;
}

.seat-picker__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.seat-picker__input::-webkit-outer-spin-button,
.seat-picker__input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.seat-picker__hint {
  margin: 0;
  font-size: 0.75rem;
  color: #7b849c;
}

.seat-picker__hint--error {
  color: #c53030;
}
</style>
