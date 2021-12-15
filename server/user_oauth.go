package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleOauth2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
	"log"
	"net/http"
)

var googleConfig *oauth2.Config

type CompleteOauth struct {
	Username string      `json:"username" binding:"required" form:"username"`
	Avatar   interface{} `json:"avatar" form:"avatar"`
}

func InitOauth() {
	if googleConfig == nil {
		googleConfig = &oauth2.Config{
			ClientID:     "589093568358-p2sil2brte394rh5fh415ok8j5ghq6kc.apps.googleusercontent.com",
			ClientSecret: "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",
			Endpoint:     google.Endpoint,
			Scopes:       []string{googleOauth2.UserinfoEmailScope, googleOauth2.UserinfoProfileScope},
			RedirectURL:  "http://localhost:7001/login?provider=google",
		}
	}
}

func UserByGoogleOauthCode(code string) (*db.User, *db.RoleRow, error) {
	conf := googleConfig
	ctx := context.Background()

	// Exchange code for oauth token
	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, nil, err
	}

	// Access Google service from token
	oauth2Service, err := googleOauth2.NewService(ctx, option.WithTokenSource(conf.TokenSource(ctx, token)))
	if err != nil {
		return nil, nil, err
	}

	// Use Google service with said token to get user info
	userInfo, err := oauth2Service.Userinfo.V2.Me.Get().Do()
	if err != nil {
		return nil, nil, err
	}

	// Check if there's a user with email identical to that from service query
	queries := db.New(db.Pool())
	user, err := queries.UserByEmail(ctx, userInfo.Email)
	if err != nil {
		// If query finds no account record, create a new one with the received email
		if err == pgx.ErrNoRows {
			account, role, err := RegisterOauthAccount(userInfo.Email)
			if err != nil {
				return nil, nil, err
			}
			return account, role, nil
		}
		return nil, nil, err
	}

	// Get detailed role from roleId
	role, err := queries.Role(ctx, user.RoleID)
	if err != nil {
		return nil, nil, err
	}

	return &user, &role, nil
}

func UserByOauthToken(login OauthLogin) (*db.User, *db.RoleRow, error) {
	if login.Provider == "google" {
		return UserByGoogleOauthCode(login.Code)
	}

	return nil, nil, errors.New("unsupported provider")
}

func createOauthAccount(email, roleName string) (*db.User, *db.RoleRow, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	user, err := queries.InsertUser(ctx, db.InsertUserParams{
		Email:    email,
		RoleName: roleName,
	})

	if err != nil {
		return nil, nil, errors.New(fmt.Sprintf("creating new unregistered user failed: %s", err))
	}

	role, err := queries.Role(ctx, user.RoleID)

	return &user, &role, nil
}

func RegisterOauthAccount(email string) (*db.User, *db.RoleRow, error) {
	return createOauthAccount(email, "oauth_incomplete")
}

func CompleteOauthRegistration(userId int32, name string, avatarId *int32, roleId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())

	if !ValidUsername(name) {
		return errors.New("name field invalid")
	}

	if avatarId == nil {
		err := queries.CompleteOauthAccount(ctx, db.CompleteOauthAccountParams{
			ID: userId,
			UserName: sql.NullString{
				String: name,
				Valid:  true,
			},
			RoleID: roleId,
		})
		if err != nil {
			return err
		}
	} else {
		err := queries.CompleteOauthAccount(ctx, db.CompleteOauthAccountParams{
			ID: userId,
			UserName: sql.NullString{
				String: name,
				Valid:  true,
			},
			AvatarImageID: sql.NullInt32{
				Int32: *avatarId,
				Valid: true,
			},
			RoleID: roleId,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func GoogleOauthRedirect(c *gin.Context) {
	conf := googleConfig

	url := conf.AuthCodeURL("unused", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusFound, url)
}

func CompleteOauthAccountHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	var user CompleteOauth
	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("error parsing json: %s\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "error parsing json",
		})
		return
	}

	extract := jwt.ExtractClaims(c)

	userId := int32(extract[UserIdClaimKey].(float64))

	peekUserRow, err := queries.GetUserInfo(ctx, userId)
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if peekUserRow.Role != "oauth_incomplete" {
		ReportError(c, errors.New("role is not oauth complete"), "error", http.StatusBadRequest)
		return
	}

	var avatarIdPointer *int32
	var avatarId int32
	if user.Avatar != nil {
		_, ok := user.Avatar.(float64)
		if !ok {
			ReportError(c, errors.New("invalid avatar id"), "error", http.StatusBadRequest)
			return
		}
		avatarId = int32(user.Avatar.(float64))
		avatarIdPointer = &avatarId
	}

	memberId, err := queries.GetRoleId(ctx, "member")
	if err != nil {
		log.Printf("error getting member role id: %s\n", err)
		c.JSON(500, gin.H{
			"error": "error parsing json",
		})
		return
	}

	err = CompleteOauthRegistration(userId, user.Username, avatarIdPointer, memberId)
	if err != nil {
		log.Printf("error completing oauth: %s\n", err)
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Complete Oauth successfully",
	})
}
