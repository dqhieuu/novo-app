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
	"strconv"
	"strings"
	"unicode"
)

const limitBookGroup = 40

type BookGroup struct {
	Name            string      `json:"name"`
	Description     interface{} `json:"description"`
	Views           int64       `json:"views"`
	LikeCount       int64       `json:"likeCount"`
	DislikeCount    int64       `json:"dislikeCount"`
	Authors         []Author    `json:"authors"`
	Genres          []Genre     `json:"genres"`
	Chapters        []Chapter   `json:"chapters"`
	CoverArts       []string    `json:"coverArts"`
	PrimaryCoverArt interface{} `json:"primaryCoverArt"`
}

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

func UpdateBookGroup(id int32, input *InputBookGroup) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.UpdateBookGroup(ctx, db.UpdateBookGroupParams{
		ID:    id,
		Title: input.Title,
		Description: sql.NullString{
			String: input.Description,
			Valid:  input.Description != "",
		},
		PrimaryCoverArtID: sql.NullInt32{
			Int32: input.PrimaryCoverArtId,
			Valid: input.PrimaryCoverArtId != 0,
		},
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}

	if input.GenreIds != nil {
		err = DeleteGenresByBookGroup(id)
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
		for i := 0; i < len(input.GenreIds); i++ {
			_, err = CreateBookGroupGenre(id, input.GenreIds[i])
			if err != nil {
				stringErr := fmt.Sprintf("Update book group failed: %s", err)
				return errors.New(stringErr)
			}
		}
	}

	if input.AuthorIds != nil {
		err = DeleteAuthorsByBookGroup(id)
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
		for i := 0; i < len(input.AuthorIds); i++ {
			_, err = CreateBookGroupAuthor(id, input.AuthorIds[i])
			if err != nil {
				stringErr := fmt.Sprintf("Update book group failed: %s", err)
				return errors.New(stringErr)
			}
		}
	}

	if input.CoverArtIds != nil {
		err = DeleteCoverOfBookGroup(id)
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
		for i := 0; i < len(input.CoverArtIds); i++ {
			_, err = CreateBookGroupArt(id, input.CoverArtIds[i])
			if err != nil {
				stringErr := fmt.Sprintf("Update book group failed: %s", err)
				return errors.New(stringErr)
			}
		}
	}
	return nil
}

