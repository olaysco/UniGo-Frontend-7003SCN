import { defineStore } from 'pinia';
import { fetchTrips as fetchTripsRequest, type Trip } from '@/services/tripService';
import { useUserStore } from './userStore';

interface TripState {
  trips: Trip[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export const useTripStore = defineStore('trips', {
  state: (): TripState => ({
    trips: [],
    loaded: false,
    loading: false,
    error: null
  }),
  actions: {
    getSessionContext() {
      const userStore = useUserStore();
      return {
        token: userStore.session?.token ?? null,
        userId: userStore.session?.user?.id ?? userStore.profile?.id ?? null
      };
    },
    async fetchTrips(force = false) {
      if (this.loading || (this.loaded && !force)) {
        return this.trips;
      }

      const { token, userId } = this.getSessionContext();
      if (!token || userId === null || userId === undefined) {
        return this.trips;
      }

      this.loading = true;
      this.error = null;

      try {
        const trips = await fetchTripsRequest({ userId }, token);
        this.trips = trips;
        this.loaded = true;
        return trips;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load trips.';
        this.error = message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
