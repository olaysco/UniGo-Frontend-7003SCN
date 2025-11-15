<template>
  <ion-page>
    <ion-content class="create-trip-content">
      <AppBackHeader title="Create a New Trip" subtitle="Create Trip" @back="goBack" />
      <div class="page-inner">
        <section class="section-block">
          <p class="section-eyebrow">Where are you going?</p>

          <div class="form-group">
            <label class="field-label" for="pickup-input">Pickup Point</label>
            <div class="input-shell">
              <ion-input id="pickup-input" v-model="form.pickupPoint" placeholder="e.g., Coventry University"
                class="text-input" inputmode="text" clear-input />
              <ion-icon :icon="navigateOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="destination-input">Destination</label>
            <div class="input-shell">
              <ion-input id="destination-input" v-model="form.destination" placeholder="e.g., Birmingham New Street"
                class="text-input" inputmode="text" clear-input />
              <ion-icon :icon="locationOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>
        </section>

        <section class="section-block">
          <p class="section-eyebrow">Trip Details</p>

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
              <ion-datetime id="create-trip-datetime"></ion-datetime>
            </ion-modal>
          </div>

          <div class="form-group">
            <label class="field-label" for="price-input">Cost per passenger</label>
            <div class="input-shell price-shell">
              <span class="currency-prefix">£</span>
              <ion-input id="price-input" v-model="form.cost" type="number" inputmode="decimal" placeholder="0.00"
                class="text-input" min="0" step="0.5" />
            </div>
          </div>
        </section>
      </div>

      <div class="action-bar">
    <ion-button expand="block" size="large" color="secondary">Create Trip</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { IonButton, IonContent, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonModal, IonPage } from '@ionic/vue';
import { addOutline, locationOutline, navigateOutline, removeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const form = reactive({
  pickupPoint: '',
  destination: '',
  seats: 2,
  datetime: '',
  cost: ''
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
</script>

<style scoped>
.create-trip-content {
  --background: #f4f5f8;
}

.create-trip-content::part(scroll) {
  padding-top: 0;
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
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
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
</style>
