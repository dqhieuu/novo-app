package server

import (
	jwt "github.com/appleboy/gin-jwt/v2"
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

	InitOauth()
	authMiddleware := AuthMiddleware()

	r.POST("/login", authMiddleware.LoginHandler)
	r.GET("/login", authMiddleware.LoginHandler)


	imageHandler := r.Group("/images")
	{
		imageHandler.POST("/upload", ReceiveImages)
		imageHandler.POST("/submit", SubmitImages)
		imageHandler.POST("/thumbnail", ServeThumbnail)
		imageHandler.GET("/:imageId", GetImageById)
	}

	r.GET("/oauth/google", GoogleOauthRedirect)

	r.NoRoute(authMiddleware.MiddlewareFunc(), func(c *gin.Context) {
		claims := jwt.ExtractClaims(c)
		log.Printf("NoRoute claims: %#v\n", claims)
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	auth := r.Group("/auth")
	auth.GET("/refresh_token", authMiddleware.RefreshHandler)

	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
