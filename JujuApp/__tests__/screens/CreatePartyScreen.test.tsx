import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CreatePartyScreen from '../../src/screens/CreatePartyScreen';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../src/api/party', () => ({
  partyApi: {
    createParty: jest.fn(),
  },
}));

import { partyApi } from '../../src/api/party';

describe('CreatePartyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (partyApi.createParty as jest.Mock).mockResolvedValue({
      code: 0,
      data: { id: '123' },
    });
  });

  it('renders create party screen without crashing', () => {
    render(<CreatePartyScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays form title', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByText('基本信息')).toBeTruthy();
  });

  it('displays input fields', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByPlaceholderText('给你的聚会起个名字')).toBeTruthy();
    expect(screen.getByPlaceholderText('描述一下你的聚会...')).toBeTruthy();
    expect(screen.getByPlaceholderText('详细地址')).toBeTruthy();
  });

  it('displays category options', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByText('🎉 派对')).toBeTruthy();
    expect(screen.getByText('🎵 音乐')).toBeTruthy();
    expect(screen.getByText('⚽ 运动')).toBeTruthy();
    expect(screen.getByText('🎨 艺术')).toBeTruthy();
    expect(screen.getByText('🍜 美食')).toBeTruthy();
  });

  it('displays theme options', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByText('🎪 娱乐')).toBeTruthy();
    expect(screen.getByText('🎮 游戏')).toBeTruthy();
    expect(screen.getByText('🎭 社交')).toBeTruthy();
    expect(screen.getByText('🏃 户外')).toBeTruthy();
  });

  it('handles title input', () => {
    render(<CreatePartyScreen />);
    const input = screen.getByPlaceholderText('给你的聚会起个名字');
    fireEvent.changeText(input, 'Test Party Title');
    expect(input.props.value).toBe('Test Party Title');
  });

  it('displays ticket type section', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByText('票型设置')).toBeTruthy();
  });

  it('displays submit button', () => {
    render(<CreatePartyScreen />);
    expect(screen.getByText('创建聚会')).toBeTruthy();
  });

  it('handles category selection', () => {
    render(<CreatePartyScreen />);
    const categoryBtn = screen.getByText('🎉 派对');
    fireEvent.press(categoryBtn);
  });

  it('handles theme selection', () => {
    render(<CreatePartyScreen />);
    const themeBtn = screen.getByText('🎪 娱乐');
    fireEvent.press(themeBtn);
  });
});
