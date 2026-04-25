import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import ScanTicketScreen from '../../src/screens/ScanTicketScreen';

jest.mock('../../src/api/scan', () => ({
  scanApi: {
    verifyTicket: jest.fn(),
    useTicket: jest.fn(),
  },
}));

import { scanApi } from '../../src/api/scan';

describe('ScanTicketScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders scan ticket screen without crashing', () => {
    render(<ScanTicketScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays header title', () => {
    render(<ScanTicketScreen />);
    expect(screen.getByText('扫码验票')).toBeTruthy();
  });

  it('displays scan hint text', () => {
    render(<ScanTicketScreen />);
    expect(screen.getByText('将二维码放入框内')).toBeTruthy();
  });

  it('displays scan button', () => {
    render(<ScanTicketScreen />);
    expect(screen.getByText('点击扫码')).toBeTruthy();
  });

  it('handles scan button press and shows scanning state', async () => {
    (scanApi.verifyTicket as jest.Mock).mockResolvedValue({
      data: {
        valid: true,
        ticket: {
          orderNo: 'ORDER123',
          partyTitle: 'Test Party',
          ticketTypeName: 'VIP Ticket',
          status: 'unused',
        },
      },
    });
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    // 验证扫描中状态
    expect(screen.getByText('正在扫描...')).toBeTruthy();
    
    // 等待 2 秒的扫描动画
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    // 验证 API 被调用
    expect(scanApi.verifyTicket).toHaveBeenCalledWith('TICKET_123456');
  });

  it('displays ticket info after successful scan', async () => {
    (scanApi.verifyTicket as jest.Mock).mockResolvedValue({
      data: {
        valid: true,
        ticket: {
          orderNo: 'ORDER123',
          partyTitle: 'Test Party',
          ticketTypeName: 'VIP Ticket',
          status: 'unused',
        },
      },
    });
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    // 等待扫描完成
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    // 验证票券信息显示
    expect(screen.getByText('ORDER123')).toBeTruthy();
    expect(screen.getByText('Test Party')).toBeTruthy();
    expect(screen.getByText('VIP Ticket')).toBeTruthy();
  });

  it('displays use button for unused ticket', async () => {
    (scanApi.verifyTicket as jest.Mock).mockResolvedValue({
      data: {
        valid: true,
        ticket: {
          orderNo: 'ORDER123',
          partyTitle: 'Test Party',
          ticketTypeName: 'VIP Ticket',
          status: 'unused',
        },
      },
    });
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    expect(screen.getByText('确认使用')).toBeTruthy();
  });

  it('handles use ticket button press', async () => {
    (scanApi.verifyTicket as jest.Mock).mockResolvedValue({
      data: {
        valid: true,
        ticket: {
          orderNo: 'ORDER123',
          partyTitle: 'Test Party',
          ticketTypeName: 'VIP Ticket',
          status: 'unused',
        },
      },
    });
    (scanApi.useTicket as jest.Mock).mockResolvedValue({ code: 0 });
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    const useBtn = screen.getByText('确认使用');
    fireEvent.press(useBtn);
    
    expect(scanApi.useTicket).toHaveBeenCalledWith('TICKET_123456');
  });

  it('handles invalid ticket scan', async () => {
    (scanApi.verifyTicket as jest.Mock).mockResolvedValue({
      data: {
        valid: false,
        message: 'Ticket already used',
      },
    });
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    expect(scanApi.verifyTicket).toHaveBeenCalledWith('TICKET_123456');
  });

  it('handles scan error', async () => {
    (scanApi.verifyTicket as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<ScanTicketScreen />);
    const scanBtn = screen.getByText('点击扫码');
    fireEvent.press(scanBtn);
    
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });
    
    expect(scanApi.verifyTicket).toHaveBeenCalledWith('TICKET_123456');
  });
});