import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMembers from '../pages/admin/Members';
import { ThemeProvider } from '../context/ThemeContext';
import * as userService from '../pages/admin/userService';
import * as AuthContext from '../context/AuthContext';

jest.mock('react-hot-toast');
jest.mock('../context/SocketContext', () => ({
  ...jest.requireActual('../context/SocketContext'),
  useSocket: () => ({
    unreadCount: 0,
    activeChats: [],
    notifications: [],
    onlineUsers: [],
    socket: null,
  }),
}));

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('AdminMembers page', () => {
  const mockAdmin = { _id: 'admin_1', name: 'Admin User', role: 'admin' };

  const mockMembers = [
    {
      _id: 'm1',
      name: 'Alice Active',
      email: 'alice@example.com',
      phone: '9876543210',
      role: 'member',
      membershipPlan: 'monthly',
      membershipStart: new Date(Date.now() - 10 * 86400000).toISOString(),
      membershipEnd: new Date(Date.now() + 20 * 86400000).toISOString(), // active
      feePaid: true,
      feeAmount: 1500,
    },
    {
      _id: 'm2',
      name: 'Bob Expiring',
      email: 'bob@example.com',
      phone: '9876543211',
      role: 'member',
      membershipPlan: 'quarterly',
      membershipStart: new Date(Date.now() - 85 * 86400000).toISOString(),
      membershipEnd: new Date(Date.now() + 3 * 86400000).toISOString(), // expiring in 3 days
      feePaid: true,
      feeAmount: 4000,
    },
    {
      _id: 'm3',
      name: 'Charlie Expired',
      email: 'charlie@example.com',
      phone: '9876543212',
      role: 'member',
      membershipPlan: 'monthly',
      membershipStart: new Date(Date.now() - 40 * 86400000).toISOString(),
      membershipEnd: new Date(Date.now() - 10 * 86400000).toISOString(), // expired
      feePaid: false,
      feeDueAmount: 1500,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockAdmin,
      loading: false,
    });
  });

  test('renders empty state when gym has zero members', async () => {
    jest.spyOn(userService, 'loadUsers').mockResolvedValue([]);

    renderWithProviders(<AdminMembers />);

    await waitFor(() => {
      expect(screen.getByText(/No members/i)).toBeInTheDocument();
    });
  });

  test('renders table with multiple members and their membership details', async () => {
    jest.spyOn(userService, 'loadUsers').mockResolvedValue(mockMembers);

    renderWithProviders(<AdminMembers />);

    await waitFor(() => {
      expect(screen.getAllByText('Alice Active').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bob Expiring').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Charlie Expired').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('9876543210').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9876543211').length).toBeGreaterThan(0);
  });

  test('filters member rows by search input', async () => {
    jest.spyOn(userService, 'loadUsers').mockResolvedValue(mockMembers);

    renderWithProviders(<AdminMembers />);

    await waitFor(() => {
      expect(screen.getAllByText('Alice Active').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/Search by name, email or phone/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(screen.getAllByText('Alice Active').length).toBeGreaterThan(0);
      expect(screen.queryByText('Bob Expiring')).not.toBeInTheDocument();
      expect(screen.queryByText('Charlie Expired')).not.toBeInTheDocument();
    });
  });
});
