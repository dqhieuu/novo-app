-- name: InsertBookChapterImage :exec
INSERT INTO book_chapter_images(book_chapter_id, image_id, rank) VALUES($1, $2, $3);