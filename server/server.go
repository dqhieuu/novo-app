package server

import (
	"context"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
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

	r.GET("/test", func(c *gin.Context){
		ctx := context.Background()
		queries := db.New(db.Pool())

		commenter, err := queries.GetCommenter(ctx, 1)
		if err != nil {
			c.JSON(500, gin.H{
				"error": err,
			})
		}
		log.Printf("%+v\n", commenter)

		var testObj BookGroup
		testObj.Authors = make([]Author, 0)
		testObj.Chapters = make([]Chapter, 0)
		c.JSON(200, testObj)
	})

	r.GET("/chapter/:chapterId", GetBookChapterContentHandler)

	r.GET("/genre/all", ListAllGenresHandler)

	r.GET("/comment", GetCommentsHandler)

	r.GET("/genre/:genreId", GetBookByGenreHandler)

	auth := r.Group("/auth")
	{
		auth.Use(authMiddleware.MiddlewareFunc())
		auth.GET("/refresh_token", authMiddleware.RefreshHandler)
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
	}
	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
