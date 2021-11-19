package server

import (
	"errors"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

type UserClaims struct {
	UserId int32
	Role   int32
}

type passwordLogin struct {
	UsernameOrEmail string `form:"u" json:"u" binding:"required"`
	Password        string `form:"pw" json:"pw" binding:"required"`
}

type OauthLogin struct {
	Provider string `form:"provider" json:"provider" binding:"required"`
	Code     string `form:"code" json:"code" binding:"required"`
}

var userId = "uid"

// AuthMiddleware is a jwt auth(enticator/orizator)
func AuthMiddleware() *jwt.GinJWTMiddleware {
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:       "my novo app",
		Key:         []byte("U3M9B6BdNrWOxnar6P0HSqskxjec7DkG"),
		Timeout:     time.Hour,
		MaxRefresh:  time.Hour,
		IdentityKey: userId,

		Authenticator: func(c *gin.Context) (interface{}, error) {
			// Try if it has password login fields
			var loginInfo passwordLogin
			if err := c.ShouldBind(&loginInfo); err == nil {
				user, err := UserByLoginInfo(loginInfo.UsernameOrEmail, loginInfo.Password)
				if err != nil {
					return nil, err
				}
				return UserClaims{UserId: user.ID, Role: user.RoleID}, nil
			}

			// Try if it has oauth login fields
			var tokenInfo OauthLogin
			if err := c.ShouldBindQuery(&tokenInfo); err == nil {
				user, err := UserByOauthToken(tokenInfo)
				if err != nil {
					return nil, err
				}
				return UserClaims{UserId: user.ID, Role: user.RoleID}, nil
			}

			return nil, errors.New("authentication failed")
		},

		PayloadFunc: func(data interface{}) jwt.MapClaims {
			if v, ok := data.(*UserClaims); ok {
				return jwt.MapClaims{
					userId: v.UserId,
					"role": v.Role,
				}
			}
			return jwt.MapClaims{}
		},

		//Authorizator: func(data interface{}, c *gin.Context) bool {
		//	if v, ok := data.(*UserClaims); ok {
		//		log.Println(v.UserId)
		//		return true
		//	}
		//
		//	return false
		//},

		SendCookie:     true,
		SecureCookie:   false, //non HTTPS dev environments
		CookieHTTPOnly: true,  // JS can't modify. Helps mitigate cookie hijacking
		CookieDomain:   "localhost:7001",
		CookieName:     "jwt",
		CookieSameSite: http.SameSiteDefaultMode, // (https only/Lax mode) CSRF protection

		// TokenLookup is a string in the form of "<source>:<name>" that is used
		// to extract token from the request.
		TokenLookup: "header: Authorization, query: token, cookie: jwt",
	})

	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}
	return authMiddleware
}
