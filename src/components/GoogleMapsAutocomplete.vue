<template>
  <input
    ref="input"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="placeholder"
    class="w-full"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  modelValue?: string;
  options?: google.maps.places.AutocompleteOptions;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue', 'place_changed']);

const input = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  const { Autocomplete } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

  if (input.value) {
    const autocomplete = new Autocomplete(input.value, props.options);

    autocomplete.addListener('place_changed', () => {
      emit('place_changed', autocomplete.getPlace());
    });
  }
});
</script>
