import { defineStore } from 'pinia';
import { fetchTrips as fetchTripsRequest, type Trip } from '@/services/tripService';
import type { TripCardData, TripStatus, RoleOption } from '@/components/TripCard.vue';
import { useUserStore } from './userStore';

const statusById: Record<number, TripStatus> = {
  1: 'active'
};

const statusVariantMap: Record<TripStatus, TripCardData['statusVariant']> = {
  pending: 'pending',
  confirmed: 'confirmed',
  past: 'completed',
  active: 'active',
  upcoming: 'upcoming'
};

const normalizeStatus = (status: Trip['status']): TripStatus => {
  if (typeof status === 'number' && statusById[status]) {
    return statusById[status];
  }

  const numericValue = Number(status);
  if (!Number.isNaN(numericValue) && statusById[numericValue]) {
    return statusById[numericValue];
  }

  const value = String(status ?? '').toLowerCase();
  if (value.includes('pending')) return 'pending';
  if (value.includes('confirm')) return 'confirmed';
  if (value.includes('past') || value.includes('complete')) return 'past';
  if (value.includes('upcoming')) return 'upcoming';
  return 'active';
};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPrice = (amount: number) => `£${(Number.isFinite(amount) ? amount : Number(amount) || 0).toFixed(2)}`;

const formatLocationLabel = (
  point: Trip['departurePoint'],
  lat: Trip['departureLat'],
  lng: Trip['departureLng'],
  fallback: string
) => {
  if (typeof point === 'string') {
    const trimmed = point.trim();
    if (trimmed && trimmed !== '[object Object]') {
      return trimmed;
    }
  }

  if (point && typeof point === 'object' && 'name' in point && typeof point.name === 'string') {
    const name = point.name.trim();
    if (name) {
      return name;
    }
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  return fallback;
};

type PlacePoint = {
  place_id?: string;
};


const resolveRole = (trip: Trip, currentUserId: string | number | null): RoleOption => {
  if (currentUserId !== null && currentUserId !== undefined && trip.userId !== null && trip.userId !== undefined) {
    return String(trip.userId) === String(currentUserId) ? 'carOwner' : 'coRider';
  }
  return 'coRider';
};

const mapTripToCard = (
  trip: Trip,
  index: number,
  currentUserId: string | number | null,
  now: number
): TripCardData => {
  const status = normalizeStatus(trip.status);
  const role = resolveRole(trip, currentUserId);
  const origin = formatLocationLabel(trip.departurePoint, trip.departureLat, trip.departureLng, 'Pickup TBD');
  const destination = formatLocationLabel(trip.arrivalPoint, trip.arrivalLat, trip.arrivalLng, 'Destination TBD');
  const departureDate = new Date(trip.departureTime);
  const isPast = status === 'past' || departureDate.getTime() < now;

  return {
    id: typeof trip.id === 'string' ? Number(trip.id) || trip.id : trip.id,
    datetimeLabel: formatDateLabel(trip.departureTime),
    route: `${origin} to ${destination}`,
    price: formatPrice(Number(trip.price)),
    status,
    statusVariant: statusVariantMap[status] ?? 'active',
    passengers: [],
    seatsLabel: trip.availability ? `${trip.availability} seats available` : undefined,
    mapVariant: index % 2 === 0 ? 'variant-a' : 'variant-b',
    state: isPast ? 'past' : 'active',
    role,
    depPointPlaceId: (trip.departurePoint as PlacePoint | undefined)?.place_id,
    arrPointPlaceId: (trip.arrivalPoint as PlacePoint | undefined)?.place_id
  };
};

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
  getters: {
    tripCards: (state): TripCardData[] => {
      const userStore = useUserStore();
      const currentUserId = userStore.session?.user?.id ?? userStore.profile?.id ?? null;
      const now = Date.now();
      return state.trips.map((trip, index) => mapTripToCard(trip, index, currentUserId, now));
    }
  },
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
