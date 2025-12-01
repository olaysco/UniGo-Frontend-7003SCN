import { apiRequest } from './apiClient';

export type TripIdentifier = string | number;

export interface TriipApiEntity {
  id: TripIdentifier;
  user_id: string | number;
  vehicle_id: string | number;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  availability: number;
  price: number;
  status: number;
}

export interface TripPayload {
  vehicleId: string | number;
  userId: string | number;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  availability: number;
  price: number;
}

export interface Trip {
  id: TripIdentifier;
  userId: string | number | null;
  vehicleId: string | number | null;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  availability: number;
  price: number;
  status: number;
  raw: TriipApiEntity;
}

interface TripSingleResponse {
  data?: TriipApiEntity;
  trip?: TriipApiEntity;
  [key: string]: unknown;
}

const pickTripEntity = (payload: TripSingleResponse | TriipApiEntity | null | undefined): TriipApiEntity | null => {
  if (!payload) {
    return null;
  }

  if ('data' in (payload as TripSingleResponse) && (payload as TripSingleResponse).data) {
    return (payload as TripSingleResponse).data as TriipApiEntity;
  }

  if ('trip' in (payload as TripSingleResponse) && (payload as TripSingleResponse).trip) {
    return (payload as TripSingleResponse).trip as TriipApiEntity;
  }

  return payload as TriipApiEntity;
};

const normalizeTrip = (entity: TriipApiEntity): Trip => {
  return {
    id: entity.id,
    userId: entity.user_id ?? null,
    vehicleId: entity.vehicle_id ?? null,
    departureLocation: entity.departure_location,
    arrivalLocation: entity.arrival_location,
    departureTime: entity.departure_time,
    arrivalTime: entity.arrival_time,
    availability: entity.availability,
    price: entity.price,
    status: entity.status,
    raw: entity
  };
};

const toApiPayload = (payload: TripPayload) => {
  return {
    vehicle_id: payload.vehicleId,
    user_id: payload.userId,
    departure_location: payload.departureLocation,
    arrival_location: payload.arrivalLocation,
    departure_time: payload.departureTime,
    arrival_time: payload.arrivalTime,
    availability: payload.availability,
    price: payload.price
  };
};

export const createTrip = async (payload: TripPayload, token: string): Promise<Trip> => {
  const response = await apiRequest<TripSingleResponse | TriipApiEntity>('/trips/create-trip', {
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
