import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';

interface PreviewData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  date: string;
  readTime: string;
}

const BlogPreviewPage: React.FC = () => {
  const { showToast } = useToast();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPreview = localStorage.getItem('blog_preview');
    if (storedPreview) {
      try {
        const data = JSON.parse(storedPreview);
        setPreviewData(data);
      } catch (error) {
        console.error('Error parsing preview data:', error);
        showToast('Error loading preview data', 'error');
        window.close();
      }
    } else {
      showToast('No preview data found', 'error');
      window.close();
    }
    setLoading(false);
  }, [showToast]);

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#6b7280'
          }}>
            Loading preview...
          </div>
        </div>
      </Layout>
    );
  }

  if (!previewData) {
    return (
      <Layout>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#6b7280'
          }}>
            Preview data not found
          </div>
        </div>
      </Layout>
    );
  }

  // Function to render markdown-like content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            marginTop: '32px',
            lineHeight: '1.2'
          }}>
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px',
            marginTop: '32px',
            lineHeight: '1.3'
          }}>
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px',
            marginTop: '24px',
            lineHeight: '1.4'
          }}>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={key++} style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '12px',
            lineHeight: '1.6'
          }}>
            {line.substring(2, line.length - 2)}
          </p>
        );
      } else if (line.startsWith('- ')) {
        // Handle bullet points
        const bulletPoints: string[] = [];
        let j = i;
        while (j < lines.length && lines[j].trim().startsWith('- ')) {
          bulletPoints.push(lines[j].trim().substring(2));
          j++;
        }
        elements.push(
          <ul key={key++} style={{
            marginBottom: '16px',
            paddingLeft: '20px'
          }}>
            {bulletPoints.map((point, index) => (
              <li key={index} style={{
                fontSize: '16px',
                color: '#374151',
                lineHeight: '1.6',
                marginBottom: '8px'
              }}>
                {point}
              </li>
            ))}
          </ul>
        );
        i = j - 1; // Skip processed lines
      } else if (line.length > 0) {
        elements.push(
          <p key={key++} style={{
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.7',
            marginBottom: '16px'
          }}>
            {line}
          </p>
        );
      } else {
        elements.push(<br key={key++} />);
      }
    }

    return elements;
  };

  const tagsArray = previewData.tags ? previewData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

  return (
    <Layout>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Preview Header */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg width="20" height="20" fill="#f59e0b" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#92400e'
            }}>
              Blog Preview Mode
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
            }}
          >
            Close Preview
          </button>
        </div>

        {/* Article Header */}
        <article style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Meta Information */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '6px 16px',
              backgroundColor: '#f0fdfa',
              color: '#0d9488',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {previewData.category}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {previewData.readTime}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {new Date(previewData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            {previewData.title}
          </h1>

          {/* Author */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#0d9488',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white'
            }}>
              {previewData.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                {previewData.author}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Healthcare Professional
              </p>
            </div>
          </div>

          {/* Tags */}
          {tagsArray.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '32px'
            }}>
              {tagsArray.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          {previewData.excerpt && (
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderLeft: '4px solid #0d9488',
              borderRadius: '8px',
              marginBottom: '32px'
            }}>
              <p style={{
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#475569',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {previewData.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#374151'
          }}>
            {renderContent(previewData.content)}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f766e';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Close Preview
            </button>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPreviewPage;