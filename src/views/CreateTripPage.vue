<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Create a New Trip</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="create-trip-content ion-padding">
      <div class="page-inner mt-5">
        <section class="section-block" >
          <p class="section-eyebrow">Where are you going?</p>

          <div class="form-group">
            <label class="field-label" for="pickup-input">Pickup Point</label>
            <div class="input-shell">
              <ion-input
                id="pickup-input"
                v-model="form.pickupPoint"
                placeholder="e.g., Coventry University"
                class="text-input"
                inputmode="text"
                clear-input
              />
              <ion-icon :icon="navigateOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-label" for="destination-input">Destination</label>
            <div class="input-shell">
              <ion-input
                id="destination-input"
                v-model="form.destination"
                placeholder="e.g., Birmingham New Street"
                class="text-input"
                inputmode="text"
                clear-input
              />
              <ion-icon :icon="locationOutline" aria-hidden="true" class="input-icon" />
            </div>
          </div>
        </section>

        <section class="section-block">
          <p class="section-eyebrow">Trip Details</p>

          <div class="form-group">
            <label class="field-label">Available Seats</label>
            <div class="seat-stepper">
              <button
                type="button"
                class="stepper-btn"
                :disabled="form.seats <= minSeats"
                @click="decreaseSeats"
              >
                <ion-icon :icon="removeOutline" aria-hidden="true" />
              </button>
              <span class="seat-value">{{ form.seats }}</span>
              <button
                type="button"
                class="stepper-btn"
                :disabled="form.seats >= maxSeats"
                @click="increaseSeats"
              >
                <ion-icon :icon="addOutline" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="field-label">Date &amp; Time</label>
            <button type="button" class="input-shell date-button" @click="openDateModal">
              <span v-if="formattedDateTime" class="date-value">{{ formattedDateTime }}</span>
              <span v-else class="placeholder">mm/dd/yyyy, --:-- --</span>
              <div class="date-icons">
                <ion-icon :icon="timeOutline" aria-hidden="true" />
                <ion-icon :icon="calendarOutline" aria-hidden="true" />
              </div>
            </button>
          </div>

          <div class="form-group">
            <label class="field-label" for="price-input">Cost per passenger</label>
            <div class="input-shell price-shell">
              <span class="currency-prefix">£</span>
              <ion-input
                id="price-input"
                v-model="form.cost"
                type="number"
                inputmode="decimal"
                placeholder="0.00"
                class="text-input"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </section>
      </div>

      <div class="action-bar">
        <ion-button expand="block" size="large" color="secondary">Create Trip</ion-button>
      </div>

      <ion-modal :is-open="isDateModalOpen" class="date-modal" @did-dismiss="closeDateModal">
        <ion-content>
          <div class="date-modal-header">
            <h2>Select date &amp; time</h2>
          </div>
          <ion-datetime
            v-model="datetimeDraft"
            presentation="date-time"
            minute-values="0,15,30,45"
          />
          <div class="modal-actions">
            <ion-button fill="clear" color="medium" @click="closeDateModal">Cancel</ion-button>
            <ion-button color="secondary" @click="applyDate">Done</ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import {
  addOutline,
  calendarOutline,
  locationOutline,
  navigateOutline,
  removeOutline,
  timeOutline
} from 'ionicons/icons';

const form = reactive({
  pickupPoint: '',
  destination: '',
  seats: 2,
  datetime: '',
  cost: ''
});

const minSeats = 1;
const maxSeats = 6;

const isDateModalOpen = ref(false);
const datetimeDraft = ref('');

const formattedDateTime = computed(() => {
  if (!form.datetime) {
    return '';
  }

  const date = new Date(form.datetime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
});

const openDateModal = () => {
  datetimeDraft.value = form.datetime || new Date().toISOString();
  isDateModalOpen.value = true;
};

const closeDateModal = () => {
  isDateModalOpen.value = false;
};

const applyDate = () => {
  form.datetime = datetimeDraft.value;
  closeDateModal();
};

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
</script>

<style scoped>
.create-trip-header ion-toolbar {
  --background: #f7f8fb;
  --border-width: 0;
  font-weight: 600;
}

.create-trip-content {
  --background: #f4f5f8;
  display: flex;
  flex-direction: column;
}

.section-block + .section-block {
  margin-top: 32px;
}

.section-eyebrow {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0c1220;
  margin-bottom: 16px;
}

.form-group + .form-group {
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
  justify-content: space-between;
  padding: 0 18px;
  color: #101828;
}

.date-button .placeholder {
  color: #b0b7c9;
}

.date-icons {
  display: flex;
  gap: 10px;
  color: #9da7bf;
}

.date-value {
  font-weight: 600;
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

.date-modal ion-content {
  --background: #fff;
}

.date-modal-header {
  padding: 20px 20px 0;
}

.date-modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0c1220;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px 24px;
}
</style>
