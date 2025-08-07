import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.8.228:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface LoginResponseData {
  token: string;
  calories: number;
  userId: string | number;
}

export async function registerUser(email: string, password: string, dailyCalories: number) {
  try {
    const response = await api.post('/users/register', { email, password, dailyCalories });
    await AsyncStorage.setItem('token', response.data.token || '');
    return { id: response.data.userId };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export const fetchWeeklyIntake = (userId: string) =>
  api.get(`/food/weekly-intake/${userId}`); 

export const getDailyIntake = async (userId: number, date: string) => {
  try {
    const response = await api.get(`/food/user/${userId}/date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily intake:', error);
    return Array(24).fill(0); 
  }
};


export const getWeeklyIntake = async (userId: number) => {
  try {
    const response = await api.get(`/food/weekly-intake/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly intake:', error);
    throw error;
  }
};

export async function loginUser(email: string, password: string): Promise<LoginResponseData> {
  const response = await api.post<LoginResponseData>('/auth/login', { email, password });
  await AsyncStorage.setItem('token', response.data.token);
  return response.data;
}

export const getUserData = (userId: string) => api.get(`/users/${userId}`);
export const updateUserData = (userId: string, dailyCalories: number) =>
  api.put(`/users/${userId}`, { dailyCalories });

export const getFoodData = (userId: string, date: string) =>
  api.get(`/food/${userId}`, { params: { date } });

export const getFoodHistory = (userId: string) =>
  api.get(`/food/history/${userId}`);

export const deleteFoodEntry = (userId: string, date: string) =>
  api.delete(`/food/${userId}`, { params: { date } });

export const updateFoodEntry = (
  userId: string,
  hourlyIntake: number[],
  total: number,
  date: string
) =>
  api.put('/food', { userId, hourlyIntake, total, date });

export const saveCalorieIntake = (
  userId: string,
  hourlyIntake: number[],
  total: number,
  date: string
) =>
  api.post('/food', { userId, hourlyIntake, total, date });
