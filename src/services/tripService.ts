import { apiRequest } from './apiClient';

export type TripIdentifier = string | number;

export interface TripVehicleApiEntity {
  id: string | number;
  user_id: string | number;
  model?: string | null;
  plate_number?: string | null;
  color?: string | null;
  capacity?: number | null;
  s3_imagelink?: string | null;
}

export interface TripUserApiEntity {
  id: string | number;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
}

export interface TripApiEntity {
  id: TripIdentifier;
  user_id: string | number;
  vehicle_id: string | number;
  dep_lng: number;
  dep_lat: number;
  arr_lng: number;
  arr_lat: number;
  dep_point?: any;
  arr_point?: any;
  dep_time: string;
  arrival_time: string;
  availability: number;
  price: number;
  status: number;
  vehicle?: TripVehicleApiEntity | null;
  user?: TripUserApiEntity | null;
}

export interface TripBookingApiEntity extends TripApiEntity {
  booking_id?: string | number | null;
  booking_status?: string | number | null;
}

export interface TripPayload {
  vehicleId: string | number;
  userId: string | number;
  departureLng: null | number;
  departureLat: null | number;
  arrivalLng: null | number;
  arrivalLat: null | number;
  departureTime: string;
  arrivalTime: string;
  availability: number;
  price: number;
  arrivalPoint?: any;
  departurePoint?: any;
}

export interface Trip {
  id: TripIdentifier;
  userId: string | number | null;
  vehicleId: string | number | null;
  departureLng: number;
  departureLat: number;
  arrivalLng: number;
  arrivalLat: number;
  departureTime: string;
  arrivalTime: string;
  availability: number;
  price: number;
  status: string | number;
  arrivalPoint?: any;
  departurePoint?: any;
  raw: TripApiEntity;
  vehicle?: TripVehicleApiEntity | null;
  user?: TripUserApiEntity | null;
}

export interface TripWithBooking extends Trip {
  bookingId: string | number | null;
  bookingStatus: string | number | null;
}

interface TripListResponse {
  data?: TripApiEntity[];
  trips?: TripApiEntity[];
  [key: string]: unknown;
}

interface TripSingleResponse {
  data?: TripApiEntity;
  trip?: TripApiEntity;
  [key: string]: unknown;
}

const pickTripEntity = (payload: TripSingleResponse | TripApiEntity | null | undefined): TripApiEntity | null => {
  if (!payload) {
    return null;
  }

  if ('data' in (payload as TripSingleResponse) && (payload as TripSingleResponse).data) {
    return (payload as TripSingleResponse).data as TripApiEntity;
  }

  if ('trip' in (payload as TripSingleResponse) && (payload as TripSingleResponse).trip) {
    return (payload as TripSingleResponse).trip as TripApiEntity;
  }

  return payload as TripApiEntity;
};

export const normalizeTrip = (entity: TripApiEntity): Trip => {
  return {
    id: entity.id,
    userId: entity.user_id ?? null,
    vehicleId: entity.vehicle_id ?? null,
    departureLng: entity.dep_lng,
    arrivalLng: entity.arr_lng,
    departureLat: entity.dep_lat,
    arrivalLat: entity.arr_lat,
    departurePoint: entity.dep_point,
    arrivalPoint: entity.arr_point,
    departureTime: entity.dep_time,
    arrivalTime: entity.arrival_time,
    availability: entity.availability,
    price: entity.price,
    status: entity.status,
    vehicle: entity?.vehicle ?? null,
    user: entity?.user ?? null,
    raw: entity
  };
};

const toApiPayload = (payload: TripPayload) => {
  return {
    vehicle_id: payload.vehicleId,
    user_id: payload.userId,
    dep_lat: payload.departureLat,
    dep_lng: payload.departureLng,
    arr_lat: payload.arrivalLat,
    arr_lng: payload.arrivalLng,
    dep_point: payload.departurePoint,
    arr_point: payload.arrivalPoint,
    dep_time: payload.departureTime,
    arrival_time: payload.arrivalTime,
    availability: payload.availability,
    price: payload.price,
    arr_time: payload.departureTime
  };
};

export const createTrip = async (payload: TripPayload, token: string): Promise<Trip> => {
  const response = await apiRequest<TripSingleResponse | TripApiEntity>('/trips/create-trip', {
    method: 'POST',
    token,
    body: toApiPayload(payload)
  });

  const entity = pickTripEntity(response);
  if (!entity) {
    throw new Error('Trip payload missing in create response');
  }

  return normalizeTrip(entity);
};

interface TripSearchParams {
  userId?: string | number;
  radius?: string;
  destination_lat?: number;
  destination_lng?: number;
  arrival_lat?: number;
  arrival_lng?: number;
  price?: string | number;
}

const pickTripList = (
  payload: TripListResponse | TripApiEntity[] | null | undefined
): TripApiEntity[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as TripApiEntity[];
  }

  if (payload.data) {
    return payload.data as TripApiEntity[];
  }

  if (payload.trips) {
    return payload.trips as TripApiEntity[];
  }

  return [];
};

const buildTripSearchQuery = (params: TripSearchParams = {}): string => {
  const query = new URLSearchParams();

  if (params.userId !== undefined) {
    query.set('user_id', String(params.userId));
  }

  if (params.arrival_lat) {
    query.set('arrival_lat', String(params.arrival_lat));
  }

  if (params.arrival_lng) {
    query.set('arrival_lng', String(params.arrival_lng));
  }

  if (params.destination_lat) {
    query.set('destination_lat', String(params.destination_lat));
  }

  if (params.destination_lng) {
    query.set('destination_lng', String(params.destination_lng));
  }

  if (params.price !== undefined) {
    query.set('price', String(params.price));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchTrips = async (
  params: TripSearchParams,
  token: string
): Promise<Trip[]> => {
  const query = buildTripSearchQuery(params);
  const response = await apiRequest<TripListResponse | TripApiEntity[]>(`/trips/search${query}`, {
    method: 'GET',
    token
  });

  return pickTripList(response).map(normalizeTrip);
};

export const fetchTrip = async (
  id: number | string,
  token: string
): Promise<Trip> => {
  const response = await apiRequest<TripApiEntity>(`/trips/${id}`, {
    method: 'GET',
    token
  });

  return normalizeTrip(response);
};

export const cancelTrip = async (
  tripId: number | string,
  token: string
): Promise<void> => {
  await apiRequest(`/trips/cancel`, {
    method: 'POST',
    token,
    body: {
      trip_id: tripId
    }
  });
};

export const fetchUserBookedTrips = async (
  userId: string | number,
  token: string
): Promise<TripWithBooking[]> => {
  const response = await apiRequest<TripListResponse | TripBookingApiEntity[]>(
    `/bookings/users/${userId}/trips`,
    {
      method: 'GET',
      token
    }
  );

  return pickTripList(response).map(entity => {
    const normalized = normalizeTrip(entity);
    const bookingEntity = entity as TripBookingApiEntity;
    return {
      ...normalized,
      bookingId: bookingEntity.booking_id ?? null,
      bookingStatus: bookingEntity.booking_status ?? null
    };
  });
};

export type { TripSearchParams };
