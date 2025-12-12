import { defineStore } from 'pinia';
import {
  fetchTrips as fetchTripsRequest,
  fetchTrip as fetchTripRequest,
  cancelTrip as cancelTripRequest,
  fetchUserBookedTrips,
  type Trip,
  type TripWithBooking
} from '@/services/tripService';
import type { TripCardData, TripStatus, RoleOption } from '@/components/TripCard.vue';
import { useUserStore } from './userStore';

const statusById: Record<number, TripStatus> = {
  0: 'active',
  1: 'cancelled'
};

const bookingStatusById: Record<number, TripStatus> = {
  0: 'pending',
  1: 'cancelled',
  2: 'confirmed',
  3: 'completed'
};

const statusVariantMap: Record<TripStatus, TripCardData['statusVariant']> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  past: 'completed',
  active: 'active',
  upcoming: 'upcoming'
};

const normalizeStatus = (status: Trip['status']): TripStatus => {
  console.log('Normalizing status:', status);
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
  if (value.includes('cancel') || value.includes('reject') || value.includes('decline')) {
    return 'cancelled';
  }
  if (value.includes('complete') || value.includes('finish') || value.includes('past')) {
    return 'completed';
  }
  if (value.includes('confirm') || value.includes('accept')) {
    return 'confirmed';
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
  const isPast = baseStatus === 'past' || baseStatus === 'cancelled' || departureDate.getTime() < now;
  const status = baseStatus === 'cancelled' || baseStatus === 'completed' ? baseStatus : isPast ? 'past' : baseStatus;
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
  riderTrips: TripCardData[];
  riderLoaded: boolean;
  riderLoading: boolean;
  riderError: string | null;
  latestRiderRequestId: number;
}

export const useTripStore = defineStore('trips', {
  state: (): TripState => ({
    trips: [],
    loaded: false,
    loading: false,
    error: null,
    riderTrips: [],
    riderLoaded: false,
    riderLoading: false,
    riderError: null,
    latestRiderRequestId: 0
  }),
  getters: {
    tripCards: (state): TripCardData[] => {
      const userStore = useUserStore();
      const currentUserId = userStore.session?.user?.id ?? userStore.profile?.id ?? null;
      return state.trips.map((trip, index) => mapTripToCard(trip, index, currentUserId));
    },
    riderTripCards: (state): TripCardData[] => state.riderTrips,
    riderTripStatusCounts: (state): { active: number; past: number } => {
      const counts = { active: 0, past: 0 };
      state.riderTrips.forEach(trip => {
        if (trip.state === 'past' || trip.status === 'cancelled') {
          counts.past += 1;
        } else {
          counts.active += 1;
        }
      });
      return counts;
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
    },
    async cancelTrip(tripId: string | number) {
      const { token } = this.getSessionContext();
      if (!token) {
        throw new Error('Authentication required to cancel trip.');
      }

      await cancelTripRequest(tripId, token);
      this.trips = this.trips.filter(trip => String(trip.id) !== String(tripId));
    },

    async fetchRiderTrips(force = false) {
      if (this.riderLoading || (this.riderLoaded && !force)) {
        return this.riderTrips;
      }

      const { token, userId } = this.getSessionContext();
      if (!token || userId === null || userId === undefined) {
        this.riderTrips = [];
        this.riderLoaded = true;
        return this.riderTrips;
      }

      this.riderLoading = true;
      this.riderError = null;
      const requestId = ++this.latestRiderRequestId;

      try {
        const bookings = await fetchUserBookedTrips(userId, token);
        if (requestId !== this.latestRiderRequestId) {
          return this.riderTrips;
        }
        this.riderTrips = bookings.map((trip, index) => mapBookedTripToCard(trip, index, userId));
        this.riderLoaded = true;
        return this.riderTrips;
      } catch (error) {
        if (requestId !== this.latestRiderRequestId) {
          return this.riderTrips;
        }
        const message = error instanceof Error ? error.message : 'Unable to load trips.';
        this.riderError = message;
        throw error;
      } finally {
        if (requestId === this.latestRiderRequestId) {
          this.riderLoading = false;
        }
      }
    }
  }
});
