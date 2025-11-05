import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import BlogPreviewPage from '../../pages/BlogPreviewPage';
import { ToastProvider } from '../../components/Toast';

// Mock the Layout component
vi.mock('../../components/Layout', () => ({
  default: function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  }
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {component}
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('BlogPreviewPage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock window.close
    Object.defineProperty(window, 'close', {
      value: vi.fn(),
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    renderWithProviders(<BlogPreviewPage />);
    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  it('displays preview data when available', async () => {
    const mockPreviewData = {
      title: 'Test Blog Post',
      excerpt: 'This is a test excerpt',
      content: '# Test Content\n\nThis is test content with **bold** text.',
      category: 'Health Tips',
      tags: 'health, wellness',
      author: 'Dr. Test',
      date: '2024-01-01',
      readTime: '2 min read'
    };

    localStorage.setItem('blog_preview', JSON.stringify(mockPreviewData));

    renderWithProviders(<BlogPreviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
      expect(screen.getByText('Dr. Test')).toBeInTheDocument();
      expect(screen.getByText('Health Tips')).toBeInTheDocument();
      expect(screen.getByText('2 min read')).toBeInTheDocument();
      expect(screen.getByText('Blog Preview Mode')).toBeInTheDocument();
    });
  });

  it('displays error when no preview data is found', async () => {
    renderWithProviders(<BlogPreviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Preview data not found')).toBeInTheDocument();
    });
  });

  it('renders markdown content correctly', async () => {
    const mockPreviewData = {
      title: 'Test Blog Post',
      excerpt: 'Test excerpt',
      content: '# Main Heading\n\n## Sub Heading\n\n- Bullet point 1\n- Bullet point 2\n\n**Bold text**',
      category: 'Health Tips',
      tags: 'test',
      author: 'Dr. Test',
      date: '2024-01-01',
      readTime: '1 min read'
    };

    localStorage.setItem('blog_preview', JSON.stringify(mockPreviewData));

    renderWithProviders(<BlogPreviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Main Heading')).toBeInTheDocument();
      expect(screen.getByText('Sub Heading')).toBeInTheDocument();
      expect(screen.getByText('Bullet point 1')).toBeInTheDocument();
      expect(screen.getByText('Bullet point 2')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });
  });

  it('renders tags correctly', async () => {
    const mockPreviewData = {
      title: 'Test Blog Post',
      excerpt: 'Test excerpt',
      content: 'Test content',
      category: 'Health Tips',
      tags: 'health, wellness, tips',
      author: 'Dr. Test',
      date: '2024-01-01',
      readTime: '1 min read'
    };

    localStorage.setItem('blog_preview', JSON.stringify(mockPreviewData));

    renderWithProviders(<BlogPreviewPage />);

    await waitFor(() => {
      expect(screen.getByText('#health')).toBeInTheDocument();
      expect(screen.getByText('#wellness')).toBeInTheDocument();
      expect(screen.getByText('#tips')).toBeInTheDocument();
    });
  });

  it('handles close preview button click', async () => {
    const mockPreviewData = {
      title: 'Test Blog Post',
      excerpt: 'Test excerpt',
      content: 'Test content',
      category: 'Health Tips',
      tags: '',
      author: 'Dr. Test',
      date: '2024-01-01',
      readTime: '1 min read'
    };

    localStorage.setItem('blog_preview', JSON.stringify(mockPreviewData));

    renderWithProviders(<BlogPreviewPage />);

    await waitFor(() => {
      const closeButtons = screen.getAllByText('Close Preview');
      expect(closeButtons).toHaveLength(2); // One in header, one in footer
      
      closeButtons[0].click();
      expect(window.close).toHaveBeenCalled();
    });
  });
});