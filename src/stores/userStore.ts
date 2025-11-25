import { defineStore } from 'pinia';
import type { AuthSession, LoginCredentials, UserProfile } from '@/services/userService';
import {
  clearSession,
  fetchProfile as fetchProfileRequest,
  loadSession,
  login as loginRequest,
  persistSession
} from '@/services/userService';

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

      const response = await fetchProfileRequest(this.session.token);
      this.profile = response.user ?? null;
      this.profileLoaded = true;
      return this.profile;
    },
    logout() {
      this.setSession(null);
    }
  }
});
