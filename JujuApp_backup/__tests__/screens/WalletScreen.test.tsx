import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import WalletScreen from '../../src/screens/WalletScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api', () => ({
  walletApi: {
    getWalletInfo: jest.fn(),
    getTransactions: jest.fn(),
  },
}));

import { walletApi } from '../../src/api';

describe('WalletScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (walletApi.getWalletInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        balance: 1000,
        frozen_balance: 0,
        available_balance: 1000,
      },
    });
    (walletApi.getTransactions as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        list: [
          { id: 1, type: 'recharge', amount: 500, created_at: '2025-04-01', description: '充值', status: 1 },
          { id: 2, type: 'payment', amount: -100, created_at: '2025-04-02', description: '消费', status: 1 },
        ],
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders wallet screen without crashing', () => {
    render(<WalletScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays balance label', async () => {
    render(<WalletScreen />);
    // 等待加载完成
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('账户余额')).toBeTruthy();
  });
});
