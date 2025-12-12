import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import pinia from '@/stores';
import { useUserStore } from '@/stores/userStore';

type AuthRouteMeta = {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/OnboardingPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'search',
        component: () => import('@/views/SearchPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'trips',
        component: () => import('@/views/TripsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'messages',
        component: () => import('@/views/MessagesPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'messages/:id',
        name: 'message-details',
        component: () => import('@/views/MessageDetailsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        component: () => import('@/views/ProfilePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile-details',
        component: () => import('@/views/ProfileDetailsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'faq',
        component: () => import('@/views/FaqHelpPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'vehicles',
        component: () => import('@/views/ManageVehiclesPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'terms-of-service',
        component: () => import('@/views/TermsOfServicePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'wallet',
        component: () => import('@/views/WalletTopUp.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/booked-trip/:id',
        name: 'booked-trip-details',
        component: () => import('@/views/BookedTripDetailsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/owner-trip/:id',
        name: 'owner-trip-details',
        component: () => import('@/views/OwnerTripDetailsPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/cancel-trip/:id?',
    name: 'cancel-trip',
    //component: () => import('@/views/CancelTripPage.vue')
      component: () => import('@/views/CancelTripUnavailablePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/booking-receipt/:id',
    name: 'booking-receipt',
    component: () => import('@/views/BookingReceiptPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rate-trip/:id?',
    name: 'rate-trip',
      component: () => import('@/views/RatingPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-trip',
    component: () => import('@/views/CreateTripPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/refer-a-friend',
    component: () => import('@/views/ReferFriendPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-vehicle',
    component: () => import('@/views/AddVehiclePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    component: () => import('@/views/TermsOfServicePage.vue')
  },
  {
    path: '/trip/:id',
    name: 'trip-details',
    component: () => import('@/views/TripDetailsPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const userStore = useUserStore(pinia);

router.beforeEach(async (to) => {
  const meta = to.meta as AuthRouteMeta;

  if (meta.requiresAuth && !userStore.isAuthenticated) {
    return to.fullPath && to.fullPath !== '/login'
      ? { path: '/login', query: { redirect: to.fullPath } }
      : { path: '/login' };
  }

  if (userStore.isAuthenticated && !userStore.profileLoaded) {
    try {
      await userStore.fetchProfile();
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  }

  if (meta.requiresGuest && userStore.isAuthenticated) {
    return '/tabs/home';
  }

  return true;
});

export default router
