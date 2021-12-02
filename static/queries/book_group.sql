-- name: BookGroupById :one
SELECT *
FROM book_groups
WHERE id = $1;

-- name: BookGroupsByTitle :many
SELECT *
FROM book_groups
WHERE  LOWER(title) LIKE '%' || $1 || '%'
ORDER BY id
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: UpdateBookGroup :exec
UPDATE book_groups
SET title = $2,
    description=$3,
    owner_id=$4
WHERE id = $1;

-- name: InsertBookGroup :one
INSERT INTO book_groups(title, description,owner_id,primary_cover_art_id)
VALUES (@title, @description,@owner_id,@primary_cover_art_id)
RETURNING *;

-- name: DeleteBookGroup :exec
DELETE FROM book_groups
WHERE id = @id;

-- name: SearchSuggestion :many
SELECT bg.title AS title,
       bg.id AS id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter
FROM book_groups AS bg
         LEFT JOIN images i on bg.primary_cover_art_id = i.id
         LEFT JOIN book_chapters bct on bg.id = bct.book_group_id
WHERE bg.title LIKE '%'||sqlc.arg(query)||'%'
GROUP BY bg.id
LIMIT 5;