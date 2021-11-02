package main

import (
	"github.com/dqhieuu/novo-app/v2/server"
	"github.com/gin-gonic/gin"
)

func main() {
	server.Hello()
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}