-- name: UserByUsernameOrEmail :one
SELECT *
FROM users
WHERE user_name = $1
   OR email = $1
    FETCH FIRST ROWS ONLY;

-- name: UserByEmail :one
SELECT *
FROM users
WHERE email = $1
    FETCH FIRST ROWS ONLY;

-- name: InsertUser :one
INSERT INTO users(user_name, password, email, role_id)
VALUES (@user_name, @password, @email, (SELECT id FROM roles WHERE name = @role_name))
RETURNING *;

-- name: DeleteUser :exec
DELETE
FROM users
WHERE user_name = $1;

-- name: CompleteOauthAccount :exec
UPDATE users
SET user_name       = $2,
    avatar_image_id = $3,
    role_id         = $4
WHERE id = $1;

-- name: GetUserInfo :one
SELECT users.user_name,
       users.email,
       r.name as role,
       users.summary,
       i.path as avatarPath
FROM users
         JOIN roles r on users.role_id = r.id
         LEFT JOIN images i on users.avatar_image_id = i.id
WHERE users.id = $1;

-- name: BookGroupsByUser :many
SELECT bg.id,
       (array_agg(i.path))[1]   AS image,
       (array_agg(bg.title))[1] as title,
       bct.latest_chapter,
       bct.last_updated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_groups as bg
         JOIN users u on u.id = bg.owner_id
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bg.id
    ) bcm ON TRUE
         LEFT JOIN LATERAL (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bg.id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latest_chapter,
           MAX(bct.date_created)                                             AS last_updated,
           coalesce(sum(bcv.count), 0)                                       AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i on bg.primary_cover_art_id = i.id
WHERE u.id = $1
GROUP BY bg.id, bg.title, i.path, bct.latest_chapter, bct.last_updated, bct.views, bcm.comments, bgl.likes
ORDER BY last_updated DESC NULLS LAST;

