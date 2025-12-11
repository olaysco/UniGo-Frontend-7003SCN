<template>
  <div ref="mapRef" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

type LatLngLiteral = { lat: number; lng: number };

const props = defineProps<{
  center: LatLngLiteral;
  zoom?: number;
  disableDefaultUI?: boolean;
  pickup?: LatLngLiteral | null;
  dropoff?: LatLngLiteral | null;
}>();

const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
let pickupMarker: google.maps.Marker | null = null;
let dropoffMarker: google.maps.Marker | null = null;
let directionsRenderer: google.maps.DirectionsRenderer | null = null;
let directionsService: google.maps.DirectionsService | null = null;

onMounted(async () => {
  const { Map } = (await google.maps.importLibrary('maps')) as { Map: typeof google.maps.Map };
  map.value = new Map(mapRef.value!, {
    center: props.center,
    zoom: props.zoom ?? 10,
    disableDefaultUI: props.disableDefaultUI ?? false,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map.value,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#2563eb',
      strokeOpacity: 0.9,
      strokeWeight: 6,
    },
  });

  updateMarkersAndRoute();
});

onUnmounted(() => {
  pickupMarker?.setMap(null);
  dropoffMarker?.setMap(null);
  directionsRenderer?.setMap(null);
});

watch(
  () => [props.pickup, props.dropoff],
  () => {
    updateMarkersAndRoute();
  }
);

watch(
  () => props.center,
  (newCenter) => {
    if (map.value && newCenter) map.value.setCenter(newCenter);
  }
);

watch(
  () => props.zoom,
  (newZoom) => {
    if (map.value && newZoom) map.value.setZoom(newZoom);
  }
);

function createMarker(position: LatLngLiteral, color: string) {
  const svg = `<svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.611 0 0 7.611 0 17c0 11.756 15.2 26.972 16.471 28.266a0.75 0.75 0 0 0 1.058 0C18.8 43.972 34 28.756 34 17 34 7.611 26.389 0 17 0Zm0 24.5A7.5 7.5 0 1 1 24.5 17 7.509 7.509 0 0 1 17 24.5Z" fill="${color}"/>
  </svg>`;
  return new google.maps.Marker({
    position,
    map: map.value!,
    icon: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  });
}

async function updateMarkersAndRoute() {
  if (!map.value || !directionsService || !directionsRenderer) return;

  pickupMarker?.setMap(null);
  dropoffMarker?.setMap(null);

  if (props.pickup) pickupMarker = createMarker(props.pickup, '#0ac36c');
  if (props.dropoff) dropoffMarker = createMarker(props.dropoff, '#2563eb');

  if (props.pickup && props.dropoff) {
    try {
      const result = await directionsService.route({
        origin: props.pickup,
        destination: props.dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      directionsRenderer.setDirections(result);
    } catch (e) {
      console.error('Directions request failed:', e);
      directionsRenderer.setDirections(null); // Clear the route safely
    }
  } else {
    directionsRenderer.setDirections(null);
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
