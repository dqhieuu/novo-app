package server

import (
	"context"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func Run() {
	r := gin.Default()

	// Global middleware
	// Logger middleware will write the logs to gin.DefaultWriter even if you set with GIN_MODE=release.
	// By default gin.DefaultWriter = os.Stdout
	r.Use(gin.Logger())

	// Recovery middleware recovers from any panics and writes a 500 if there was one.
	r.Use(gin.Recovery())

	// CORS middleware allows cross-origin requests
	r.Use(cors.Default())

	InitOauth()

	// Auth middleware
	authMiddleware := AuthMiddleware()

	// For Password login
	r.POST("/login", authMiddleware.LoginHandler)
	// For Oauth login
	r.GET("/login", authMiddleware.LoginHandler)

	r.POST("/register", RegisterPasswordHandler)

	r.GET("/oauth/google", GoogleOauthRedirect)

	r.POST("/auth/upload/:imageType", UploadImageHandler)
	r.Static("/image", "static/images")

	r.GET("/test", func(c *gin.Context) {

		err := db.New(db.Pool()).UpsertViewByDate(context.Background(), db.UpsertViewByDateParams{
			BookChapterID: 1,
			ViewDate:      time.Now(),
		})

		if err != nil {
			ReportError(c, err, "error", 500)
			return
		}

		c.JSON(200, gin.H{
			"message": "success",
		})
	})

	r.GET("/chapter/:chapterId", GetBookChapterContentHandler)
	r.GET("/genre/all", ListAllGenresHandler)
	r.GET("/comment", GetCommentsHandler)
	r.GET("/genre/:genreId", GetBookByGenreHandler)
	r.GET("/search-suggest/:query", GetSearchSuggestionHandler)
	r.GET("/search/:query", GetSearchResultHandler)
	r.GET("/book/latest", GetLatestBookGroupsHandler)
	r.GET("/book/random", GetRandomBookGroups)
	r.GET("/user/:userId", GetUserInfoByIdHandler)
	r.GET("/book/top/:type", GetBookGroupsByViewHandler)

	r.GET("/author/:authorId", GetAuthorInfoHandler)

	auth := r.Group("/auth")
	{
		auth.Use(authMiddleware.MiddlewareFunc())
		auth.POST("/refresh-token", authMiddleware.RefreshHandler)
		auth.POST("/logout", authMiddleware.LogoutHandler)
		auth.GET("/role", GetRoleHandler)
		auth.POST("/author", CreateAuthorHandler)
		auth.PATCH("/author/:authorId", UpdateAuthorHandler)
		auth.DELETE("/author/:authorId", DeleteAuthorHandler)
		auth.POST("/complete-oauth-register", CompleteOauthAccountHandler)
		auth.POST("/book", CreateBookGroupHandler)
		auth.POST("/chapter/hypertext", CreateHypertextChapterHandler)
		auth.POST("/chapter/images", CreateImagesChapterHandler)
		auth.POST("/comment", CreateCommentHandler)
		auth.GET("/book/:bookGroupId", GetBookGroupContentHandler)
		auth.DELETE("chapter/:chapterId", DeleteBookChapterHandler)
		auth.DELETE("/comment/:commentId", DeleteCommentHandler)
		auth.PATCH("/comment/:commentId", EditCommentHandler)
		auth.POST("/like/:bookGroupId/:operation", LikeOperationHandler)
		auth.DELETE("/book/:bookGroupId", DeleteBookGroupHandler)
		auth.PATCH("/book/:bookGroupId", UpdateBookGroupHandler)
		auth.PATCH("/chapter/hypertext/:chapterId", UpdateHypertextChapter)
		auth.PATCH("/chapter/images/:chapterId", UpdateImagesChapterHandler)
	}
	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
