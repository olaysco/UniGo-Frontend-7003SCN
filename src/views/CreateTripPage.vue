<template>
  <ion-page>
    <ion-content class="create-trip-content safe-area-scroll">
      <AppBackHeader title="Create a New Trip" subtitle="Create Trip" @back="goBack" />
      <div class="page-inner">
        <section class="section-block describe-block">
          <div class="describe-heading">
            <p class="section-eyebrow">Describe your trip</p>
            <p class="describe-helper">Try: "Driving from Coventry to London on Friday at 9am, 3 seats, £15 each."</p>
          </div>

          <div
            class="describe-shell"
            :class="{ 'describe-shell--busy': descriptionProcessing }"
            :aria-busy="descriptionProcessing ? 'true' : 'false'"
          >
            <ion-textarea
              v-model="naturalTripDescription"
              placeholder="I'm driving from..."
              auto-grow
              :maxlength="400"
              :rows="3"
              aria-label="Trip description"
              class="describe-input"
              :disabled="descriptionProcessing"
            ></ion-textarea>

            <div class="describe-actions">
              <button type="button" class="describe-action describe-action--ghost" disabled aria-label="Voice input coming soon">
                <ion-icon :icon="micOutline" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="describe-action describe-action--primary"
                :disabled="descriptionProcessing"
                :aria-busy="descriptionProcessing ? 'true' : 'false'"
                @click="handleDescriptionSubmit"
                aria-label="Send trip description"
              >
                <ion-icon v-if="!descriptionProcessing" :icon="arrowUp" aria-hidden="true" />
                <ion-spinner v-else name="crescent" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section class="section-block input-block">
          <p class="section-eyebrow">Where are you going?</p>

          <div class="form-group">
            <label class="field-label" for="pickup-input">Pickup Point</label>
            <div v-if="descriptionProcessing" class="input-shell input-shell--skeleton" aria-hidden="true">
              <ion-skeleton-text animated class="input-skeleton-line" style="width: 70%" />
              <ion-skeleton-text animated class="input-skeleton-line" style="width: 90%" />
            </div>
            <div v-else :class="['input-shell', { 'input-shell--error': fieldErrors.departurePoint }]">
              <GoogleMapsAutocomplete
                v-model="pickupQuery"
                class="native-input sc-ion-input-ios w-full"
                placeholder="Pickup e.g., Coventry University"
                :options="mapOptions"
                @place_changed="onPickupPlaceChanged"
              />
              <ion-icon :icon="navigateOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="destination-input">Destination</label>
            <div v-if="descriptionProcessing" class="input-shell input-shell--skeleton" aria-hidden="true">
              <ion-skeleton-text animated class="input-skeleton-line" style="width: 65%" />
              <ion-skeleton-text animated class="input-skeleton-line" style="width: 80%" />
            </div>
            <div v-else :class="['input-shell', { 'input-shell--error': fieldErrors.arrivalPoint }]">
              <GoogleMapsAutocomplete
                v-model="destinationQuery"
                class="native-input sc-ion-input-ios w-full"
                placeholder="Destination e.g., Coventry University"
                :options="mapOptions"
                @place_changed="onDestinationPlaceChanged"
              >
              </GoogleMapsAutocomplete>
              <ion-icon :icon="locationOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>
          <div class="form-group">
            <label class="field-label" for="vehicle-input">Vehicle</label>
            <div :class="['input-shell', { 'input-shell--error': fieldErrors.vehicle_id }]">
              <ion-select
                label="Vehicle"
                placeholder="Select Vehicle"
                class="select-field"
                id="vehicle"
                v-model="form.vehicle_id"
                :interface-options="selectInterfaceOptions"
                :disabled="descriptionProcessing"
              >
                <ion-select-option v-for="vehicle in vehicles" :key="vehicle.id" :value="String(vehicle.id)">
                  {{ vehicle.name }}
                </ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Available Seats</label>
            <div :class="['seat-stepper', { 'seat-stepper--disabled': descriptionProcessing }]">
              <button type="button" class="stepper-btn" :disabled="descriptionProcessing || form.seats <= minSeats" @click="decreaseSeats">
                <ion-icon :icon="removeOutline" aria-hidden="true" />
              </button>
              <span class="seat-value">{{ form.seats }}</span>
              <button type="button" class="stepper-btn" :disabled="descriptionProcessing || form.seats >= maxSeats" @click="increaseSeats">
                <ion-icon :icon="addOutline" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="create-trip-datetime-button" class="field-label">Date &amp; Time</label>
            <ion-datetime-button
              datetime="create-trip-datetime"
              class="date-button"
              :disabled="descriptionProcessing"
            ></ion-datetime-button>

            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="create-trip-datetime" v-model="form.datetime" :min="minDate" :disabled="descriptionProcessing"></ion-datetime>
            </ion-modal>
          </div>

          <div class="form-group">
            <label class="field-label" for="price-input">Cost per passenger</label>
            <div :class="['input-shell', 'price-shell', { 'input-shell--error': fieldErrors.cost }]">
              <span class="currency-prefix">£</span>
              <ion-input
                id="price-input"
                v-model="form.cost"
                type="number"
                inputmode="decimal"
                placeholder="0.00"
                class="text-input"
                min="0"
                step="0.5"
                :disabled="descriptionProcessing"
              />
            </div>
          </div>

          <ion-button
            expand="block"
            size="large"
            color="secondary"
            class="mt-6"
            :disabled="creatingTrip || descriptionProcessing"
            @click="createTrip"
          >
            {{ creatingTrip ? 'Creating Trip...' : 'Create Trip' }}
          </ion-button>
        </section>
      </div>

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
import { onMounted, reactive, ref, watch } from 'vue';
import { IonButton, IonContent, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonModal, IonPage, IonSelect, IonSelectOption, IonSkeletonText, IonSpinner, IonTextarea, IonToast, loadingController } from '@ionic/vue';
import { addOutline, arrowUp, locationOutline, micOutline, navigateOutline, removeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import GoogleMapsAutocomplete from '@/components/GoogleMapsAutocomplete.vue';
import { useVehicleStore } from '@/stores/vehicleStore';
import { storeToRefs } from 'pinia';
import { useToast } from '@/composables/useToast';
import { createTrip as createTripRequest, parseTripDescription, type TripPayload } from '@/services/tripService';
import { useUserStore } from '@/stores/userStore';
import { useTripStore } from '@/stores/tripStore';
const { toastMessage, toastColor, toastOpen, showToast, closeToast } = useToast('success');

const router = useRouter();
const vehicleStore = useVehicleStore();
const userStore = useUserStore();
const tripStore = useTripStore();
const { vehicles, loaded } = storeToRefs(vehicleStore);

const loadVehicles = async () => {
  try {
    await vehicleStore.fetchVehicles();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load vehicles.';
    showToast(message, 'danger');
  }
};

const center = { lat: 52.347725, lng: -2.206882 };
const mapOptions = ref({
  componentRestrictions: { country: 'gb' },
  bounds: {
    north: center.lat + 0.5,
    south: center.lat - 0.5,
    east: center.lng + 0.5,
    west: center.lng - 0.5,
  }
});

onMounted(() => {
  if (!loaded.value) {
    loadVehicles();
  }
});

// IonDatetime expects ISO string boundaries; clamp min to start of today.
const today = new Date();
today.setHours(0, 0, 0, 0);
const minDate = today.toISOString();

const pickupQuery = ref('');
const destinationQuery = ref('');

const form = reactive({
  departureLat: null as number | null,
  arrivalLat: null as number | null,
  departureLng: null as number | null,
  arrivalLng: null as number | null,
  departurePoint: null as AutocompletePlace | null,
  arrivalPoint: null as AutocompletePlace | null,
  seats: 2,
  datetime: new Date().toISOString(),
  cost: '',
  vehicle_id: null as string | number | null,
});

const fieldErrors = reactive({
  departurePoint: false,
  arrivalPoint: false,
  vehicle_id: false,
  cost: false,
});

const creatingTrip = ref(false);
const selectInterfaceOptions = { cssClass: 'create-trip-select-alert' };

type AutocompletePlace = {
  name?: string;
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
};

const getLatLngString = (place: AutocompletePlace) => {
  console.log('Place changed:', place);
  const lat = place?.geometry?.location?.lat();
  const lng = place?.geometry?.location?.lng();

  if (typeof lat === 'number' && typeof lng === 'number') {
    return [lat, lng];
  }

  return null;
};

const onPickupPlaceChanged = (place: AutocompletePlace) => {
  const coords = getLatLngString(place);
  console.log(place)

  if (coords) {
    form.departureLat = coords[0];
    form.departureLng = coords[1];
    form.departurePoint = place;
    const label = place.formatted_address ?? place.name;
    if (label) {
      pickupQuery.value = label;
    }
    fieldErrors.departurePoint = false;
  } else {
    showToast('Unable to determine pickup coordinates.', 'danger');
    fieldErrors.departurePoint = true;
  }
};

const onDestinationPlaceChanged = (place: AutocompletePlace) => {
  const coords = getLatLngString(place);

  if (coords) {
    form.arrivalLat = coords[0];
    form.arrivalLng = coords[1];
    form.arrivalPoint = place;
    const label = place.formatted_address ?? place.name;
    if (label) {
      destinationQuery.value = label;
    }
    fieldErrors.arrivalPoint = false;
  } else {
    showToast('Unable to determine destination coordinates.', 'danger');
    fieldErrors.arrivalPoint = true;
  }
};

watch(() => form.vehicle_id, (value) => {
  if (value !== null) {
    fieldErrors.vehicle_id = false;
  }
});

watch(() => form.cost, (value) => {
  if (value !== '') {
    fieldErrors.cost = false;
  }
});

const ensureVehicleSelection = (vehicleList: typeof vehicles.value) => {
  if (!vehicleList.length) {
    form.vehicle_id = null;
    return;
  }

  const currentId = form.vehicle_id;
  const hasCurrentSelection =
    currentId !== null && vehicleList.some((vehicle) => String(vehicle.id) === String(currentId));

  if (!hasCurrentSelection) {
    form.vehicle_id = String(vehicleList[0].id);
  }
};

watch(vehicles, ensureVehicleSelection, { immediate: true });

const naturalTripDescription = ref('');
const descriptionProcessing = ref(false);

type GeocodeTarget = 'departure' | 'arrival';

const resolveGoogleMaps = () => {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps is not available in this environment.');
  }

  const maps = (window as typeof window & { google?: any }).google?.maps;
  if (!maps || typeof maps.Geocoder !== 'function') {
    throw new Error('Google Maps is not ready yet. Please try again in a moment.');
  }
  return maps;
};

