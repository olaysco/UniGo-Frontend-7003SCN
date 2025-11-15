<template>
  <ion-page>
    <ion-content class="details-page safe-area-scroll" :fullscreen="true">
      <header class="top-bar ion-padding-horizontal">
        <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>
        <h1>Profile Details</h1>
        <span class="icon-button placeholder" aria-hidden="true"></span>
      </header>

      <main class="details-body">
        <section class="card">
          <p class="card-label">Account name</p>
          <div class="card-row">
            <p class="card-value">{{ profile.name }}</p>
            <button class="ghost-button" type="button" aria-label="Edit name" @click="openEditor('name')">
              <ion-icon :icon="createOutline" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="card">
          <p class="card-label">Phone number</p>
          <div class="card-row">
            <div>
              <p class="card-value">{{ profile.phone }}</p>
              <p class="card-helper" aria-live="polite">
                <ion-icon v-if="profile.phoneVerified" :icon="shieldCheckmarkOutline" aria-hidden="true" />
                {{ profile.phoneVerified ? 'Verified number' : 'Unverified' }}
              </p>
            </div>
            <button class="ghost-button" type="button" aria-label="Edit phone" @click="openEditor('phone')">
              <ion-icon :icon="createOutline" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="card">
          <p class="card-label">Email</p>
          <div class="card-row">
            <p class="card-value">{{ profile.email }}</p>
            <button class="ghost-button" type="button" aria-label="Edit email" @click="openEditor('email')">
              <ion-icon :icon="createOutline" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="card">
          <p class="card-label">Date of birth</p>
          <div class="card-row">
            <p class="card-value">{{ profile.birthDate || '-' }}</p>
            <button class="ghost-button" type="button" aria-label="Set date of birth" @click="openEditor('birthDate')">
              <ion-icon :icon="calendarOutline" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="actions">
          <button class="action-row" type="button" @click="handleSignOut">
            <ion-icon :icon="logOutOutline" aria-hidden="true" />
            <span>Sign out</span>
            <ion-icon :icon="chevronForwardOutline" aria-hidden="true" />
          </button>
          <button class="action-row destructive" type="button" @click="handleDelete">
            <ion-icon :icon="trashOutline" aria-hidden="true" />
            <span>Delete account</span>
            <ion-icon :icon="chevronForwardOutline" aria-hidden="true" />
          </button>
        </section>
      </main>
    </ion-content>
    <ion-modal
      :is-open="paneVisible"
      :initial-breakpoint="0.6"
      :breakpoints="[0.6, 0.95]"
      handle-behavior="cycle"
      class="profile-edit-modal"
      @didDismiss="handleModalDismiss"
    >
      <div v-if="activeFieldMeta" class="pane-content">
        <div class="pane-header">
          <p class="pane-subtitle">Edit {{ activeFieldMeta.label }}</p>
          <h2>{{ activeFieldMeta.label }}</h2>
        </div>
        <ion-input
          v-model="editingValue"
          :type="activeFieldMeta.type"
          :placeholder="activeFieldMeta.placeholder"
          fill="outline"
          label-placement="stacked"
          class="pane-input"
        >
          <div slot="label">{{ activeFieldMeta.label }}</div>
        </ion-input>
        <p class="pane-helper">{{ activeFieldMeta.helper }}</p>
        <div class="pane-actions">
          <ion-button expand="block" fill="clear" color="medium" @click="closePane">
            Cancel
          </ion-button>
          <ion-button expand="block" color="success" :disabled="isSaveDisabled" @click="saveField">
            Save changes
          </ion-button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { IonButton, IonContent, IonIcon, IonInput, IonModal, IonPage } from '@ionic/vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import {
  calendarOutline,
  chevronBackOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  trashOutline
} from 'ionicons/icons';

type EditableFieldKey = 'name' | 'phone' | 'email' | 'birthDate';

const router = useRouter();

const profile = reactive({
  name: 'Olayiwola Odunsi',
  phone: '08113376030',
  phoneVerified: true,
  email: 'olayiwolaodunsi@gmail.com',
  birthDate: ''
});

const fieldMeta: Record<EditableFieldKey, { label: string; placeholder: string; type: string; helper: string }> = {
  name: {
    label: 'Account name',
    placeholder: 'Enter your full name',
    type: 'text',
    helper: 'Use the name that appears on your ID for verification.'
  },
  phone: {
    label: 'Phone number',
    placeholder: 'Enter your phone number',
    type: 'tel',
    helper: 'We will send a quick verification text to confirm changes.'
  },
  email: {
    label: 'Email address',
    placeholder: 'e.g. hello@unigo.app',
    type: 'email',
    helper: 'Email updates include ride receipts and important alerts.'
  },
  birthDate: {
    label: 'Date of birth',
    placeholder: 'DD/MM/YYYY',
    type: 'date',
    helper: 'We use your birth date to verify eligibility for certain trips.'
  }
};

const editingField = ref<EditableFieldKey | null>(null);
const editingValue = ref('');
const paneVisible = ref(false);

const activeFieldMeta = computed(() => (editingField.value ? fieldMeta[editingField.value] : null));
const isSaveDisabled = computed(() => !editingField.value || editingValue.value.trim().length === 0);

const goBack = () => {
  router.back();
};

const openEditor = async (field: EditableFieldKey) => {
  editingField.value = field;
  editingValue.value = profile[field] || '';
  paneVisible.value = true;
};

const closePane = () => {
  paneVisible.value = false;
  editingField.value = null;
  editingValue.value = '';
};

const saveField = () => {
  if (!editingField.value) return;
  profile[editingField.value] = editingValue.value.trim();
  closePane();
};

const handleModalDismiss = () => {
  closePane();
};

const handleSignOut = () => {
  console.info('Sign out tapped');
};

const handleDelete = () => {
  console.info('Delete account tapped');
};

onBeforeRouteLeave(() => {
  if (paneVisible.value) {
    closePane();
  }
});
</script>

<style scoped>
.details-page {
  --background: #f6f7fb;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 48px;
  padding-bottom: 16px;
}

.top-bar h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f1b2b;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f1b2b;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

.icon-button.placeholder {
  opacity: 0;
  pointer-events: none;
}

.details-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 60px;
}

.card {
  background: #eef0f5;
  border-radius: 22px;
  padding: 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.card-label {
  font-size: 0.9rem;
  color: #7b859b;
  margin-bottom: 10px;
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f1b2b;
}

.card-helper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #00a870;
  margin-top: 4px;
}

.ghost-button {
  border: none;
  background: transparent;
  color: #7b859b;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.actions {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.action-row {
  width: 100%;
  border: none;
  background: transparent;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0f1b2b;
  font-weight: 600;
}

.action-row + .action-row {
  border-top: 1px solid #f0f1f5;
}

.action-row ion-icon:first-of-type {
  margin-right: 12px;
}

.destructive {
  color: #e53d35;
}

:global(.profile-edit-modal::part(content)) {
  --background: transparent;
  --border-radius: 24px 24px 0 0;
  --box-shadow: none;
  align-self: flex-end;
  padding: 0;
}

:global(.profile-edit-modal::part(backdrop)) {
  background: rgba(15, 18, 34, 0.45);
}

.pane-content {
  background: #ffffff;
  border-radius: 32px 32px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.pane-header h2 {
  margin: 4px 0 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.pane-subtitle {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  color: #7d869e;
  margin: 0;
}

.pane-helper {
  font-size: 0.85rem;
  color: #7a859c;
}

.pane-input {
  --background: #f5f7fb;
  --border-color: #d9dde8;
  --border-radius: 18px;
  --highlight-color-focused: #03a46b;
  --highlight-color-valid: #03a46b;
}

.pane-actions {
  display: flex;
  gap: 12px;
}

.pane-actions ion-button {
  flex: 1;
  height: 48px;
  --border-radius: 14px;
}
</style>
