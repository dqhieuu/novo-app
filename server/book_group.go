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

const limitBookGroup = 50

func BookGroupById(id int32) (*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	data, err := queries.BookGroupById(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Get book group by id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &data, err
}

func BookGroupsByTitle(title string, page int32) ([]*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.BookGroupsByTitle(ctx, db.BookGroupsByTitleParams{
		Column1: sql.NullString{
			String: title,
			Valid:  true, // chuỗi rỗng sẽ liệt kê tất cả
		},
		Offset: (page - 1) * limitBookGroup,
		Limit:  limitBookGroup,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by title failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.BookGroup
	for i := 0; i < len(bookGroups); i++ {
		outData = append(outData, &bookGroups[i])
	}
	return outData, err
}

func UpdateBookGroup(id int32, title string, description string, ownerId int32, genreIds []int32, authorIds []int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.UpdateBookGroup(ctx, db.UpdateBookGroupParams{
		ID:    id,
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
		OwnerID: ownerId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteGenresByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}
	for i := 0; i < len(genreIds); i++ {
		_, err = CreateBookGroupGenre(id, genreIds[i])
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
	}

	err = DeleteAuthorsByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}
	for i := 0; i < len(authorIds); i++ {
		_, err = CreateBookGroupAuthor(id, authorIds[i])
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
	}

	return nil
}

func CreateBookGroup(input *CreateBookGroupParams) (*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroup, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title: input.Title,
		Description: sql.NullString{
			String: input.Description,
			Valid:  input.Description != "",
		},
		OwnerID: input.OwnerId,
		PrimaryCoverArtID: sql.NullInt32{
			Int32: input.PrimaryCoverArtId,
			Valid: input.PrimaryCoverArtId != 0,
		},
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book group failed: %s", err)
		return nil, errors.New(stringErr)
	}
	for i := 0; i < len(input.GenreIds); i++ {
		_, err = CreateBookGroupGenre(bookGroup.ID, input.GenreIds[i])
		if err != nil {
			return nil, err
		}
	}

	for i := 0; i < len(input.AuthorIds); i++ {
		_, err = CreateBookGroupAuthor(bookGroup.ID, input.AuthorIds[i])
		if err != nil {
			return nil, err
		}
	}

	for i := 0; i < len(input.CoverArtIds); i++ {
		_, err = CreateBookGroupArt(bookGroup.ID, input.CoverArtIds[i])
		if err != nil {
			return nil, err
		}
	}

	return &bookGroup, nil
}

func DeleteBookGroup(id int32) error {
	err := DeleteGenresByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteAuthorsByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteBookChapterByBookGroupId(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteBookGroup(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

type CreateBookGroupParams struct {
	Title             string  `json:"name" form:"name"`
	Description       string  `json:"description" form:"description"`
	AuthorIds         []int32 `json:"authors" form:"authors"`
	GenreIds          []int32 `json:"genres" form:"genres"`
	CoverArtIds       []int32 `json:"coverArts" form:"coverArts"`
	PrimaryCoverArtId int32   `json:"primaryCoverArt" form:"primaryCoverArt"`
	OwnerId           int32   `json:"owner" form:"owner"`
}

func CreateBookGroupHandler(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	var bookGroup CreateBookGroupParams
	bookGroup.OwnerId = int32(claims[UserIdClaimKey].(float64))

	if err := c.ShouldBindJSON(&bookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("Title before ", bookGroup.Title)
	fmt.Println("Description before ", bookGroup.Description)
	fmt.Println("AuthorIds before ", bookGroup.AuthorIds)
	fmt.Println("GenreIds before ", bookGroup.GenreIds)
	fmt.Println("CoverArtIds before ", bookGroup.CoverArtIds)
	fmt.Println("PrimaryCoverArtId before ", bookGroup.PrimaryCoverArtId)
	fmt.Println("OwnerId before ", bookGroup.OwnerId)
	if err := ValidTitle(&bookGroup.Title); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("Title after ", bookGroup.Title)
	if err := ValidDescription(&bookGroup.Description); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("Description after ", bookGroup.Description)
	ValidAuthors(&bookGroup.AuthorIds)
	fmt.Println("AuthorIds after ", bookGroup.AuthorIds)
	ValidGenres(&bookGroup.GenreIds)
	fmt.Println("GenreIds after ", bookGroup.GenreIds)
	ValidCoverArt(&bookGroup.CoverArtIds)
	fmt.Println("CoverArtIds after ", bookGroup.CoverArtIds)
	ValidPrimaryCoverArtId(&bookGroup.PrimaryCoverArtId, &bookGroup.CoverArtIds)
	if _, err := CreateBookGroup(&bookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("PrimaryCoverArtId after ", bookGroup.PrimaryCoverArtId)
	c.JSON(http.StatusOK, gin.H{
		"message": "Create book group successfully",
	})
}

func ValidTitle(title *string) error {
	*title = strings.TrimSpace(*title)
	if len(*title) < 1 {
		stringErr := fmt.Sprintf("Name must be more than 1 character")
		return errors.New(stringErr)
	}
	for i := 0; i < len(*title); i++ {
		c := (*title)[i]
		if unicode.IsControl(rune(c)) {
			stringErr := fmt.Sprintf("Name cannot contain control characters or newline characters")
			return errors.New(stringErr)
		}
	}
	if len(*title) > 200 {
		*title = (*title)[0:200]
	}
	return nil
}
func ValidDescription(description *string) error {
	if description == nil {
		return nil
	}
	if len(*description) > 500 {
		*description = (*description)[0:500]
	}
	for i := 0; i < len(*description); i++ {
		c := (*description)[i]
		if c == '\r' || c == '\n' {
			continue
		}
		if unicode.IsControl(rune(c)) {
			stringErr := fmt.Sprintf("Description cannot contain control characters")
			return errors.New(stringErr)
		}
	}
	return nil
}

func ValidAuthors(authorIds *[]int32) {
	if authorIds == nil {
		return
	}
	check := make(map[int32]bool)
	top := 0
	for i := 0; i < len(*authorIds); i++ {
		authorId := (*authorIds)[i]
		if check[authorId] == true { //nếu trùng thì bỏ qua
			continue
		}
		check[authorId] = true
		result, _ := CheckAuthorExistById(authorId)
		if result == false { //nếu không tồn tại thì bỏ qua
			continue
		}
		(*authorIds)[top] = authorId // top là số phẩn tử còn lại, top luôn luôn <=i
		top++
	}
	*authorIds = (*authorIds)[0:top]
}

func ValidGenres(genreIds *[]int32) {
	check := make(map[int32]bool)
	top := 0
	for i := 0; i < len(*genreIds); i++ {
		genreId := (*genreIds)[i]
		if check[genreId] == true { //nếu trùng thì bỏ qua
			continue
		}
		check[genreId] = true
		result, _ := CheckGenreExistById(genreId)
		if result == false { //nếu không tồn tại thì bỏ qua
			continue
		}
		(*genreIds)[top] = genreId // top là số phẩn tử còn lại, top luôn luôn <=i
		top++
	}
	*genreIds = (*genreIds)[0:top]
}

func ValidCoverArt(coverArtIds *[]int32) {
	check := make(map[int32]bool)
	top := 0
	for i := 0; i < len(*coverArtIds); i++ {
		coverArtId := (*coverArtIds)[i]
		if check[coverArtId] == true { //nếu trùng thì bỏ qua
			continue
		}
		check[coverArtId] = true
		result, _ := CheckImageExistById(coverArtId)
		if result == false { //nếu không tồn tại thì bỏ qua
			continue
		}
		(*coverArtIds)[top] = coverArtId // top là số phẩn tử còn lại, top luôn luôn <=i
		top++
	}
	*coverArtIds = (*coverArtIds)[0:top]
}
func ValidPrimaryCoverArtId(PrimaryCoverArtId *int32, coverArtIds *[]int32) {
	var found = false
	var length = len(*coverArtIds)
	for i := 0; i < length; i++ {
		if (*PrimaryCoverArtId) == (*coverArtIds)[i] {
			found = true
		}
	}
	if found == true {
		return
	}
	if length > 1 {
		*PrimaryCoverArtId = (*coverArtIds)[length-1]
	}
}
