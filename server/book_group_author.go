package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
)

func BookGroupAuthor(bookGroupId, bookAuthorId int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.BookGroupAuthor(ctx, db.BookGroupAuthorParams{
		BookGroupID: bookGroupId, BookAuthorID: bookAuthorId,
	})
	if err != nil {
		return false, err
	}
	return result, nil
}
func CreateBookGroupAuthor(bookGroupId, bookAuthorId int32) (*db.BookGroupAuthor, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupAuthor, err := queries.InsertBookGroupAuthor(ctx, db.InsertBookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book_group_author failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookGroupAuthor, nil
}

func DeleteBookGroupAuthor(bookGroupId, bookAuthorId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookGroupAuthor(ctx, db.DeleteBookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Delete book_group_author failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func AuthorsByBookGroup(bookGroupId, page int32) ([]int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.AuthorsByBookGroup(ctx, db.AuthorsByBookGroupParams{
		BookGroupID: bookGroupId,
		Offset:      (page - 1) * limitBookAuthors,
		Limit:       limitBookAuthors,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get authors by bookGroup failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return bookGroups, err
}

func DeleteAuthorsByBookGroup(bookGroupId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupAuthorsByBookGroup(ctx, bookGroupId)
	if err != nil {
		stringErr := fmt.Sprintf("Delete bookGroupAuthor by bookGroup failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func DeleteBookGroupsByBookAuthor(genre int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupAuthorsByAuthor(ctx, genre)
	if err != nil {
		stringErr := fmt.Sprintf("Delete bookGroupAuthor by author failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func GetAuthorInfoHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	var authorId int32
	_, err := fmt.Sscan(c.Param("authorId"), &authorId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	author, err := queries.GetBookAuthor(ctx, authorId)
	if author == (db.GetBookAuthorRow{}) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Author does not exist",
		})
		return
	} else if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bookGroups, err := queries.BookGroupsByAuthor(ctx, authorId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if bookGroups == nil {
		bookGroups = []db.BookGroupsByAuthorRow{}
	}
	var avatar interface{}
	var description interface{}
	if author.Avatar.Valid == true {
		avatar = author.Avatar.String
	}
	if author.Description.Valid == true {
		description = author.Description.String
	}
	c.JSON(http.StatusOK, gin.H{
		"name":        author.Name,
		"description": description,
		"avatar":      avatar,
		"books":       bookGroups,
	})

}
