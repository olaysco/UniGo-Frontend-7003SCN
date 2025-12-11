<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  position: google.maps.LatLngLiteral;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  clickable?: boolean;
  map?: google.maps.Map;
}>();

let marker: google.maps.Marker | null = null;

onMounted(async () => {
  // Load Marker library
  const { Marker } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

  if (props.map) {
    marker = new Marker({
      position: props.position,
      icon: props.icon,
      clickable: props.clickable,
      map: props.map,
    });
  }
});

onUnmounted(() => {
  if (marker) marker.setMap(null);
});

watch(
  () => props.position,
  (newPosition) => {
    if (marker && newPosition) {
      marker.setPosition(newPosition);
    }
  }
);
</script>
