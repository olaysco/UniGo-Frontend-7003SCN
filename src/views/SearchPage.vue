<template>
  <ion-page>
    <ion-content class="search-content" :fullscreen="true">
      <div class="search-layout">
        <section class="map-stage">
          <div class="map-shell">
            <GoogleMap
              ref="map"
              class="map-frame"
              :center="mapCenter"
              :zoom="mapZoom"
              :disableDefaultUI="true"
            >
              <GoogleMapMarker
                v-if="pickupLocation"
                :position="pickupLocation"
                :icon="{ url: pickupIcon }"
                :clickable="false"
                :map="map?.map"
              />
              <GoogleMapMarker
                v-if="dropoffLocation"
                :position="dropoffLocation"
                :icon="{ url: dropoffIcon }"
                :clickable="false"
                :map="map?.map"
              />
            </GoogleMap>
          </div>

          <div class="query-overlay pt-6 px-6">
            <div class="query-card">
              <div class="query-icon">
                <ion-icon :icon="locateOutline" aria-hidden="true" />
              </div>
              <div class="query-fields">
                <p class="query-label text-slate-60">Pickup</p>
                <GoogleMapsAutocomplete
                  v-model="originQuery"
                  class="query-input"
                  placeholder="Where are you now?"
                  aria-label="Pickup location"
                  :options="autocompleteOptions"
                  @place_changed="onPickupPlaceChanged"
                >
                </GoogleMapsAutocomplete>
              </div>
            </div>

            <div class="query-card">
              <div class="query-icon is-search">
                <ion-icon :icon="searchOutline" aria-hidden="true" />
              </div>
              <div class="query-fields">
                <p class="query-label text-slate-60">Drop-off</p>
                <GoogleMapsAutocomplete
                  v-model="destinationQuery"
                  class="query-input"
                  placeholder="Where to?"
                  aria-label="Drop-off location"
                  :options="autocompleteOptions"
                  @place_changed="onDropoffPlaceChanged"
                >
                </GoogleMapsAutocomplete>
              </div>
            </div>
          </div>

          <section class="result-sheet">
            <div class="sheet-card">

              <div v-if="isSearching" class="sheet-loading">
                <ion-spinner name="crescent" aria-hidden="true" />
                <p>Searching trips...</p>
              </div>

              <Swiper
                v-else-if="rides.length"
                class="sheet-swiper"
                :slides-per-view="slidesPerView"
                :space-between="16"
                :slides-offset-before="16"
                :slides-offset-after="rides.length > 1 ? 16 : 0"
                :allow-touch-move="rides.length > 1"
                :grab-cursor="rides.length > 1"
                :threshold="8"
              >
                <SwiperSlide v-for="ride in rides" :key="ride.id">
                  <TripCard :trip="ride" :route-name="ride.role == 'coRider' ? 'trip-details': 'owner-trip-details'" />
                </SwiperSlide>
              </Swiper>

              <div v-else-if="searchError" class="sheet-empty is-error">
                <ion-icon :icon="searchOutline" aria-hidden="true" />
                <p>{{ searchError }}</p>
              </div>

              <div v-else-if="pickupLocation || dropoffLocation" class="sheet-empty">
                <ion-icon :icon="searchOutline" aria-hidden="true" />
                <p>Update your pickup or drop-off locations to discover rides.</p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { locateOutline, searchOutline } from 'ionicons/icons';
import TripCard, { TripCardData } from '@/components/TripCard.vue';
import GoogleMap from '@/components/GoogleMap.vue';
import GoogleMapMarker from '@/components/GoogleMapMarker.vue';
import GoogleMapsAutocomplete from '@/components/GoogleMapsAutocomplete.vue';
import { fetchTrips, type Trip } from '@/services/tripService';
import { useUserStore } from '@/stores/userStore';
import { mapTripToCard } from '@/stores/tripStore';

type LatLngLiteral = { lat: number; lng: number };


const fallbackCenter: LatLngLiteral = { lat: 52.406822, lng: -1.519693 };
const autocompleteOptions = {
  componentRestrictions: { country: 'gb' },
  bounds: {
    north: fallbackCenter.lat + 0.5,
    south: fallbackCenter.lat - 0.5,
    east: fallbackCenter.lng + 0.5,
    west: fallbackCenter.lng - 0.5
  }
};

const map = ref();
const originQuery = ref();
const destinationQuery = ref();

const userStore = useUserStore();
const pickupLocation = ref<LatLngLiteral | null>();
const dropoffLocation = ref<LatLngLiteral | null>();
const mapCenter = computed<LatLngLiteral>(() => {
  if (pickupLocation.value && dropoffLocation.value) {
    return {
      lat: (pickupLocation.value.lat + dropoffLocation.value.lat) / 2,
      lng: (pickupLocation.value.lng + dropoffLocation.value.lng) / 2
    };
  }

  return pickupLocation.value ?? dropoffLocation.value ?? fallbackCenter;
});