func CreateBookGroup(input *InputBookGroup) (*db.BookGroup, error) {
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

func GetBookGroupContentHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupId := c.Param("bookGroupId")
	bookGroupId64, err := strconv.ParseInt(bookGroupId, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing book group id", 500)
		return
	}

	var responseObject BookGroup
	bookGroup, err := BookGroupById(int32(bookGroupId64))

	if err != nil {
		ReportError(c, err, "error getting book group", 500)
		return
	}

	if bookGroup.ID == 0 {
		ReportError(c, err, "book group does not exist", http.StatusBadRequest)
		return
	} else {
		//get name and description
		responseObject.Name = bookGroup.Title
		if bookGroup.Description.Valid {
			responseObject.Description = bookGroup.Description.String
		}

		//get views
		totalViews, err := queries.GetBookGroupView(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting total view", 500)
			return
		}
		responseObject.Views = totalViews.(int64)

		//get likes
		totalLikes, err := queries.GetLikes(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting likes", 500)
			return
		}
		responseObject.LikeCount = totalLikes.(int64)

		//get dislikes
		totalDislikes, err := queries.GetDislikes(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting dislikes", 500)
			return
		}
		responseObject.DislikeCount = -totalDislikes.(int64)

		//get authors
		authors, err := queries.GetBookGroupAuthors(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting authors", 500)
			return
		}
		if len(authors) > 0 {
			for _, author := range authors {
				responseObject.Authors = append(responseObject.Authors, Author{
					Name: author.Name,
					Id:   author.ID,
				})
			}
		} else {
			responseObject.Authors = make([]Author, 0)
		}

		//get genres
		genres, err := queries.GetBookGroupGenres(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting book group genres", 500)
			return
		}
		if len(genres) > 0 {
			for _, genre := range genres {
				responseObject.Genres = append(responseObject.Genres, Genre{
					Id:   genre.ID,
					Name: genre.Name,
				})
			}
		} else {
			responseObject.Genres = make([]Genre, 0)
		}

		//get chapters
		chapters, err := queries.GetBookGroupChapters(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting book group chapters", 500)
			return
		}
		if len(chapters) > 0 {
			for _, chapter := range chapters {
				resChapter := Chapter{
					ChapterNumber: chapter.ChapterNumber,
					Id:            chapter.Chapterid,
					TimePosted:    chapter.DateCreated.UnixMicro(),
					UserPosted: Author{
						Id:   chapter.Userid,
						Name: chapter.UserName.String,
					},
				}
				if chapter.Name.Valid {
					resChapter.Name = chapter.Name.String
				}
				responseObject.Chapters = append(responseObject.Chapters, resChapter)
			}
		} else {
			responseObject.Chapters = make([]Chapter, 0)
		}

		//get cover arts
		coverArts, err := queries.GetBookGroupCoverArts(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting cover arts", 500)
			return
		}
		if len(coverArts) > 0 {
			for _, imagePath := range coverArts {
				responseObject.CoverArts = append(responseObject.CoverArts, imagePath)
			}
		} else {
			responseObject.CoverArts = make([]string, 0)
		}

		//get primary cover art
		check, err := queries.CheckImageExistById(ctx, bookGroup.PrimaryCoverArtID.Int32)
		if err != nil {
			ReportError(c, err, "internal error", 500)
			return
		}
		if check {
			primaryCoverArt, err := queries.GetImageBasedOnId(ctx, bookGroup.PrimaryCoverArtID.Int32)
			if err != nil {
				ReportError(c, err, "error getting primary art", 500)
				return
			}
			responseObject.PrimaryCoverArt = primaryCoverArt.Path
		}
	}

	c.JSON(200, responseObject)
}

type BookByGenreHandler struct {
	Id            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Title         string      `json:"title"`
	LatestChapter interface{} `json:"latestChapter"`
	Comments      int32       `json:"comments"`
	Views         int64       `json:"views"`
	Likes         int64       `json:"likes"`
}

func GetBookByGenreHandler(c *gin.Context) {

	var genreId int32
	_, err := fmt.Sscan(c.Param("genreId"), &genreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var page int32
	stringTmp := c.Query("page")
	if len(stringTmp) > 0 {
		_, err = fmt.Sscan(stringTmp, &page)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		page = 1
	}

	books, err := BookGroupsByGenre(genreId, page)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error get books": err.Error()})
		return
	}
	if *books == nil {
		books = &[]db.BookGroupsByGenreRow{}
	}

	var latestPage interface{}
	tmp, err := NumberBookGroupInGenre(genreId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error get latestPage": err.Error()})
		return
	}
	if tmp > 0 {
		latestPage = (tmp-1)/limitBookGroup + 1
	} else {
		latestPage = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"latestPage": latestPage,
		"books":      *books,
	})
}

