import { defineStore } from 'pinia';
import {
  Vehicle,
  VehicleIdentifier,
  VehiclePayload,
  createVehicle,
  deleteVehicle as deleteVehicleRequest,
  fetchVehicles as fetchVehiclesRequest,
  updateVehicle as updateVehicleRequest,
  updateVehiclePhoto as updateVehiclePhotoRequest
} from '@/services/vehicleService';
import { useUserStore } from './userStore';

interface VehicleState {
  vehicles: Vehicle[];
  loaded: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updatingMap: Record<string, boolean>;
  deletingMap: Record<string, boolean>;
  uploadingMap: Record<string, boolean>;
}

const toKey = (id: VehicleIdentifier): string => {
  return typeof id === 'string' ? id : String(id);
};

export const useVehicleStore = defineStore('vehicles', {
  state: (): VehicleState => ({
    vehicles: [],
    loaded: false,
    loading: false,
    saving: false,
    error: null,
    updatingMap: {},
    deletingMap: {},
    uploadingMap: {}
  }),
  getters: {
    vehicleById: (state) => {
      return (id: VehicleIdentifier) => state.vehicles.find((vehicle) => toKey(vehicle.id) === toKey(id));
    },
    isUpdating: (state) => {
      return (id: VehicleIdentifier | null | undefined) =>
        id === null || id === undefined ? false : Boolean(state.updatingMap[toKey(id)]);
    },
    isDeleting: (state) => {
      return (id: VehicleIdentifier | null | undefined) =>
        id === null || id === undefined ? false : Boolean(state.deletingMap[toKey(id)]);
    },
    isUploading: (state) => {
      return (id: VehicleIdentifier | null | undefined) =>
        id === null || id === undefined ? false : Boolean(state.uploadingMap[toKey(id)]);
    }
  },
  actions: {
    requireToken() {
      const userStore = useUserStore();
      const token = userStore.session?.token;
      if (!token) {
        throw new Error('You need to be signed in to manage vehicles.');
      }
      return token;
    },
    setFlag(map: Record<string, boolean>, id: VehicleIdentifier, value: boolean) {
      const key = toKey(id);
      if (value) {
        map[key] = true;
      } else {
        delete map[key];
      }
    },
    upsertVehicle(next: Vehicle) {
      const index = this.vehicles.findIndex((vehicle) => toKey(vehicle.id) === toKey(next.id));
      if (index === -1) {
        this.vehicles = [next, ...this.vehicles];
      } else {
        this.vehicles.splice(index, 1, next);
      }
    },
    patchVehicle(id: VehicleIdentifier, patch: Partial<Vehicle>) {
      const index = this.vehicles.findIndex((vehicle) => toKey(vehicle.id) === toKey(id));
      if (index !== -1) {
        this.vehicles.splice(index, 1, {
          ...this.vehicles[index],
          ...patch
        });
      }
    },
    removeVehicle(id: VehicleIdentifier) {
      this.vehicles = this.vehicles.filter((vehicle) => toKey(vehicle.id) !== toKey(id));
    },
    async fetchVehicles(force = false) {
      if (this.loading || (!force && this.loaded)) {
        return this.vehicles;
      }

      const token = this.requireToken();
      this.loading = true;
      this.error = null;

      try {
        const vehicles = await fetchVehiclesRequest(token);
        this.vehicles = vehicles;
        this.loaded = true;
        return vehicles;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load vehicles.';
        this.error = message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async addVehicle(payload: VehiclePayload, imageFile?: File | null) {
      if (this.saving) {
        return null;
      }

      const token = this.requireToken();
      this.saving = true;
      this.error = null;

      try {
        const vehicle = await createVehicle(payload, token);
        this.upsertVehicle(vehicle);

        if (imageFile) {
          await this.updateVehiclePhoto(vehicle.id, imageFile);
        }

        return vehicle;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to add vehicle.';
        this.error = message;
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async updateVehicle(id: VehicleIdentifier, payload: VehiclePayload, imageFile?: File | null) {
      const token = this.requireToken();
      this.setFlag(this.updatingMap, id, true);

      try {
        const vehicle = await updateVehicleRequest(id, payload, token);
        this.upsertVehicle(vehicle);

        if (imageFile) {
          await this.updateVehiclePhoto(id, imageFile);
        }

        return vehicle;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update vehicle.';
        this.error = message;
        throw error;
      } finally {
        this.setFlag(this.updatingMap, id, false);
      }
    },
    async deleteVehicle(id: VehicleIdentifier) {
      const token = this.requireToken();
      this.setFlag(this.deletingMap, id, true);
      this.error = null;

      try {
        await deleteVehicleRequest(id, token);
        this.removeVehicle(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete vehicle.';
        this.error = message;
        throw error;
      } finally {
        this.setFlag(this.deletingMap, id, false);
      }
    },
    async updateVehiclePhoto(id: VehicleIdentifier, file: File) {
      const token = this.requireToken();
      this.setFlag(this.uploadingMap, id, true);

      try {
        const updated = await updateVehiclePhotoRequest(id, file, token);
        if (updated) {
          this.patchVehicle(id, updated);
        } else if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          const objectUrl = URL.createObjectURL(file);
          this.patchVehicle(id, { imageUrl: objectUrl });
          if (typeof URL.revokeObjectURL === 'function') {
            setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update vehicle photo.';
        this.error = message;
        throw error;
      } finally {
        this.setFlag(this.uploadingMap, id, false);
      }
    }
  }
});