const mapZoom = computed(() => {
  if (pickupLocation.value && dropoffLocation.value) {
    return 11;
  }

  if (pickupLocation.value || dropoffLocation.value) {
    return 13;
  }

  return 12;
});
const pickupIcon = createMarkerIcon('#0ac36c');
const dropoffIcon = createMarkerIcon('#2563eb');

const rides = ref<TripCardData[]>([]);
const isSearching = ref(false);
const searchError = ref<string | null>(null);
let latestSearchId = 0;

type AutocompletePlace = {
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
};

const getLatLngFromPlace = (place: AutocompletePlace): LatLngLiteral | null => {
  const lat = place?.geometry?.location?.lat?.();
  const lng = place?.geometry?.location?.lng?.();

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }

  return null;
};

const getPlaceDescription = (place: AutocompletePlace, fallback: string) => {
  return place.formatted_address ?? place.name ?? fallback;
};

const slidesPerView = computed(() => (rides.value.length > 1 ? 1.08 : 1));

function createMarkerIcon(color: string) {
  const svg = `<svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg"><path d="M17 0C7.611 0 0 7.611 0 17c0 11.756 15.2 26.972 16.471 28.266a0.75 0.75 0 0 0 1.058 0C18.8 43.972 34 28.756 34 17 34 7.611 26.389 0 17 0Zm0 24.5A7.5 7.5 0 1 1 24.5 17 7.509 7.509 0 0 1 17 24.5Z" fill="${color}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const formatCoords = (coords: LatLngLiteral) => `${coords.lat},${coords.lng}`;

const searchTrips = async (origin: LatLngLiteral, destination: LatLngLiteral) => {
  const requestId = ++latestSearchId;
  isSearching.value = true;
  searchError.value = null;

  try {
    const trips = await fetchTrips(
      {
        arrival_lat: origin.lat,
        arrival_lng: origin.lng,
        destination_lat: destination.lat,
        destination_lng: destination.lng
      },
      userStore.session?.token ?? ''
    );

    if (requestId !== latestSearchId) {
      return;
    }

    rides.value = trips.map((trip, index) => mapTripToCard(trip, index, userStore.session?.user?.id ?? null));
    console.log('Found trips:', rides.value);
  } catch (error) {
    if (requestId !== latestSearchId) {
      return;
    }

    searchError.value = error instanceof Error ? error.message : 'Unable to load trips.';
    rides.value = [];
  } finally {
    if (requestId === latestSearchId) {
      isSearching.value = false;
    }
  }
};

watch(
  [pickupLocation, dropoffLocation],
  ([origin, destination]) => {
    console.log('Searching trips from', origin, 'to', destination);
    if (origin && destination) {
      void searchTrips(origin, destination);
    }
  },
  { immediate: true }
);


const onPickupPlaceChanged = (place: AutocompletePlace) => {
  const coords = getLatLngFromPlace(place);
  const description = getPlaceDescription(place, originQuery.value);

  if (coords) {
    pickupLocation.value = coords;
  }

  originQuery.value = description;
};

const onDropoffPlaceChanged = (place: AutocompletePlace) => {
  const coords = getLatLngFromPlace(place);
  const description = getPlaceDescription(place, destinationQuery.value);

  if (coords) {
    dropoffLocation.value = coords;
  }

  destinationQuery.value = description;
};
</script>

<style scoped>
.search-content {
  --background: #f4f6fb;
}

.search-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  gap: 14px;
}

.map-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 0 -20px;
  overflow: hidden;
}

.query-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 8px 12px;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.query-overlay {
  position: absolute;
  top: 20px;
  left: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 3;
}

.query-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #e6f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #09a85a;
  flex-shrink: 0;
}

.query-icon.is-search {
  background: #e9f1ff;
  color: #2172ff;
}

.query-fields {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.query-label {
  font-size: 0.7rem;
  margin-bottom: 2px;
}

.query-input {
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0e1527;
  outline: none;
  width: 100%;
}

.query-input::placeholder {
  color: #b4bccb;
  font-weight: 500;
}

.map-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
  box-shadow: none;
  background: linear-gradient(135deg, #d3dfea, #f5f7fb);
}

.map-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  filter: saturate(0.9) contrast(1.05);
}

.map-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 45%);
  pointer-events: none;
}

.result-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(12px + var(--ion-safe-area-bottom, 0px));
  padding: 0 16px;
  z-index: 4;
}

.sheet-swiper {
  padding: 4px 0 8px;
}

.sheet-swiper :deep(.swiper-wrapper) {
  padding-bottom: 4px;
}

.sheet-swiper :deep(.swiper-slide) {
  display: flex;
  height: auto;
}

.sheet-swiper :deep(.trip-card) {
  width: 100%;
}

.sheet-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  color: #6d7388;
  background: white;
  padding: 8px;
}

.sheet-empty ion-icon {
  font-size: 1.8rem;
  color: #9aa3b6;
}

.sheet-empty.is-error {
  color: #b42318;
}

.sheet-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6d7388;
  padding: 12px;
}

.sheet-loading ion-spinner {
  width: 30px;
  height: 30px;
  color: #136f4a;
}
</style>
