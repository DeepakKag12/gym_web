import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import * as SettingsContext from '../context/SettingsContext';
import * as ThemeContext from '../context/ThemeContext';

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(SettingsContext, 'useSettings').mockReturnValue({
      gymName: 'FitNation by Ajeet',
      phone: '9630906906',
      whatsapp: '9630906906',
      instagram: 'fitnation.by.ajeet',
      hours: ['Mon–Sat: 5 AM – 11 AM'],
      telHref: 'tel:9630906906',
      waHref: 'https://wa.me/919630906906',
      instagramHref: 'https://instagram.com/fitnation.by.ajeet',
    });
    jest.spyOn(ThemeContext, 'useTheme').mockReturnValue({
      isDark: true,
      toggleTheme: jest.fn(),
    });
  });

  test('renders hero headline, navigation triggers, and gym name', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/FitNation/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Explore Workouts/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Join FitNation/i).length).toBeGreaterThan(0);
  });

  test('renders muscle category highlights', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Chest').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Back').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shoulders').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Arms').length).toBeGreaterThan(0);
  });
});
