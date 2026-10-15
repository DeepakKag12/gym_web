import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StorePage from '../pages/StorePage';
import * as CartContext from '../context/CartContext';
import * as apiModule from '../utils/api';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');

describe('StorePage', () => {
  const mockProducts = [
    {
      _id: 'prod_1',
      name: 'Whey Gold Standard',
      brand: 'Optimum Nutrition',
      category: 'protein',
      price: 3500,
      discountPrice: 3100,
      stock: 10,
      rating: 4.8,
      reviewCount: 45,
      flavors: ['Chocolate', 'Vanilla'],
    },
    {
      _id: 'prod_2',
      name: 'Micronized Creatine',
      brand: 'MuscleBlaze',
      category: 'creatine',
      price: 1200,
      discountPrice: 999,
      stock: 5,
      rating: 4.6,
      reviewCount: 30,
      flavors: [],
    },
    {
      _id: 'prod_3',
      name: 'Pre-Workout Explosive',
      brand: 'Cellucor',
      category: 'pre-workout',
      price: 2400,
      stock: 0, // Out of stock
      rating: 4.2,
      reviewCount: 15,
      flavors: ['Fruit Punch'],
    },
  ];

  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(CartContext, 'useCart').mockReturnValue({
      addToCart: mockAddToCart,
      count: 0,
    });
  });

  test('renders products after successful API fetch', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockResolvedValue({ data: mockProducts });

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Whey Gold Standard')).toBeInTheDocument();
      expect(screen.getByText('Micronized Creatine')).toBeInTheDocument();
      expect(screen.getByText('Pre-Workout Explosive')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/products in All Products/)).toBeInTheDocument();
    expect(screen.getAllByText('Out of Stock')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Out of Stock' })).toBeDisabled();
  });

  test('renders empty state when no products are found', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  test('filters products by search input with debounce', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockResolvedValue({ data: mockProducts });

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Whey Gold Standard')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search products or brands/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Creatine' } });
      // Wait for debounce timer (250ms)
      await new Promise(r => setTimeout(r, 300));
    });

    expect(screen.getByText('Micronized Creatine')).toBeInTheDocument();
    expect(screen.queryByText('Whey Gold Standard')).not.toBeInTheDocument();
  });

  test('clicking Add to Cart triggers addToCart and toast notification', async () => {
    jest.spyOn(apiModule, 'cachedGet').mockResolvedValue({ data: mockProducts });

    render(
      <MemoryRouter>
        <StorePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Whey Gold Standard')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButtons[0]);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProducts[0], 1);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Whey Gold Standard added!'),
      expect.anything()
    );
  });
});
