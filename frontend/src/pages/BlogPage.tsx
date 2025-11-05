import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPublishedBlogPosts, BlogPost } from '../utils/blogStorage';
import { isLoggedIn } from '../utils/navigation';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load blog posts
    const posts = getPublishedBlogPosts();
    console.log('Loaded published blog posts:', posts.length);
    setBlogPosts(posts);

    // Check if user is logged in and is a doctor
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
  }, []);

  const handleReadMore = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

  const handleCreateBlog = () => {
    navigate('/blog/create');
  };

  return (
    <Layout title="Blog" subtitle="Health insights and updates">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 32px',
          marginBottom: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Health & Wellness Blog
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto 24px auto',
            lineHeight: '1.6'
          }}>
            Expert insights, health tips, and the latest updates from the world of healthcare in Bahrain.
          </p>
          
          {/* Create Blog Button for Doctors */}
          {user && user.userType === 'doctor' && (
            <button
              onClick={handleCreateBlog}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
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
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create New Post
            </button>
          )}
        </div>



        {/* Refresh Button for Debugging */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => {
              const posts = getPublishedBlogPosts();
              setBlogPosts(posts);
              console.log('Refreshed blog posts:', posts.length);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Refresh Posts ({blogPosts.length} loaded)
          </button>
        </div>

        {/* Blog Posts */}
        {blogPosts.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              No blog posts yet
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              {user && user.userType === 'doctor' 
                ? 'Be the first to share your medical expertise with our community!'
                : 'Check back soon for expert health insights and tips from our medical professionals.'
              }
            </p>
            {user && user.userType === 'doctor' && (
              <button
                onClick={handleCreateBlog}
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
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                }}
              >
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {blogPosts.map((post) => (
              <div key={post.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => handleReadMore(post.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: '#f0fdfa',
                    color: '#0d9488',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {post.readTime}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {post.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  {post.excerpt}
                </p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span style={{
                        fontSize: '10px',
                        color: '#9ca3af'
                      }}>
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {post.author}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadMore(post.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d9488';
                    }}
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlogPage;