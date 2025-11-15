<template>
  <ion-page>
    <ion-content class="vehicles-page safe-area-scroll">
      <AppBackHeader title="My Vehicles" @back="goBack" />

      <section class="vehicle-list">
        <article v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
          <img class="vehicle-image" :src="vehicle.image" :alt="vehicle.name" />
          <div class="vehicle-details">
            <h2>{{ vehicle.name }}</h2>
            <p>{{ vehicle.plate }} - {{ vehicle.color }}</p>
          </div>
          <button class="icon-button" type="button" aria-label="Vehicle actions" @click="openVehicleOptions(vehicle)">
            <ion-icon :icon="ellipsisVertical" aria-hidden="true" />
          </button>
        </article>
      </section>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="success" @click="goToAddVehicle">
          <ion-icon :icon="add" aria-hidden="true" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
    <ion-modal
      :is-open="!!selectedVehicle"
      :initial-breakpoint="0.95"
      :breakpoints="[0.95]"
      handle-behavior="cycle"
      class="vehicle-pane"
      @didDismiss="closeVehiclePane"
    >
      <div v-if="selectedVehicle" class="pane-content ion-padding">
        <div class="vehicle-media">
          <img :src="previewImage || selectedVehicle.image" :alt="selectedVehicle.name" />
          <ion-button class="media-edit" size="small" fill="solid" color="dark" @click="handleEditImage">
            <ion-icon :icon="createOutline" aria-hidden="true" />
          </ion-button>
          <input
            ref="imageInputRef"
            type="file"
            accept="image/*"
            class="image-file-input"
            @change="handleImageSelected"
          />
        </div>
        <form class="pane-form">
          <div class="form-field">
            <label for="vehicle-make">Make</label>
            <div class="input-shell">
              <ion-input id="vehicle-make" v-model="vehicleForm.make" class="text-input" />
            </div>
          </div>
          <div class="form-field">
            <label for="vehicle-model">Model</label>
            <div class="input-shell">
              <ion-input id="vehicle-model" v-model="vehicleForm.model" class="text-input" />
            </div>
          </div>
          <div class="form-field">
            <label for="vehicle-year">Year</label>
            <div class="input-shell">
              <ion-input id="vehicle-year" v-model="vehicleForm.year" type="number" class="text-input" />
            </div>
          </div>
          <div class="form-field">
            <label for="vehicle-plate">License Plate</label>
            <div class="input-shell">
              <ion-input id="vehicle-plate" v-model="vehicleForm.plate" class="text-input" />
            </div>
          </div>
          <div class="form-field">
            <label for="vehicle-color">Color</label>
            <div class="input-shell">
              <ion-input id="vehicle-color" v-model="vehicleForm.color" class="text-input" />
            </div>
          </div>
        </form>
        <div class="pane-actions">
          <ion-button expand="block" fill="solid" color="light" @click="closeVehiclePane" class="w-full">
            <span class="pane-actions__text">Cancel</span>
          </ion-button>
          <ion-button expand="block" color="secondary" :disabled="isUpdateDisabled" @click="handleUpdateVehicle" class="w-full text-white">
            Update Vehicle
          </ion-button>
        </div>
        <button class="delete-button" type="button" @click="handleRemoveVehicle">Delete Vehicle</button>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonModal, IonPage } from '@ionic/vue';
import { add, createOutline, ellipsisVertical } from 'ionicons/icons';
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const vehicles = [
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3',
    make: 'Tesla',
    model: 'Model 3',
    year: '2022',
    plate: 'CV23CD',
    color: 'White',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'ford-focus',
    name: 'Ford Focus',
    make: 'Ford',
    model: 'Focus',
    year: '2019',
    plate: 'CV12AB',
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=200&q=80'
  }
];

const goBack = () => {
  router.back();
};

const goToAddVehicle = () => {
  router.push('/add-vehicle');
};

