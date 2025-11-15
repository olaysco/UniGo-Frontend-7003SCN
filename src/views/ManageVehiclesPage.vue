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
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonIcon, IonPage } from '@ionic/vue';
import { add, ellipsisVertical } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

const vehicles = [
  {
    id: 'tesla-model-3',
    name: 'Tesla Model 3',
    plate: 'CV23CD',
    color: 'White',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'ford-focus',
    name: 'Ford Focus',
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

const openVehicleOptions = (vehicle: (typeof vehicles)[number]) => {
  console.info('Open actions for', vehicle.name);
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
</style>
