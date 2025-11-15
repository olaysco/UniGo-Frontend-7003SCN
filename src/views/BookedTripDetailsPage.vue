<template>
  <ion-page>
    <ion-content class="booked-trip-page safe-area-scroll">
      <AppBackHeader title="Booking Details" subtitle="Ride confirmed" @back="goBack" />
      <div class="page-body ion-padding">
        <section v-if="showStatusBanner" class="status-banner">
          <ion-icon :icon="checkmarkCircle" aria-hidden="true" />
          <div>
            <p class="status-title">Booking Confirmed! You're all set.</p>
            <p class="status-subtitle">Reference {{ booking.reference }} • {{ booking.status }}</p>
          </div>
        </section>

        <section class="map-card">
          <img :src="booking.mapImage" alt="Route preview map" />
        </section>

        <section class="detail-card">
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="calendarOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">{{ booking.date }}</p>
              <p class="detail-meta">{{ booking.departure }} · Est. Arrival {{ booking.arrival }}</p>
            </div>
          </article>
          <hr />
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="navigateOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">Pickup: {{ booking.pickup.title }}</p>
              <p class="detail-meta">{{ booking.pickup.address }}</p>
            </div>
          </article>
          <hr />
          <article class="detail-row">
            <div class="icon-pill">
              <ion-icon :icon="locationOutline" aria-hidden="true" />
            </div>
            <div>
              <p class="detail-title">Drop-off: {{ booking.dropoff.title }}</p>
              <p class="detail-meta">{{ booking.dropoff.address }}</p>
            </div>
          </article>
        </section>

        <section class="driver-card">
          <div class="driver-header">
            <img class="driver-avatar" :src="booking.driver.avatar" :alt="booking.driver.name" />
            <div>
              <p class="driver-name">{{ booking.driver.name }}</p>
              <p class="driver-rating">
                <ion-icon :icon="star" aria-hidden="true" />
                {{ booking.driver.rating }} ({{ booking.driver.reviews }} reviews)
              </p>
            </div>
          </div>
          <p class="vehicle-name">{{ booking.vehicle }}</p>
          <p class="driver-note">{{ booking.note }}</p>
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
              <ion-label>{{ booking.seats }} Seat</ion-label>
            </ion-chip>
          </header>
          <div class="summary-list">
            <div v-for="item in booking.summary" :key="item.label" class="summary-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
          <div class="summary-total">
            <span>Total Paid</span>
            <p>{{ booking.total }}</p>
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
  IonPage
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
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();
const route = useRoute();

const booking = reactive({
  status: 'Paid via card',
  reference: '#UN-10452',
  date: 'Monday, 28 October',
  departure: '08:00',
  arrival: '09:15',
  pickup: {
    title: 'Coventry University',
    address: 'Priory St, Coventry CV1 5FB'
  },
  dropoff: {
    title: 'Birmingham New St',
    address: 'Station St, Birmingham B2 4QA'
  },
  vehicle: 'Blue Ford Focus',
  note: '"No smoking, please. Happy to chat or listen to music!"',
  driver: {
    name: 'Sarah K.',
    rating: '4.8',
    reviews: 12,
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80'
  },
  seats: 1,
  summary: [
    { label: 'Fare', value: '£5.00' },
    { label: 'Booking fee', value: '£0.75' },
    { label: 'Coverage', value: '£0.30' }
  ],
  total: '£6.05',
  mapImage: './map-placeholder.png'
});

const goBack = () => {
  router.back();
};

const contactDriver = (type: 'call' | 'message') => {
  console.info(`Contact driver via ${type}`);
};

const viewReceipt = () => {
  console.info('Open receipt view');
};

const cancelTrip = () => {
  const bookingId = (route.params.id as string) || 'current';
  router.push({ name: 'cancel-trip', params: { id: bookingId } });
};

const viewerRole = computed(() => (route.query.role as string) === 'carOwner' ? 'carOwner' : 'coRider');
const tripStatus = computed(() => (route.query.status as string) || 'confirmed');
const isCoRider = computed(() => viewerRole.value === 'coRider');
const isPending = computed(() => tripStatus.value === 'pending');
const isPast = computed(() => tripStatus.value === 'past');
const hideStatusSections = computed(() => isCoRider.value && (isPending.value || isPast.value));

const showStatusBanner = computed(() => !hideStatusSections.value);
const showReceiptButton = computed(() => !hideStatusSections.value);
const showRateButton = computed(() => isCoRider.value && isPast.value);
const showCancelButton = computed(() => !showRateButton.value);

const rateTrip = () => {
  console.info('Open rate trip modal');
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

.driver-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.driver-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
}

.driver-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.driver-rating {
  margin: 4px 0 0;
  color: #8a95a8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.driver-rating ion-icon {
  color: #f8c035;
}

.chevron {
  margin-left: auto;
  color: #c1c7d5;
}

.vehicle-name {
  margin: 16px 0 4px;
  font-weight: 600;
  color: #111b2b;
}

.driver-note {
  margin: 0 0 18px;
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
