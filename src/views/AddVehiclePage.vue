<template>
  <ion-page>
    <ion-content class="manage-vehicle-page safe-area-scroll">
      <AppBackHeader title="Manage Vehicle" subtitle="Your Garage" @back="goBack" />

      <div class="ion-padding">
        <section class="form-section">
          <p class="field-label">Vehicle Image</p>
          <label class="upload-card" for="vehicle-image-input">
            <template v-if="previewImage">
              <img :src="previewImage" alt="Vehicle preview" class="upload-preview" />
              <p class="upload-hint">Tap to replace photo</p>
            </template>
            <template v-else>
              <ion-icon :icon="cameraOutline" aria-hidden="true" />
              <p><strong>Click to upload</strong> or drag and drop</p>
              <small>SVG, PNG, JPG (max. 800×400px)</small>
            </template>
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
            <ion-input class="input-field" v-model="form.plateNumber" label="License Plate" label-placement="stacked"
              placeholder="e.g., AB12 CDE" />
            <ion-input class="input-field" v-model="form.capacity" label="Available Seats" label-placement="stacked"
              placeholder="e.g., 3" type="number" />
          </div>
        </section>
        <div class="action-bar">
          <ion-button
            expand="block"
            size="large"
            color="success"
            class="text-white"
            :disabled="!isValid || saving"
            @click="saveVehicle"
          >
            <ion-spinner v-if="saving" name="crescent" class="mr-2" />
            <span>{{ saving ? 'Saving…' : 'Save Vehicle' }}</span>
          </ion-button>
        </div>
      </div>
    </ion-content>
    <ion-toast
      :is-open="toastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2500"
      @didDismiss="closeToast"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonInput, IonPage, IonSpinner, IonToast } from '@ionic/vue';
import { cameraOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useVehicleStore } from '@/stores/vehicleStore';
import { storeToRefs } from 'pinia';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const vehicleStore = useVehicleStore();
const { saving } = storeToRefs(vehicleStore);
const { toastMessage, toastColor, toastOpen, showToast, closeToast } = useToast('success');

const form = reactive({
  make: '',
  model: '',
  year: '',
  color: '',
  plateNumber: '',
  capacity: ''
});

const previewImage = ref('');
const imageFile = ref<File | null>(null);

const isValid = computed(() => form.model.trim() && form.plateNumber.trim());

const goBack = () => {
  router.back();
};

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  imageFile.value = file;

  const reader = new FileReader();
  reader.onload = () => {
    previewImage.value = typeof reader.result === 'string' ? reader.result : '';
  };
  reader.readAsDataURL(file);
  input.value = '';
};

const resetForm = () => {
  form.make = '';
  form.model = '';
  form.year = '';
  form.color = '';
  form.plateNumber = '';
  form.capacity = '';
  previewImage.value = '';
  imageFile.value = null;
};

const buildPayload = () => {
  return {
    make: form.make ? form.make.trim() : null,
    model: form.model.trim(),
    plateNumber: form.plateNumber.trim(),
    color: form.color ? form.color.trim() : null,
    year: form.year ? form.year.trim() : null,
    capacity: form.capacity ? Number(form.capacity) : null
  };
};

const saveVehicle = async () => {
  if (!isValid.value || saving.value) {
    return;
  }

  try {
    await vehicleStore.addVehicle(buildPayload(), imageFile.value);
    showToast('Vehicle saved', 'success');
    resetForm();
    goBack();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save vehicle.';
    showToast(message, 'danger');
  }
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

.upload-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.15);
}

.upload-hint {
  margin: 8px 0 0;
  font-weight: 600;
  color: #0f1b2b;
}

.upload-card ion-icon {
  font-size: 2rem;
  color: #7a859c;
}

.input-field {
  flex: 1;
  font-size: 1rem;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: transparent;
  --color: #0f172a;
  --placeholder-color: #b2b9c7;
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
