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
            <div class="map-visual"></div>
            <div class="route-chip">
              <ion-icon :icon="navigateOutline" aria-hidden="true" />
              <span>{{ trip.route.origin }} → {{ trip.route.destination }}</span>
            </div>
          </section>

          <section class="driver-card">
            <div class="driver-meta">
              <div class="driver-avatar" role="img" :aria-label="`${trip.driver.name} avatar`">
                <span>{{ trip.driver.initials }}</span>
              </div>
              <div>
                <p class="driver-name">{{ trip.driver.name }}</p>
                <p class="driver-car">{{ trip.driver.vehicle }}</p>
              </div>
            </div>
            <div class="driver-rating" :aria-label="`Driver rating ${trip.driver.rating} out of 5`">
              <ion-icon :icon="star" aria-hidden="true" />
              <span>{{ trip.driver.rating.toFixed(1) }}</span>
            </div>
          </section>

          <section class="detail-list">
            <article v-for="item in detailItems" :key="item.id" class="detail-row">
              <div class="icon-chip" :class="`is-${item.accent}`">
                <ion-icon :icon="item.icon" aria-hidden="true" />
              </div>
              <div class="detail-copy">
                <p class="detail-label">{{ item.label }}</p>
                <p class="detail-value" :class="{ 'is-accent': item.highlight }">{{ item.value }}</p>
              </div>
            </article>
          </section>
        </main>
      </div>
    </ion-content>

    <ion-footer class="cta-footer">
      <div class="cta-panel ion-padding">
        <ion-button expand="block" size="large" color="secondary" @click="requestSeat">
          Book Seat for £{{ trip.pricePerSeat.toFixed(2) }}
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonButton, IonContent, IonFooter, IonIcon, IonPage } from '@ionic/vue';
import {
  calendarOutline,
  cashOutline,
  chevronBackOutline,
  flagOutline,
  navigateOutline,
  peopleOutline,
  star
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();

const trip = {
  id: Number(route.params.id ?? 1),
  date: '2024-10-28T08:30:00',
  pickupPoint: 'Priory Street, Coventry CV1',
  destinationAddress: 'Birmingham Airport, B26 3QJ',
  pricePerSeat: 8,
  seatsAvailable: 2,
  route: {
    origin: 'Coventry City Centre',
    destination: 'Birmingham Airport'
  },
  driver: {
    name: 'Alex R.',
    initials: 'AR',
    vehicle: 'Volkswagen ID.3 • Blue',
    rating: 4.8
  }
};

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(trip.date))
);

const seatLabel = computed(() =>
  `${trip.seatsAvailable} seat${trip.seatsAvailable === 1 ? '' : 's'} available`
);

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
    value: trip.pickupPoint,
    icon: navigateOutline,
    accent: 'mint'
  },
  {
    id: 'destination',
    label: 'Destination',
    value: trip.destinationAddress,
    icon: flagOutline,
    accent: 'mint'
  },
  {
    id: 'price',
    label: 'Price per Seat',
    value: `£${trip.pricePerSeat.toFixed(2)}`,
    icon: cashOutline,
    accent: 'mint'
  },
  {
    id: 'seats',
    label: 'Available Seats',
    value: seatLabel.value,
    icon: peopleOutline,
    accent: 'sunny',
    highlight: true
  }
]);

const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.replace('/tabs/home');
  }
};

const requestSeat = () => {
  console.info(`[Trip ${trip.id}] Request to join triggered`);
};
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

.map-visual::after,
.map-visual::before {
  content: '';
  position: absolute;
  inset: 20px;
  border: 2px dashed rgba(15, 23, 42, 0.2);
  border-radius: var(--box-radius-lg);
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
