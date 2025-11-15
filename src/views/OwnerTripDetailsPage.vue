<template>
  <ion-page>
    <ion-content class="owner-trip-page safe-area-scroll">
      <AppBackHeader title="Trip Overview" subtitle="Trip Information" @back="goBack" />

      <div class="page-body ion-padding">
        <section class="overview-card">
          <p class="eyebrow">{{ trip.date }} · {{ trip.departure }} · {{ trip.seats }} seats</p>
          <h1>{{ trip.route }}</h1>
          <p class="earnings">Projected earnings · <strong>{{ trip.total }}</strong></p>
          <div class="chip-row">
            <ion-chip color="success" outline>
              <ion-icon :icon="checkmarkCircle" />
              <ion-label>{{ trip.status }}</ion-label>
            </ion-chip>
            <ion-chip color="secondary" outline>
              <ion-icon :icon="people" />
              <ion-label>{{ trip.requests.length }} requests</ion-label>
            </ion-chip>
          </div>
        </section>

        <section class="segment-card">
          <article class="segment-row">
            <div class="icon-pill">
              <ion-icon :icon="navigateOutline" />
            </div>
            <div>
              <p class="label">Pickup</p>
              <p class="value text-slate-700">{{ trip.pickup }}</p>
            </div>
          </article>
          <article class="segment-row">
            <div class="icon-pill">
              <ion-icon :icon="locationOutline" />
            </div>
            <div>
              <p class="label">Drop-off</p>
              <p class="value text-slate-700">{{ trip.dropoff }}</p>
            </div>
          </article>
        </section>

        <section class="requests-card">
          <header class="text-slate-900">
            <p>Ride requests</p>
            <small>{{ trip.requests.length }} pending</small>
          </header>
          <article v-for="request in trip.requests" :key="request.id" class="request-card d-flex">
            <div class="request-main">
              <img :src="request.avatar" :alt="request.name" />
              <div>
                <p class="name">{{ request.name }}</p>
                <p class="rating">
                  <ion-icon :icon="star" aria-hidden="true" />
                  {{ request.rating }} ({{ request.reviews }} reviews)
                </p>
              </div>
            </div>
            <div class="request-actions">
              <ion-button expand="block" fill="outline" color="medium" @click="rejectRider(request.id)" class="w-full">
                Reject
              </ion-button>
              <ion-button expand="block" color="secondary" @click="confirmRider(request.id)"  class="w-full">
                Confirm
              </ion-button>
            </div>
          </article>
        </section>

        <section v-if="trip.confirmed.length" class="requests-card confirmed-card">
          <header class="text-slate-900">
            <p>Confirmed riders</p>
            <small>{{ trip.confirmed.length }} joined</small>
          </header>
          <article v-for="rider in trip.confirmed" :key="rider.id" class="request-card">
            <div class="request-main">
              <img :src="rider.avatar" :alt="rider.name" />
              <div>
                <p class="name">{{ rider.name }}</p>
                <p class="rating">
                  <ion-icon :icon="star" aria-hidden="true" />
                  {{ rider.rating }} ({{ rider.reviews }} reviews)
                </p>
              </div>
            </div>
            <div class="request-actions">
              <ion-button expand="block" fill="outline" color="secondary" @click="messageRider(rider.id)" class="w-full">
                Message
              </ion-button>
            </div>
          </article>
        </section>

        <section class="actions">
          <ion-button expand="block" size="large" @click="editTrip" color="danger">
            Cancel Trip
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
import { checkmarkCircle, locationOutline, navigateOutline, people, star } from 'ionicons/icons';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const trip = reactive({
  route: 'Coventry Campus to Rugby',
  pickup: 'The Hub, Coventry University',
  dropoff: 'Rugby Town Centre',
  date: 'Mon, 03 Jun',
  departure: '07:30 AM',
  seats: 3,
  total: '£18.00',
  status: 'Active ride',
  requests: [
    {
      id: 'r-1',
      name: 'Alex Doe',
      seats: 1,
      note: 'Pickup near Science Park',
      rating: '4.9',
      reviews: 21,
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'r-2',
      name: 'Maya L.',
      seats: 1,
      note: 'Flexible drop-off',
      rating: '4.7',
      reviews: 15,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'
    }
  ],
  confirmed: [
    {
      id: 'c-1',
      name: 'Jamie W.',
      seats: 1,
      note: 'Paid via Stripe',
      rating: '4.8',
      reviews: 18,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'c-2',
      name: 'Priya S.',
      seats: 1,
      note: 'Regular rider',
      rating: '5.0',
      reviews: 30,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'
    }
  ]
});

const goBack = () => {
  router.back();
};

const editTrip = () => {
  console.info('Navigate to edit trip');
};

const messageRider = (id: string) => {
  console.info('message rider', id);
};

const confirmRider = (id: string) => {
  console.info('confirm rider', id);
};

const rejectRider = (id: string) => {
  console.info('reject rider', id);
};
</script>

<style scoped>
.owner-trip-page {
  --background: #f5f6fa;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card {
  background: #101b2c;
  color: #ffffff;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 25px 60px rgba(7, 10, 24, 0.35);
}

.overview-card .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 6px;
}

.overview-card h1 {
  margin: 0 0 12px;
  font-size: 1.4rem;
}

.overview-card .earnings {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}

.chip-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.segment-card,
.requests-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 14px 32px rgba(34, 42, 62, 0.08);
}

.segment-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.segment-row + .segment-row {
  margin-top: 16px;
}

.icon-pill {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: #ecf2ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3555ff;
}

.segment-card .label {
  margin: 0;
  color: #7a859e;
}

.segment-card .value {
  margin: 2px 0 0;
  font-weight: 600;
}

.requests-card header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-weight: 600;
}

.request-card {
  align-items: center;
  justify-content: space-between;
  border-radius: 22px;
  padding: 14px 16px;
  margin: 0;
}

.requests-card .request-card + .request-card {
  border-top: 1px solid #e4e9f3;
  margin-top: 18px;
  padding-top: 18px;
}

.request-main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.request-main img {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  object-fit: cover;
}

.request-main .name {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.request-main .rating {
  margin: 2px 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8890a7;
  font-size: 0.9rem;
}

.request-main .rating ion-icon {
  color: #f2c94c;
}

.request-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}



.actions ion-button {
  --border-radius: 20px;
}
</style>