const geocodeAddress = async (
  address: string
): Promise<{ place: AutocompletePlace; lat: number; lng: number } | null> => {
  if (!address.trim()) {
    return null;
  }

  const maps = resolveGoogleMaps();
  const geocoder = new maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results: any, status: string) => {
      if (status === 'OK' && results?.length) {
        const result = results[0];
        const location = result.geometry?.location;
        if (!location) {
          resolve(null);
          return;
        }

        const latValue = typeof location.lat === 'function' ? location.lat() : location.lat;
        const lngValue = typeof location.lng === 'function' ? location.lng() : location.lng;

        const place: AutocompletePlace = {
          name: result.formatted_address ?? address,
          formatted_address: result.formatted_address ?? address,
          place_id: result.place_id,
          geometry: {
            location: {
              lat: () => latValue,
              lng: () => lngValue
            }
          }
        };

        resolve({ place, lat: latValue, lng: lngValue });
        return;
      }

      if (status === 'ZERO_RESULTS') {
        resolve(null);
        return;
      }

      reject(new Error('Unable to map that address. Please refine your description.'));
    });
  });
};

const setLocationFromText = async (address: string | null | undefined, type: GeocodeTarget) => {
  if (!address || !address.trim()) {
    return;
  }

  try {
    const geocoded = await geocodeAddress(address);
    if (!geocoded) {
      showToast(`Couldn't locate ${type === 'departure' ? 'the pickup' : 'the destination'} address.`, 'warning');
      if (type === 'departure') {
        fieldErrors.departurePoint = true;
      } else {
        fieldErrors.arrivalPoint = true;
      }
      return;
    }

    if (type === 'departure') {
      form.departureLat = geocoded.lat;
      form.departureLng = geocoded.lng;
      form.departurePoint = geocoded.place;
      const label = geocoded.place.formatted_address ?? geocoded.place.name ?? address;
      if (label) {
        pickupQuery.value = label;
      }
      fieldErrors.departurePoint = false;
    } else {
      form.arrivalLat = geocoded.lat;
      form.arrivalLng = geocoded.lng;
      form.arrivalPoint = geocoded.place;
      const label = geocoded.place.formatted_address ?? geocoded.place.name ?? address;
      if (label) {
        destinationQuery.value = label;
      }
      fieldErrors.arrivalPoint = false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to geocode that location.';
    showToast(message, 'danger');
  }
};

const clampSeats = (value: number) => {
  if (!Number.isFinite(value)) {
    return form.seats;
  }
  return Math.min(maxSeats, Math.max(minSeats, Math.round(value)));
};

const handleDescriptionSubmit = async () => {
  if (descriptionProcessing.value) {
    return;
  }

  if (!naturalTripDescription.value.trim()) {
    showToast('Add a quick trip description first.', 'warning');
    return;
  }

  const token = userStore.session?.token;
  if (!token) {
    router.push({ path: '/login' });
    showToast('Please sign in to describe your trip.', 'danger');
    return;
  }

  descriptionProcessing.value = true;

  try {
    const details = await parseTripDescription(naturalTripDescription.value.trim(), token);

    if (typeof details.seats === 'number') {
      form.seats = clampSeats(details.seats);
    }

    if (typeof details.price === 'number' && Number.isFinite(details.price)) {
      form.cost = String(details.price);
      fieldErrors.cost = false;
    }

    if (typeof details.departure_time === 'string') {
      const parsedDate = new Date(details.departure_time);
      if (!Number.isNaN(parsedDate.getTime())) {
        form.datetime = parsedDate.toISOString();
      }
    }

    await setLocationFromText(details.departure_location ?? null, 'departure');
    await setLocationFromText(details.arrival_location ?? null, 'arrival');

    showToast('Trip form updated from your description.', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process that description just yet.';
    showToast(message, 'danger');
  } finally {
    descriptionProcessing.value = false;
  }
};

const minSeats = 1;
const maxSeats = 6;

const increaseSeats = () => {
  if (form.seats < maxSeats) {
    form.seats += 1;
  }
};

const decreaseSeats = () => {
  if (form.seats > minSeats) {
    form.seats -= 1;
  }
};

const goBack = () => {
  router.back();
};

const createTrip = async () => {
  if (descriptionProcessing.value) {
    showToast('Please wait for the trip description to finish processing.', 'warning');
    return;
  }

  console.log('Creating trip with form data:', form);
  fieldErrors.departurePoint = !form.departurePoint;
  fieldErrors.arrivalPoint = !form.arrivalPoint;
  fieldErrors.vehicle_id = form.vehicle_id === null;
  fieldErrors.cost = form.cost === '';

  if (
    fieldErrors.departurePoint ||
    fieldErrors.arrivalPoint ||
    fieldErrors.vehicle_id ||
    fieldErrors.cost
  ) {
    return;
  }

  const token = userStore.session?.token;
  if (!token) {
    router.push({ path: '/login' });
    showToast('Please sign in to create a trip.', 'danger');
    return;
  }

  const userId = userStore.session?.user?.id ?? userStore.profile?.id ?? null;
  if (userId === null || userId === undefined) {
    showToast('Unable to determine user information.', 'danger');
    return;
  }

  if (creatingTrip.value) {
    return;
  }

  const price = Number(form.cost);
  if (!Number.isFinite(price)) {
    fieldErrors.cost = true;
    return;
  }

  const payload: TripPayload = {
    vehicleId: form.vehicle_id!,
    userId,
    departureLng: form.departureLng,
    arrivalLng: form.arrivalLng,
    departureLat: form.departureLat,
    arrivalLat: form.arrivalLat,
    departurePoint: form.departurePoint,
    arrivalPoint: form.arrivalPoint,
    departureTime: form.datetime,
    arrivalTime: form.datetime,
    availability: form.seats,
    price: Number(form.cost)
  };

  creatingTrip.value = true;

  let loader: HTMLIonLoadingElement | null = null;

  try {
    const trip = await createTripRequest(payload, token);
    showToast('Trip created successfully!', 'success');

    loader = await loadingController.create({
      message: 'Redirecting...'
    });
    await loader.present();
    await tripStore.fetchTrips(true);
    router.back();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create trip.';
    showToast(message, 'danger');
  } finally {
    creatingTrip.value = false;
    if (loader) {
      loader.dismiss();
      loader = null;
    }
  }
};
</script>

<style scoped>
.create-trip-content {
  --background: #f4f5f8;
}

.page-inner {
  padding: 0 20px 40px;
}

.section-block+.section-block {
  margin-top: 32px;
}

.section-eyebrow {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0c1220;
  margin: 0 0 16px;
}

.form-group+.form-group {
  margin-top: 18px;
}

.field-label {
  display: block;
  font-size: 0.9rem;
  color: #52607e;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-shell {
  width: 100%;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e3e8f5;
  min-height: 58px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.input-shell:focus-within {
  border-color: #1fb16a;
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.05),
    0 0 0 1px rgba(31, 177, 106, 0.18);
}

.input-shell--error {
  border-color: #f97373;
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.05),
    0 0 0 1px rgba(249, 115, 115, 0.4);
}

.select-field {
  flex: 1;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

:global(.create-trip-select-alert .alert-button) {
  color: #0f172a;
}

:global(.create-trip-select-alert [aria-checked='true'].sc-ion-alert-ios .alert-radio-label.sc-ion-alert-ios) {
  color: var(--ion-color-secondary);
}

.text-input {
  flex: 1;
  font-weight: 500;
  color: #101828;
}

.text-input::part(native) {
  padding-left: 0;
  padding-right: 0;
}

.input-icon {
  color: #9da7bf;
  font-size: 1.4rem;
}

.seat-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e3e8f5;
  min-height: 60px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.stepper-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: rgba(20, 186, 130, 0.12);
  color: var(--ion-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stepper-btn:disabled {
  opacity: 0.3;
}

.seat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c1220;
}

.date-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: space-between;
  min-height: 58px;
  border-radius: 18px;
  border: 1px solid #e3e8f5;
  background: #ffffff;
  color: #101828;
  font-weight: 600;
  padding: 0 18px;
  box-shadow: 0 8px 18px rgba(15, 23, 42,.05);
}

.date-button:focus-visible {
  border-color: #1fb16a;
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.05),
    0 0 0 1px rgba(31, 177, 106, 0.18);
}

