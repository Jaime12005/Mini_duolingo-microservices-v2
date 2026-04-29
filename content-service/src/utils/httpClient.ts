import axios from 'axios';

export const gamificationClient = axios.create({
  baseURL: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:5300',
  timeout: 5000,
});