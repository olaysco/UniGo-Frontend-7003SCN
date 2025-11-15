<template>
  <ion-page>
    <ion-content class="messages-page safe-area-scroll" :fullscreen="true">
      <AppBackHeader title="Messages" subtitle="All chats & alerts" @back="goBack" />

      <section class="message-list ion-padding">
        <article
          v-for="message in messages"
          :key="message.id"
          class="message-card"
          :class="[
            message.type === 'system' ? 'is-system' : '',
            message.unread ? 'is-unread' : ''
          ]"
          role="button"
          tabindex="0"
          @click="openMessage(message.id)"
          @keyup.enter="openMessage(message.id)"
          @keyup.space.prevent="openMessage(message.id)"
        >
          <div class="card-header">
            <div class="identity">
              <div class="avatar" :class="{ 'avatar-icon': message.type === 'system' }">
                <img v-if="message.type !== 'system'" :src="message.avatar" :alt="message.name" />
                <ion-icon v-else :icon="notificationsOutline" aria-hidden="true" />
              </div>
              <div class="details">
                <p class="name">{{ message.name }}</p>
                <p class="preview">{{ message.preview }}</p>
                <p v-if="message.journey" class="journey">{{ message.journey }}</p>
                <p v-if="message.contextLabel" class="context">{{ message.contextLabel }}</p>
              </div>
            </div>
            <div class="meta">
              <span class="time">{{ message.timeLabel }}</span>
              <span v-if="message.unread" class="status-dot" aria-label="Unread message" />
            </div>
          </div>
        </article>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import AppBackHeader from '@/components/AppBackHeader.vue';

interface MessageCard {
  id: string;
  name: string;
  preview: string;
  journey: string;
  contextLabel?: string;
  timeLabel: string;
  unread?: boolean;
  type?: 'user' | 'system';
  avatar?: string;
}

const router = useRouter();

const messages = ref<MessageCard[]>([
  {
    id: 'msg-1',
    name: 'Jane Doe',
    preview: 'Sounds good! See you then.',
    journey: 'Coventry to Birmingham - Fri, 28 Oct',
    timeLabel: '10:30 AM',
    unread: true,
    type: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'msg-2',
    name: 'John Smith',
    preview: 'Are you still on for the trip tomorrow?',
    journey: 'Campus to Leamington Spa - Thu, 27 Oct',
    timeLabel: 'Yesterday',
    type: 'user',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'msg-3',
    name: 'System Notification',
    preview: '£5.50 from Alex.',
    journey: '',
    timeLabel: '2 days ago',
    type: 'system',
    contextLabel: 'Payment Received'
  },
  {
    id: 'msg-4',
    name: 'Alex Ray',
    preview: 'Thanks for the ride!',
    journey: 'Warwick Arts Centre to Coventry Station - Tue, 25 Oct',
    timeLabel: '3 days ago',
    type: 'user',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80'
  }
]);

const goBack = () => {
  router.back();
};

const openMessage = (id: string) => {
  router.push({ name: 'message-details', params: { id } });
};
</script>

<style scoped>
ion-content.messages-page {
   --background: #f8f9fb;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 16px 32px rgba(25, 39, 71, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.message-card.is-system {
  background: #eef8f5;
}

.message-card.is-unread .preview {
  color: #1f2233;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.identity {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f1f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon ion-icon {
  font-size: 24px;
  color: #1f866f;
}

.name {
  margin: 0;
  font-weight: 700;
  color: #11182a;
}

.preview {
  margin: 4px 0 0;
  color: #556079;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  min-width: 80px;
}

.time {
  color: #8b94ad;
  font-size: 0.85rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #26c281;
}

.journey {
  margin: 0;
  color: #7a859c;
  font-size: 0.9rem;
}

.context {
  margin: 0;
  color: #2c7a66;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
