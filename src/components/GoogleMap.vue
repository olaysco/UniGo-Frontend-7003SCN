<template>
  <div ref="mapRef" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  center: {
    type: Object as () => google.maps.LatLngLiteral,
    required: true,
  },
  zoom: {
    type: Number,
    default: 14,
  },
  disableDefaultUI: {
    type: Boolean,
    default: false,
  },
});

const mapRef = ref<HTMLDivElement | null>(null);
let map: google.maps.Map | null = null;

onMounted(async () => {
  // Load the Maps library from the global loader
  const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;

  if (mapRef.value) {
    map = new Map(mapRef.value, {
      center: props.center,
      zoom: props.zoom,
      disableDefaultUI: props.disableDefaultUI,
    });
  }
});

// Watch for center updates
watch(
  () => props.center,
  (newCenter) => {
    if (map && newCenter) {
      map.setCenter(newCenter);
    }
  }
);

// Watch for zoom updates
watch(
  () => props.zoom,
  (newZoom) => {
    if (map && newZoom) {
      map.setZoom(newZoom);
    }
  }
);
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
