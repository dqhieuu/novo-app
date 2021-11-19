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

CREATE TRIGGER save_temp_image
    AFTER INSERT
    ON images
    FOR EACH ROW
    EXECUTE PROCEDURE add_temp_image();