type InputBookGroup struct {
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
	var bookGroup InputBookGroup
	bookGroup.OwnerId = int32(claims[UserIdClaimKey].(float64))

	if err := c.ShouldBindJSON(&bookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//fmt.Println("Title before ", bookGroup.Title)
	//fmt.Println("Description before ", bookGroup.Description)
	//fmt.Println("AuthorIds before ", bookGroup.AuthorIds)
	//fmt.Println("GenreIds before ", bookGroup.GenreIds)
	//fmt.Println("CoverArtIds before ", bookGroup.CoverArtIds)
	//fmt.Println("PrimaryCoverArtId before ", bookGroup.PrimaryCoverArtId)
	//fmt.Println("OwnerId before ", bookGroup.OwnerId)
	if err := ValidTitle(&bookGroup.Title); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//fmt.Println("Title after ", bookGroup.Title)
	if err := ValidDescription(&bookGroup.Description); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//fmt.Println("Description after ", bookGroup.Description)
	ValidAuthors(&bookGroup.AuthorIds)
	//fmt.Println("AuthorIds after ", bookGroup.AuthorIds)
	ValidGenres(&bookGroup.GenreIds)
	//fmt.Println("GenreIds after ", bookGroup.GenreIds)
	ValidCoverArt(&bookGroup.CoverArtIds)
	//fmt.Println("CoverArtIds after ", bookGroup.CoverArtIds)
	ValidPrimaryCoverArtId(&bookGroup.PrimaryCoverArtId, &bookGroup.CoverArtIds)
	//fmt.Println("PrimaryCoverArtId after ", bookGroup.PrimaryCoverArtId)
	if _, err := CreateBookGroup(&bookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
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
	if length > 0 {
		*PrimaryCoverArtId = (*coverArtIds)[length-1]
	} else {
		*PrimaryCoverArtId = 0
	}
}

func GetSearchSuggestionHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	query := c.Param("query")
	books, err := queries.SearchSuggestion(ctx, sql.NullString{
		String: query,
		Valid:  true,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if books == nil {
		books = []db.SearchSuggestionRow{}
	}
	c.JSON(http.StatusOK, gin.H{"books": books})
}

func GetSearchResultHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	query := c.Param("query")

	var page int32
	stringTmp := c.Query("page")
	if len(stringTmp) > 0 {
		_, err := fmt.Sscan(stringTmp, &page)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		page = 1
	}
	if page < 1 {
		page = 1
	}

	books, err := queries.SearchResult(ctx, db.SearchResultParams{
		Query: sql.NullString{
			String: query,
			Valid:  true,
		},
		Offset: (page - 1) * limitBookGroup,
		Limit:  limitBookGroup,
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if books == nil {
		books = []db.SearchResultRow{}
	}

	var latestPage interface{}
	tmp, err := queries.NumberBookGroupSearchResult(ctx, sql.NullString{
		String: query,
		Valid:  true,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error get latestPage": err.Error()})
		return
	}
	if tmp > 0 {
		latestPage = (tmp-1)/limitBookGroup + 1
	} else {
		latestPage = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"latestPage": latestPage,
		"books":      books,
	})
}

func GetLatestBookGroupsHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	var page int32
	stringTmp := c.Query("page")
	if len(stringTmp) > 0 {
		_, err := fmt.Sscan(stringTmp, &page)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		page = 1
	}
	if page < 1 {
		page = 1
	}

	var limit int32
	stringTmp = c.Query("limit")
	if len(stringTmp) > 0 {
		_, err := fmt.Sscan(stringTmp, &limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		limit = 20
	}

	if limit < 10 || limit > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be between 10 and 100",
		})
		return
	}

	books, err := queries.LatestBookGroups(ctx, db.LatestBookGroupsParams{
		Offset: (page - 1) * limit,
		Limit:  limit,
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if books == nil {
		books = []db.LatestBookGroupsRow{}
	}

	var latestPage interface{}
	tmp, err := queries.NumberBookGroup(ctx)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error get latestPage": err.Error()})
		return
	}
	if tmp > 0 {
		latestPage = (int32(tmp)-1)/limit + 1
	} else {
		latestPage = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"latestPage": latestPage,
		"books":      books,
	})
}

func GetRandomBookGroups(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	var limit int32
	stringTmp := c.Query("limit")
	if len(stringTmp) > 0 {
		_, err := fmt.Sscan(stringTmp, &limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		limit = 20
	}

	if limit < 10 || limit > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be between 10 and 100",
		})
		return
	}

	books, err := queries.RandomBookGroups(ctx, limit)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if books == nil {
		books = []db.RandomBookGroupsRow{}
	}

	c.JSON(http.StatusOK, gin.H{
		"books": books,
	})
}

