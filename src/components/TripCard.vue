<template>
  <article class="trip-card">
    <div class="trip-card__top">
      <div>
        <p class="trip-time">{{ trip.datetimeLabel }}</p>
        <p class="trip-title">{{ trip.route }}</p>
        <p class="trip-price">Price: {{ trip.price }}</p>
      </div>
      <div class="map-preview" :class="trip.mapVariant">
        <div class="map-route"></div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="trip-card__bottom">
      <div class="trip-meta">
        <span class="status-pill" :class="`is-${trip.statusVariant}`">{{ trip.status }}</span>

        <div v-if="trip.passengers.length" class="avatar-stack">
          <div
            v-for="passenger in trip.passengers"
            :key="passenger.id"
            class="avatar"
            :style="{ backgroundColor: passenger.color }"
            :aria-label="`${passenger.name} avatar`"
          >
            <span>{{ passenger.initials }}</span>
          </div>
        </div>

        <div v-if="trip.seatsLabel" class="seats-info">
          <ion-icon :icon="peopleOutline" aria-hidden="true" />
          <span>{{ trip.seatsLabel }}</span>
        </div>
      </div>

      <ion-button size="small" @click="openDetails" aria-label="View trip details">
        View Details
      </ion-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { peopleOutline } from 'ionicons/icons';

export interface Passenger {
  id: number;
  name: string;
  initials: string;
  color: string;
}

export interface TripCardData {
  id: number;
  datetimeLabel: string;
  route: string;
  price: string;
  status: string;
  statusVariant: 'confirmed' | 'pending' | 'completed';
  seatsLabel?: string;
  passengers: Passenger[];
  mapVariant: 'variant-a' | 'variant-b';
  state: 'active' | 'past';
}

interface Props {
  trip: TripCardData;
}

const props = defineProps<Props>();

const router = useRouter();

const openDetails = () => {
  router.push({ name: 'trip-details', params: { id: props.trip.id } });
};
</script>

<style scoped>
.trip-card {
  background: #ffffff;
  border-radius: var(--box-radius-lg);
  padding: 22px 24px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
}

.trip-card__top {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  justify-content: space-between;
}

.trip-time {
  color: #7c8298;
  font-size: 0.95rem;
}

.trip-title {
  font-size: 1rem;
  color: #0e1222;
  font-weight: 700;
  margin: 4px 0;
}

.trip-price {
  color: #7c8298;
}

.map-preview {
  width: 72px;
  height: 72px;
  border-radius: var(--box-radius-lg);
  position: relative;
  flex-shrink: 0;
  background: linear-gradient(130deg, #f2f6ff, #dcefee);
}

.map-preview.variant-b {
  background: linear-gradient(145deg, #fdf1d8, #e0f3ff);
}

.map-route {
  position: absolute;
  inset: 12px;
  border-radius: var(--box-radius-lg);
  border: 2px dashed rgba(15, 23, 42, 0.2);
}

.divider {
  height: 1px;
  background: #e8ecf3;
  margin: 16px 0;
}

.trip-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-pill {
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-pill.is-confirmed {
  background: #def7eb;
  color: #1b8a52;
}

.status-pill.is-pending {
  background: #fff4ce;
  color: #8b6b13;
}

.status-pill.is-completed {
  background: #edf0f5;
  color: #556070;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  font-weight: 600;
  border: 2px solid #ffffff;
  margin-left: -10px;
}

.avatar:first-child {
  margin-left: 0;
}

.seats-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8f96a9;
  font-weight: 600;
}

.ghost-button {
  border: none;
  background: #edf0f5;
  color: #141937;
  border-radius: 18px;
  padding: 10px 20px;
}
</style>
