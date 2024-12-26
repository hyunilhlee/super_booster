import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChannelInput from './ChannelInput';

describe('ChannelInput Component', () => {
  test('renders input field and button', () => {
    render(<ChannelInput onAnalyze={() => {}} />);
    
    const input = screen.getByPlaceholderText('유튜브 채널 URL을 입력하세요');
    const button = screen.getByRole('button', { name: '분석하기' });
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test('validates channel URL', () => {
    const mockAnalyze = jest.fn();
    render(<ChannelInput onAnalyze={mockAnalyze} />);
    
    const input = screen.getByPlaceholderText('유튜브 채널 URL을 입력하세요');
    const button = screen.getByRole('button', { name: '분석하기' });

    // 잘못된 URL 입력
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);
    expect(mockAnalyze).not.toHaveBeenCalled();

    // 올바른 URL 입력
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/channel/valid-id' } });
    fireEvent.click(button);
    expect(mockAnalyze).toHaveBeenCalledWith('https://www.youtube.com/channel/valid-id');
  });
}); 