func Clamp(input, min, max int32) int32 {
	if input < min {
		return min
	}
	if input > max {
		return max
	}
	return input
}

const (
	WeekView  = "week"
	MonthView = "month"
	YearView  = "year"
	AllView   = "all"
)

func GetBookGroupsByViewHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	var limit int32
	stringTmp := c.Query("limit")
	if len(stringTmp) > 0 {
		_, err := fmt.Sscan(stringTmp, &limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		limit = 20
	}
	limit = Clamp(limit, 10, 100)

	typeView := c.Param("type")
	switch typeView {
	case WeekView:
		books, err := queries.BookGroupsTopViewWeek(ctx, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		if books == nil {
			books = []db.BookGroupsTopViewWeekRow{}
		}
		c.JSON(http.StatusOK, gin.H{
			"books": books,
		})
	case MonthView:
		books, err := queries.BookGroupsTopViewMonth(ctx, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		if books == nil {
			books = []db.BookGroupsTopViewMonthRow{}
		}
		c.JSON(http.StatusOK, gin.H{
			"books": books,
		})
	case YearView:
		books, err := queries.BookGroupsTopViewYear(ctx, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		if books == nil {
			books = []db.BookGroupsTopViewYearRow{}
		}
		c.JSON(http.StatusOK, gin.H{
			"books": books,
		})
	case AllView:
		books, err := queries.BookGroupsTopViewAll(ctx, limit)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
		if books == nil {
			books = []db.BookGroupsTopViewAllRow{}
		}
		c.JSON(http.StatusOK, gin.H{
			"books": books,
		})
	default:
		c.JSON(http.StatusNotAcceptable, gin.H{
			"error": "invalid type view",
		})
		return
	}
}

func DeleteBookGroupHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupIdString := c.Param("bookGroupId")
	bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing book group id", http.StatusBadRequest)
		return
	}

	bookId := int32(bookGroupId64)

	check, err := queries.CheckBookGroupById(ctx, bookId)
	if err != nil {
		ReportError(c, err, "error getting book group", 500)
		return
	}

	if !check {
		ReportError(c, errors.New("book group does not exist"), "error", http.StatusBadRequest)
		return
	} else {
		err := queries.DeleteBookGroup(ctx, bookId)
		if err != nil {
			ReportError(c, err, "error deleting book group", 500)
			return
		}
	}

	c.JSON(200, gin.H{
		"message": "delete successful",
	})
}

func UpdateBookGroupHandler(c *gin.Context) {
	var bookGroupId int32
	_, err := fmt.Sscan(c.Param("bookGroupId"), &bookGroupId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := context.Background()
	queries := db.New(db.Pool())
	oldBookGroup, err := queries.BookGroupById(ctx, bookGroupId)
	if oldBookGroup == (db.BookGroup{}) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Book group does exist",
		})
		return
	} else if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var newBookGroup InputBookGroup
	if err = c.ShouldBindJSON(&newBookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if newBookGroup.Title == "" {
		newBookGroup.Title = oldBookGroup.Title
	}
	if newBookGroup.Description == "" {
		newBookGroup.Description = oldBookGroup.Description.String
	}

	if err = ValidTitle(&newBookGroup.Title); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err = ValidDescription(&newBookGroup.Description); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ValidAuthors(&newBookGroup.AuthorIds)
	ValidGenres(&newBookGroup.GenreIds)
	if newBookGroup.CoverArtIds != nil {
		ValidCoverArt(&newBookGroup.CoverArtIds)
		ValidPrimaryCoverArtId(&newBookGroup.PrimaryCoverArtId, &newBookGroup.CoverArtIds)
	} else {
		oldCoverIds, err := queries.GetCoverIdsOfBookGroup(ctx, bookGroupId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ValidPrimaryCoverArtId(&newBookGroup.PrimaryCoverArtId, &oldCoverIds)
	}

	if err = UpdateBookGroup(bookGroupId, &newBookGroup); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Update book group successfully",
	})
}
