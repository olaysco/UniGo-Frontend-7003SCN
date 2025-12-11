import { apiRequest } from './apiClient';

export interface BookingPayload {
  tripId: number | string;
  seat: number;
  price: number;
  pickup_point?: Record<string, unknown> | null;
  pickup_lat_lng?: string | null;
  user_id?: number | string | null;
}

export interface BookingResponse {
  id: number;
  trip_id: number;
  user_id: number;
  seat: number;
  price: number;
  status: number;
  pickup_point?: Record<string, unknown> | null;
  pickup_lat_lng?: string | null;
}

export const createBooking = async (payload: BookingPayload, token: string): Promise<BookingResponse> => {
  const { tripId, ...body } = payload;
  return apiRequest<BookingResponse>(`/bookings/trips/${tripId}/bookings`, {
    method: 'POST',
    token,
    body
  });
};
