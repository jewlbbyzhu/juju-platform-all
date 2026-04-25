import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import OrderDetailScreen from '../../src/screens/OrderDetailScreen';

const mockNavigate = jest.fn();
const mockRoute = {
  params: { orderId: 1 },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

jest.mock('../../src/api/order', () => ({
  orderApi: {
    getOrderDetail: jest.fn(),
  },
}));

import { orderApi } from '../../src/api/order';

describe('OrderDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (orderApi.getOrderDetail as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        id: 1,
        order_no: 'ORDER001',
        status: 'paid',
        party: { title: '测试聚会', cover_image: 'https://example.com/image.jpg' },
        ticket: { name: '普通票' },
        quantity: 2,
        total_amount: 200,
        actual_amount: 180,
        created_at: '2025-04-01T10:00:00Z',
        paid_at: '2025-04-01T10:05:00Z',
      },
    });
  });

  it('renders order detail without crashing', () => {
    render(<OrderDetailScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays order party title', async () => {
    render(<OrderDetailScreen />);
    await waitFor(() => {
      expect(screen.getByText('测试聚会')).toBeTruthy();
    });
  });
});
