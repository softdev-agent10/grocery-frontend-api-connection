import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  merchant_id?: number;
  branch_id?: number;
  is_active?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  full_name: string;
  role: string;
  branch_id: number;
  pin?: string;
  is_active: boolean;
  is_staff: boolean;
}

const AUTH_API_URI = process.env.NEXT_PUBLIC_AUTH_API_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

export const getUsers = (filters?: UserFilter) =>
  apiClient.get<PaginatedResponse<User>>('/settings/users', filters);

export const createUserResponse = (data: Partial<User>) =>
  apiClient.post<SingleResponse<User>>('/settings/users', data);

/**
 * DIRECT AUTH API CALL
 * No merchant_id / branch_id should be added here.
 */
export const createUser = async (data: any): Promise<SingleResponse<User>> => {
  try {
    if (!AUTH_API_URI) {
      throw new Error('NEXT_PUBLIC_AUTH_API_URI is missing in .env');
    }

    if (!CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_CLIENT_ID is missing in .env');
    }

    // console.log('Step 1: Sending signup request...', data);

    const signupResponse = await fetch(
      `${AUTH_API_URI}/signup?client_id=${CLIENT_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    // console.log('Step 2: Signup API responded');

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      // console.error('Signup failed:', errorText);
      throw new Error(errorText || 'Signup failed');
    }

    const signupData = await signupResponse.json();
    // console.log('Step 3: Signup success response:', signupData);

    const userData = data?.data;

    const savedUserPayload: Partial<User> = {
      username: userData?.user_name,
      email: userData?.email,
      phone_number: userData?.number,
      full_name: userData?.full_name,
      role: userData?.role,
      branch_id: Number(userData?.optional_fields?.b_id),
      pin: userData?.password,
      is_active: true,
    };

    // console.log('Step 4: Sending data to internal API...', savedUserPayload);

    const savedUserResponse = await apiClient.post<SingleResponse<User>>(
      '/settings/users',
      savedUserPayload
    );

    // console.log('Step 5: Internal API success:', savedUserResponse);

    return savedUserResponse;
  } catch (error) {
    console.error('Error in createUser flow:', error);
    throw error;
  }
};