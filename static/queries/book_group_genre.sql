-- name: AllBookGroupGenre :many
SELECT *
FROM book_group_genres
ORDER BY book_group_id,genre_id;

-- name: InsertBookGroupGenre :one
INSERT INTO book_group_genres(book_group_id, genre_id)
VALUES (@book_group_id, @genre_id)
RETURNING *;

-- name: DeleteBookGroupGenre :exec
DELETE
FROM book_group_genres
WHERE book_group_id = $1
  AND genre_id = $2;

-- name: BookGroupGenre :one
SELECT EXISTS(
   SELECT 1
   FROM book_group_genres
   WHERE book_group_id = $1
     AND genre_id = $2
);

-- name: GenresByBookGroup :many
SELECT bgg.genre_id
FROM book_group_genres AS bgg
WHERE bgg.book_group_id = $1
ORDER BY bgg.genre_id
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY;

-- name: DelBookGroupGenresByGenre :exec
DELETE
FROM book_group_genres
WHERE genre_id = $1;

-- name: DelBookGroupGenresByBookGroup :exec
DELETE
FROM book_group_genres
WHERE book_group_id = $1;

-- name: GetBookGroupGenres :many
SELECT genres.id, genres.name
FROM genres JOIN book_group_genres bgg on genres.id = bgg.genre_id
            JOIN book_groups bg on bgg.book_group_id = bg.id
WHERE bg.id = $1;

-- name: NumberRowBookGroupInGenre :one
SELECT count(*)
FROM book_group_genres
WHERE genre_id = $1;

-- name: BookGroupsByGenre :many
SELECT bgg.book_group_id id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bg.title))[1] title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_group_genres AS bgg
         LEFT JOIN book_groups AS bg ON bgg.book_group_id = bg.id
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bgg.book_group_id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bgg.book_group_id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bgg.book_group_id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bgg.genre_id = $1
GROUP BY bgg.book_group_id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY;