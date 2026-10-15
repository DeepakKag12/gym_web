import { getSocketUrl, playNotificationSound } from '../context/SocketContext';
import API from '../utils/api';

describe('SocketContext utilities', () => {
  test('getSocketUrl strips trailing /api from base URL', () => {
    API.defaults.baseURL = 'http://localhost:5000/api';
    expect(getSocketUrl()).toBe('http://localhost:5000');

    API.defaults.baseURL = 'https://g-ym-backend.vercel.app/api/';
    expect(getSocketUrl()).toBe('https://g-ym-backend.vercel.app');
  });

  test('playNotificationSound runs safely without throwing even if AudioContext is missing', () => {
    expect(() => playNotificationSound()).not.toThrow();
  });
});
