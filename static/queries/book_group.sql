-- name: BookGroupById :one
SELECT id, title, aliases, description, date_created, owner_id, primary_cover_art_id
FROM book_groups
WHERE id = $1;

-- name: BookGroupsByTitle :many
SELECT id, title, aliases, description, date_created, owner_id, primary_cover_art_id
FROM book_groups
WHERE book_group_tsv @@ to_tsquery(unaccent($1))
ORDER BY id
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: UpdateBookGroup :exec
UPDATE book_groups
SET title = $2,
    description=$3,
    primary_cover_art_id=$4,
    aliases = $5
WHERE id = $1;

-- name: InsertBookGroup :one
INSERT INTO book_groups(title, aliases, description,owner_id,primary_cover_art_id)
VALUES (@title, @aliases, @description,@owner_id,@primary_cover_art_id)
RETURNING id, title, aliases, description, date_created, owner_id, primary_cover_art_id;

-- name: DeleteBookGroup :exec
DELETE FROM book_groups
WHERE id = @id;

-- name: SearchSuggestion :many
SELECT bg.title AS title,
       bg.id AS id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter
FROM book_groups AS bg
         LEFT JOIN images i on bg.primary_cover_art_id = i.id
         LEFT JOIN book_chapters bct on bg.id = bct.book_group_id
WHERE bg.book_group_tsv @@ to_tsquery(unaccent(sqlc.arg(query)))
GROUP BY bg.id
LIMIT 5;

-- name: SearchResult :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bg.book_group_tsv @@ to_tsquery(unaccent(sqlc.arg(query)))
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY last_updated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

-- name: NumberBookGroupSearchResult :one
SELECT COUNT(id)
FROM book_groups
WHERE book_group_tsv @@ to_tsquery(unaccent(sqlc.arg(query)));

-- name: LatestBookGroups :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY last_updated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

-- name: NumberBookGroup :one
SELECT COUNT(id)
FROM book_groups;

-- name: RandomBookGroups :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY RANDOM() LIMIT $1;


-- name: BookGroupsTopViewWeek :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
        LEFT JOIN book_chapter_views bcv
        ON bct.id = bcv.book_chapter_id
        AND bcv.view_date>= (now()-Interval '1 week')
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY bct.views DESC
LIMIT $1;

-- name: BookGroupsTopViewMonth :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
                           AND bcv.view_date>= (now()-Interval '1 month')
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY bct.views DESC
LIMIT $1;

-- name: BookGroupsTopViewYear :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
                           AND bcv.view_date>= (now()-Interval '1 year')
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY bct.views DESC
LIMIT $1;

-- name: BookGroupsTopViewAll :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latest_chapter,
       bct.last_updated,
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
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created) AS last_updated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY bct.views DESC
LIMIT $1;

-- name: CheckBookGroupById :one
SELECT EXISTS(SElECT 1 FROM book_groups WHERE id = $1);

