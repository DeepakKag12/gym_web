import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettings, waNumber } from '../context/SettingsContext';
import * as apiModule from '../utils/api';

describe('SettingsContext and waNumber', () => {
  describe('waNumber formatter', () => {
    test('formats 10-digit Indian numbers with 91 prefix', () => {
      expect(waNumber('9876543210')).toBe('919876543210');
    });

    test('strips formatting characters like spaces, dashes, parentheses, plus', () => {
      expect(waNumber('+91 98765-43210')).toBe('919876543210');
      expect(waNumber('(987) 654-3210')).toBe('919876543210');
    });

    test('preserves full international numbers if already including country code', () => {
      expect(waNumber('919876543210')).toBe('919876543210');
      expect(waNumber('14155552671')).toBe('14155552671');
    });

    test('returns empty string for empty or null inputs', () => {
      expect(waNumber('')).toBe('');
      expect(waNumber(null)).toBe('');
      expect(waNumber(undefined)).toBe('');
    });
  });

  describe('SettingsProvider & useSettings hook', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('provides initial fallback values immediately', () => {
      jest.spyOn(apiModule, 'cachedGet').mockReturnValue(new Promise(() => {})); // pending

      const wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>;
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.gymName).toBe('FitNation by Ajeet');
      expect(result.current.phone).toBe('9630906906');
      expect(result.current.telHref).toBe('tel:9630906906');
      expect(result.current.waHref).toBe('https://wa.me/919630906906');
    });

    test('updates context state when /settings API returns gym details', async () => {
      const mockSettings = {
        gymName: 'FitNation Pro Arena',
        ownerName: 'Ajeet Jamadari',
        tagline: 'Transform your life',
        phone: '9988776655',
        whatsapp: '9988776655',
        instagram: 'fitnation_pro',
      };

      jest.spyOn(apiModule, 'cachedGet').mockResolvedValue({ data: mockSettings });

      const wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>;
      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current.gymName).toBe('FitNation Pro Arena');
      });

      expect(result.current.telHref).toBe('tel:9988776655');
      expect(result.current.waHref).toBe('https://wa.me/919988776655');
      expect(result.current.instagramHref).toBe('https://instagram.com/fitnation_pro');
    });

    test('handles API failure gracefully by retaining fallback values without crashing', async () => {
      jest.spyOn(apiModule, 'cachedGet').mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>;
      const { result } = renderHook(() => useSettings(), { wrapper });

      // Wait a tick for catch handler to execute
      await act(async () => {
        await new Promise(r => setTimeout(r, 20));
      });

      expect(result.current.gymName).toBe('FitNation by Ajeet');
      expect(result.current.phone).toBe('9630906906');
    });

    test('useSettings outside of SettingsProvider returns usable fallback without throwing', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.gymName).toBe('FitNation by Ajeet');
      expect(result.current.telHref).toBe('tel:9630906906');
    });
  });
});
