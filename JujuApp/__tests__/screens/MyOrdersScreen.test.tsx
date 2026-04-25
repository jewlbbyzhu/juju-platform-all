import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MyOrdersScreen from '../../src/screens/MyOrdersScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: () => {},
}));

jest.mock('../../src/api/order', () => ({
  orderApi: {
    getOrders: jest.fn(),
    cancelOrder: jest.fn(),
  },
}));

import { orderApi } from '../../src/api/order';

describe('MyOrdersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (orderApi.getOrders as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        list: [
          {
            id: 1,
            order_no: 'ORDER001',
            status: 'pending',
            party: { title: '测试聚会' },
            ticket: { name: '普通票' },
            quantity: 2,
            total_amount: 200,
            created_at: '2025-04-01T10:00:00Z',
          },
        ],
      },
    });
  });

  it('renders orders screen without crashing', () => {
    render(<MyOrdersScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays tabs', () => {
    render(<MyOrdersScreen />);
    expect(screen.getByText('全部')).toBeTruthy();
    expect(screen.getByText('待支付')).toBeTruthy();
    expect(screen.getByText('已支付')).toBeTruthy();
  });
});
