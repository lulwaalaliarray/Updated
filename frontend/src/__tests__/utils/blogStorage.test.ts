import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getBlogPosts, 
  saveBlogPost, 
  getBlogPostsByAuthor,
  getPublishedBlogPostsByAuthor,
  getDraftBlogPostsByAuthor,
  generateBlogId,
  BlogPost 
} from '../../utils/blogStorage';

describe('blogStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should filter published blogs by author correctly', () => {
    const authorId = 'test-author-1';
    const otherAuthorId = 'test-author-2';

    // Create test blog posts
    const publishedPost: BlogPost = {
      id: generateBlogId(),
      title: 'Published Post',
      excerpt: 'Published excerpt',
      content: 'Published content',
      author: 'Test Author',
      authorId: authorId,
      date: '2024-01-01',
      category: 'Health Tips',
      readTime: '2 min read',
      tags: ['health'],
      published: true
    };

    const draftPost: BlogPost = {
      id: generateBlogId(),
      title: 'Draft Post',
      excerpt: 'Draft excerpt',
      content: 'Draft content',
      author: 'Test Author',
      authorId: authorId,
      date: '2024-01-02',
      category: 'Health Tips',
      readTime: '3 min read',
      tags: ['health'],
      published: false
    };

    const otherAuthorPost: BlogPost = {
      id: generateBlogId(),
      title: 'Other Author Post',
      excerpt: 'Other excerpt',
      content: 'Other content',
      author: 'Other Author',
      authorId: otherAuthorId,
      date: '2024-01-03',
      category: 'Health Tips',
      readTime: '1 min read',
      tags: ['health'],
      published: true
    };

    // Save the posts
    saveBlogPost(publishedPost);
    saveBlogPost(draftPost);
    saveBlogPost(otherAuthorPost);

    // Test filtering
    const allPostsByAuthor = getBlogPostsByAuthor(authorId);
    const publishedPostsByAuthor = getPublishedBlogPostsByAuthor(authorId);
    const draftPostsByAuthor = getDraftBlogPostsByAuthor(authorId);

    expect(allPostsByAuthor).toHaveLength(2);
    expect(publishedPostsByAuthor).toHaveLength(1);
    expect(draftPostsByAuthor).toHaveLength(1);

    expect(publishedPostsByAuthor[0].title).toBe('Published Post');
    expect(publishedPostsByAuthor[0].published).toBe(true);

    expect(draftPostsByAuthor[0].title).toBe('Draft Post');
    expect(draftPostsByAuthor[0].published).toBe(false);
  });

  it('should return empty arrays when no posts match the criteria', () => {
    const nonExistentAuthorId = 'non-existent-author';

    const allPostsByAuthor = getBlogPostsByAuthor(nonExistentAuthorId);
    const publishedPostsByAuthor = getPublishedBlogPostsByAuthor(nonExistentAuthorId);
    const draftPostsByAuthor = getDraftBlogPostsByAuthor(nonExistentAuthorId);

    expect(allPostsByAuthor).toHaveLength(0);
    expect(publishedPostsByAuthor).toHaveLength(0);
    expect(draftPostsByAuthor).toHaveLength(0);
  });

  it('should handle author with only published posts', () => {
    const authorId = 'published-only-author';

    const publishedPost: BlogPost = {
      id: generateBlogId(),
      title: 'Only Published Post',
      excerpt: 'Published excerpt',
      content: 'Published content',
      author: 'Published Author',
      authorId: authorId,
      date: '2024-01-01',
      category: 'Health Tips',
      readTime: '2 min read',
      tags: ['health'],
      published: true
    };

    saveBlogPost(publishedPost);

    const allPostsByAuthor = getBlogPostsByAuthor(authorId);
    const publishedPostsByAuthor = getPublishedBlogPostsByAuthor(authorId);
    const draftPostsByAuthor = getDraftBlogPostsByAuthor(authorId);

    expect(allPostsByAuthor).toHaveLength(1);
    expect(publishedPostsByAuthor).toHaveLength(1);
    expect(draftPostsByAuthor).toHaveLength(0);
  });

  it('should handle author with only draft posts', () => {
    const authorId = 'draft-only-author';

    const draftPost: BlogPost = {
      id: generateBlogId(),
      title: 'Only Draft Post',
      excerpt: 'Draft excerpt',
      content: 'Draft content',
      author: 'Draft Author',
      authorId: authorId,
      date: '2024-01-01',
      category: 'Health Tips',
      readTime: '2 min read',
      tags: ['health'],
      published: false
    };

    saveBlogPost(draftPost);

    const allPostsByAuthor = getBlogPostsByAuthor(authorId);
    const publishedPostsByAuthor = getPublishedBlogPostsByAuthor(authorId);
    const draftPostsByAuthor = getDraftBlogPostsByAuthor(authorId);

    expect(allPostsByAuthor).toHaveLength(1);
    expect(publishedPostsByAuthor).toHaveLength(0);
    expect(draftPostsByAuthor).toHaveLength(1);
  });
});