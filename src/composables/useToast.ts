import { ref } from 'vue';

export const useToast = (defaultColor: string = 'danger') => {
  const toastMessage = ref('');
  const toastColor = ref(defaultColor);
  const toastOpen = ref(false);

  const showToast = (message: string, color: string = defaultColor) => {
    toastMessage.value = message;
    toastColor.value = color;
    toastOpen.value = true;
  };

  const closeToast = () => {
    toastOpen.value = false;
  };

  return {
    toastMessage,
    toastColor,
    toastOpen,
    showToast,
    closeToast
  };
};
