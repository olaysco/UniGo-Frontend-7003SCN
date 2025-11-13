<template>
  <ion-page>
    <ion-content class="search-content safe-area-scroll" :fullscreen="true">
      <header class="top-bar ion-padding">
        <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>
        <h1>Find a Ride</h1>
        <button class="icon-button" type="button" aria-label="Open filters">
          <ion-icon :icon="funnelOutline" aria-hidden="true" />
        </button>
      </header>

      <main class="search-body ion-padding">
        <section class="search-field">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Where are you going?"
            inputmode="search"
            :debounce="250"
            show-cancel-button="never"
            aria-label="Search destination"
          />
        </section>

        <div class="filter-row">
          <button
            v-for="filter in filterOptions"
            :key="filter.id"
            class="filter-pill"
            :class="{ 'is-active': filter.id === activeFilter }"
            type="button"
            @click="selectFilter(filter.id)"
          >
            <ion-icon :icon="filter.icon" aria-hidden="true" />
            <span>{{ filter.label }}</span>
            <ion-icon
              v-if="filter.hasDropdown"
              :icon="chevronDownOutline"
              class="chevron"
              aria-hidden="true"
            />
          </button>
        </div>

        <section v-if="filteredRides.length" class="ride-results">
          <article
            v-for="ride in filteredRides"
            :key="ride.id"
            class="ride-card"
            role="button"
            tabindex="0"
            @click="openTrip(ride.id)"
            @keyup.enter.prevent="openTrip(ride.id)"
            @keyup.space.prevent="openTrip(ride.id)"
          >
            <div class="ride-card__top">
              <div class="driver-block">
                <div class="avatar" :style="{ backgroundColor: ride.driver.color }" aria-hidden="true">
                  <span>{{ ride.driver.initials }}</span>
                </div>
                <div>
                  <p class="ride-route">{{ ride.origin }} to {{ ride.destination }}</p>
                  <p class="driver-name">{{ ride.driver.name }}</p>
                </div>
              </div>
              <p class="ride-price">{{ formatPrice(ride.price) }}</p>
            </div>

            <div class="ride-card__meta">
              <div class="meta-item">
                <ion-icon :icon="timeOutline" aria-hidden="true" />
                <span>Departs: {{ formatDeparture(ride.departure) }}</span>
              </div>
              <div class="meta-item seats" :class="{ 'is-low': ride.seatsLeft === 1 }">
                <ion-icon :icon="peopleOutline" aria-hidden="true" />
                <span>{{ seatLabel(ride.seatsLeft) }}</span>
              </div>
            </div>
          </article>
        </section>

        <section v-else class="empty-state">
          <div class="empty-icon">
            <ion-icon :icon="searchOutline" aria-hidden="true" />
          </div>
          <h2>No Rides Found</h2>
          <p>Try adjusting your search or filters to find available rides.</p>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonSearchbar
} from '@ionic/vue';
import {
  add,
  calendarOutline,
  cashOutline,
  chevronBackOutline,
  chevronDownOutline,
  funnelOutline,
  peopleOutline,
  searchOutline,
  swapHorizontalOutline,
  timeOutline
} from 'ionicons/icons';

type FilterId = 'date' | 'route' | 'price';

interface RideDriver {
  name: string;
  initials: string;
  color: string;
}

interface RideResult {
  id: number;
  origin: string;
  destination: string;
  departure: string;
  price: number;
  seatsLeft: number;
  driver: RideDriver;
}

const router = useRouter();

const filterOptions: Array<{ id: FilterId; label: string; icon: string; hasDropdown?: boolean }> = [
  { id: 'date', label: 'Date', icon: calendarOutline, hasDropdown: true },
  { id: 'route', label: 'Route', icon: swapHorizontalOutline },
  { id: 'price', label: 'Price', icon: cashOutline, hasDropdown: true }
];

const rides = ref<RideResult[]>([
  {
    id: 1,
    origin: 'Coventry University',
    destination: 'Warwick Uni',
    departure: '2024-04-20T08:30:00',
    price: 5,
    seatsLeft: 2,
    driver: { name: 'Alex Johnson', initials: 'AJ', color: '#e1ecff' }
  },
  {
    id: 2,
    origin: 'Coventry Station',
    destination: 'Leamington Spa',
    departure: '2024-04-20T09:00:00',
    price: 4.5,
    seatsLeft: 1,
    driver: { name: 'Maria Rodriguez', initials: 'MR', color: '#fde8dc' }
  },
  {
    id: 3,
    origin: 'City Centre',
    destination: 'Arena Shopping Park',
    departure: '2024-04-20T11:15:00',
    price: 3,
    seatsLeft: 3,
    driver: { name: 'Ben Carter', initials: 'BC', color: '#e2f6ed' }
  }
]);

const searchQuery = ref('');
const activeFilter = ref<FilterId>('route');

const filteredRides = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  let results = [...rides.value];

  if (query) {
    results = results.filter(ride => {
      const haystack = `${ride.origin} ${ride.destination} ${ride.driver.name}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  if (activeFilter.value === 'price') {
    results.sort((a, b) => a.price - b.price);
  } else if (activeFilter.value === 'date') {
    results.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime());
  } else {
    results.sort((a, b) => `${a.origin} ${a.destination}`.localeCompare(`${b.origin} ${b.destination}`));
  }

  return results;
});

const formatPrice = (amount: number) => `£${amount.toFixed(2)}`;

const formatDeparture = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(value));

const seatLabel = (seats: number) => (seats === 1 ? '1 seat left' : `${seats} seats left`);

const selectFilter = (id: FilterId) => {
  activeFilter.value = id;
};

const openTrip = (id: number) => {
  router.push({ name: 'trip-details', params: { id } });
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.search-content {
  --background: #f6f7fb;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0;
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
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.search-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-field ion-searchbar {
  --background: #ffffff;
  --border-radius: 20px;
  --color: #111c26;
  --placeholder-color: #9aa3b6;
  --box-shadow: 0 15px 45px rgba(15, 23, 42, 0.08);
  padding: 0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-pill {
  flex: 1;
  min-width: 96px;
  border: none;
  border-radius: var(--box-radius-lg);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  color: #5f677c;
  font-weight: 600;
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.06);
}

.filter-pill.is-active {
  background: #06c167;
  color: #ffffff;
  box-shadow: 0 20px 30px rgba(6, 193, 103, 0.35);
}

.filter-pill .chevron {
  font-size: 0.85rem;
}

.ride-results {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ride-card {
  background: #ffffff;
  border-radius: var(--box-radius-lg);
  padding: 20px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.07);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.ride-card:focus-visible {
  outline: 3px solid rgba(6, 193, 103, 0.4);
  outline-offset: 4px;
}

.ride-card:active {
  transform: scale(0.98);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.12);
}

.ride-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.driver-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0f172a;
}

.ride-route {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.driver-name {
  color: #6f7690;
  font-weight: 500;
}

.ride-price {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
}

.ride-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e7eaf2;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b738a;
  font-weight: 600;
}

.meta-item.seats {
  color: #04a056;
}

.meta-item.seats.is-low {
  color: #dc6b28;
}

.empty-state {
  margin-top: 40px;
  text-align: center;
  color: #6d7388;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 30px;
  background: #e4e7ef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #95a1bc;
  font-size: 1.8rem;
}

.empty-state h2 {
  font-size: 1.2rem;
  color: #0f172a;
  margin: 0;
}

.add-fab {
  margin-right: 10px;
  margin-bottom: 16px;
}
</style>
