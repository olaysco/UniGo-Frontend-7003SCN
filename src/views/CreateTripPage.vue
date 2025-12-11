<template>
  <ion-page>
    <ion-content class="create-trip-content safe-area-scroll">
      <AppBackHeader title="Create a New Trip" subtitle="Create Trip" @back="goBack" />
      <div class="page-inner">
        <section class="section-block">
          <p class="section-eyebrow">Where are you going?</p>

          <div class="form-group">
            <label class="field-label" for="pickup-input">Pickup Point</label>
            <div :class="['input-shell', { 'input-shell--error': fieldErrors.departurePoint }]">
                <GoogleMapsAutocomplete
   class="native-input sc-ion-input-ios w-full"
   placeholder="e.g., Coventry University"
   :options="mapOptions"
   @place_changed="onPickupPlaceChanged"
/>
              <ion-icon :icon="navigateOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="destination-input">Destination</label>
            <div :class="['input-shell', { 'input-shell--error': fieldErrors.arrivalPoint }]">
               <GoogleMapsAutocomplete
                   class="native-input sc-ion-input-ios w-full"
                    placeholder="e.g., Coventry University"
                    :options="mapOptions"
                    @place_changed="onDestinationPlaceChanged"
                  >
                </GoogleMapsAutocomplete>
              <ion-icon :icon="locationOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>
        </section>

        <section class="section-block">
          <p class="section-eyebrow">Trip Details</p>

          <div class="form-group">
            <div :class="['input-shell', { 'input-shell--error': fieldErrors.vehicle_id }]">
              <ion-select
                label="Vehicle"
                placeholder="Select Vehicle"
                class="select-field"
                id="vehicle"
                v-model="form.vehicle_id"
                :interface-options="selectInterfaceOptions"
              >
                <ion-select-option v-for="vehicle in vehicles" :key="vehicle.id" :value="String(vehicle.id)">
                  {{ vehicle.name }}
                </ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Available Seats</label>
            <div class="seat-stepper">
              <button type="button" class="stepper-btn" :disabled="form.seats <= minSeats" @click="decreaseSeats">
                <ion-icon :icon="removeOutline" aria-hidden="true" />
              </button>
              <span class="seat-value">{{ form.seats }}</span>
              <button type="button" class="stepper-btn" :disabled="form.seats >= maxSeats" @click="increaseSeats">
                <ion-icon :icon="addOutline" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="create-trip-datetime-button" class="field-label">Date &amp; Time</label>
            <ion-datetime-button datetime="create-trip-datetime" class="date-button"></ion-datetime-button>

            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="create-trip-datetime" v-model="form.datetime" :min="minDate"></ion-datetime>
            </ion-modal>
          </div>

          <div class="form-group">
            <label class="field-label" for="price-input">Cost per passenger</label>
            <div :class="['input-shell', 'price-shell', { 'input-shell--error': fieldErrors.cost }]">
              <span class="currency-prefix">£</span>
              <ion-input id="price-input" v-model="form.cost" type="number" inputmode="decimal" placeholder="0.00"
                class="text-input" min="0" step="0.5" />
            </div>
          </div>

          <ion-button
            expand="block"
            size="large"
            color="secondary"
            class="mt-6"
            :disabled="creatingTrip"
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
import { IonButton, IonContent, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonModal, IonPage, IonSelect, IonSelectOption, IonToast, loadingController } from '@ionic/vue';
import { addOutline, locationOutline, navigateOutline, removeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import GoogleMapsAutocomplete from '@/components/GoogleMapsAutocomplete.vue';
import { useVehicleStore } from '@/stores/vehicleStore';
import { storeToRefs } from 'pinia';
import { useToast } from '@/composables/useToast';
import { createTrip as createTripRequest, type TripPayload } from '@/services/tripService';
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
    form.arrivalPoint = place
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
</style>
