import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/OnboardingPage.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'search',
        component: () => import('@/views/SearchPage.vue')
      },
      {
        path: 'trips',
        component: () => import('@/views/TripsPage.vue')
      },
      {
        path: 'messages',
        component: () => import('@/views/MessagesPage.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/ProfilePage.vue')
      },
      {
        path: 'profile-details',
        component: () => import('@/views/ProfileDetailsPage.vue')
      },
      {
        path: 'faq',
        component: () => import('@/views/FaqHelpPage.vue')
      },
      {
        path: 'vehicles',
        component: () => import('@/views/ManageVehiclesPage.vue')
      },
      {
        path: 'terms-of-service',
        component: () => import('@/views/TermsOfServicePage.vue')
      },
      {
        path: '/booked-trip/:id',
        name: 'booked-trip-details',
        component: () => import('@/views/BookedTripDetailsPage.vue')
      }
    ]
  },
  {
    path: '/cancel-trip/:id?',
    name: 'cancel-trip',
    component: () => import('@/views/CancelTripPage.vue')
  },
  {
    path: '/create-trip',
    component: () => import('@/views/CreateTripPage.vue')
  },
  {
    path: '/refer-a-friend',
    component: () => import('@/views/ReferFriendPage.vue')
  },
  {
    path: '/add-vehicle',
    component: () => import('@/views/AddVehiclePage.vue')
  },
  {
    path: '/terms',
    component: () => import('@/views/TermsOfServicePage.vue')
  },
  {
    path: '/trip/:id',
    name: 'trip-details',
    component: () => import('@/views/TripDetailsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
