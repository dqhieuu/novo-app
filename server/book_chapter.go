package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgtype"
	"log"
	"net/http"
	"regexp"
	"strings"
)

const limitChapter = 50
const limitNameCharacter = 50

type HypertextChapter struct {
	ChapterNumber string `json:"chapter_number" binding:"required"`
	Name string `json:"name"`
	Content string `json:"content" binding:"required"`
	BookGroupId int32 `json:"book_group_id" binding:"required"`
}

func HasControlCharacters(content string) bool {
	hasInvalidChars, _ := regexp.MatchString(`[\x00-\x1F\x7F]`, content)
	if hasInvalidChars {
		return true
	}
	return false
}

func CheckEmptyString(content string) bool {
	if len(strings.TrimSpace(content)) == 0 {
		return true
	}
	return false
}

func checkChapterName(name string) bool {
	if HasControlCharacters(name) {
		return false
	}
	hasNextLine, _ := regexp.MatchString(`[\r\n]`, name)
	if hasNextLine {
		return false
	}
	if len(name) > limitNameCharacter {
		return false
	}
	return true
}

func BookChapterById(id int32) (*db.BookChapter, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookChapter, err := queries.BookChapterById(ctx, id)

	if err != nil {
		stringErr := fmt.Sprintf("Get book Chapter by id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookChapter, err
}

func BookChaptersByBookGroupId(bookGroupID, page int32) ([]*db.BookChapter, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookChapters, err := queries.BookChaptersByBookGroupId(ctx, db.BookChaptersByBookGroupIdParams{
		BookGroupID: bookGroupID,
		Offset:      (page - 1) * limitChapter,
		Limit:       limitChapter,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookChapters by book group id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.BookChapter
	for i := 0; i < len(bookChapters); i++ {
		outData = append(outData, &bookChapters[i])
	}
	return outData, err
}

func UpdateBookChapter(id int32, chapterNumber, description, textContext, chapterType string,
	bookGroupID, ownerID int32) error {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var chapterNumberSql pgtype.Numeric
	err := chapterNumberSql.Scan(chapterNumber)
	if err != nil {
		stringErr := fmt.Sprintf("Update book chapter  failed: %s", err)
		return errors.New(stringErr)
	}

	descriptionSql := sql.NullString{}
	err = descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Update book chapter  failed: %s", err)
		return errors.New(stringErr)
	}

	textContextSql := sql.NullString{}
	err = textContextSql.Scan(textContext)
	if err != nil {
		stringErr := fmt.Sprintf("Update book chapter  failed: %s", err)
		return errors.New(stringErr)
	}

	err = queries.UpdateBookChapter(ctx, db.UpdateBookChapterParams{
		ID:            id,
		ChapterNumber: chapterNumberSql,
		Name:   descriptionSql,
		TextContext:   textContextSql,
		Type:          chapterType,
		BookGroupID:   bookGroupID,
		OwnerID:       ownerID,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update book chapter  failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CreateBookChapter(chapterNumber, description, textContext, chapterType string,
	bookGroupID, ownerID int32) (*db.BookChapter, error) {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var chapterNumberSql pgtype.Numeric
	err := chapterNumberSql.Scan(chapterNumber)
	if err != nil {
		stringErr := fmt.Sprintf("Create book chapter  failed: %s", err)
		return nil, errors.New(stringErr)
	}

	descriptionSql := sql.NullString{}
	err = descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Create book chapter  failed: %s", err)
		return nil, errors.New(stringErr)
	}

	textContextSql := sql.NullString{}
	err = textContextSql.Scan(textContext)
	if err != nil {
		stringErr := fmt.Sprintf("Create book chapter  failed: %s", err)
		return nil, errors.New(stringErr)
	}

	bookChapter, err := queries.InsertBookChapter(ctx, db.InsertBookChapterParams{
		ChapterNumber: chapterNumberSql,
		Name:   descriptionSql,
		TextContext:   textContextSql,
		Type:          chapterType,
		BookGroupID:   bookGroupID,
		OwnerID:       ownerID,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book chapter  failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookChapter, nil
}

func DeleteBookChapterById(id int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookChapterById(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book chapter by Id failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func DeleteBookChapterByBookGroupId(bookGroupId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookChapterByBookGroupId(ctx, bookGroupId)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book chapter by bookGroupId failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CreateHypertextChapterHandler(c *gin.Context) {
	var newHypertextChapter HypertextChapter
	if err := c.ShouldBindJSON(&newHypertextChapter); err != nil {
		log.Printf("error parsing json: %s\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "error parsing json",
		})
		return
	}
	//check chapter number
	if CheckEmptyString(newHypertextChapter.ChapterNumber) {
		log.Println("invalid chapter number")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid chapter number",
		})
		return
	}

	 //check chapter name
	 if checkChapterName(newHypertextChapter.Name) {
		 log.Println("invalid chapter name")
		 c.JSON(http.StatusBadRequest, gin.H{
			 "error": "invalid chapter name",
		 })
		 return
	 }

	//check content
	if HasControlCharacters(newHypertextChapter.Content) && CheckEmptyString(newHypertextChapter.Content) {
		log.Println("invalid content")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid content",
		})
		return
	}

	extract := jwt.ExtractClaims(c)

	newChapter, err := CreateBookChapter(
		newHypertextChapter.ChapterNumber,
		newHypertextChapter.Name,
		newHypertextChapter.Content,
		"hypertext",
		newHypertextChapter.BookGroupId,
		int32(extract[UserIdClaimKey].(float64)))

	if err != nil {
		log.Printf("error creating new hypertext chapter: %s\n", err)
		c.JSON(500, gin.H{
			"error": err,
		})
		return
	}
	c.JSON(200, gin.H{
		"id": newChapter.ID,
	})
}
