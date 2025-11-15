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
  </ion-page>

  <ProfileFieldEditorPane
    v-if="activeFieldMeta"
    :open="isPaneOpen"
    :label="activeFieldMeta.label"
    :placeholder="activeFieldMeta.placeholder"
    :helper="activeFieldMeta.helper"
    :type="activeFieldMeta.type"
    :value="editingValue"
    @close="closeEditor"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  calendarOutline,
  chevronBackOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  trashOutline
} from 'ionicons/icons';
import ProfileFieldEditorPane from '@/components/ProfileFieldEditorPane.vue';

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
    type: 'text',
    helper: 'We use your birth date to verify eligibility for certain trips.'
  }
};

const editingField = ref<EditableFieldKey | null>(null);
const editingValue = ref('');
const isPaneOpen = ref(false);

const activeFieldMeta = computed(() => (editingField.value ? fieldMeta[editingField.value] : null));

const goBack = () => {
  router.back();
};

const openEditor = (field: EditableFieldKey) => {
  editingField.value = field;
  editingValue.value = profile[field] || '';
  isPaneOpen.value = true;
};

const closeEditor = () => {
  isPaneOpen.value = false;
  editingField.value = null;
  editingValue.value = '';
};

const handleSave = (value: string) => {
  if (!editingField.value) return;
  profile[editingField.value] = value;
  closeEditor();
};

const handleSignOut = () => {
  console.info('Sign out tapped');
};

const handleDelete = () => {
  console.info('Delete account tapped');
};
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
</style>
