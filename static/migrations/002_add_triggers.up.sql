CREATE OR REPLACE FUNCTION add_temp_image()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO temp_images(image_id) VALUES (NEW.id);
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION insert_like_operation()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    if new.point > 0 then
        if exists(select 1
                  from book_group_likes
                  where user_id = new.user_id
                    and book_group_id = new.book_group_id
                    and point < 0) then
            delete
            from book_group_likes
            where user_id = new.user_id
              and book_group_id = new.book_group_id
              and point < 0;
        end if;
    elsif new.point < 0 then
        if exists(select 1
                  from book_group_likes
                  where user_id = new.user_id
                    and book_group_id = new.book_group_id
                    and point > 0) then
            delete
            from book_group_likes
            where user_id = new.user_id
              and book_group_id = new.book_group_id
              and point > 0;
        end if;
    end if;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION book_group_tsv_trigger_func()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
Declare
    authorName text;
BEGIN
    SELECT CONCAT(book_authors.name, ' ', book_authors.aliases)
    INTO authorName
    FROM book_authors
             JOIN book_group_authors bga on book_authors.id = bga.book_author_id
    WHERE bga.book_group_id = new.id;
    new.book_group_tsv = setweight(to_tsvector(unaccent(concat(new.title, ' ', new.aliases))), 'A') ||
                         setweight(to_tsvector(unaccent(coalesce(authorName, ''))), 'B') ||
                         setweight(to_tsvector(unaccent(coalesce(new.description, ''))), 'D');
    RETURN new;
END
$$;

CREATE OR REPLACE function tsv_on_book_group_author_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
Declare
    authorName text;
BEGIN
    SELECT concat(book_authors.name, ' ', book_authors.aliases)
    INTO authorName
    FROM book_authors
             JOIN book_group_authors bga on book_authors.id = bga.book_author_id
    WHERE bga.book_author_id = new.book_author_id;
    UPDATE book_groups
    SET book_group_tsv =
                    setweight(to_tsvector(unaccent(concat(book_groups.title, ' ', book_groups.aliases))), 'A') ||
                    setweight(to_tsvector(unaccent(coalesce(authorName, ''))), 'B') ||
                    setweight(to_tsvector(unaccent(coalesce(book_groups.description, ''))), 'D')
    WHERE book_groups.id = new.book_group_id;
    return new;
end
$$;

CREATE OR REPLACE function tsv_on_book_author_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
Declare
    bookList int[];
    book     int;
BEGIN
    SELECT array_agg(book_groups.id)
    INTO bookList
    FROM book_groups
             JOIN book_group_authors bga on book_groups.id = bga.book_group_id
             JOIN book_authors ba ON bga.book_author_id = ba.id
    WHERE ba.id = new.id;
    if bookList is null then
        bookList = '{}';
    end if;
    foreach book in array bookList
        loop
            UPDATE book_groups
            SET book_group_tsv = setweight(to_tsvector(unaccent(concat(book_groups.title, ' ', book_groups.aliases))),
                                           'A') ||
                                 setweight(to_tsvector(unaccent(coalesce(concat(new.name, ' ', new.aliases), ''))),
                                           'B') ||
                                 setweight(to_tsvector(unaccent(coalesce(book_groups.description, ''))), 'D')
            WHERE id = book;
        end loop;
    return new;
end
$$;

CREATE OR REPLACE FUNCTION book_author_tsv_trigger_func()
    RETURNS TRIGGER
    LANGUAGE plpgsql AS
$$
BEGIN
    new.book_author_tsv = setweight(to_tsvector(unaccent(new.name)), 'A') ||
                          setweight(to_tsvector(unaccent(coalesce(new.aliases, ''))), 'B');
    RETURN new;
END
$$;

CREATE TRIGGER book_group_tsv_trigger
    BEFORE INSERT OR UPDATE
    ON book_groups
    FOR EACH ROW
EXECUTE PROCEDURE book_group_tsv_trigger_func();

CREATE TRIGGER book_group_author_change_tsv_trigger
    AFTER INSERT OR UPDATE
    ON book_group_authors
    FOR EACH ROW
EXECUTE PROCEDURE tsv_on_book_group_author_change();

CREATE TRIGGER book_author_change_tsv_trigger
    AFTER UPDATE
    ON book_authors
    FOR EACH ROW
EXECUTE PROCEDURE tsv_on_book_author_change();

CREATE TRIGGER book_author_tsv_trigger
    BEFORE INSERT OR UPDATE
    ON book_authors
    FOR EACH ROW
EXECUTE PROCEDURE book_author_tsv_trigger_func();

CREATE TRIGGER save_temp_image
    AFTER INSERT
    ON images
    FOR EACH ROW
EXECUTE PROCEDURE add_temp_image();

CREATE TRIGGER insert_like
    BEFORE INSERT
    ON book_group_likes
    FOR EACH ROW
EXECUTE PROCEDURE insert_like_operation();