.price-shell {
  gap: 8px;
}

.currency-prefix {
  font-weight: 700;
  font-size: 1.1rem;
  color: #7c8499;
}

.action-bar {
  position: sticky;
  bottom: 0;
  padding-top: 20px;
  background: linear-gradient(180deg, rgba(244, 245, 248, 0) 0%, #f4f5f8 35%);
}

.action-bar ion-button {
  --box-shadow: 0 12px 22px rgba(16, 185, 129, 0.4);
}

ion-datetime {
  width: 100%;
}
.alert-wrapper.sc-ion-alert-ios {
  --ion-color-primary: black !important;
}

.describe-block {
  margin-top: 4px;
}

.describe-heading {
  margin-bottom: 12px;
}

.describe-helper {
  margin: 6px 0 0;
  color: #7c8499;
  font-size: 0.85rem;
}

.describe-shell {
  border-radius: 24px;
  background: #fdfefe;
  border: 1px solid #e3e8f5;
  padding: 16px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.describe-shell--busy {
  opacity: 0.7;
  pointer-events: none;
}

.describe-shell:focus-within {
  border-color: var(--ion-color-secondary);
  box-shadow: 0 18px 40px rgba(23, 177, 106, 0.25);
}

.describe-input {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  color: #101828;
  min-height: 96px;
}

.describe-input::part(native) {
  padding: 0;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
}

.describe-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.describe-action {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.describe-action--ghost {
  background: rgba(23, 177, 106, 0.1);
  color: #17b16a;
}

.describe-action--primary {
  background: #17b16a;
  color: #ffffff;
  box-shadow: 0 12px 22px rgba(23, 177, 106, 0.35);
}

.describe-action[disabled] {
  opacity: 0.4;
  box-shadow: none;
}

.describe-action ion-spinner {
  width: 20px;
  height: 20px;
}

.input-shell--skeleton {
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 10px;
}

.input-skeleton-line {
  --border-radius: 12px;
  height: 14px;
}

.seat-stepper--disabled {
  opacity: 0.5;
  pointer-events: none;
}

</style>
