package com.blogplatform.service;

import com.blogplatform.dto.BlogRequest;
import com.blogplatform.entity.*;
import com.blogplatform.exception.UnauthorizedException;
import com.blogplatform.mapper.BlogMapper;
import com.blogplatform.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BlogServiceTest {

    @Mock
    private BlogRepository blogRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private BookmarkRepository bookmarkRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BlogMapper blogMapper;

    @InjectMocks
    private BlogService blogService;

    private User author;
    private Category category;
    private Blog blog;
    private UUID authorId;
    private UUID categoryId;
    private UUID blogId;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        blogId = UUID.randomUUID();

        author = User.builder()
                .id(authorId)
                .email("author@test.com")
                .username("author")
                .fullName("Test Author")
                .role(UserRole.USER)
                .build();

        category = Category.builder()
                .id(categoryId)
                .name("Technology")
                .slug("technology")
                .build();

        blog = Blog.builder()
                .id(blogId)
                .title("Initial Blog Title")
                .slug("initial-blog-title")
                .content("This is the test content.")
                .author(author)
                .category(category)
                .status(BlogStatus.DRAFT)
                .build();
    }

    @Test
    void createBlog_Success_GeneratesUniqueSlug() {
        BlogRequest request = new BlogRequest("New Tech Post", "Summary", "Post content details here.", null, categoryId, BlogStatus.PUBLISHED, false);

        when(userRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(blogRepository.existsBySlug("new-tech-post")).thenReturn(false);
        when(blogRepository.save(any(Blog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Blog created = blogService.createBlog(request, authorId);

        assertNotNull(created);
        assertEquals("New Tech Post", created.getTitle());
        assertEquals("new-tech-post", created.getSlug());
        assertEquals(BlogStatus.PUBLISHED, created.getStatus());
        assertEquals(author, created.getAuthor());
        assertEquals(category, created.getCategory());
        verify(blogRepository, times(1)).save(any(Blog.class));
    }

    @Test
    void createBlog_SlugCollision_AppendsCounter() {
        BlogRequest request = new BlogRequest("New Tech Post", "Summary", "Content details.", null, categoryId, BlogStatus.PUBLISHED, false);

        when(userRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(blogRepository.existsBySlug("new-tech-post")).thenReturn(true);
        when(blogRepository.existsBySlug("new-tech-post-1")).thenReturn(false);
        when(blogRepository.save(any(Blog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Blog created = blogService.createBlog(request, authorId);

        assertEquals("new-tech-post-1", created.getSlug());
    }

    @Test
    void updateBlog_Success_AsAuthor() {
        BlogRequest request = new BlogRequest("Updated Title", "Summary", "Updated content details.", null, categoryId, BlogStatus.PUBLISHED, false);

        when(blogRepository.findById(blogId)).thenReturn(Optional.of(blog));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(blogRepository.existsBySlug("updated-title")).thenReturn(false);
        when(blogRepository.save(any(Blog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Blog updated = blogService.updateBlog(blogId, request, authorId, false);

        assertNotNull(updated);
        assertEquals("Updated Title", updated.getTitle());
        assertEquals("updated-title", updated.getSlug());
        verify(blogRepository, times(1)).save(blog);
    }

    @Test
    void updateBlog_Fail_AsOtherUser() {
        BlogRequest request = new BlogRequest("Updated Title", "Summary", "Updated content.", null, categoryId, BlogStatus.PUBLISHED, false);
        UUID otherUserId = UUID.randomUUID();

        when(blogRepository.findById(blogId)).thenReturn(Optional.of(blog));

        assertThrows(UnauthorizedException.class, () -> {
            blogService.updateBlog(blogId, request, otherUserId, false);
        });
        verify(blogRepository, never()).save(any());
    }

    @Test
    void updateBlog_Success_AsAdminForOtherUser() {
        BlogRequest request = new BlogRequest("Updated Title", "Summary", "Updated content.", null, categoryId, BlogStatus.PUBLISHED, true);
        UUID adminId = UUID.randomUUID();

        when(blogRepository.findById(blogId)).thenReturn(Optional.of(blog));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(blogRepository.existsBySlug("updated-title")).thenReturn(false);
        when(blogRepository.save(any(Blog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Blog updated = blogService.updateBlog(blogId, request, adminId, true);

        assertNotNull(updated);
        assertTrue(updated.isFeatured()); // Admin successfully featured it
    }
}
