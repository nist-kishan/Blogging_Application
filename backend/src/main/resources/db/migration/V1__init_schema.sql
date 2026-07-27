-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    social_links TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    role VARCHAR(50) DEFAULT 'USER' NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- REFRESH TOKENS TABLE
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- BLOGS TABLE
CREATE TABLE blogs (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    banner_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    author_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_blogs_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blogs_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- COMMENTS TABLE
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    blog_id UUID NOT NULL,
    author_id UUID NOT NULL,
    parent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_comments_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- LIKES TABLE
CREATE TABLE likes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    blog_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_blog_like UNIQUE (user_id, blog_id)
);

-- BOOKMARKS TABLE
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    blog_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_blog_bookmark UNIQUE (user_id, blog_id)
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email) WHERE deleted = FALSE;
CREATE INDEX idx_users_username ON users(username) WHERE deleted = FALSE;
CREATE INDEX idx_blogs_slug ON blogs(slug) WHERE deleted = FALSE;
CREATE INDEX idx_blogs_status_deleted ON blogs(status, deleted, created_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug) WHERE deleted = FALSE;
CREATE INDEX idx_comments_blog_parent ON comments(blog_id, parent_id) WHERE deleted = FALSE;
CREATE INDEX idx_likes_blog ON likes(blog_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- Insert Default Administrator
-- password: AdminPassword123! (BCrypt hashed)
INSERT INTO users (id, email, password, username, full_name, role, is_email_verified, created_by, updated_by)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'admin@blogplatform.com',
    '$2a$12$Z/Ue0o0mD8sF2D0YvN2oYeO/5kY3m.lO8VjF4fK9w2W7S6Z.k6V.S', -- BCrypt hash for 'AdminPassword123!'
    'admin',
    'System Administrator',
    'ADMIN',
    TRUE,
    'SYSTEM',
    'SYSTEM'
);

-- Insert a Default Category
INSERT INTO categories (id, name, slug, description, created_by, updated_by)
VALUES (
    'c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Technology',
    'technology',
    'All things tech, coding, gadgets, and software engineering.',
    'SYSTEM',
    'SYSTEM'
);
