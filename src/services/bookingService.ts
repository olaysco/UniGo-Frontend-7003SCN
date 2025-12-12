import { apiRequest } from './apiClient';

export interface BookingPayload {
  tripId: number | string;
  seat: number;
  price: number;
  pickup_point?: Record<string, unknown> | null;
  pickup_lat_lng?: string | null;
  user_id?: number | string | null;
}

export interface BookingUser {
  id: number | string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  avatar?: string | null;
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
  user?: BookingUser | null;
  status_text?: string | null;
}

type BookingPayloadEntity = {
  booking_data?: Partial<BookingResponse> & {
    price?: number | string;
    seat?: number | string;
    status?: number | string;
  } | null;
  user_data?: BookingUser | null;
};

interface BookingListResponse {
  data?: BookingResponse[];
  bookings?: BookingResponse[];
  [key: string]: unknown;
}

const normalizeBookingEntity = (entity: BookingResponse | BookingPayloadEntity): BookingResponse | null => {
  if ('booking_data' in (entity as BookingPayloadEntity)) {
    const bookingData = (entity as BookingPayloadEntity).booking_data;
    if (!bookingData) {
      return null;
    }

    return {
      id: Number(bookingData.id) || 0,
      trip_id: Number(bookingData.trip_id) || 0,
      user_id: Number(bookingData.user_id) || 0,
      seat: Number(bookingData.seat) || 0,
      price: typeof bookingData.price === 'number' ? bookingData.price : Number(bookingData.price) || 0,
      status: Number(bookingData.status) || 0,
      pickup_point: bookingData.pickup_point ?? null,
      pickup_lat_lng: bookingData.pickup_lat_lng ?? null,
      user: (entity as BookingPayloadEntity).user_data ?? null,
      status_text: bookingData.status_text ?? null
    };
  }

  const booking = entity as BookingResponse;
  return {
    ...booking,
    seat: Number(booking.seat) || 0,
    price: typeof booking.price === 'number' ? booking.price : Number(booking.price) || 0,
    status: Number(booking.status) || 0
  };
};

const pickBookingList = (
  payload: BookingListResponse | (BookingResponse | BookingPayloadEntity)[] | null | undefined
): BookingResponse[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return (payload as (BookingResponse | BookingPayloadEntity)[])
      .map(normalizeBookingEntity)
      .filter((booking): booking is BookingResponse => Boolean(booking));
  }

  if (payload.data) {
    return (payload.data as (BookingResponse | BookingPayloadEntity)[])
      .map(normalizeBookingEntity)
      .filter((booking): booking is BookingResponse => Boolean(booking));
  }

  if (payload.bookings) {
    return (payload.bookings as (BookingResponse | BookingPayloadEntity)[])
      .map(normalizeBookingEntity)
      .filter((booking): booking is BookingResponse => Boolean(booking));
  }

  return [];
};

export const createBooking = async (payload: BookingPayload, token: string): Promise<BookingResponse> => {
  const { tripId, ...body } = payload;
  return apiRequest<BookingResponse>(`/bookings/trips/${tripId}/bookings`, {
    method: 'POST',
    token,
    body
  });
};

export const fetchTripBookings = async (tripId: number | string, token: string): Promise<BookingResponse[]> => {
  const query = new URLSearchParams();
  query.set('trip_id', String(tripId));
  const response = await apiRequest<BookingListResponse | BookingResponse[]>(`/bookings?${query.toString()}`, {
    method: 'GET',
    token
  });

  return pickBookingList(response);
};
