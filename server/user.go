package server

import (
	"context"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"net/mail"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const LimitUserBookGroups = 20

type UserInfo struct {
	Role       string        `json:"role" binding:"required"`
	Permission []interface{} `json:"permission" binding:"required"`
	Id         int32         `json:"id" binding:"required"`
	Name       interface{}   `json:"name"`
	Avatar     interface{}   `json:"avatar"`
	Email      string        `json:"email" binding:"required"`
}

type UserProfile struct {
	Name        string       `json:"name"`
	Role        string       `json:"role"`
	Avatar      interface{}  `json:"avatar"`
	Description interface{}  `json:"description"`
	BookPosted  []BookByUser `json:"bookPosted"`
}

type BookByUser struct {
	Id            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Title         string      `json:"title"`
	LatestChapter interface{} `json:"latestChapter"`
	Comments      int64       `json:"comments"`
	Views         int64       `json:"views"`
	Likes         int64       `json:"likes"`
	LastUpdated   interface{} `json:"lastUpdated"`
}

type User struct {
	Name  string      `json:"name" binding:"required"`
	Id    int32       `json:"id" binding:"required"`
	Image interface{} `json:"image"`
}

type ChangePassword struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}

type ChangeUserInfo struct {
	Email       interface{} `json:"email"`
	Username    interface{} `json:"username"`
	Description interface{} `json:"description"`
}

func EqualPasswords(hashedPassword, password []byte) bool {
	return bcrypt.CompareHashAndPassword(hashedPassword, password) == nil
}

func GeneratePasswordHash(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func ValidPassword(password string) bool {
	hasInvalidChars, _ := regexp.MatchString(`[\x00-\x1F\x7F\r\n]`, password)
	if hasInvalidChars == true {
		return false
	}
	validPassword, _ := regexp.MatchString(`^.{8,50}$`, password)
	return validPassword
}

func ValidUsername(username string) bool {
	hasInvalidChars, _ := regexp.MatchString(` [\x00-\x1F\x7F\r\n]`, username)
	if hasInvalidChars == true {
		return false
	}

	hasInvalidChars, _ = regexp.MatchString(`\s{2}`, username)
	if hasInvalidChars == true {
		return false
	}
	validUsername, _ := regexp.MatchString(`^.{6,20}$`, username)
	return validUsername
}

func createAccount(username, password, email, roleName string) (*db.User, *db.RoleRow, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	username = strings.TrimSpace(username)
	email = strings.TrimSpace(email)
	if _, err := mail.ParseAddress(email); err != nil {
		return nil, nil, errors.New(fmt.Sprintf(`invalid email address: "%s"`, email))
	}

	if !ValidUsername(username) {
		return nil, nil, errors.New(fmt.Sprintf(`invalid user name: "%s"`, username))
	}

	if !ValidPassword(password) {
		return nil, nil, errors.New(fmt.Sprintf(`invalid password: "%s"`, password))
	}

	hashedPassword, err := GeneratePasswordHash(password)
	if err != nil {
		return nil, nil, errors.New(fmt.Sprintf("error while generating password: %s", err))
	}

	user, err := queries.InsertUser(ctx, db.InsertUserParams{
		UserName: sql.NullString{String: username, Valid: true},
		Password: sql.NullString{String: hex.EncodeToString(hashedPassword), Valid: true},
		Email:    email,
		RoleName: roleName,
	})
	if err != nil {
		return nil, nil, errors.New(fmt.Sprintf("creating new user failed: %s", err))
	}

	role, err := queries.Role(ctx, user.RoleID)
	if err != nil {
		return nil, nil, err
	}

	return &user, &role, nil
}

func UserByLoginInfo(loginInfo PasswordLogin) (*db.User, *db.RoleRow, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	user, err := queries.UserByUsernameOrEmail(ctx, sql.NullString{String: loginInfo.UsernameOrEmail, Valid: true})
	if err != nil {
		return nil, nil, errors.New("user not found")
	}

	hexPassword := user.Password

	if !hexPassword.Valid {
		return nil, nil, errors.New("can't access oauth user (having a nullable password)")
	}

	passwordHash, err := hex.DecodeString(hexPassword.String)
	if err != nil {
		return nil, nil, err
	}

	if !EqualPasswords(passwordHash, []byte(loginInfo.Password)) {
		return nil, nil, errors.New("incorrect password")
	}

	role, err := queries.Role(ctx, user.RoleID)
	if err != nil {
		return nil, nil, err
	}

	return &user, &role, nil
}

func RegisterAccount(username, password, email string) (*db.User, *db.RoleRow, error) {
	return createAccount(username, password, email, "member")
}

func DeleteAccount(username string) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteUser(ctx, sql.NullString{String: username, Valid: true})

	if err != nil {
		return errors.New(fmt.Sprintf(`Failed to delete account "%s": %s`, username, err))
	}
	return nil
}

type Register struct {
	Username string `json:"username" form:"username" binding:"required"`
	Password string `json:"password" form:"password" binding:"required"`
	Email    string `json:"email" form:"email" binding:"required"`
}

func RegisterPasswordHandler(c *gin.Context) {
	var r Register
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(r.Username) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Username must be at least 6 characters",
		})
		return
	}
	if r.Username[0] == ' ' {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Username cannot start with a space",
		})
		return
	}

	if strings.Contains(r.Username, "  ") == true {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Username cannot contain two consecutive spaces",
		})
		return
	}

	if len(r.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Password must be at least 8 characters",
		})
		return
	}
	_, _, err := RegisterAccount(r.Username, r.Password, r.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Register successfully",
	})
}
func GetRoleHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	claims := jwt.ExtractClaims(c)
	var userInfo UserInfo
	userId := int32(claims[UserIdClaimKey].(float64))

	user, err := queries.GetUserInfo(ctx, userId)
	if err != nil {
		ReportError(c, err, "error getting user info", 500)
		return
	}

	userInfo.Role = claims[RoleNameClaimKey].(string)
	userInfo.Permission = claims[RolePermsClaimKey].([]interface{})
	userInfo.Id = userId
	if user.Avatarpath.Valid {
		userInfo.Avatar = user.Avatarpath.String
	}
	if user.UserName.Valid {
		userInfo.Name = user.UserName.String
	}
	userInfo.Email = user.Email

	c.JSON(200, userInfo)
}

func GetUserInfoByIdHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	userIdString := c.Param("userId")
	userId64, err := strconv.ParseInt(userIdString, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing user id", http.StatusBadRequest)
		return
	}
	userId := int32(userId64)

	var userProfile UserProfile

	userInfo, err := queries.GetUserInfo(ctx, userId)
	if err != nil {
		ReportError(c, err, "error getting user info", 500)
		return
	}

	if userInfo.UserName.Valid {
		userProfile.Name = userInfo.UserName.String
	}
	userProfile.Role = userInfo.Role
	if userInfo.Summary.Valid {
		userProfile.Description = userInfo.Summary.String
	}
	if userInfo.Avatarpath.Valid {
		userProfile.Avatar = userInfo.Avatarpath.String
	}

	bookGroups, err := queries.BookGroupsByUser(ctx, userId)
	if err != nil {
		ReportError(c, err, "error getting user book groups", 500)
		return
	}
	if len(bookGroups) == 0 {
		userProfile.BookPosted = make([]BookByUser, 0)
	} else {
		for _, book := range bookGroups {
			newBook := BookByUser{
				Id:       book.ID,
				Title:    book.Title.(string),
				Comments: book.Comments,
				Views:    book.Views.(int64),
				Likes:    book.Likes.(int64),
			}
			if book.Image != nil {
				newBook.Image = book.Image
			}
			if book.LatestChapter != nil {
				newBook.LatestChapter = book.LatestChapter
			}
			if book.LastUpdated != nil {
				newBook.LastUpdated = book.LastUpdated.(time.Time).UnixMicro()
			} else {
				bookRowForDateCreated, err := queries.BookGroupById(ctx, book.ID)
				if err != nil {
					ReportError(c, err, "error getting book group", 500)
					return
				}
				newBook.LastUpdated = bookRowForDateCreated.DateCreated.Time.UnixMicro()
			}
			userProfile.BookPosted = append(userProfile.BookPosted, newBook)
		}
	}
	c.JSON(200, userProfile)
}

func SearchUserHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	keyword := c.Param("query")

	if len(keyword) == 0 || len(keyword) > 100 {
		return
	}

	var response []User

	users, err := queries.SearchUsers(ctx, sql.NullString{
		String: keyword,
		Valid:  true,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	for _, user := range users {
		var userInfo User
		userInfo.Name = user.UserName.String
		userInfo.Id = user.ID
		if user.Path.Valid {
			userInfo.Image = user.Path.String
		}
		response = append(response, userInfo)
	}

	c.JSON(200, response)
}

func ChangeCurrentUserPasswordHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	var editPass ChangePassword
	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))

	user, err := queries.GetUserInfo(ctx, userId)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	err = c.ShouldBindJSON(&editPass)
	if err != nil {
		ReportError(c, err, "error", http.StatusBadRequest)
		return
	}

	hexPassword := user.Password
	if !hexPassword.Valid {
		ReportError(c, errors.New("can not get user password"), "error", http.StatusBadRequest)
		return
	}

	bytePassword, err := hex.DecodeString(hexPassword.String)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	if !EqualPasswords(bytePassword, []byte(editPass.OldPassword)) {
		ReportError(c, errors.New("password does not exist"), "error", http.StatusBadRequest)
		return
	}

	if !ValidPassword(editPass.NewPassword) {
		ReportError(c, errors.New("invalid password"), "error", http.StatusBadRequest)
		return
	}

	hashedPassword, err := GeneratePasswordHash(editPass.NewPassword)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	err = queries.UpdatePassword(ctx, db.UpdatePasswordParams{
		ID: userId,
		Password: sql.NullString{
			String: hex.EncodeToString(hashedPassword),
			Valid:  true,
		},
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}

	c.JSON(200, gin.H{
		"message": "change password successful",
	})
}

func ChangeCurrentUserInfoHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))

	user, err := queries.GetUserInfo(ctx, userId)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if user.ID == 0 {
		ReportError(c, errors.New("user is not authorized"), "error", 403)
		return
	}

	var newUserInfo ChangeUserInfo
	err = c.ShouldBindJSON(&newUserInfo)
	if err != nil {
		ReportError(c, err, "error", 400)
		return
	}

	var updateInfoParam db.UpdateUserInfoParams
	if newUserInfo.Email != nil {
		updateInfoParam.Email = newUserInfo.Email.(string)
	} else {
		updateInfoParam.Email = user.Email
	}

	if newUserInfo.Username != nil {
		updateInfoParam.UserName = sql.NullString{
			String: newUserInfo.Username.(string),
			Valid:  true,
		}
	} else {
		updateInfoParam.UserName = user.UserName
	}

	if newUserInfo.Description != nil {
		updateInfoParam.Summary = sql.NullString{
			String: newUserInfo.Description.(string),
			Valid:  true,
		}
	} else {
		updateInfoParam.Summary = user.Summary
	}
	updateInfoParam.ID = userId

	err = queries.UpdateUserInfo(ctx, updateInfoParam)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	log.Printf("%+v\n", updateInfoParam)

	c.JSON(200, gin.H{
		"message": "update info successful",
	})
}
