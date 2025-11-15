<template>
  <ion-page>
    <ion-content class="cancel-trip-page safe-area-scroll">
      <AppBackHeader title="Cancel Your Trip?" @back="goBack" />
      <div class="page-body ion-padding">
        <section class="trip-card" aria-label="Trip summary">
          <div class="trip-icon">
            <ion-icon :icon="carOutline" aria-hidden="true" />
          </div>
          <div>
            <p class="trip-title">{{ trip.origin }} to {{ trip.destination }}</p>
            <p class="trip-meta">{{ trip.date }} at {{ trip.time }}</p>
          </div>
        </section>

        <section class="notice-card" aria-label="Cancellation policy">
          <ion-icon :icon="informationCircle" aria-hidden="true" />
          <p>Please note that cancellations made less than 24 hours before departure may be subject to a fee.</p>
        </section>

        <ion-button expand="block" color="danger" size="large" class="cancel-button" @click="confirmCancel">
          Yes, Cancel Trip
        </ion-button>
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
import { IonButton, IonContent, IonIcon, IonModal, IonPage } from '@ionic/vue';
import { carOutline, checkmark, informationCircle } from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const trip = reactive({
  origin: 'Coventry University',
  destination: 'Birmingham New Street',
  date: 'Wed, 25 Oct',
  time: '08:30 AM'
});

const isModalOpen = ref(false);

const goBack = () => {
  router.back();
};

const confirmCancel = () => {
  isModalOpen.value = true;
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
  router.push('/tabs/search');
};
</script>

<style scoped>
.cancel-trip-page {
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
