<template>
  <ion-page>
    <ion-content class="message-detail-page safe-area-scroll">
      <header class="chat-header ion-padding">
        <button class="icon-button text-slate-900" type="button" @click="goBack" aria-label="Back to messages">
          <ion-icon :icon="chevronBack" />
        </button>
        <div class="chat-peer">
          <img :src="thread.avatar" :alt="thread.name" />
          <div>
            <p class="name">{{ thread.name }}</p>
            <p class="route">RE: {{ thread.route }}</p>
          </div>
        </div>
        <div class="header-spacer" />
      </header>

      <section class="conversation ion-padding-horizontal">
        <p class="day-divider">Today</p>
        <article v-for="message in messages" :key="message.id" class="message-block" :class="message.sender === 'me' ? 'is-own' : 'is-peer'">
          <div class="message-meta">
            <span>{{ message.senderLabel }}</span>
            <span>{{ message.time }}</span>
          </div>
          <div class="bubble-row">
            <img v-if="message.sender === 'peer'" :src="thread.avatar" :alt="thread.name" class="mini-avatar" />
            <div class="bubble">
              <p>{{ message.text }}</p>
            </div>
          </div>
        </article>
      </section>
    </ion-content>

    <ion-footer class="composer-footer">
      <div class="composer safe-area-inset-bottom">
        <input type="text" placeholder="Type a message..." />
        <button class="circle-btn primary" type="button" aria-label="Send message">
          <ion-icon :icon="send" />
        </button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonFooter, IonIcon, IonPage } from '@ionic/vue';
import { addOutline, chevronBack, send } from 'ionicons/icons';

const router = useRouter();

interface ChatThread {
  name: string;
  avatar: string;
  route: string;
}

interface ChatMessage {
  id: string;
  sender: 'peer' | 'me';
  senderLabel: string;
  time: string;
  text: string;
}

const thread: ChatThread = {
  name: 'Alex Doe',
  avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  route: 'Coventry to Leamington - 24 Oct'
};

const messages = ref<ChatMessage[]>([
  {
    id: 'm-1',
    sender: 'peer',
    senderLabel: 'Alex Doe',
    time: '10:45 AM',
    text: 'Hey! Just confirming our trip for tomorrow. Are we still good for a 9 AM pickup?'
  },
  {
    id: 'm-2',
    sender: 'me',
    senderLabel: 'You',
    time: '10:46 AM',
    text: 'Hi Alex! Yes, everything is on track. See you at 9!'
  },
  {
    id: 'm-3',
    sender: 'peer',
    senderLabel: 'Alex Doe',
    time: '10:47 AM',
    text: "Perfect! I'll be waiting outside the train station entrance. Let me know if you're running late."
  },
  {
    id: 'm-4',
    sender: 'me',
    senderLabel: 'You',
    time: '10:48 AM',
    text: 'Sounds good, will do!'
  }
]);

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.message-detail-page {
  --background: #f6f8fb;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f6f8fb;
}

.icon-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 10px 20px rgba(38, 50, 94, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chat-peer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-peer img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-peer .name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.chat-peer .route {
  margin: 2px 0 0;
  color: #8690a9;
  font-size: 0.9rem;
}

.header-spacer {
  flex: 1;
}

.conversation {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 18px;
  padding-bottom: 110px;
}

.day-divider {
  text-align: center;
  font-weight: 600;
  color: #a1a9bf;
  margin: 0;
}

.message-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-meta {
  display: flex;
  gap: 8px;
  color: #7c839c;
  font-size: 0.85rem;
}

.message-block.is-own .message-meta {
  justify-content: flex-end;
}

.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message-block.is-own .bubble-row {
  justify-content: flex-end;
}

.mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.bubble {
  max-width: 80%;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 26px;
  box-shadow: 0 18px 30px rgba(15, 30, 67, 0.08);
  font-size: 0.95rem;
  color: #17203a;
}

.message-block.is-own .bubble {
  background: #00b074;
  color: #ffffff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 26px;
}

.message-block.is-peer .bubble {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 26px;
}

.composer-footer {
  --background: #f6f8fb;
  border-top: 1px solid #e4e7ed;
}

.composer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  background: #f6f8fb;
}

.composer input {
  flex: 1;
  border: none;
  border-radius: 28px;
  padding: 12px 16px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e4e7ed;
  font-size: 1rem;
  color: #111827;
}

.composer input::placeholder {
  color: #a1a9bf;
}

.circle-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: #e4ebf5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5c647c;
}

.circle-btn.primary {
  background: #00b074;
  color: #ffffff;
}
</style>
