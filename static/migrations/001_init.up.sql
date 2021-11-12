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
    id          int GENERATED ALWAYS AS IDENTITY,
    name        text NOT NULL UNIQUE,
    description text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users
(
    id              int GENERATED ALWAYS AS IDENTITY,
    date_created    timestamptz NOT NULL DEFAULT now(),
    user_name       text        NOT NULL UNIQUE,
    password        text        NOT NULL,
    email           text        NOT NULL,
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

CREATE TABLE IF NOT EXISTS book_chapter_types
(
    id          int GENERATED ALWAYS AS IDENTITY,
    name        text NOT NULL,
    description text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS book_authors
(
    id              int GENERATED ALWAYS AS IDENTITY,
    name            text NOT NULL,
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
    ownerID      int  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_book_groups_users
        FOREIGN KEY (ownerID)
            REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS book_group_alt_titles
(
    title   text NOT NULL,
    book_id int  NOT NULL,
    CONSTRAINT fk_alt_titles_book_groups
        FOREIGN KEY (book_id)
            REFERENCES book_groups (id)
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
            REFERENCES book_groups (id)
);

CREATE TABLE IF NOT EXISTS book_group_likes
(
    point         int NOT NULL,
    user_id       int NOT NULL,
    book_group_id int NOT NULL,
    PRIMARY KEY (user_id, book_group_id),
    CONSTRAINT fk_likes_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id),
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
            REFERENCES book_groups (id),
    CONSTRAINT fk_book_group_genres_genres
        FOREIGN KEY (genre_id)
            REFERENCES genres (id)
);

CREATE TABLE IF NOT EXISTS book_group_authors
(
    book_group_id  int NOT NULL,
    book_author_id int NOT NULL,
    CONSTRAINT fk_book_group_authors_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id),
    CONSTRAINT fk_book_group_authors_book_authors
        FOREIGN KEY (book_author_id)
            REFERENCES book_authors (id)
);

CREATE TABLE IF NOT EXISTS book_chapters
(
    id             int GENERATED ALWAYS AS IDENTITY,
    date_created   timestamptz NOT NULL DEFAULT now(),
    chapter_number decimal     NOT NULL,
    description    text,
    text_context   text,
    type_id        int         NOT NULL,
    book_group_id  int         NOT NULL,
    owner_id       int         NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_book_chapters_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id),
    CONSTRAINT fk_book_chapters_types
        FOREIGN KEY (type_id)
            REFERENCES book_chapter_types (id),
    CONSTRAINT fk_book_chapters_users
        FOREIGN KEY (owner_id)
            REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS book_chapter_images
(
    book_chapter_id int NOT NULL,
    image_id        int NOT NULL,
    PRIMARY KEY (book_chapter_id, image_id),
    CONSTRAINT fk_book_chapter_images_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id),
    CONSTRAINT fk_book_chapter_images_images
        FOREIGN KEY (image_id)
            REFERENCES images (id)
);

CREATE TABLE IF NOT EXISTS book_chapters_views
(
    count           int,
    view_date       date NOT NULL DEFAULT now(),
    book_chapter_id int  NOT NULL,
    CONSTRAINT fk_book_chapter_views_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id)
);

CREATE TABLE IF NOT EXISTS book_comments
(
    content         text NOT NULL,
    user_id         int  NOT NULL,
    book_group_id   int,
    book_chapter_id int,
    CONSTRAINT fk_book_comments_users
        FOREIGN KEY (user_id)
            REFERENCES users (id),
    CONSTRAINT fk_book_comments_book_groups
        FOREIGN KEY (book_group_id)
            REFERENCES book_groups (id),
    CONSTRAINT fk_book_comments_book_chapters
        FOREIGN KEY (book_chapter_id)
            REFERENCES book_chapters (id)
);

