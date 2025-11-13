<template>
  <li>
    <button class="row" type="button" @click="$emit('click')">
      <div class="row-main">
        <ion-icon :icon="iconMap[icon]" aria-hidden="true" />
        <span>{{ label }}</span>
      </div>
      <ion-icon :icon="chevronForward" aria-hidden="true" class="chevron" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  cardOutline,
  chevronForward,
  giftOutline,
  locationOutline,
  personCircleOutline
} from 'ionicons/icons';

type IconKey = 'personCircleOutline' | 'locationOutline' | 'cardOutline' | 'giftOutline';

const iconMap: Record<IconKey, string> = {
  personCircleOutline,
  locationOutline,
  cardOutline,
  giftOutline
};

defineProps<{ icon: IconKey; label: string }>();

defineEmits<{ (e: 'click'): void }>();
</script>

<style scoped>
.row {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  color: #1f2a3d;
  font-weight: 600;
  font-size: 1rem;
}

.row + .row {
  border-top: 1px solid #f0f1f5;
}

.row-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-main ion-icon {
  font-size: 1.3rem;
  color: #7c879c;
}

.chevron {
  color: #c0c6d3;
}
</style>
