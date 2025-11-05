import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Toast, { ToastProvider, useToast } from '../../components/Toast';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('Toast Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders toast with correct message and type', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument(); // Close button
  });

  it('auto-dismisses after 3 seconds by default', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time by 3 seconds
    vi.advanceTimersByTime(3000);

    // Should start fade out animation
    vi.advanceTimersByTime(300); // Wait for fade out animation

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('can be manually closed by clicking X button', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // Should start fade out animation immediately
    vi.advanceTimersByTime(300); // Wait for fade out animation

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('respects custom duration', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        duration={5000}
        onClose={mockOnClose}
      />
    );

    // Should not dismiss after 3 seconds
    vi.advanceTimersByTime(3000);
    expect(mockOnClose).not.toHaveBeenCalled();

    // Should dismiss after 5 seconds
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(300); // Wait for fade out animation
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets timer when message changes', () => {
    const { rerender } = render(
      <Toast
        message="First message"
        type="success"
        onClose={mockOnClose}
      />
    );

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000);

    // Change message (simulating new toast)
    rerender(
      <Toast
        message="Second message"
        type="success"
        onClose={mockOnClose}
      />
    );

    // Should not dismiss after 1 more second (would be 3 total)
    vi.advanceTimersByTime(1000);
    expect(mockOnClose).not.toHaveBeenCalled();

    // Should dismiss after 3 seconds from message change
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(300); // Wait for fade out animation
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays correct icons for different types', () => {
    const { rerender } = render(
      <Toast
        message="Success message"
        type="success"
        onClose={mockOnClose}
      />
    );

    // Success icon should be present
    expect(screen.getByText('Success message')).toBeInTheDocument();

    rerender(
      <Toast
        message="Error message"
        type="error"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();

    rerender(
      <Toast
        message="Info message"
        type="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });
});

describe('ToastProvider', () => {
  // Test component that uses the toast hook
  const TestComponent = () => {
    const { showToast } = useToast();

    return (
      <div>
        <button onClick={() => showToast('Success message', 'success')}>
          Show Success
        </button>
        <button onClick={() => showToast('Error message', 'error')}>
          Show Error
        </button>
        <button onClick={() => showToast('Info message', 'info')}>
          Show Info
        </button>
      </div>
    );
  };

  it('shows toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('replaces existing toast with new one', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show first toast
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Show second toast
    const errorButton = screen.getByText('Show Error');
    fireEvent.click(errorButton);

    // Wait for transition
    vi.advanceTimersByTime(350);

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses toast after 3 seconds', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Fast-forward time by 3 seconds + fade out animation
    vi.advanceTimersByTime(3300);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });
});