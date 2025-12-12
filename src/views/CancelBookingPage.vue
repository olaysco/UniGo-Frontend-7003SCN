<template>
  <ion-page>
    <ion-content class="cancel-booking-page safe-area-scroll">
      <AppBackHeader title="Cancel Your Trip?" @back="goBack" />
      <div class="page-body ion-padding">
        <section class="trip-card" aria-label="Trip summary">
          <div class="trip-icon">
            <ion-icon :icon="carOutline" aria-hidden="true" />
          </div>
          <div v-if="trip">
            <p class="trip-title">{{ summary.origin }} to {{ summary.destination }}</p>
            <p class="trip-meta">{{ summary.date }} at {{ summary.time }}</p>
          </div>
          <div v-else-if="loadingTrip" class="skeleton-stack">
            <ion-skeleton-text animated class="skeleton-line" style="width: 160px" />
            <ion-skeleton-text animated class="skeleton-line" style="width: 120px" />
          </div>
          <div v-else>
            <p class="trip-title">Trip details unavailable</p>
            <p class="trip-meta">{{ tripError || 'This trip could not be found.' }}</p>
          </div>
        </section>

        <section class="notice-card" aria-label="Cancellation policy">
          <ion-icon :icon="informationCircle" aria-hidden="true" />
          <p>Please note that cancellations made less than 24 hours before departure may be subject to a fee.</p>
        </section>

        <ion-button
          expand="block"
          color="danger"
          size="large"
          class="cancel-button"
          @click="confirmCancel"
          :disabled="canceling || loadingTrip || !trip"
        >
          Yes, Cancel Trip
        </ion-button>
        <p v-if="cancelError" class="error-text">{{ cancelError }}</p>
        <ion-button expand="block" color="light" size="large" class="keep-button" @click="goBack">
          No, Keep Trip
        </ion-button>
      </div>

      <ion-modal
        :is-open="isModalOpen"
        :initial-breakpoint="0.7"
        :breakpoints="[0.7]"
        css-class="cancel-success-modal"
        :backdrop-dismiss="false"
        @didDismiss="closeModal"
      >
        <div class="modal-shell">
          <div class="modal-icon">
            <ion-icon :icon="checkmark" aria-hidden="true" />
          </div>
          <h2>Your Trip Has Been Cancelled</h2>
          <p>
            We've notified the driver. Your payment has been refunded according to our cancellation policy.
          </p>
          <ion-button expand="block" color="secondary" size="large" @click="findNewRide">
            Find a New Ride
          </ion-button>
          <button class="modal-link" type="button" @click="completeCancellation">Done</button>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonModal, IonPage, IonSkeletonText } from '@ionic/vue';
import { carOutline, checkmark, informationCircle } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useTripStore, mapTripToCard } from '@/stores/tripStore';
import type { TripCardData } from '@/components/TripCard.vue';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();
const userStore = useUserStore();

const tripId = (route.params.tripId || route.params.id) as string;
const remoteTrip = ref<TripCardData | null>(null);
const localTrip = computed(() => tripStore.tripCards.find(t => String(t.id) === tripId));
const trip = computed(() => localTrip.value ?? remoteTrip.value ?? null);
const loadingTrip = ref(false);
const tripError = ref<string | null>(null);

const isModalOpen = ref(false);
const canceling = ref(false);
const cancelError = ref<string | null>(null);

const summary = computed(() => {
  if (!trip.value) {
    return {
      origin: 'Unknown origin',
      destination: 'Unknown destination',
      date: '',
      time: ''
    };
  }

  return {
    origin: trip.value.pickup,
    destination: trip.value.dropoff,
    date: trip.value.date,
    time: trip.value.departure
  };
});

const ensureTripData = async () => {
  if (!tripId || trip.value || loadingTrip.value) {
    return;
  }

  const currentUserId = userStore.session?.user?.id ?? userStore.profile?.id ?? null;
  loadingTrip.value = true;
  tripError.value = null;
  try {
    const tripEntity = await tripStore.getTripById(tripId);
    if (tripEntity) {
      remoteTrip.value = mapTripToCard(tripEntity, 0, currentUserId);
    } else {
      tripError.value = 'Trip not found.';
    }
  } catch (error) {
    tripError.value = error instanceof Error ? error.message : 'Unable to load trip.';
  } finally {
    loadingTrip.value = false;
  }
};

const goBack = () => {
  router.back();
};

const confirmCancel = async () => {
  if (!tripId) return;
  cancelError.value = null;
  canceling.value = true;
  try {
    await tripStore.cancelTrip(tripId);
    isModalOpen.value = true;
  } catch (error) {
    cancelError.value = error instanceof Error ? error.message : 'Unable to cancel trip.';
  } finally {
    canceling.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};

const completeCancellation = () => {
  closeModal();
  router.push('/tabs/trips');
};

const findNewRide = () => {
  closeModal();
  router.push('/search-trip');
};

onMounted(() => {
  void ensureTripData();
});
</script>

<style scoped>
.cancel-booking-page {
  --background: #f6f7fb;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trip-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 14px 26px rgba(109, 123, 145, 0.08);
}

.skeleton-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 10px;
}

.trip-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #f2f6ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #263057;
  font-size: 1.4rem;
}

.trip-title {
  margin: 0;
  font-weight: 600;
  color: #111b2b;
}

.trip-meta {
  margin: 4px 0 0;
  color: #6b7288;
}

.notice-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff5da;
  border-radius: 24px;
  padding: 18px;
  color: #705200;
  line-height: 1.4;
}

.notice-card ion-icon {
  font-size: 1.4rem;
  margin-top: 2px;
}

.cancel-button {
  --border-radius: 18px;
  font-weight: 600;
}

.keep-button {
  --border-radius: 18px;
  font-weight: 600;
  color: #0d1a2b;
}

.error-text {
  color: #b91c1c;
  margin: 6px 0 0;
  text-align: center;
}

.cancel-success-modal::part(content) {
  --background: transparent;
  --box-shadow: none;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-shell {
  background: #ffffff;
  border-radius: 32px;
  padding: 32px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 20px;
}

.modal-icon {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #b5f2dd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0a7f52;
  font-size: 3rem;
  margin: 0 auto 4px;
}

.modal-shell h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #111b2b;
}

.modal-shell p {
  margin: 0;
  color: #657087;
}

.modal-shell ion-button {
  --border-radius: 22px;
}

.modal-link {
  background: none;
  border: 0;
  color: #3c6ee8;
  font-weight: 600;
  font-size: 1rem;
}
</style>
