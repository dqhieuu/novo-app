package server

import (
	"context"
	"errors"
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

func GoogleOauthRedirect(c *gin.Context) {
	conf := googleConfig

	url := conf.AuthCodeURL("unused", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusFound, url)
}

func UserByGoogleOauthCode(code string) (*db.User, error) {
	conf := googleConfig
	ctx := context.Background()

	// Exchange code for oauth token
	token, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, err
	}

	// Access Google service from token
	oauth2Service, err := googleOauth2.NewService(ctx, option.WithTokenSource(conf.TokenSource(ctx, token)))
	if err != nil {
		return nil, err
	}

	// Use Google service with said token to get user info
	userInfo, err := oauth2Service.Userinfo.V2.Me.Get().Do()
	if err != nil {
		return nil, err
	}

	// Check if there's a user with email identical to that from service query
	queries := db.New(db.Pool())
	user, err := queries.UserByEmail(ctx, userInfo.Email)
	if err != nil {
		// If query finds no account record, create a new one with the received email
		if err == pgx.ErrNoRows {
			account, err := RegisterOauthAccount(userInfo.Email)
			if err != nil {
				return nil, err
			}
			return account, nil
		}
		return nil, err
	}

	log.Print(gin.H{"info": user})
	return &user, nil
}

func UserByOauthToken(login OauthLogin) (*db.User, error) {
	if login.Provider == "google" {
		return UserByGoogleOauthCode(login.Code)
	}

	return nil, errors.New("unsupported provider")
}
