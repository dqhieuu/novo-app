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
                  where user_id = new.user_id and book_group_id = new.book_group_id and point < 0) then
            delete
            from book_group_likes
            where user_id = new.user_id and book_group_id = new.book_group_id and point < 0;
        end if;
    elsif new.point < 0 then
        if exists(select 1
                  from book_group_likes
                  where user_id = new.user_id and book_group_id = new.book_group_id and point > 0) then
            delete
            from book_group_likes
            where user_id = new.user_id and book_group_id = new.book_group_id and point > 0;
        end if;
    end if;
    RETURN NEW;
END;
$$;

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