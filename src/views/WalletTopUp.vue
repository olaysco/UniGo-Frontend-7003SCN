<template>
  <ion-page>
    <ion-content class="wallet-page safe-area-scroll" :fullscreen="true">
      <AppBackHeader title="My Wallet" @back="goBack" />

      <main class="details-body">
        <!-- Display e-wallet balance -->
        <section class="card">
          <div class="balance-header">
            <ion-icon :icon="wallet" class="wallet-icon"></ion-icon>
            <p class="card-label">E-Wallet Balance</p>
          </div>
          <p class="card-value">{{ balance }}</p>
        </section>

        <!-- Choose top up amount -->
        <p class="title">Choose Amount</p>
        <!-- Choose 10/25/50 -->
        <div class="amount-row">
            <button
                v-for="amount in amounts"
                :key="amount.value"
                class="amount-button"
                :class="{ 'active': selectedAmount === amount.value }"
                @click="selectAmount(amount.value)"
            >
                <p :class="selectedAmount === amount.value ? 'active-text' : 'inactive-text'">
                £{{ amount.value }}
                </p>
            </button>
        </div>
        <!-- Input custom amount -->
        <div class="amount-input">
            <span class="currency">£</span>
            <input
                v-model="customAmount"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*"
                class="custom-input"
                placeholder="Or enter a custom amount"
                @input="validateInput"
            />
        </div>

        <!-- Enter payment method -->
        <p class="title">Payment Method</p>
        <div class="payment-row">
            <button class="add-payment-button">
              <ion-icon :icon="add" class="add-icon"></ion-icon>
                Add a new payment method
            </button>
        </div>

        <ion-footer class="footer-button">
          <ion-button expand="block" size="large" class="button-done">Done</ion-button>
        </ion-footer>

      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import AppBackHeader from '@/components/AppBackHeader.vue';
import { add, wallet } from 'ionicons/icons';

const router = useRouter();

// get from API
const balance = "£15.70";

const amounts = [
  { value: 10 },
  { value: 25 },
  { value: 50 }
];

const selectedAmount = ref<number | null>(null);
const customAmount = ref('');

// display the selected amount
const selectAmount = (value: number) => {
  selectedAmount.value = value;
  customAmount.value = value.toString(); 
};

// validate input 
const validateInput = () => {
  // Remove non-numeric except "."
  customAmount.value = customAmount.value.replace(/[^0-9.]/g, '');

  // Only one decimal allowed
  const parts = customAmount.value.split(".");
  if (parts.length > 2) {
    customAmount.value = parts[0] + "." + parts[1];
  }

  // remove selected button when user input amount 
  selectedAmount.value = null;
};

const goBack = () => {
  router.back();
};

</script>

<style scoped>
ion-content.wallet-page {
    --background: #f8f9fb;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem; 
    text-align: center;
    height: 100vh;             
    width: 100%;
    padding: 2rem;
}

.details-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 60px;
}

.card {
  background: #e0f2ed;
  border-radius: 22px;
  padding: 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  text-align: left;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.card-label {
  font-size: 20px;
  color: #11ba82;
  margin-bottom: 10px;
  font-weight: 700;
}

.card-value {
  font-size: 30px;
  font-weight: 700;
  color: #0f1b2b
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 8px; 
}

.wallet-icon {
  color: #11ba82;
  font-size: 25px; 
  margin-bottom: 10px;
}

.title {
  font-size: 25px;
  font-weight: 700;
  color: #0f1b2b;
  margin-top: 20px;
  text-align: left
}

.amount-row {
  display: flex;
  /* spacing between boxes */
  gap: 12px;           
  width: 100%;
}

.amount-button {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 0 1rem;
  border: 2px solid #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.amount-button.active {
  border: 2px solid #11ba82;
  box-shadow: 0 3px 8px rgba(17, 186, 130, 0.4);
}

.active-text {
  color: #11ba82;
  font-weight: 700;
}

.inactive-text {
  color: #111816;
  font-weight: 500;
}

.amount-input {
  position: relative;
  width: 100%;
  margin-top: 1rem;
}

.currency {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #111816;
  font-weight: 600;
  font-size: 20px;
}

.custom-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem; /* space for £ */
  border: 2px solid #ccc;
  border-radius: 10px;
  font-size: 20px;
}

.custom-input:focus {
  border-color: #11ba82;
  outline: none;
}

.payment-row {
  width: 100%;
}

.add-payment-button {
  width: 100%;
  height: 55px;
  display: flex;
  align-items: center;
  gap: 20px;             
  padding: 12px 16px;
  border-radius: 15px;
  background: #ffffff;
  font-size: 16px;
  font-weight: 400;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.add-icon {
  font-size: 22px;
  width: 30px;
  height: 30px;
  background: #eee;
  border-radius: 8px;
}

.button-done {
  --background: #11ba82;     
  --color: #ffffff;   
  --border-radius: 12px;    
  width: 100%;         
  font-weight: 700;
}

.footer-button {
  position: fixed;
  bottom: 20px;   
  left: 0;
  right: 0;
  padding: 0 20px;
}


</style>
