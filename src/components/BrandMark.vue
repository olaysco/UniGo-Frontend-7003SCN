<template>
  <div class="brand-mark" :class="variantClass">
    <div class="brand-icon">
      <ion-icon :icon="icon" aria-hidden="true" />
    </div>
    <p class="brand-name">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { carSportOutline } from 'ionicons/icons';

type BrandMarkVariant = 'default' | 'minimal';

const props = defineProps({
  label: {
    type: String,
    default: 'UniGo'
  },
  icon: {
    type: String,
    default: carSportOutline
  },
  variant: {
    type: String as () => BrandMarkVariant,
    default: 'default'
  }
});

const variantClass = computed(() => `brand-mark--${props.variant}`);
</script>

<style scoped>
.brand-mark {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(20, 186, 130, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-secondary);
  box-shadow: 0 10px 25px rgba(20, 186, 130, 0.15);
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #0c1220;
}

.brand-mark--minimal .brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.brand-mark--minimal .brand-name {
  font-size: 1rem;
}
</style>
