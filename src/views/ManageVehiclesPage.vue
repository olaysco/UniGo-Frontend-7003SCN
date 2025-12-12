<template>
  <ion-page>
    <ion-content class="vehicles-page safe-area-scroll">
      <AppBackHeader title="My Vehicles" @back="goBack" />

      <section v-if="vehicleList.length" class="vehicle-list">
        <button
          v-for="vehicle in vehicleList"
          :key="vehicle.id"
          type="button"
          class="vehicle-card"
          @click="openVehicleOptions(vehicle)"
        >
          <img class="vehicle-image" :src="getVehicleImage(vehicle)" :alt="vehicle.name" />
          <div class="vehicle-details">
            <h2>{{ vehicle.name }}</h2>
            <p>{{ vehicle.plateNumber }}<span v-if="vehicle.color"> • {{ vehicle.color }}</span></p>
          </div>
        </button>
      </section>

      <div v-else-if="isLoadingVehicles" class="vehicle-loading">
        <ion-spinner name="crescent" />
        <p>Loading your vehicles…</p>
      </div>

      <div v-else class="vehicle-empty">
        <p class="vehicle-empty__title">No vehicles yet</p>
        <p class="vehicle-empty__subtitle">Add your first car to start sharing rides.</p>
        <ion-button color="success" expand="block" class="vehicle-empty__cta text-white" @click="goToAddVehicle">
          Add a vehicle
        </ion-button>
      </div>

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
      <ion-content>
        <div v-if="selectedVehicle" class="pane-content ion-padding">
          <div class="vehicle-media">
            <img :src="previewImage || getVehicleImage(selectedVehicle)" :alt="selectedVehicle.name" />
            <ion-button
              class="media-edit"
              size="small"
              fill="solid"
              color="dark"
              :disabled="isUploadingImage"
              @click="handleEditImage"
            >
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
              <ion-input id="vehicle-plate" v-model="vehicleForm.plateNumber" class="text-input" />
            </div>
          </div>
            <div class="form-field">
              <label for="vehicle-color">Color</label>
              <div class="input-shell">
                <ion-input id="vehicle-color" v-model="vehicleForm.color" class="text-input" />
              </div>
            </div>
            <div class="form-field">
            <label for="vehicle-capacity">Available Seats</label>
            <div class="input-shell">
              <ion-input id="vehicle-capacity" v-model="vehicleForm.capacity" type="number" class="text-input" />
            </div>
          </div>
          </form>
          <div class="pane-actions">
            <ion-button expand="block" fill="solid" color="light" @click="closeVehiclePane" class="w-full">
              <span class="pane-actions__text">Cancel</span>
            </ion-button>
            <ion-button
              expand="block"
              color="secondary"
              :disabled="isUpdateDisabled || isUpdatingSelection"
              @click="handleUpdateVehicle"
              class="w-full text-white"
            >
              <ion-spinner v-if="isUpdatingSelection" name="crescent" class="mr-2" />
              <span>{{ isUpdatingSelection ? 'Updating…' : 'Update Vehicle' }}</span>
            </ion-button>
          </div>
          <button class="delete-button" type="button" :disabled="isDeletingSelection" @click="handleRemoveVehicle">
            {{ isDeletingSelection ? 'Deleting…' : 'Delete Vehicle' }}
          </button>
        </div>
      </ion-content>
    </ion-modal>
    <ion-toast :is-open="toastOpen" :message="toastMessage" :color="toastColor" duration="2500" @didDismiss="closeToast" />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonSpinner,
  IonToast
} from '@ionic/vue';
import { add, createOutline } from 'ionicons/icons';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { useVehicleStore } from '@/stores/vehicleStore';
import type { Vehicle } from '@/services/vehicleService';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const vehicleStore = useVehicleStore();
const { vehicles, loading, loaded } = storeToRefs(vehicleStore);
const { toastMessage, toastColor, toastOpen, showToast, closeToast } = useToast('success');

const selectedVehicle = ref<Vehicle | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const previewImage = ref('');
const vehicleForm = reactive({
  make: '',
  model: '',
  year: '',
  plateNumber: '',
  color: '',
  capacity: '',
  imageFile: null as File | null
});

