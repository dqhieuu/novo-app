package server

import (
	"encoding/json"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
)

func Run() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.GET("/test", func(c *gin.Context) {
		tests, _ := db.New(db.Pool()).ListTests(c)
		res, _ := json.Marshal(tests)

		c.JSON(200, gin.H{
			"message": string(res),
		})
	})

	_ = r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
