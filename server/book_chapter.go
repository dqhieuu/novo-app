package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"regexp"
)

const limitChapter = 50
const limitNameCharacter = 50

type Chapter struct {
	ChapterNumber float64 `json:"chapterNumber" binding:"required"`
	Name string `json:"name"`
	Id int32 `json:"id" binding:"required"`
	TimePosted int64 `json:"timePosted" binding:"required"`
	UserPosted Author `json:"userPosted" binding:"required"`
}

type HypertextChapter struct {
	ChapterNumber float64 `json:"chapter_number" binding:"required"`
	Name          string  `json:"name"`
	TextContent   string  `json:"text_content" binding:"required"`
	BookGroupId   int32   `json:"book_group_id" binding:"required"`
}

type ImageChapter struct {
	ChapterNumber float64 `json:"chapter_number" binding:"required"`
	Name          string  `json:"name"`
	Images        []int32 `json:"images" binding:"required"`
	BookGroupId   int32   `json:"bookGroupId" binding:"required"`
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

func UpdateBookChapter(id int32, chapterNumber float64, description, textContext, chapterType string,
	bookGroupID, ownerID int32) error {

	ctx := context.Background()
	queries := db.New(db.Pool())

	descriptionSql := sql.NullString{}
	err := descriptionSql.Scan(description)
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
		ChapterNumber: chapterNumber,
		Name:          descriptionSql,
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

func CreateBookChapter(chapterNumber float64, description, textContext, chapterType string,
	bookGroupID, ownerID int32) (*db.BookChapter, error) {

	ctx := context.Background()
	queries := db.New(db.Pool())

	descriptionSql := sql.NullString{}
	err := descriptionSql.Scan(description)
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
		ChapterNumber: chapterNumber,
		Name:          descriptionSql,
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
	//if CheckEmptyString(newHypertextChapter.ChapterNumber) {
	//	log.Println("invalid chapter number")
	//	c.JSON(http.StatusBadRequest, gin.H{
	//		"error": "invalid chapter number",
	//	})
	//	return
	//}

	//check chapter name
	if !checkChapterName(newHypertextChapter.Name) {
		log.Println("invalid chapter name")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid chapter name",
		})
		return
	}

	//check content
	if HasControlCharacters(newHypertextChapter.TextContent) && CheckEmptyString(newHypertextChapter.TextContent) {
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
		newHypertextChapter.TextContent,
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

func CreateImagesChapterHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	var newImageChapter ImageChapter
	if err := c.ShouldBindJSON(&newImageChapter); err != nil {
		log.Printf("error parsing json: %s\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "error parsing json",
		})
		return
	}

	//check chapter number
	//if CheckEmptyString(newImageChapter.ChapterNumber) {
	//	log.Println("invalid chapter number")
	//	c.JSON(http.StatusBadRequest, gin.H{
	//		"error": "invalid chapter number",
	//	})
	//	return
	//}

	//check chapter name
	if !checkChapterName(newImageChapter.Name) {
		log.Println("invalid chapter name")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid chapter name",
		})
		return
	}

	extract := jwt.ExtractClaims(c)

	newChapter, err := CreateBookChapter(
		newImageChapter.ChapterNumber,
		newImageChapter.Name,
		"",
		"images",
		newImageChapter.BookGroupId,
		int32(extract[UserIdClaimKey].(float64)))

	if err != nil {
		log.Printf("error creating new images chapter: %s\n", err)
		c.JSON(500, gin.H{
			"error": err,
		})
		return
	}

	//adding images
	for index, imageId := range newImageChapter.Images {
		peekRow, err := queries.GetImageBasedOnId(ctx, imageId)
		if err != nil {
			log.Printf("error getting image: %s\n", err)
			c.JSON(500, gin.H{
				"error": err,
			})
			return
		}
		switch {
		case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
			log.Printf("image does not exist")
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "image does not exist",
			})
		default:
			err = queries.InsertBookChapterImage(ctx, db.InsertBookChapterImageParams{
				BookChapterID: newChapter.ID,
				ImageID:       imageId,
				Rank:          int32(index + 1),
			})
			if err != nil {
				log.Printf("error adding book chapter images: %s\n", err)
				c.JSON(500, gin.H{
					"error": "error adding book chapter images" + err.Error(),
				})
				return
			}
		}
	}

	c.JSON(200, gin.H{
		"id": newChapter.ID,
	})
}
func GetBookChapterContentHandler(c *gin.Context) {
	var chapterId int32
	_, err := fmt.Sscan(c.Param("chapterId"), &chapterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	bookChapter, err := BookChapterById(chapterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if bookChapter.Type == "images" {
		images, err := ImagesByBookChapter(chapterId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if *images == nil {
			images = &[]string{}
		}
		c.JSON(http.StatusOK, gin.H{
			"type":          bookChapter.Type,
			"bookGroupId":   bookChapter.BookGroupID,
			"chapterNumber": bookChapter.ChapterNumber,
			"name":          bookChapter.Name.String,
			"images":        *images,
		})

	} else {
		c.JSON(http.StatusOK, gin.H{
			"type":          bookChapter.Type,
			"bookGroupId":   bookChapter.BookGroupID,
			"chapterNumber": bookChapter.ChapterNumber,
			"name":          bookChapter.Name.String,
			"textContent":   bookChapter.TextContext.String,
		})
	}
}

func DeleteBookChapterHandler(c *gin.Context) {
	var chapterId int32
	_, err := fmt.Sscan(c.Param("chapterId"), &chapterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	oldChapter, err := BookChapterById(chapterId)
	if oldChapter == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Chapter not exist",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err = DeleteBookChapterById(chapterId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Delete Chapter successfully",
	})
}
