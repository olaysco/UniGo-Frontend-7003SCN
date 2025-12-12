import { defineStore } from 'pinia';
import type { AuthSession, LoginCredentials, UserProfile } from '@/services/userService';
import {
  clearSession,
  fetchProfile as fetchProfileRequest,
  loadSession,
  login as loginRequest,
  persistSession
} from '@/services/userService';
import { ApiError } from '@/services/apiClient';

interface UserState {
  session: AuthSession | null;
  profile: UserProfile | null;
  profileLoaded: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    session: loadSession(),
    profile: null,
    profileLoaded: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.token)
  },
  actions: {
    setSession(next: AuthSession | null) {
      this.session = next;

      if (next) {
        persistSession(next);
      } else {
        clearSession();
        this.profile = null;
        this.profileLoaded = false;
      }
    },
    async login(credentials: LoginCredentials) {
      const session = await loginRequest(credentials);
      this.setSession(session);
      await this.fetchProfile(true);
      console.log('Login successful, session:', session);
      return session;
    },
    async fetchProfile(force = false) {
      if (!this.session?.token) {
        this.profile = null;
        this.profileLoaded = false;
        return null;
      }

      if (this.profileLoaded && !force) {
        return this.profile;
      }

      try {
        const response = await fetchProfileRequest(this.session.token);
        const profile = response.user ?? null;
        this.profile = profile;
        this.profileLoaded = true;

        if (profile && this.session) {
          const updatedSession: AuthSession = {
            ...this.session,
            user: {
              ...this.session.user,
              ...profile
            }
          };

          this.setSession(updatedSession);
        }

        return this.profile;
      } catch (error) {
        this.profileLoaded = false;

        if (error instanceof ApiError && error.status === 401) {
          this.logout();
        }

        throw error;
      }
    },
    logout() {
      this.setSession(null);
    }
  }
});
