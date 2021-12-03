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

-- name: SearchResult :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_groups AS bg
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bg.id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bg.id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bg.title LIKE '%'||sqlc.arg(query)||'%'
GROUP BY bg.id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

-- name: NumberBookGroupSearchResult :one
SELECT COUNT(id)
FROM book_groups
WHERE title LIKE '%' || sqlc.arg(query) || '%';

-- name: LatestBookGroups :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_groups AS bg
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bg.id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bg.id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

-- name: NumberBookGroup :one
SELECT COUNT(id)
FROM book_groups;