package server

import (
	"errors"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

type UserClaims struct {
	UserId          int32
	RoleName        string
	RolePermissions []string
}

type PasswordLogin struct {
	UsernameOrEmail string `form:"usernameOrEmail" json:"usernameOrEmail" binding:"required"`
	Password        string `form:"password" json:"password" binding:"required"`
}

type OauthLogin struct {
	Provider string `form:"provider" json:"provider" binding:"required"`
	Code     string `form:"code" json:"code" binding:"required"`
}

const UserIdClaimKey = "uid"
const RoleNameClaimKey = "rol"
const RolePermsClaimKey = "rolp"

// AuthMiddleware is a jwt auth(enticator/orizator)
func AuthMiddleware() *jwt.GinJWTMiddleware {
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:       "my novo app",
		Key:         []byte("U3M9B6BdNrWOxnar6P0HSqskxjec7DkG"),
		Timeout:     time.Hour,
		MaxRefresh:  24 * 7 * time.Hour,
		IdentityKey: UserIdClaimKey,

		// For the login function
		Authenticator: func(c *gin.Context) (interface{}, error) {
			// Try if it has password login fields
			var loginInfo PasswordLogin
			if err := c.ShouldBind(&loginInfo); err == nil {
				user, role, err := UserByLoginInfo(loginInfo)
				if err != nil {
					return nil, err
				}

				return UserClaims{UserId: user.ID, RoleName: role.RoleName, RolePermissions: role.RolePermissions}, nil
			}

			// Try if it has oauth login fields
			var tokenInfo OauthLogin
			if err := c.ShouldBindQuery(&tokenInfo); err == nil {
				user, role, err := UserByOauthToken(tokenInfo)
				if err != nil {
					return nil, err
				}

				return UserClaims{UserId: user.ID, RoleName: role.RoleName, RolePermissions: role.RolePermissions}, nil
			}

			return nil, errors.New("login credentials invalid")
		},

		PayloadFunc: func(data interface{}) jwt.MapClaims {
			if v, ok := data.(UserClaims); ok {
				return jwt.MapClaims{
					UserIdClaimKey:    v.UserId,
					RoleNameClaimKey:  v.RoleName,
					RolePermsClaimKey: v.RolePermissions,
				}
			}
			return jwt.MapClaims{}
		},

		SendCookie:   true,
		SecureCookie: false, //non HTTPS dev environments
		//CookieHTTPOnly: true,  // JS can't modify. Helps mitigate cookie hijacking
		//CookieDomain:   "novoapp.tech",
		CookieName: "token",
		//CookieSameSite: http.SameSiteDefaultMode, // (https only/Lax mode) CSRF protection

		// TokenLookup is a string in the form of "<source>:<name>" that is used
		// to extract token from the request.
		TokenLookup: "header: Authorization, query: token, cookie: token",
	})

	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}
	return authMiddleware
}
