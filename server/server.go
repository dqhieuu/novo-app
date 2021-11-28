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
	//imageHandler := r.Group("/images")
	//{
	//	imageHandler.POST("/upload", ReceiveImages)
	//	imageHandler.POST("/submit", SubmitImages)
	//	imageHandler.POST("/thumbnail", ServeThumbnail)
	//	imageHandler.GET("/:imageId", GetImageById)
	//}
	//
	//commentHandler := r.Group("/comments")
	//{
	//	commentHandler.POST("/add", InsertComment)
	//	commentHandler.POST("/edit", EditComment)
	//	commentHandler.DELETE("/delete", RemoveComment)
	//}
	//
	//viewsHandler := r.Group("/views")
	//{
	//	viewsHandler.POST("", InsertView)
	//	viewsHandler.GET("/week", ViewByWeek)
	//	viewsHandler.GET("/month", ViewByMonth)
	//	viewsHandler.GET("/year", ViewByYear)
	//}
	//
	//
	//r.POST("/likes", InsertLikes)
	//r.POST("/dislikes", InsertDisLikes)
	//r.GET("/likes", ReturnLikes)

	r.GET("/oauth/google", GoogleOauthRedirect)

	auth := r.Group("/auth")
	auth.Use(authMiddleware.MiddlewareFunc())

	auth.GET("/refresh_token", authMiddleware.RefreshHandler)

	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