const selectedVehicle = ref<(typeof vehicles)[number] | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const previewImage = ref('');
const vehicleForm = reactive({
  make: '',
  model: '',
  year: '',
  plate: '',
  color: '',
  imageFile: null as File | null
});

const isUpdateDisabled = computed(() => {
  return !vehicleForm.make.trim() || !vehicleForm.model.trim() || !vehicleForm.plate.trim();
});

const openVehicleOptions = (vehicle: (typeof vehicles)[number]) => {
  selectedVehicle.value = vehicle;
  previewImage.value = vehicle.image;
  vehicleForm.make = vehicle.make || '';
  vehicleForm.model = vehicle.model || '';
  vehicleForm.year = vehicle.year || '';
  vehicleForm.plate = vehicle.plate;
  vehicleForm.color = vehicle.color;
  vehicleForm.imageFile = null;
};

const closeVehiclePane = () => {
  selectedVehicle.value = null;
  previewImage.value = '';
  vehicleForm.imageFile = null;
};

const handleEditImage = () => {
  imageInputRef.value?.click();
};

const handleImageSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  vehicleForm.imageFile = file;
  const reader = new FileReader();
  reader.onload = () => {
    previewImage.value = typeof reader.result === 'string' ? reader.result : '';
  };
  reader.readAsDataURL(file);
  input.value = '';
};

const handleRemoveVehicle = () => {
  if (!selectedVehicle.value) return;
  console.info('Remove vehicle', selectedVehicle.value.id);
  closeVehiclePane();
};

const handleUpdateVehicle = () => {
  if (!selectedVehicle.value) return;
  console.info('Update vehicle', selectedVehicle.value.id, {
    ...vehicleForm,
    previewImage: previewImage.value
  });
  closeVehiclePane();
};
</script>

<style scoped>
ion-content.vehicles-page {
  --background: #f6f7fb;;
  padding-bottom: env(safe-area-inset-bottom);
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 20px 100px;
}

.vehicle-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 22px;
  padding: 16px;
  gap: 14px;
  box-shadow: 0 12px 30px rgba(78, 99, 120, 0.12);
  border: 1px solid rgba(15, 27, 43, 0.04);
}

.vehicle-image {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
}

.vehicle-details {
  flex: 1;
}

.vehicle-details h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #121d2c;
  font-weight: 700;
}

.vehicle-details p {
  margin: 4px 0 0;
  color: #766d6c;
  font-size: 0.95rem;
}

.icon-button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #1b1b1b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-button ion-icon {
  font-size: 1.4rem;
}

ion-fab {
  margin-bottom: 16px;
  margin-right: 8px;
}

ion-fab-button {
  --box-shadow: 0 12px 26px rgba(58, 184, 120, 0.32);
}

.vehicle-pane::part(content) {
  border-radius: 28px 28px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.pane-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vehicle-media {
  position: relative;
}

.vehicle-media img {
  width: 100%;
  border-radius: 22px;
  object-fit: cover;
  max-height: 200px;
}

.media-edit {
  position: absolute;
  bottom: 12px;
  right: 12px;
  --border-radius: 12px;
  --padding-start: 10px;
  --padding-end: 10px;
}

.image-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.pane-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  color: #516080;
  font-weight: 600;
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-radius: 18px;
  background: #ffffff;
  border: 1.5px solid #dbe0e9;
  height: 58px;
}

.input-shell:focus-within {
  border-color: #1fb16a;
  box-shadow: 0 0 0 1px rgba(31, 177, 106, 0.2);
}

.text-input {
  flex: 1;
  font-size: 1rem;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: transparent;
  --color: #0f1b2b;
  --placeholder-color: #b2b9c7;
}

.pane-actions {
  display: flex;
  gap: 12px;
}

.pane-actions ion-button {
  --border-radius: 16px;
  font-weight: 600;
}

.pane-actions__text {
  color: #0f1b2b;
}

.delete-button {
  background: none;
  border: none;
  color: #e25a4a;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 4px;
}
</style>
