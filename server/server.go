package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

	//r.GET("/test/:id", func(c *gin.Context){
	//	ctx := context.Background()
	//	queries := db.New(db.Pool())
	//
	//	idString := c.Param("id")
	//	id64, err := strconv.ParseInt(idString, 10, 32)
	//	if err != nil {
	//		ReportError(c, err, "error parsing id", 500)
	//		return
	//	}
	//
	//	check, err := queries.CheckIfCommentExist(ctx, int32(id64))
	//	if err != nil {
	//		c.JSON(500, gin.H{
	//			"error": err,
	//		})
	//	}
	//	log.Printf("%+v\n", check)
	//
	//	c.JSON(200, gin.H{
	//		"message": "success",
	//	})
	//})

	r.GET("/chapter/:chapterId", GetBookChapterContentHandler)

	r.GET("/genre/all", ListAllGenresHandler)

	r.GET("/comment", GetCommentsHandler)

	r.GET("/genre/:genreId", GetBookByGenreHandler)

	r.GET("/search-suggest/:query", GetSearchSuggestionHandler)

	r.GET("/search/:query", GetSearchResultHandler)

	r.GET("/book/latest", GetLatestBookGroupsHandler)

	r.GET("/book/random", GetRandomBookGroups)

	r.GET("/book/top/:type", GetBookGroupsByViewHandler)

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
	}
	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
