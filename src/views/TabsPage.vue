<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="main-tab-bar py-4">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon aria-hidden="true" :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon aria-hidden="true" :icon="searchOutline" />
          <ion-label>Search</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="bookings" href="/tabs/bookings">
          <ion-icon aria-hidden="true" :icon="calendarOutline" />
          <ion-label>Bookings</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="messages" href="/tabs/messages">
          <ion-icon aria-hidden="true" :icon="chatbubbleEllipsesOutline" />
          <ion-label>Messages</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { calendarOutline, carSportOutline, chatbubbleEllipsesOutline, homeOutline, personCircleOutline, searchOutline } from 'ionicons/icons';
</script>

<style scoped>
.main-tab-bar {
  --color-selected: var(--ion-color-secondary);
}
</style>
