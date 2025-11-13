<template>
  <ion-page>
    <ion-content class="faq-page safe-area-scroll" :fullscreen="true">
      <header class="top-bar ion-padding">
        <button class="icon-button" type="button" aria-label="Go back" @click="goBack">
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>
        <h1>FAQ & Help</h1>
        <span class="icon-button placeholder" aria-hidden="true"></span>
      </header>

      <main class="faq-body ion-padding">
        <section class="search-field">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search for a question..."
            :debounce="200"
            show-cancel-button="never"
            aria-label="Search FAQs"
          />
        </section>

        <ion-segment
          class="category-pills"
          scrollable
          :value="activeCategory"
          @ionChange="handleSegmentChange"
        >
          <ion-segment-button
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            class="pill"
          >
            <ion-label>{{ category.label }}</ion-label>
          </ion-segment-button>
        </ion-segment>

        <section class="faq-list" aria-live="polite">
          <article
            v-for="item in filteredFaqs"
            :key="item.id"
            class="faq-item"
          >
            <button
              class="faq-question"
              type="button"
              :aria-expanded="openFaq === item.id"
              @click="toggleFaq(item.id)"
            >
              <span>{{ item.question }}</span>
              <ion-icon
                :icon="openFaq === item.id ? chevronUpOutline : chevronDownOutline"
                aria-hidden="true"
              />
            </button>
            <p v-if="openFaq === item.id" class="faq-answer">{{ item.answer }}</p>
          </article>

          <p v-if="!filteredFaqs.length" class="empty-state">
            No questions match your search. Try a different keyword.
          </p>
        </section>

        <section class="support-card">
          <div>
            <p class="support-title">Can't find your answer?</p>
            <p class="support-copy">Our support team is here to help.</p>
          </div>
          <ion-button color="success" shape="round" @click="contactSupport">
            Contact
          </ion-button>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonLabel,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTabBar,
  IonTabButton
} from '@ionic/vue';
import type { SegmentChangeEventDetail } from '@ionic/vue';
import {
  chevronBackOutline,
  chevronDownOutline,
  chevronUpOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  homeOutline,
  personCircleOutline,
  searchOutline
} from 'ionicons/icons';

type CategoryId = 'getting-started' | 'booking' | 'payments';

interface FaqItem {
  id: number;
  category: CategoryId;
  question: string;
  answer: string;
}

const router = useRouter();

const categories: Array<{ id: CategoryId; label: string }> = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'booking', label: 'Booking & Rides' },
  { id: 'payments', label: 'Payments' }
];

const faqs = ref<FaqItem[]>([
  {
    id: 1,
    category: 'getting-started',
    question: 'How do I book a ride?',
    answer:
      'Enter your pickup and destination on the home screen, choose a trip, and confirm your booking to match with a nearby driver instantly.'
  },
  {
    id: 2,
    category: 'payments',
    question: 'What payment methods are accepted?',
    answer: 'We support debit/credit cards, PayPal, and cash on pickup for trusted riders.'
  },
  {
    id: 3,
    category: 'booking',
    question: 'How is the ride price calculated?',
    answer: 'Prices factor in distance, driver availability, and shared costs. You will always see the final price before confirming.'
  },
  {
    id: 4,
    category: 'getting-started',
    question: 'How can I edit my profile?',
    answer: 'Go to Profile > Profile Details to update your name, contact info, or preferred payment methods.'
  },
  {
    id: 5,
    category: 'booking',
    question: 'Can I cancel a ride?',
    answer: 'Yes, open the booking details and tap Cancel Ride. Free cancellations apply up to 30 minutes before pickup.'
  }
]);

const activeCategory = ref<CategoryId>('getting-started');
const openFaq = ref<number | null>(1);
const searchQuery = ref('');

const filteredFaqs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return faqs.value.filter(item => {
    const matchesCategory = item.category === activeCategory.value;
    const matchesQuery = !query || `${item.question} ${item.answer}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
});

const selectCategory = (id: CategoryId) => {
  activeCategory.value = id;
  openFaq.value = null;
};

const handleSegmentChange = (event: CustomEvent<SegmentChangeEventDetail>) => {
  const value = event.detail.value as CategoryId | undefined;
  if (value && value !== activeCategory.value) {
    selectCategory(value);
  }
};

const toggleFaq = (id: number) => {
  openFaq.value = openFaq.value === id ? null : id;
};

const goBack = () => {
  router.back();
};

const supportEmail = 'support@unigo.com';

const contactSupport = () => {
  const mailto = `mailto:${supportEmail}`;
  if (typeof window !== 'undefined') {
    window.location.href = mailto;
  }
};
</script>

<style scoped>
.faq-page {
  --background: #f5f8f6;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.icon-button {
  border: none;
  background: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  color: #0f172a;
}

.icon-button.placeholder {
  opacity: 0;
  box-shadow: none;
  pointer-events: none;
}

.faq-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.search-field ion-searchbar {
  --background: #ffffff;
  --border-radius: 20px;
  --box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  --color: #111b2f;
  --placeholder-color: #9aa2b4;
}

.category-pills {
  width: 100%;
  --background: transparent;
  --indicator-color: transparent;
  --color: inherit;
  padding-bottom: 6px;
}

.category-pills::-webkit-scrollbar {
  display: none;
}

.pill {
  --background: #ffffff;
  --background-checked: #05c168;
  --color: #4c556a;
  --color-checked: #ffffff;
  --indicator-color: transparent;
  flex: 0 0 auto;
  margin-right: 12px;
  min-width: max-content;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.pill:last-child {
  margin-right: 0;
}

.pill::part(native) {
  border-radius: 999px;
  padding: 10px 20px;
}

.faq-list {
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
  padding: 10px 6px;
}

.faq-item + .faq-item {
  border-top: 1px solid #f0f2f6;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111b2f;
}

.faq-answer {
  margin: 0 20px 20px;
  color: #6e768c;
  line-height: 1.5;
}

.empty-state {
  margin: 0;
  padding: 16px 20px 24px;
  color: #6c778f;
  text-align: center;
}

.support-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
}

.support-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111b2f;
  margin-bottom: 6px;
}

.support-copy {
  margin: 0;
  color: #6d768d;
}
</style>
