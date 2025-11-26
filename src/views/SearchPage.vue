<template>
  <ion-page>
    <ion-content class="search-content" :fullscreen="true">
      <div class="search-layout">
        <!-- <header class="top-bar">
          <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
            <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
          </button>
          <h1>Find a Ride</h1>
          <button class="icon-button" type="button" aria-label="Open filters">
            <ion-icon :icon="funnelOutline" aria-hidden="true" />
          </button>
        </header> -->

        <section class="map-stage">
          <div class="map-shell">
            <iframe
              class="map-frame"
              :src="mapSrc"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              title="Google Maps preview"
            ></iframe>
            <div
              v-for="pin in mapPins"
              :key="pin.id"
              class="map-pin"
              :class="`is-${pin.variant}`"
              :style="{ top: `${pin.top}%`, left: `${pin.left}%` }"
            >
              <span v-if="pin.label">{{ pin.label }}</span>
            </div>
            <div class="map-price" :style="pricePinStyle">
              <span>{{ primaryFareLabel }}</span>
            </div>
          </div>

          <div class="query-overlay pt-6 px-6">
            <div class="query-card">
              <div class="query-icon">
                <ion-icon :icon="locateOutline" aria-hidden="true" />
              </div>
              <div class="query-fields">
                <p class="query-label text-slate-60">Pickup</p>
                <input
                  v-model="originQuery"
                  type="text"
                  placeholder="Where are you now?"
                  aria-label="Pickup location"
                />
              </div>
            </div>

            <div class="query-card">
              <div class="query-icon is-search">
                <ion-icon :icon="searchOutline" aria-hidden="true" />
              </div>
              <div class="query-fields">
                <p class="query-label text-slate-60">Drop-off</p>
                <input
                  v-model="destinationQuery"
                  type="text"
                  placeholder="Where to?"
                  aria-label="Drop-off location"
                />
              </div>
            </div>
          </div>

          <section class="result-sheet">
            <div class="sheet-card">

              <Swiper
                v-if="filteredRides.length"
                class="sheet-swiper"
                :slides-per-view="slidesPerView"
                :space-between="16"
                :slides-offset-before="16"
                :slides-offset-after="filteredRides.length > 1 ? 16 : 0"
                :allow-touch-move="filteredRides.length > 1"
                :grab-cursor="filteredRides.length > 1"
                :threshold="8"
              >
                <SwiperSlide v-for="ride in filteredRides" :key="ride.id">
                  <TripCard :trip="ride" route-name="trip-details" />
                </SwiperSlide>
              </Swiper>

              <div v-else class="sheet-empty">
                <ion-icon :icon="searchOutline" aria-hidden="true" />
                <p>Try updating your pickup or drop-off locations to discover more rides.</p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import { chevronBackOutline, funnelOutline, locateOutline, searchOutline } from 'ionicons/icons';
import TripCard, { TripCardData } from '@/components/TripCard.vue';

interface RideResult extends TripCardData {
  origin: string;
  destination: string;
  departure: string;
  priceValue: number;
}

interface MapPin {
  id: string;
  top: number;
  left: number;
  variant: 'cluster' | 'dot';
  label?: string;
}

const router = useRouter();

const originQuery = ref('Coventry University');
const destinationQuery = ref('Warwick University');

