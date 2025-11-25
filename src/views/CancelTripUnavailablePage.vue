<template>
    <ion-page>
        <ion-content class="cancel-unavailable-page" :fullscreen="true" :scroll-y="false">
          <AppBackHeader title="" @back="goBack"/> 
            <div class="page-body ion-padding">

                <div class="error-icon">
                    <ion-icon :icon="closeCircle" size="large"></ion-icon>
                </div>
                <h1 class="error-title">Unable to Cancel Trip</h1>
                <p class="error-message">Cancellations are not permitted within 2 hours of the scheduled pickup time.</p>
            
                <div class="detail-card">
                    <!-- Trip Details -->
                    <div class="detail-row">
                        <ion-icon :icon="calendarClear" aria-hidden="true" class="detail-icon"/>
                        <p class="detail-title">Date & Time:</p>
                    </div>
                    <p class="detail-meta">{{ booking.date }} {{ booking.departure }}</p>
                
                    <div class="detail-row">
                        <ion-icon :icon="locate" aria-hidden="true" class="detail-icon"/>
                        <p class="detail-title">Pickup:</p>
                    </div>
                    <p class="detail-meta">{{ booking.pickup}}</p>
                    
                    <div class="detail-row">
                        <ion-icon :icon="location" aria-hidden="true" class="detail-icon"/>
                        <p class="detail-title">Drop-off:</p>
                    </div>
                    <p class="detail-meta">{{ booking.dropoff}}</p>

                    <div class="detail-row">
                        <ion-icon :icon="personCircle" aria-hidden="true" class="detail-icon"/>
                        <p class="detail-title">Driver:</p>
                    </div>
                    <p class="detail-meta">{{ booking.driver}}</p>

                    <div class="detail-row">
                        <ion-icon :icon="cash" aria-hidden="true" class="detail-icon"/>
                        <p class="detail-title">Fare:</p>
                    </div>
                    <p class="detail-meta">{{ booking.total}}</p>
                </div>

                <!-- <ion-footer class="footer-button">
                    <ion-button expand="block" class="button-done" @click="goBack">Done</ion-button>
                </ion-footer> -->
                
            </div>  
        
            

        </ion-content>

        

    </ion-page>
</template>


<script setup lang="ts">
import { IonIcon, IonButton, IonBackButton } from '@ionic/vue';
import { calendarClear, cash, chevronBackOutline, closeCircle, closeCircleOutline, locate, location, personCircle } from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBackHeader from '@/components/AppBackHeader.vue';

const router = useRouter();

// TODO: fetch data from database
const booking = reactive({
    date: 'Monday, 28 October',
    departure: '18:30',
    pickup: 'Coventry University',
    dropoff: 'Leamington Spa',
    driver: 'Sarah K.',
    seats: 1,
    total: '£4.55'
});

const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.replace('/tabs/home');
  }
};

</script>

<style scoped>
ion-content.cancel-unavailable-page {
  --background: #f8f9fb;
}

.page-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;          
  width: 100%;
  padding: 2rem;
}

.error-icon {
  margin-bottom: 20px;       
  display: flex;              
  width: 80px;                 
  height: 80px;
  align-items: center;        
  justify-content: center;    
  border-radius: 9999px;      
  background: #fee2e2;       
  color: #e11935;  
}

.error-icon span {
  font-size: 2.5rem;         
  color: #ef4444;           
}

.error-title {
  color: #333333;
  font-size: 30px;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: -0.01em;
  padding-bottom: 5px;
}

.error-message {
  color: #6c757d;
  font-size: 18px;
  font-weight: 200;
  line-height: normal;
  max-width: 400px; /* similar to max-w-sm */
}

.detail-card {
    margin-top: 2rem;             
    width: 100%;                 
    max-width: 28rem;            
    border-radius: 0.75rem;       
    background: #ffffff;          
    padding: 1.5rem;             
    text-align: left;            
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
}

.detail-row {
  display: flex;
  align-items: center;   /* vertically center icon + text */
  gap: 10px;              /* space between icon and text */
  margin-bottom: 5px;
}

.detail-icon {
  font-size: 21px;   
}

.detail-title {
  font-size: 20px;      
  font-weight: 500;         
  color: #6c757d;           
}

.detail-meta {
  font-size: 20px;            
  font-weight: 600;          
  color: #333333;   
  margin-bottom: 15px;  
  padding-left: 2rem;        
}

.button-done {
  --background: #11ba82;     
  --color: #ffffff;   
  --border-radius: 12px;    
  width: 100%;         
}

.footer-button {
  position: fixed;
  bottom: 20px;     /* distance from bottom */
  left: 0;
  right: 0;
  padding: 0 20px;
}


</style>




