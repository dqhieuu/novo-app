package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"unicode"
)

const limitBookAuthors = 50

type Author struct {
	Name string `json:"name" binding:"required"`
	Id   int32  `json:"id" binding:"required"`
}

func BookAuthorById(id int32) (*db.BookAuthor, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookAuthor, err := queries.BookAuthorById(ctx, id)

	if err != nil {
		stringErr := fmt.Sprintf("Get bookAuthor by id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookAuthor, err
}

func BookAuthors(page int32) ([]*db.BookAuthor, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookAuthors, err := queries.BookAuthors(ctx, db.BookAuthorsParams{
		Offset: (page - 1) * limitBookAuthors,
		Limit:  limitBookAuthors,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookAuthors list failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.BookAuthor
	for i := 0; i < len(bookAuthors); i++ {
		outData = append(outData, &bookAuthors[i])
	}
	return outData, err
}

func UpdateBookAuthor(id int32, name, description string, imageID int32) error {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var descriptionSql sql.NullString
	err := descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Update bookAuthor failed: %s", err)
		return errors.New(stringErr)
	}

	var imageIdSql = sql.NullInt32{
		Int32: imageID,
		Valid: imageID > 0,
	}

	err = queries.UpdateBookAuthor(ctx, db.UpdateBookAuthorParams{
		ID:            id,
		Name:          name,
		Description:   descriptionSql,
		AvatarImageID: imageIdSql,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update bookAuthor failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CreateBookAuthor(name, description string, imageID int32) (*db.BookAuthor, error) {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var descriptionSql sql.NullString
	err := descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Update bookAuthor failed: %s", err)
		return nil, errors.New(stringErr)
	}

	var imageIdSql = sql.NullInt32{
		Int32: imageID,
		Valid: imageID > 0,
	}

	bookAuthor, err := queries.InsertBookAuthor(ctx, db.InsertBookAuthorParams{
		Name:          name,
		Description:   descriptionSql,
		AvatarImageID: imageIdSql,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create bookAuthor failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookAuthor, nil
}

func DeleteBookAuthor(id int32) error {
	var err error
	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteBookAuthor(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete bookAuthor failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CheckAuthorExistById(id int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.CheckAuthorExistById(ctx, id)
	if err != nil {
		return false, err
	}
	return result, nil
}

type CreateAuthor struct {
	Name        string `json:"name" form:"name" binding:"required"`
	Description string `json:"description" form:"description"`
	AvatarId    int32  `json:"avatarId" form:"avatarId"`
}

func CreateAuthorHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	
	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))
	
	check, err := queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
		Module: AuthorModule,
		Action: PostAction,
		ID:     userId,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if !check {
		ReportError(c, errors.New("permission denied"), "error", 403)
		return
	}
	
	var a CreateAuthor
	if err := c.ShouldBindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	a.Name = strings.TrimSpace(a.Name)
	if strings.Contains(a.Name, "  ") == true {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Name cannot contain two consecutive spaces",
		})
		return
	}
	if len(a.Name) > 30 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "name must be less than or equal to 30 characters",
		})
		return
	}
	for i := 0; i < len(a.Name); i++ {
		if unicode.IsControl(rune(a.Name[i])) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Name cannot contain control characters or newline characters",
			})
			return
		}
	}

	if len(a.Description) > 500 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "description must be less than or equal to 50 characters",
		})
		return
	}
	for i := 0; i < len(a.Description); i++ {
		ch := a.Description[i]
		if ch == '\r' || ch == '\n' {
			continue
		}
		if unicode.IsControl(rune(ch)) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Description cannot contain control characters",
			})
			return
		}
	}
	
	exist, err := queries.CheckAuthorExistByName(ctx, a.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if exist == true {
		c.JSON(http.StatusConflict, gin.H{
			"error": "name was exist",
		})
		return
	}

	_, err = CreateBookAuthor(a.Name, a.Description, a.AvatarId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Create Author successfully",
	})
}

type UpdateAuthor struct {
	Name        string `json:"name" form:"name"`
	Description string `json:"description" form:"description"`
	AvatarId    int32  `json:"avatar" form:"avatar"`
}

func UpdateAuthorHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))
	permAllow := false

	check, err := queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
		Module: AuthorModule,
		Action: ModifyAction,
		ID:     userId,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if !check {
		check, err = queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
			Module: AuthorModule,
			Action: ModifySelfAction,
			ID:     userId,
		})
		if err != nil {
			ReportError(c, err, "error", 500)
			return
		}
		if check {
			permAllow = true
		}
	} else {
		permAllow = true
	}
	if permAllow {
		var authorId int32
		_, err = fmt.Sscan(c.Param("authorId"), &authorId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		oldAuthor, err := BookAuthorById(authorId)
		if oldAuthor == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Author not exist",
			})
			return
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		var a UpdateAuthor
		if err := c.ShouldBindJSON(&a); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if len(a.Name) > 30 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "name must be less than or equal to 30 characters",
			})
			return
		}
		if len(a.Description) > 500 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "description must be less than or equal to 50 characters",
			})
			return
		}

		exist, err := queries.CheckAuthorExistByName(ctx, a.Name)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if exist == true {
			c.JSON(http.StatusConflict, gin.H{"error": "name was exist"})
			return
		}

		if len(a.Name) == 0 {
			a.Name = oldAuthor.Name
		}
		if len(a.Description) == 0 {
			a.Description = oldAuthor.Description.String
		}
		if a.AvatarId == 0 {
			a.AvatarId = oldAuthor.AvatarImageID.Int32
		}
		err = UpdateBookAuthor(authorId, a.Name, a.Description, a.AvatarId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Update Author successfully",
		})
	} else {
		ReportError(c, errors.New("permission denied"), "error", 403)
		return
	}
}

func DeleteAuthorHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))
	permAllow := false

	check, err := queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
		Module: AuthorModule,
		Action: DeleteAction,
		ID:     userId,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if !check {
		check, err = queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
			Module: AuthorModule,
			Action: DeleteSelfAction,
			ID:     userId,
		})
		if err != nil {
			ReportError(c, err, "error", 500)
			return
		}
		if check {
			permAllow = true
		}
	} else {
		permAllow = true
	}

	if permAllow {
		var authorId int32
		_, err = fmt.Sscan(c.Param("authorId"), &authorId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		oldAuthor, err := BookAuthorById(authorId)
		if oldAuthor == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Author not exist",
			})
			return
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err = DeleteBookAuthor(authorId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Delete Author successfully",
		})
	} else {
		ReportError(c, errors.New("permission denied"), "error", 403)
		return
	}
}

func SearchAuthorHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	searchString := c.Param("query")

	if len(searchString) == 0 || len(searchString) > 100 {
		return
	}

	var response []Author

	authors, err := queries.SearchAuthors(ctx, sql.NullString{
		String: searchString,
		Valid:  true,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	for _, author := range authors {
		response = append(response, Author{
			Name: author.Name,
			Id:   author.ID,
		})
	}

	c.JSON(200, response)
}
