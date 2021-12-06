-- name: InsertBookChapterImage :exec
INSERT INTO book_chapter_images(book_chapter_id, image_id, rank) VALUES($1, $2, $3);

-- name: ImagesByBookChapter :many
SELECT i.path
FROM book_chapter_images AS bci
JOIN images AS i ON i.id=bci.image_id
WHERE bci.book_chapter_id = $1
ORDER BY bci.rank ASC;

-- name: DeleteImageOfBookChapter :exec
DELETE
FROM book_chapter_images
WHERE book_chapter_id = $1;