import { apiRequest } from './apiClient';

export type VehicleIdentifier = string | number;

export interface VehicleApiEntity {
  id: VehicleIdentifier;
  user_id: string | number;
  model: string;
  plate_number: string;
  color?: string | null;
  capacity?: number | null;
  s3_imagelink?: string | null;
  make?: string | null;
  year?: string | number | null;
}

export interface VehiclePayload {
  make?: string | null;
  model: string;
  plateNumber: string;
  color?: string | null;
  year?: string | number | null;
  capacity?: number | null;
}

export interface Vehicle {
  id: VehicleIdentifier;
  userId: string | number | null;
  name: string;
  make: string | null;
  model: string;
  plateNumber: string;
  color: string | null;
  year: string | null;
  capacity: number | null;
  imageUrl: string | null;
  raw: VehicleApiEntity;
}

interface VehicleListResponse {
  data?: VehicleApiEntity[];
  vehicles?: VehicleApiEntity[];
  [key: string]: unknown;
}

interface VehicleSingleResponse {
  data?: VehicleApiEntity;
  vehicle?: VehicleApiEntity;
  [key: string]: unknown;
}

const resolveVehicleEntity = (payload: unknown): VehicleApiEntity | null => {
  if (payload && typeof payload === 'object') {
    const maybeVehicle = payload as VehicleSingleResponse;
    if (maybeVehicle.data && typeof maybeVehicle.data === 'object') {
      return maybeVehicle.data;
    }
  }

  return payload && typeof payload === 'object' ? (payload as VehicleApiEntity) : null;
};

const resolveVehicleList = (payload: unknown): VehicleApiEntity[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as VehicleApiEntity[];
  }

  return [];
};

const normalizeVehicle = (entity: VehicleApiEntity): Vehicle => {
  const make = entity.make ?? null;
  const model = entity.model;
  const plateNumber = entity.plate_number;
  const color = entity.color ?? null;
  const capacity = entity.capacity ?? null;
  const yearValue = entity.year;
  const imageUrl = entity.s3_imagelink ?? null;
  const fallbackName = [make, model].filter(Boolean).join(' ').trim();
  const name = fallbackName || model;

  return {
    id: entity.id,
    userId: entity.user_id ?? null,
    name,
    make,
    model,
    plateNumber,
    color,
    year: yearValue === null || yearValue === undefined ? null : String(yearValue),
    capacity,
    imageUrl,
    raw: entity
  };
};

const toApiPayload = (payload: VehiclePayload): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    make: payload.make ?? null,
    model: payload.model,
    plate_number: payload.plateNumber,
    color: payload.color ?? null,
    capacity: payload.capacity ?? null,
    year: payload.year ?? null
  };

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key];
    }
  });

  return body;
};

export const fetchVehicles = async (token: string): Promise<Vehicle[]> => {
  const response = await apiRequest<VehicleListResponse | VehicleApiEntity[]>('/vehicles', {
    method: 'GET',
    token
  });

  return resolveVehicleList(response).map(normalizeVehicle);
};

export const createVehicle = async (payload: VehiclePayload, token: string): Promise<Vehicle> => {
  const response = await apiRequest<VehicleSingleResponse | VehicleApiEntity>('/vehicles', {
    method: 'POST',
    token,
    body: toApiPayload(payload)
  });

  const entity = resolveVehicleEntity(response);
  if (!entity) {
    throw new Error('Vehicle payload missing in create response');
  }

  return normalizeVehicle(entity);
};

export const updateVehicle = async (
  id: VehicleIdentifier,
  payload: VehiclePayload,
  token: string
): Promise<Vehicle> => {
  const response = await apiRequest<VehicleSingleResponse | VehicleApiEntity>(`/vehicles/${id}`, {
    method: 'PUT',
    token,
    body: toApiPayload(payload)
  });
  const entity = resolveVehicleEntity(response);
  if (!entity) {
    throw new Error('Vehicle payload missing in update response');
  }
  return normalizeVehicle(entity);
};

export const deleteVehicle = async (id: VehicleIdentifier, token: string): Promise<void> => {
  await apiRequest(`/vehicles/${id}`, {
    method: 'DELETE',
    token
  });
};

export const updateVehiclePhoto = async (
  id: VehicleIdentifier,
  file: File,
  token: string
): Promise<Vehicle | null> => {
  const formData = new FormData();
  formData.append('files', file);
  console.log('Uploading file:', formData);

  const response = await apiRequest<VehicleSingleResponse | VehicleApiEntity>(`/vehicles/photo/${id}`, {
    method: 'PUT',
    token,
    body: formData
  });

  const entity = resolveVehicleEntity(response);
  return entity ? normalizeVehicle(entity) : null;
};
