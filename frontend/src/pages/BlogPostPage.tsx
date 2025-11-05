import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getBlogPost, BlogPost } from '../utils/blogStorage';
import { useToast } from '../components/Toast';
import { isLoggedIn } from '../utils/navigation';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    if (isLoggedIn()) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }

    if (id) {
      const blogPost = getBlogPost(id);
      if (blogPost) {
        // Check if post is published or if current user is the author
        const currentUser = user || (isLoggedIn() ? JSON.parse(localStorage.getItem('userData') || '{}') : null);
        
        if (blogPost.published || (currentUser && currentUser.userType === 'doctor' && (currentUser.id === blogPost.authorId || currentUser.email === blogPost.authorId))) {
          setPost(blogPost);
        } else {
          showToast('This blog post is not available', 'error');
          navigate('/blog');
        }
      } else {
        showToast('Blog post not found', 'error');
        navigate('/blog');
      }
    }
    setLoading(false);
  }, [id, navigate, showToast, user]);

  const handleGoBack = () => {
    navigate('/blog');
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
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
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
            Blog post not found
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

  return (
    <Layout>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#0d9488';
            e.currentTarget.style.color = '#0d9488';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Blog
        </button>

        {/* Draft Indicator */}
        {!post.published && user && user.userType === 'doctor' && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
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
              Draft Mode - This post is only visible to you
            </span>
          </div>
        )}

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
              {post.category}
            </span>
            {!post.published && (
              <span style={{
                padding: '6px 16px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Draft
              </span>
            )}
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {post.readTime}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {new Date(post.date).toLocaleDateString('en-US', {
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
            {post.title}
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
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                {post.author}
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
          {post.tags && post.tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '32px'
            }}>
              {post.tags.map((tag, index) => (
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

          {/* Content */}
          <div style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#374151'
          }}>
            {renderContent(post.content)}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <button
              onClick={handleGoBack}
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
              Back to All Posts
            </button>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPostPage;