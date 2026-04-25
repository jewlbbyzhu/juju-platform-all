import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import CustomerServiceScreen from '../../src/screens/CustomerServiceScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('CustomerServiceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders customer service screen without crashing', async () => {
    render(<CustomerServiceScreen />);
    // 等待加载完成（600ms 的加载动画）
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen).toBeTruthy();
  });

  it('displays service name', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('聚聚客服')).toBeTruthy();
  });

  it('displays service hours', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('在线时间：9:00-21:00')).toBeTruthy();
  });

  it('displays FAQ section', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('常见问题')).toBeTruthy();
  });

  it('displays FAQ items', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('如何参加聚会？')).toBeTruthy();
    expect(screen.getByText('如何申请退款？')).toBeTruthy();
    expect(screen.getByText('聚会取消怎么办？')).toBeTruthy();
    expect(screen.getByText('如何成为VIP会员？')).toBeTruthy();
  });

  it('displays contact section', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('联系我们')).toBeTruthy();
  });

  it('displays phone number', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('客服电话')).toBeTruthy();
    expect(screen.getByText('400-123-4567')).toBeTruthy();
  });

  it('displays call button', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('拨打')).toBeTruthy();
  });

  it('displays chat button', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(screen.getByText('💬 在线咨询')).toBeTruthy();
  });

  it('handles FAQ item press', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    const faqItem = screen.getByText('如何参加聚会？');
    fireEvent.press(faqItem);
  });

  it('handles phone call button press', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    const callBtn = screen.getByText('拨打');
    fireEvent.press(callBtn);
  });

  it('handles chat button press', async () => {
    render(<CustomerServiceScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    const chatBtn = screen.getByText('💬 在线咨询');
    fireEvent.press(chatBtn);
  });
});