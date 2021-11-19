-- name: GetBookGroup :one
SELECT title, description, date_created,
       (SELECT user_name FROM users WHERE id = ownerid) AS ownerName
FROM book_groups
WHERE title = $1
FETCH FIRST ROWS ONLY;

-- name: GetListBookGroup :many
SELECT title, description, date_created,
       (SELECT user_name FROM users WHERE id = ownerid) AS ownerName
FROM book_groups
FETCH FIRST $1 ROWS ONLY;

-- name: UpdateTitleBookGroup :exec
UPDATE book_groups
SET title = @new_title
WHERE title = @old_title;

-- name: UpdateDescBookGroup :exec
UPDATE book_groups
SET description = @new_description
WHERE title = @title;

-- name: UpdateAuthorBookGroup :exec
UPDATE book_groups
SET ownerid = (SELECT id FROM users WHERE user_name = @new_user_name)
WHERE title = @title;

-- name: InsertBookGroup :exec
INSERT INTO book_groups(title, description,ownerid)
VALUES (@title, @description,(SELECT id FROM users WHERE user_name = @owner_name));

-- name: DeleteBookGroup :exec
DELETE FROM book_groups
WHERE title = @title;
