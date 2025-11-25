<template>
  <ion-page>
    <ion-content class="rating-page" :fullscreen="true" :scroll-y="false">
        <AppBackHeader title="Rate Your Driver" @back="goBack"/>
        <div class="page-body">

            <img class="driver-avatar" :src="driver.avatar" :alt="driver.name" />
            
            <h1 class="rating-title">How was your trip with {{ driver.name }}?</h1>
            
            <!-- Rate with stars -->
            <div class="stars-row">
                <div class="star-icon" 
                    v-for="n in 5" 
                    :key="n"
                    @click="setRating(n)">
                <ion-icon
                    :icon="n <= rating ? star : starOutline"
                    size="large">
                </ion-icon>                
                </div>
            </div>
            
            <!-- Input Feedback -->
            <div class="feedback-section">
                <p class="feedback-title">Additional Feedback</p>
                <div class="feedback-input">
                    <textarea v-model="feedback" placeholder="Add a comment..."></textarea>
                </div>
            </div>
        </div>
    </ion-content>

    <ion-footer class="footer-button">
        <ion-button expand="block" size="large" class="button-submit" @click="submit">Submit</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { star, starOutline } from 'ionicons/icons';
import { ref } from "vue";

const router = useRouter();

// get from API
const driver = {
    name: 'Sarah K.',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80'
  };

const rating = ref(0); 
const feedback = ref("");      
const showToast = ref(false);

const setRating = (n: number) => {
  rating.value = n;
};

const submit = () => {
    console.log("Rating:", rating.value);
    console.log("Feedback:", feedback.value);
    // TODO: store the rating and feedback into database
    setTimeout(() => {
        router.back();
    }, 1000);
};

const goBack = () => {
  router.back();
};

</script>
 
<style>
ion-content.rating-page {
  --background: #f8f9fb;
}

.page-body {
  display: flex;
  flex-direction: column;
  align-items: center;     
  height: 100%;
  padding: 2rem 1rem;
  text-align: center;
}

.driver-avatar {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  object-fit: cover;
  margin-top: 30px;
}

.rating-title {
  color: #333333;
  font-size: 30px;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: -0.01em;
  padding-bottom: 5px;
}

.stars-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px; 
  margin-top: 30px;
  margin-bottom: 30px;
}

.star-icon ion-icon {
  color: #ffcc00; 
  font-size: 40px;
}

.feedback-section {
  width: 100%;
  max-width: 400px;   
  text-align: left;   
  margin-top: 30px;
}

.feedback-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1b2b;
  margin-bottom: 10px;
  padding-left: 5px;
}

.feedback-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ccc;
  border-radius: 0.5rem;
  font-size: 16px;
  resize: none;
}

.button-submit {
  --background: #11ba82;     
  --color: #ffffff;   
  --border-radius: 12px;    
  width: 100%;         
  font-weight: 700;
}

.footer-button {
  /* position: fixed;*/
  bottom: 20px;   
  left: 0;
  right: 0; 
  padding: 0 20px;
}


</style>
