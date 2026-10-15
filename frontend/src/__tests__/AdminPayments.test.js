import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPayments from '../pages/admin/Payments';
import { ThemeProvider } from '../context/ThemeContext';
import * as apiModule from '../utils/api';
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

const renderWithProviders = (ui, initialEntries = ['/admin/payments']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('AdminPayments page', () => {
  const mockAdmin = { _id: 'admin_1', name: 'Admin User', role: 'admin' };

  const mockPaymentsData = {
    payments: [
      {
        _id: 'pay_1',
        amount: 3000,
        type: 'renewal',
        method: 'upi',
        createdAt: new Date().toISOString(),
        member: { _id: 'm1', name: 'Rahul Sharma', email: 'rahul@example.com' },
      },
      {
        _id: 'pay_2',
        amount: 1200,
        type: 'order',
        method: 'cash',
        createdAt: new Date().toISOString(),
        order: { _id: 'ord_1', totalAmount: 1200 },
        member: { _id: 'm2', name: 'Priya Patel', email: 'priya@example.com' },
      },
    ],
    totals: { membership: 3000, store: 1200, all: 4200 },
  };

  const mockDuesData = {
    members: [
      {
        _id: 'm3',
        name: 'Amit Verma',
        phone: '9876543299',
        membershipPlan: 'monthly',
        feeDueAmount: 1500,
      },
    ],
    total: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockAdmin,
      loading: false,
    });
  });

  test('renders empty state when no payments have been recorded', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockImplementation((url) => {
      if (url === '/payments') return Promise.resolve({ data: { payments: [], totals: { membership: 0, store: 0, all: 0 } } });
      if (url === '/payments/summary') return Promise.resolve({ data: {} });
      if (url === '/payments/due') return Promise.resolve({ data: { members: [], total: 0 } });
      if (url === '/members') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<AdminPayments />);

    await waitFor(() => {
      expect(screen.getByText(/No payments recorded yet/i)).toBeInTheDocument();
    });
  });

  test('renders payment rows with member names, amounts, and headline totals', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockImplementation((url) => {
      if (url === '/payments') return Promise.resolve({ data: mockPaymentsData });
      if (url === '/payments/summary') return Promise.resolve({ data: {} });
      if (url === '/payments/due') return Promise.resolve({ data: mockDuesData });
      if (url === '/members') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<AdminPayments />);

    await waitFor(() => {
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Priya Patel').length).toBeGreaterThan(0);
    });

    // Verify amounts
    expect(screen.getAllByText(/₹3,000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹1,200/).length).toBeGreaterThan(0);
  });

  test('displays outstanding dues tab with members who owe fees', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockImplementation((url) => {
      if (url === '/payments') return Promise.resolve({ data: mockPaymentsData });
      if (url === '/payments/summary') return Promise.resolve({ data: {} });
      if (url === '/payments/due') return Promise.resolve({ data: mockDuesData });
      if (url === '/members') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<AdminPayments />, ['/admin/payments?tab=dues']);

    await waitFor(() => {
      expect(screen.getAllByText('Amit Verma').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/₹1,500/).length).toBeGreaterThan(0);
    });
  });
});
