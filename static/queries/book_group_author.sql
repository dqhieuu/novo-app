-- name: InsertBookGroupAuthor :one
INSERT INTO book_group_authors(book_group_id, book_author_id)
VALUES (@book_group_id, @book_author_id)
RETURNING *;

-- name: DeleteBookGroupAuthor :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1
  AND book_author_id = $2;

-- name: BookGroupAuthor :one
SELECT EXISTS(
   SELECT 1
   FROM book_group_authors
   WHERE book_group_id = $1
     AND book_author_id = $2
);

-- name: AuthorsByBookGroup :many
SELECT bga.book_author_id
FROM book_group_authors AS bga
WHERE bga.book_group_id = $1
ORDER BY bga.book_author_id
OFFSET $2
    ROWS FETCH FIRST $3 ROWS ONLY;

-- name: DelBookGroupAuthorsByAuthor :exec
DELETE
FROM book_group_authors
WHERE book_author_id = $1;

-- name: DelBookGroupAuthorsByBookGroup :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1;

-- name: GetBookAuthor :one
SELECT ba.name,
       ba.description,
       i.path AS avatar
FROM book_authors ba
         LEFT JOIN images i on ba.avatar_image_id = i.id
WHERE ba.id=$1;

-- name: BookGroupsByAuthor :many
SELECT bga.book_group_id id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bg.title))[1] title,
       bct.latest_chapter,
       bct.last_updated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_group_authors AS bga
         LEFT JOIN book_groups AS bg ON bga.book_group_id = bg.id
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bga.book_group_id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bga.book_group_id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bga.book_group_id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bga.book_author_id = $1
GROUP BY bga.book_group_id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY last_updated DESC  NULLS LAST;