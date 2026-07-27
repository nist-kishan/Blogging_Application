package com.blogplatform.repository;

import com.blogplatform.entity.Blog;
import com.blogplatform.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    @EntityGraph(attributePaths = {"author", "category"})
    Optional<Blog> findBySlug(String slug);

    @EntityGraph(attributePaths = {"author", "category"})
    @Override
    Optional<Blog> findById(UUID id);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE b.status = :status")
    Page<Blog> findAllByStatus(@Param("status") BlogStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE b.status = :status AND b.featured = :featured")
    Page<Blog> findAllByStatusAndFeatured(@Param("status") BlogStatus status, @Param("featured") boolean featured, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE b.status = :status AND b.category.slug = :categorySlug")
    Page<Blog> findAllByStatusAndCategorySlug(@Param("status") BlogStatus status, @Param("categorySlug") String categorySlug, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE b.author.username = :username")
    Page<Blog> findAllByAuthorUsername(@Param("username") String username, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE b.status = :status AND b.author.username = :username")
    Page<Blog> findAllByStatusAndAuthorUsername(@Param("status") BlogStatus status, @Param("username") String username, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.category.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author.fullName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "b.status = :status")
    Page<Blog> searchBlogs(@Param("query") String query, @Param("status") BlogStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT b FROM Blog b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.category.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Blog> searchBlogsAdmin(@Param("query") String query, Pageable pageable);

    boolean existsBySlug(String slug);

    @Query("SELECT b FROM Blog b ORDER BY b.viewCount DESC")
    List<Blog> findTopTrendingBlogs(Pageable pageable);
}
