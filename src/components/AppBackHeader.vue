<template>
  <header class="app-header ion-padding text-slate-900">
    <button class="icon-button" type="button" aria-label="Go back" @click="$emit('back')">
      <ion-icon :icon="backIcon" aria-hidden="true" />
    </button>
    <div class="header-text">
      <p v-if="subtitle">{{ subtitle }}</p>
      <h1 class="text-slate-900">{{ title }}</h1>
    </div>
    <div class="end-slot">
      <slot name="end">
        <span class="icon-button placeholder" aria-hidden="true"></span>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    backIcon?: string;
  }>(),
  {
    subtitle: undefined,
    backIcon: chevronBackOutline
  }
);

defineEmits<{ (e: 'back'): void }>();
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  gap: 16px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: none;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}

.icon-button.placeholder {
  opacity: 0;
  pointer-events: none;
}

.header-text {
  flex: 1;
  text-align: center;
}

.header-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #7d869e;
}

.header-text h1 {
  margin: 4px 0 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.end-slot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 40px;
}
</style>