const isUpdateDisabled = computed(() => {
  return !vehicleForm.model.trim() || !vehicleForm.plateNumber.trim();
});

const vehicleList = computed(() => vehicles.value);
const isLoadingVehicles = computed(() => loading.value && !loaded.value);
const isUpdatingSelection = computed(() => (selectedVehicle.value ? vehicleStore.isUpdating(selectedVehicle.value.id) : false));
const isDeletingSelection = computed(() => (selectedVehicle.value ? vehicleStore.isDeleting(selectedVehicle.value.id) : false));
const isUploadingImage = computed(() => (selectedVehicle.value ? vehicleStore.isUploading(selectedVehicle.value.id) : false));
const fallbackImage = '/vehicle-placeholder.svg';

const goBack = () => {
  router.back();
};

const goToAddVehicle = () => {
  router.push('/add-vehicle');
};

const getVehicleImage = (vehicle: Vehicle) => {
  let url = JSON.parse(vehicle.imageUrl || '[]');
  if (Array.isArray(url) && url.length > 0) {
    url = url[0];
  }

  return url.length ? url : fallbackImage;
};

const loadVehicles = async () => {
  try {
    await vehicleStore.fetchVehicles();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load vehicles.';
    showToast(message, 'danger');
  }
};

onMounted(() => {
  if (!loaded.value) {
    loadVehicles();
  }
});

const openVehicleOptions = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  previewImage.value = getVehicleImage(vehicle);
  vehicleForm.make = vehicle.make || '';
  vehicleForm.model = vehicle.model || '';
  vehicleForm.year = vehicle.year || '';
  vehicleForm.plateNumber = vehicle.plateNumber || '';
  vehicleForm.color = vehicle.color || '';
  vehicleForm.capacity = vehicle.capacity?.toString() || '';
  vehicleForm.imageFile = null;
};

const closeVehiclePane = () => {
  selectedVehicle.value = null;
  previewImage.value = '';
  vehicleForm.imageFile = null;
};

const handleEditImage = () => {
  if (isUploadingImage.value) {
    return;
  }
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
  console.log('File selected:', file);
  reader.readAsDataURL(file);
  input.value = '';
};

const buildPayload = () => {
  return {
    make: vehicleForm.make ? vehicleForm.make.trim() : null,
    model: vehicleForm.model.trim(),
    year: vehicleForm.year ? vehicleForm.year.trim() : null,
    plateNumber: vehicleForm.plateNumber.trim(),
    color: vehicleForm.color ? vehicleForm.color.trim() : null,
    capacity: vehicleForm.capacity ? Number(vehicleForm.capacity) : null
  };
};

const handleRemoveVehicle = async () => {
  if (!selectedVehicle.value || isDeletingSelection.value) return;

  try {
    await vehicleStore.deleteVehicle(selectedVehicle.value.id);
    showToast('Vehicle removed', 'success');
    closeVehiclePane();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete vehicle.';
    showToast(message, 'danger');
  }
};

const handleUpdateVehicle = async () => {
  if (!selectedVehicle.value || isUpdatingSelection.value) return;

  try {
    await vehicleStore.updateVehicle(selectedVehicle.value.id, buildPayload(), vehicleForm.imageFile);
    showToast('Vehicle updated', 'success');
    closeVehiclePane();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update vehicle.';
    showToast(message, 'danger');
  }
};
</script>

<style scoped>
ion-content.vehicles-page {
  --background: #f6f7fb;
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
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.vehicle-card:focus-visible {
  outline: 2px solid #1fb16a;
  outline-offset: 2px;
}

.vehicle-card:active {
  transform: translateY(1px);
  box-shadow: 0 8px 20px rgba(78, 99, 120, 0.12);
}

.vehicle-image {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  background: #edf2f7;
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

.vehicle-loading,
.vehicle-empty {
  padding: 40px 24px 120px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.vehicle-loading p {
  margin: 0;
  color: #516080;
}

.vehicle-empty__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #121d2c;
  margin: 0;
}

.vehicle-empty__subtitle {
  margin: 0;
  color: #5f6b84;
}

.vehicle-empty__cta {
  margin-top: 8px;
  width: 100%;
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

.delete-button:disabled {
  opacity: 0.6;
}
</style>
