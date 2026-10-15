import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from '../pages/CheckoutPage';
import * as AuthContext from '../context/AuthContext';
import * as CartContext from '../context/CartContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('CheckoutPage', () => {
  const mockUser = { _id: 'u1', name: 'John Doe', phone: '9876543210' };
  const mockCart = [
    {
      _id: 'p1',
      name: 'Whey Protein Isolate',
      price: 2500,
      discountPrice: 2200,
      qty: 2,
      flavor: 'Vanilla',
      weight: '1kg',
      images: ['https://example.com/img.jpg'],
    },
  ];
  const mockClearCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(API, 'post').mockResolvedValue({
      data: { _id: 'ord_123', totalAmount: 4400, status: 'pending' },
    });
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
    });
    jest.spyOn(CartContext, 'useCart').mockReturnValue({
      cart: mockCart,
      total: 4400,
      clearCart: mockClearCart,
    });
  });

  test('redirects to /login if user is unauthenticated and auth is not loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('redirects to /cart if cart is empty', () => {
    jest.spyOn(CartContext, 'useCart').mockReturnValue({
      cart: [],
      total: 0,
      clearCart: mockClearCart,
    });

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/cart', { replace: true });
  });

  test('renders checkout form prefilled with user name and phone and order summary', () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
    expect(screen.getByText('Whey Protein Isolate')).toBeInTheDocument();
    expect(screen.getByText('Vanilla · 1kg')).toBeInTheDocument();
    expect(screen.getByText(/Place Order — ₹4400/)).toBeInTheDocument();
  });

  test('validates required name and phone fields before submitting', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith('Please enter your name and phone');
    expect(API.post).not.toHaveBeenCalled();
  });

  test('successfully places order, clears cart, and renders order confirmation screen', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/orders',
        expect.objectContaining({
          items: [
            expect.objectContaining({
              product: 'p1',
              name: 'Whey Protein Isolate',
              price: 2200,
              quantity: 2,
            }),
          ],
          shippingAddress: expect.objectContaining({
            name: 'John Doe',
            phone: '9876543210',
          }),
          paymentMethod: 'cod',
          idempotencyKey: expect.stringMatching(/^ord_/),
        })
      );
    });

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Order Placed!')).toBeInTheDocument();
      expect(screen.getByText('Amount due on pickup: ₹4400')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue Shopping/i })).toBeInTheDocument();
    });
  });
});
