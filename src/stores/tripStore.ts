import { defineStore } from 'pinia';
import {
  fetchTrips as fetchTripsRequest,
  fetchTrip as fetchTripRequest,
  type Trip,
  type TripWithBooking
} from '@/services/tripService';
import type { TripCardData, TripStatus, RoleOption } from '@/components/TripCard.vue';
import { useUserStore } from './userStore';

const statusById: Record<number, TripStatus> = {
  1: 'active'
};

const bookingStatusById: Record<number, TripStatus> = {
  1: 'pending',
  2: 'confirmed',
  3: 'past'
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

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
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

const normalizeBookingStatus = (status: Trip['status'] | null | undefined): TripStatus => {
  if (typeof status === 'number' && bookingStatusById[status]) {
    return bookingStatusById[status];
  }

  const numericStatus = Number(status);
  if (!Number.isNaN(numericStatus) && bookingStatusById[numericStatus]) {
    return bookingStatusById[numericStatus];
  }

  const value = String(status ?? '').toLowerCase();
  if (value.includes('confirm') || value.includes('accept')) {
    return 'confirmed';
  }
  if (value.includes('cancel') || value.includes('reject') || value.includes('past') || value.includes('complete')) {
    return 'past';
  }
  return 'pending';
};

interface TripCardOverrides {
  role?: RoleOption;
  status?: TripStatus;
  statusVariant?: TripCardData['statusVariant'];
  seatsLabel?: string;
  bookingId?: string | number | null;
  bookingStatus?: string | number | null;
}

export const mapTripToCard = (
  trip: Trip,
  index: number,
  currentUserId: string | number | null,
  overrides: TripCardOverrides = {}
): TripCardData => {
  const baseStatus = overrides.status ?? normalizeStatus(trip.status);
  const role = overrides.role ?? resolveRole(trip, currentUserId);
  const origin = formatLocationLabel(trip.departurePoint, trip.departureLat, trip.departureLng, 'Pickup TBD');
  const destination = formatLocationLabel(trip.arrivalPoint, trip.arrivalLat, trip.arrivalLng, 'Destination TBD');
  const departureDate = new Date(trip.departureTime);
  const now = Date.now();
  const isPast = baseStatus === 'past' || departureDate.getTime() < now;
  const status = isPast ? 'past' : baseStatus;
  const seatsLabel = overrides.seatsLabel ?? (trip.availability ? `${trip.availability} seats available` : undefined);

  return {
    id: typeof trip.id === 'string' ? Number(trip.id) || trip.id : trip.id,
    datetimeLabel: formatDateLabel(trip.departureTime),
    route: `${origin} → ${destination}`,
    price: formatPrice(Number(trip.price)),
    status,
    statusVariant: overrides.statusVariant ?? statusVariantMap[status] ?? 'active',
    passengers: [],
    seatsLabel,
    mapVariant: index % 2 === 0 ? 'variant-a' : 'variant-b',
    state: isPast ? 'past' : 'active',
    role,
    depPointPlaceId: (trip.departurePoint as PlacePoint | undefined)?.place_id,
    arrPointPlaceId: (trip.arrivalPoint as PlacePoint | undefined)?.place_id,
    requests: [],
    confirmed: [],
    total: formatPrice(Number(trip.price) * trip.availability),
    pickup: origin,
    dropoff: destination,
    date: formatDate(trip.departureTime),
    departure: formatTime(trip.departureTime),
    seats: trip.availability,
    bookingId: overrides.bookingId ?? null,
    bookingStatus: overrides.bookingStatus ?? null
  };
};

export const mapBookedTripToCard = (
  trip: TripWithBooking,
  index: number,
  currentUserId: string | number | null
): TripCardData => {
  const status = normalizeBookingStatus(trip.bookingStatus);
  return mapTripToCard(trip, index, currentUserId, {
    role: 'coRider',
    status,
    bookingId: trip.bookingId ?? null,
    bookingStatus: trip.bookingStatus ?? null
  });
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
      return state.trips.map((trip, index) => mapTripToCard(trip, index, currentUserId));
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
    },

    async getTripById(tripId: string | number): Promise<Trip | null> {
      this.loading = true;
      const { token, userId } = this.getSessionContext();
      if (!token || userId === null || userId === undefined) {
        return null;
      }

      try {
        const trip = await fetchTripRequest(tripId, token);
        return trip;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load trip.';
        this.error = message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
