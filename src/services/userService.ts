import { apiRequest } from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export enum UserType {
  CAR_OWNER = 1,
  CO_RIDER = 2
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  type: UserType;
}

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  phone_number?: string | null;
  dob?: string | null;
  status?: string | null;
  verify_status?: string | null;
  referrer_code?: string | null;
  type?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  modified_at?: string | null;
  modified_by?: string | null;
  email_verify?: string | null;
  mobile_verify?: string | null;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string | number | null;
  email: string;
  name?: string | null;
  [key: string]: unknown;
}

export interface AuthSession {
  token: string;
  refreshToken?: string | null;
  user: AuthUser;
  raw?: LoginApiResponse;
}

interface LoginApiResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string | null;
  user?: {
    id?: string | number | null;
    email?: string;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ProfileResponse {
  user: UserProfile;
}

const SESSION_KEY = 'unigo.auth.session';
const isBrowser = typeof window !== 'undefined';

const resolveName = (user: LoginApiResponse['user']): string | null => {
  if (!user) {
    return null;
  }

  const fallback = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return user.name ?? user.fullName ?? (fallback || null);
};

const normalizeUser = (user: LoginApiResponse['user'], fallbackEmail: string): AuthUser => {
  if (!user) {
    return {
      id: null,
      email: fallbackEmail,
      name: null
    };
  }

  return {
    id: user.id ?? null,
    email: user.email ?? fallbackEmail,
    name: resolveName(user),
    ...user
  };
};

export const login = async (credentials: LoginCredentials): Promise<AuthSession> => {
  const response = await apiRequest<LoginApiResponse>('/auth/login', {
    method: 'POST',
    body: credentials
  });

  const token = response.token ?? response.accessToken;

  if (!token) {
    throw new Error('Authentication payload did not include an access token.');
  }

  return {
    token,
    refreshToken: response.refreshToken ?? null,
    user: normalizeUser(response.user, credentials.email),
    raw: response
  };
};

export const persistSession = (session: AuthSession) => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = (): AuthSession | null => {
  if (!isBrowser) {
    return null;
  }

  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const clearSession = () => {
  if (!isBrowser) {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
};

export const fetchProfile = (token: string): Promise<ProfileResponse> => {
  return apiRequest<ProfileResponse>('/auth/profile', {
    method: 'GET',
    token
  });
};

export const register = (payload: RegisterPayload) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload
  });
};

export const updateProfile = (token: string, id: number, data: Partial<UserProfile>) => {
  return apiRequest<UserProfile>(`/users/${id}`, {
    method: 'PUT',
    body: data,
    token
  });
};