<template>
  <ion-page>
    <ion-content class="manage-vehicle-page safe-area-scroll">
      <AppBackHeader title="Manage Vehicle" subtitle="Your Garage" @back="goBack" />

      <div class="ion-padding">
        <section class="form-section">
          <p class="field-label">Vehicle Image</p>
          <label class="upload-card" for="vehicle-image-input">
            <ion-icon :icon="cameraOutline" aria-hidden="true" />
            <p><strong>Click to upload</strong> or drag and drop</p>
            <small>SVG, PNG, JPG (max. 800×400px)</small>
            <input id="vehicle-image-input" type="file" accept="image/*" @change="handleFile" hidden />
          </label>
        </section>

        <section class="form-section">
          <ion-input class="input-field" v-model="form.make" label="Make" label-placement="stacked"
            placeholder="e.g., Ford" />
          <ion-input class="input-field" v-model="form.model" label="Model" label-placement="stacked"
            placeholder="e.g., Focus" />

          <div class="input-grid">
            <ion-input class="input-field" v-model="form.year" label="Year" label-placement="stacked"
              placeholder="e.g., 2021" />
            <ion-input class="input-field" v-model="form.color" label="Color" label-placement="stacked"
              placeholder="e.g., Blue" />
          </div>

          <div class="input-grid">
            <ion-input class="input-field" v-model="form.plate" label="License Plate" label-placement="stacked"
              placeholder="e.g., AB12 CDE" />
            <ion-input class="input-field" v-model="form.seats" label="Available Seats" label-placement="stacked"
              placeholder="e.g., 3" type="number" />
          </div>
        </section>
        <div class="action-bar">
          <ion-button expand="block" size="large" color="success" :disabled="!isValid" @click="saveVehicle">
            Save Vehicle
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonInput, IonPage } from '@ionic/vue';
import { cameraOutline } from 'ionicons/icons';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const form = reactive({
  make: '',
  model: '',
  year: '',
  color: '',
  plate: '',
  seats: '',
  image: ''
});

const isValid = computed(() => form.make.trim() && form.model.trim() && form.plate.trim());

const goBack = () => {
  router.back();
};

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    form.image = input.files[0].name;
  }
};

const saveVehicle = () => {
  console.info('Vehicle saved', { ...form });
  goBack();
};
</script>

<style scoped>
ion-content.manage-vehicle-page {
  --background: #f6f7fb;
  padding-bottom: env(safe-area-inset-bottom);
}

.form-section {
  padding: 0 0px 24px;
}

.field-label {
  font-size: 1rem;
  font-weight: 600;
  color: #0f1b2b;
  margin-bottom: 12px;
}

.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px dashed #cad0e0;
  border-radius: 22px;
  background: #ffffff;
  padding: 28px;
  text-align: center;
  color: #7a859c;
}

.upload-card ion-icon {
  font-size: 2rem;
  color: #7a859c;
}

.input-field {
  --background: #ffffff;
  --border-radius: 18px;
  --border-color: #d9dde8;
  --highlight-color-focused: #03a46b;
  --highlight-color-valid: #03a46b;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  margin-top: 16px;
}

.input-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.input-grid .input-field {
  flex: 1;
}
</style>
