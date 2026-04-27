import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GerDetails from './GerDetails';
import { BrowserRouter } from 'react-router-dom';
import api from "../services/api.js";

// Жирийн хэрэглэгчийн эрхээр mock хийх
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    token: "mock-token",
    user: { phone: '99999999', name: 'Test User' },
    loading: false
  }),
}));

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { baseURL: "http://localhost:5000" }
  },
}));

describe('GerDetails Component', () => {
  const mockGer = {
    _id: '1',
    title: 'Luxury Ger',
    pricePerNight: 100000,
    location: 'Bayan-Olgii',
    capacity: 4,
    image: 'test.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/api/gers/')) return Promise.resolve({ data: mockGer });
      if (url === '/api/foods/all') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('calculates total price correctly for a 2-night stay', async () => {
    render(
      <BrowserRouter>
        <GerDetails />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText('Luxury Ger')).toBeInTheDocument());

    // Орох, гарах огнооны оролтуудыг олох
    const checkInInput = screen.getByLabelText(/Орох/i);
    const checkOutInput = screen.getByLabelText(/Гарах/i);

    // 2 хоног амрах огноо сонгох
    fireEvent.change(checkInInput, { target: { value: '2023-10-01' } });
    fireEvent.change(checkOutInput, { target: { value: '2023-10-03' } });

    // 100,000 (нэг хоног) * 2 хоног = 200,000 болох ёстой
    await waitFor(() => {
      expect(screen.getByText(/200,000/)).toBeInTheDocument();
    });
  });
});