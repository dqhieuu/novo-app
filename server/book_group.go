package server

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"time"
)

const maxInt32 = 2147483647

//localhost:8080/getBookGroup?title=title1
func GetBookGroup(c *gin.Context) {
	title := c.Query("title")
	queries := db.New(db.Pool())
	data, err := queries.GetBookGroup(context.Background(), title)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, data)
}

/*
localhost:8080/getListBookGroup?limit=2
localhost:8080/getListBookGroup
*/
func GetListBookGroup(c *gin.Context) {
	var limit int32
	_, err := fmt.Sscan(c.Query("limit"), &limit)
	if err != nil {
		limit = maxInt32
		err = nil
	}
	queries := db.New(db.Pool())
	outData, err := queries.GetListBookGroup(context.Background(), limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, outData)
}

//localhost:8080/searchBookGroup?limit=3&title=t
func SearchBookGroup(c *gin.Context) {
	var limit int32
	_, err := fmt.Sscan(c.Query("limit"), &limit)
	if err != nil {
		limit = maxInt32
		err = nil
	}
	title := c.Query("title")
	queries := db.New(db.Pool())
	data, err := queries.GetListBookGroup(context.Background(), maxInt32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	fmt.Println("title", title, limit)
	var outData []db.GetListBookGroupRow
	for i := 0; i < len(data) && len(outData) < int(limit); i++ {
		if strings.Contains(data[i].Title, title) {
			outData = append(outData, data[i])
		}
	}
	fmt.Println("Output ", data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, outData)
}

/*localhost:8080/updateTitleBookGroup
{
    "new_title":"abcde",
    "old_title":"title1"
}
*/
func UpdateTitleBookGroup(c *gin.Context) {
	var data db.UpdateTitleBookGroupParams
	err := json.NewDecoder(c.Request.Body).Decode(&data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	queries := db.New(db.Pool())
	err = queries.UpdateTitleBookGroup(context.Background(), data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Update title success",
	})
}

/*
localhost:8080/updateDescBookGroup
{
    "new_description":
    {
        "String":"description1",
        "Valid":true
    },
    "title":"title1"
}
*/
func UpdateDescBookGroup(c *gin.Context) {
	var data db.UpdateDescBookGroupParams
	err := json.NewDecoder(c.Request.Body).Decode(&data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	queries := db.New(db.Pool())
	err = queries.UpdateDescBookGroup(context.Background(), data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Update description success",
	})
}

/*
localhost:8080/UpdateAuthorBookGroup
{
    "new_user_name":"usersname2",
    "title":"title1"
}
*/
func UpdateAuthorBookGroup(c *gin.Context) {
	var data db.UpdateAuthorBookGroupParams
	err := json.NewDecoder(c.Request.Body).Decode(&data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	queries := db.New(db.Pool())
	err = queries.UpdateAuthorBookGroup(context.Background(), data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Update author success",
	})
}

/*localhost:8080/createBookGroup
{
    "title":"title4",
    "description":
    {
        "String":"description4",
        "Valid":true
    },
    "owner_name":"usersname2"
}
*/
func CreateBookGroup(c *gin.Context) {
	var data db.InsertBookGroupParams
	err := json.NewDecoder(c.Request.Body).Decode(&data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	/*loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
	data.DateCreated = sql.NullTime{
		Time:  time.Now().UTC().In(loc),
		Valid: true,
	}
	fmt.Println(data.DateCreated.Time)*/

	data.DateCreated = sql.NullTime{
		Time:  time.Now().UTC(),
		Valid: true,
	}
	queries := db.New(db.Pool())
	err = queries.InsertBookGroup(context.Background(), data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Create book group success",
	})
}

/*localhost:8080/deleteBookGroup
{
    "title":"title4"
}
*/
func DeleteBookGroup(c *gin.Context) {
	var bookGroup db.BookGroup
	err := json.NewDecoder(c.Request.Body).Decode(&bookGroup)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	queries := db.New(db.Pool())
	err = queries.DeleteBookGroup(context.Background(), bookGroup.Title)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Delete book group success",
	})
}

func BookGroupRun(r *gin.Engine)  {
	r.GET("/getBookGroup",GetBookGroup)
	r.GET("/getListBookGroup",GetListBookGroup)
	r.GET("/searchBookGroup",SearchBookGroup)
	r.PUT("/updateTitleBookGroup",UpdateTitleBookGroup)
	r.PUT("/updateDescBookGroup",UpdateDescBookGroup)
	r.PUT("/UpdateAuthorBookGroup",UpdateAuthorBookGroup)
	r.POST("/createBookGroup",CreateBookGroup)
	r.DELETE("/deleteBookGroup",DeleteBookGroup)
}