CREATE TABLE IF NOT EXISTS images
(
    id          int GENERATED ALWAYS AS IDENTITY,
    md5         text NOT NULL,
    sha1        text NOT NULL,
    path        text NOT NULL UNIQUE,
    name        text,
    description text,
    PRIMARY KEY (id),
    UNIQUE (md5, sha1)
);

CREATE TABLE IF NOT EXISTS temp_images
(
    image_id     int         NOT NULL,
    date_created timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (image_id),
    CONSTRAINT fk_temp_images_images
        FOREIGN KEY (image_id)
            REFERENCES images (id)
);

CREATE TABLE IF NOT EXISTS roles
(
    id                      int GENERATED ALWAYS AS IDENTITY,
    name                    text             NOT NULL UNIQUE,
    description             text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS role_permissions
(
    module text NOT NULL,
    action text NOT NULL,
    role_id int NOT NULL,
    PRIMARY KEY (module, action, role_id),
    CONSTRAINT fk_role_id_roles
        FOREIGN KEY (role_id)
            REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS users
(
    id              int GENERATED ALWAYS AS IDENTITY,
    date_created    timestamptz NOT NULL DEFAULT now(),
    user_name       text        UNIQUE,
    password        text,
    email           text        NOT NULL UNIQUE,
    summary         text,
    avatar_image_id int,
    role_id         int         NOT NULL,
    favorite_list   text,
    PRIMARY KEY (id),
    CONSTRAINT fk_users_images
        FOREIGN KEY (avatar_image_id)
            REFERENCES images (id),
    CONSTRAINT fk_users_roles
        FOREIGN KEY (role_id)
            REFERENCES roles (id)
);


CREATE TABLE IF NOT EXISTS genres
(
    id          int GENERATED ALWAYS AS IDENTITY,
    name        text NOT NULL UNIQUE,
    description text,
    image_id    int,
    PRIMARY KEY (id),
    CONSTRAINT fk_genres_images
        FOREIGN KEY (image_id)
            REFERENCES images (id)
);

INSERT INTO genres(name, description)
VALUES('Hành động', 'Truyện hành động'),
      ('Lãng mạn', 'Truyện lãng mạn'),
      ('Drama', 'Truyện drama'),
      ('Giả tưởng', 'Truyện giả tưởng'),
      ('Chuyển sinh', 'Truyện chuyển sinh'),
      ('Hài hước', 'Truyện hài hước'),
      ('Học đường', 'Truyện học đường'),
      ('Kinh dị', 'Truyện kinh dị'),
      ('Phiêu lưu', 'Truyện phiêu lưu');

-- CREATE TABLE IF NOT EXISTS book_chapter_types
-- (
--     id          int GENERATED ALWAYS AS IDENTITY,
--     name        text NOT NULL,
--     description text,
--     PRIMARY KEY (id)
-- );

CREATE TABLE IF NOT EXISTS book_authors
(
    id              int GENERATED ALWAYS AS IDENTITY,
    name            text UNIQUE NOT NULL,
    description     text,
    avatar_image_id int,
    PRIMARY KEY (id),
    CONSTRAINT fk_book_authors_images
        FOREIGN KEY (avatar_image_id)
            REFERENCES images (id)
);


CREATE TABLE IF NOT EXISTS book_groups
(
    id           int GENERATED ALWAYS AS IDENTITY,
    title        text NOT NULL,
    description  text,
    date_created timestamptz DEFAULT now(),
    owner_id      int  NOT NULL,
    primary_cover_art_id int,
    PRIMARY KEY (id),
    CONSTRAINT fk_book_groups_users
        FOREIGN KEY (owner_id)
            REFERENCES users (id),
    CONSTRAINT fk_book_groups_images
        FOREIGN KEY (primary_cover_art_id)
            REFERENCES images (id)
);

CREATE TABLE IF NOT EXISTS book_group_alt_titles
(
    title   text NOT NULL,
    book_id int  NOT NULL,
    CONSTRAINT fk_alt_titles_book_groups
        FOREIGN KEY (book_id)
            REFERENCES book_groups (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_group_arts
(
    book_group_id int NOT NULL,
    image_id      int NOT NULL,
    PRIMARY KEY (book_group_id, image_id),
    CONSTRAINT fk_arts_images
        FOREIGN KEY (image_id)
            REFERENCES images (id),
    CONSTRAINT fk_arts_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_group_likes
(
    point         int NOT NULL,
    user_id       int NOT NULL,
    book_group_id int NOT NULL,
    PRIMARY KEY (user_id, book_group_id),
    CONSTRAINT fk_likes_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_users
        FOREIGN KEY (user_id)
            REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS book_group_genres
(
    book_group_id int NOT NULL,
    genre_id      int NOT NULL,
    PRIMARY KEY (book_group_id, genre_id),
    CONSTRAINT fk_book_group_genres_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_group_genres_genres
        FOREIGN KEY (genre_id)
            REFERENCES genres (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_group_authors
(
    book_group_id  int NOT NULL,
    book_author_id int NOT NULL,
    CONSTRAINT fk_book_group_authors_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_group_authors_book_authors
        FOREIGN KEY (book_author_id)
            REFERENCES book_authors (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_chapters
(
    id             int GENERATED ALWAYS AS IDENTITY,
    date_created   timestamptz NOT NULL DEFAULT now(),
    chapter_number double precision     NOT NULL,
    name    text,
    text_context   text,
    type           text        NOT NULL CHECK (type IN ('images', 'hypertext')),
    book_group_id  int         NOT NULL,
    owner_id       int         NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_book_chapters_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE,
--     CONSTRAINT fk_book_chapters_types
--         FOREIGN KEY (type_id)
--             REFERENCES book_chapter_types (id),
    CONSTRAINT fk_book_chapters_users
        FOREIGN KEY (owner_id)
            REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS book_chapter_images
(
    book_chapter_id int NOT NULL,
    image_id        int NOT NULL,
    rank int NOT NULL DEFAULT 1,
    CONSTRAINT fk_book_chapter_images_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_chapter_images_images
        FOREIGN KEY (image_id)
            REFERENCES images (id)
);

CREATE TABLE IF NOT EXISTS book_chapter_views
(
    count           int DEFAULT 1,
    view_date       date NOT NULL DEFAULT now(),
    book_chapter_id int  NOT NULL,
    PRIMARY KEY (book_chapter_id, view_date),
    CONSTRAINT fk_book_chapter_views_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id)
);

CREATE TABLE IF NOT EXISTS book_comments
(
    id           int GENERATED ALWAYS AS IDENTITY,
    content         text NOT NULL,
    user_id         int  NOT NULL,
    book_group_id   int NOT NULL,
    book_chapter_id int,
    posted_time timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT fk_book_comments_users
        FOREIGN KEY (user_id)
            REFERENCES users (id),
    CONSTRAINT fk_book_comments_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_comments_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id)
);

