-- name: GetBookGroupCoverArts :many
SELECT images.id, images.path
FROM images JOIN book_group_arts bga on images.id = bga.image_id
            JOIN book_groups bg on bga.book_group_id = bg.id
WHERE bg.id = $1;