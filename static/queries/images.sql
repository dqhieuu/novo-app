-- name: GetImageBasedOnId :one
SELECT * FROM images where id = $1;

-- name: InsertImage :one
INSERT INTO images(md5, sha1, path, name, description) VALUES ($1, $2, $3, $4, $5)
RETURNING id;

-- name: GetImageBasedOnHash :one
SELECT * FROM images WHERE md5 = $1 AND sha1 = $2
FETCH FIRST ROW ONLY;

-- name: ClearTempImages :many
DELETE FROM temp_images RETURNING image_id;

-- name: DeleteImage :exec
DELETE FROM images WHERE id = $1;

-- name: DeleteTempImage :exec
DELETE FROM temp_images WHERE image_id = $1;