const rides = ref<RideResult[]>([
  {
    id: 1,
    datetimeLabel: 'Today · 08:30 AM',
    route: 'Coventry University → Warwick University',
    price: '£5.00 per seat',
    statusVariant: 'confirmed',
    seatsLabel: '2 seats left',
    passengers: [
      { id: 1, name: 'Alex Morgan', initials: 'AM', color: '#e3fff1' },
      { id: 2, name: 'Ben Patel', initials: 'BP', color: '#fff2e0' }
    ],
    mapVariant: 'variant-a',
    state: 'active',
    status: 'active',
    role: 'coRider',
    origin: 'Coventry University',
    destination: 'Warwick University',
    departure: '2024-07-24T08:30:00',
    priceValue: 5
  },
  {
    id: 2,
    datetimeLabel: 'Today · 08:30 AM',
    route: 'Coventry University → Warwick University',
    price: '£7.00 per seat',
    statusVariant: 'confirmed',
    seatsLabel: '3 seats left',
    passengers: [
      { id: 1, name: 'Alex Morgan', initials: 'AM', color: '#e3fff1' },
      { id: 2, name: 'Ben Patel', initials: 'BP', color: '#fff2e0' }
    ],
    mapVariant: 'variant-a',
    state: 'active',
    status: 'active',
    role: 'coRider',
    origin: 'Coventry University',
    destination: 'Warwick University',
    departure: '2024-07-24T08:30:00',
    priceValue: 5
  },
  {
    id: 3,
    datetimeLabel: 'Today · 09:15 AM',
    route: 'Coventry Station → Leamington Spa',
    price: '£4.50 per seat',
    statusVariant: 'active',
    seatsLabel: 'Only 1 seat left',
    passengers: [
      { id: 3, name: 'Maria R', initials: 'MR', color: '#fde8dc' }
    ],
    mapVariant: 'variant-b',
    state: 'active',
    status: 'active',
    role: 'coRider',
    origin: 'Coventry Station',
    destination: 'Leamington Spa',
    departure: '2024-07-24T09:15:00',
    priceValue: 4.5
  },
  {
    id: 4,
    datetimeLabel: 'Today · 11:00 AM',
    route: 'City Centre → Arena Shopping Park',
    price: '£3.00 per seat',
    statusVariant: 'upcoming',
    seatsLabel: '3 seats left',
    passengers: [
      { id: 4, name: 'Ben C', initials: 'BC', color: '#e2f6ed' },
      { id: 5, name: 'Rita K', initials: 'RK', color: '#e5ebff' }
    ],
    mapVariant: 'variant-a',
    state: 'active',
    status: 'upcoming',
    role: 'coRider',
    origin: 'City Centre',
    destination: 'Arena Shopping Park',
    departure: '2024-07-24T11:00:00',
    priceValue: 3
  }
]);

const mapPins: MapPin[] = [
  { id: 'cluster', top: 16, left: 20, variant: 'cluster', label: '4' },
  { id: 'dot-a', top: 62, left: 28, variant: 'dot' },
  { id: 'dot-b', top: 42, left: 65, variant: 'dot' }
];

const pricePinStyle = { top: '52%', left: '52%' };

const fallbackValue = (value: string, fallback: string) => (value.trim() ? value.trim() : fallback);

const mapSrc = computed(() => {
  const origin = fallbackValue(originQuery.value, 'Coventry University');
  const destination = fallbackValue(destinationQuery.value, 'Warwick University');
  const params = new URLSearchParams({ q: `${origin} to ${destination}`, z: '12', output: 'embed' });
  return `https://maps.google.com/maps?${params.toString()}`;
});

const filteredRides = computed(() => {
  const origin = originQuery.value.trim().toLowerCase();
  const destination = destinationQuery.value.trim().toLowerCase();

  const matches = rides.value.filter(ride => {
    const matchOrigin = origin ? ride.origin.toLowerCase().includes(origin) : true;
    const matchDestination = destination ? ride.destination.toLowerCase().includes(destination) : true;
    return matchOrigin && matchDestination;
  });

  return matches.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime());
});

const primaryFareLabel = computed(() => {
  const ride = filteredRides.value[0];
  return ride ? `£${ride.priceValue.toFixed(2)}` : '£0.00';
});

const slidesPerView = computed(() => (filteredRides.value.length > 1 ? 1.08 : 1));

const goBack = () => {
  router.back();
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

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.icon-button {
  border: none;
  background: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
  color: #0f172a;
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

.query-fields input {
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0e1527;
  outline: none;
}

.query-fields input::placeholder {
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

.map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ffffff;
  z-index: 2;
}

.map-pin.is-cluster {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #0ac36c;
  box-shadow: 0 12px 30px rgba(10, 195, 108, 0.4);
}

.map-pin.is-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #06c167;
  box-shadow: 0 6px 15px rgba(6, 193, 103, 0.5);
}

.map-price {
  position: absolute;
  transform: translate(-50%, -100%);
  background: #ffffff;
  color: #0f172a;
  padding: 10px 16px;
  border-radius: 18px;
  font-weight: 700;
  box-shadow: 0 18px 35px rgba(17, 24, 39, 0.2);
}

.map-price::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: #ffffff;
  rotate: 45deg;
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
}

.sheet-empty ion-icon {
  font-size: 1.8rem;
  color: #9aa3b6;
}
</style>
