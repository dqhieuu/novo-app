package server

import (
	"github.com/gin-gonic/gin"
	"log"
	"regexp"
	"strings"
)

func HasControlCharacters(content string) bool {
	hasInvalidChars, _ := regexp.MatchString(`[\x00-\x1F\x7F]`, content)
	if hasInvalidChars {
		return true
	}
	return false
}

func CheckEmptyString(content string) bool {
	if len(strings.TrimSpace(content)) == 0 {
		return true
	}
	return false
}

func ReportError(c *gin.Context, err error, message string, code int) {
	log.Printf("%s: %s\n", message, err)
	c.JSON(code, gin.H{
		"error": err.Error(),
	})
}
