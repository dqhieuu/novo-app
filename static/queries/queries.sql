-- name: ListBookGroups :many
SELECT * FROM book_groups
FETCH FIRST $1 ROWS ONLY;

-- name: