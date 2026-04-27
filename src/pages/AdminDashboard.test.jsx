import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter } from 'react-router-dom';
import api from "../services/api.js";

// AuthContext-ийг mock хийх (Админ эрхтэй хэрэглэгч)
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    token: "mock-token",
    user: { phone: '88888888', name: 'Admin User' },
    loading: false
  }),
}));

// API хүсэлтүүдийг mock хийх
vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { baseURL: "http://localhost:5000" }
  },
}));

// Formatter-уудыг mock хийх
vi.mock("../utils/formatters.js", () => ({
  formatCurrency: (val) => `${val?.toLocaleString()}₮`,
  formatNumber: (val) => val?.toLocaleString(),
  formatDate: (val) => val,
}));

// Recharts-ийг mock хийх (SVG зураглалыг JSDOM-д алдаагүй гаргахын тулд)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  AreaChart: ({ children }) => <div>{children}</div>,
  Area: () => <div />,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Захиалгын өгөгдөл ирж байгаа мэт mock хийх
    api.get.mockImplementation((url) => {
      if (url === "/api/bookings/all") return Promise.resolve({ data: [{ _id: '1', totalPrice: 100000, status: 'confirmed', customerName: 'John', phone: '123', type: 'ger' }] });
      if (url === "/api/trip-bookings/all") return Promise.resolve({ data: [] });
      if (url === "/api/food-bookings/all") return Promise.resolve({ data: [] });
      if (url === "/api/product-bookings/all") return Promise.resolve({ data: [] });
      if (url === "/api/gers/all") return Promise.resolve({ data: [] });
      if (url === "/api/trips/all") return Promise.resolve({ data: [] });
      if (url === "/api/foods/all") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders stats correctly based on fetched data', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Нийт орлого (100,000) дэлгэцэнд харагдаж байгаа эсэхийг шалгах
    await waitFor(() => {
      expect(screen.getByText('100,000')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/System/i)).toBeInTheDocument();
  });
});
