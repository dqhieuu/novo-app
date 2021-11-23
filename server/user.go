package server

import (
	"context"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"golang.org/x/crypto/bcrypt"
	"net/mail"
	"regexp"
)

func EqualPasswords(hashedPassword, password []byte) bool {
	return bcrypt.CompareHashAndPassword(hashedPassword, password) == nil
}

func GeneratePasswordHash(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func ValidPassword(password string) bool {
	validPassword, _ := regexp.MatchString(`^.{8,50}$`, password)
	return validPassword
}

func ValidUsername(username string) bool {
	validUsername, _ := regexp.MatchString(`^\w{6,20}$`, username)
	return validUsername
}

func CreateOauthAccount(email, roleName string) (*db.User, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	user, err := queries.InsertUser(ctx, db.InsertUserParams{
		Email:    email,
		RoleName: roleName,
	})

	if err != nil {
		return nil, errors.New(fmt.Sprintf("creating new unregistered user failed: %s", err))
	}

	return &user, nil
}

func CreateAccount(username, password, email, roleName string) (*db.User, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	if _, err := mail.ParseAddress(email); err != nil {
		return nil, errors.New(fmt.Sprintf(`invalid email address: "%s"`, email))
	}

	if !ValidUsername(username) {
		return nil, errors.New(fmt.Sprintf(`invalid user name: "%s"`, username))
	}

	if !ValidPassword(password) {
		return nil, errors.New(fmt.Sprintf(`invalid password: "%s"`, password))
	}

	hashedPassword, err := GeneratePasswordHash(password)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("error while generating password: %s", err))
	}

	user, err := queries.InsertUser(ctx, db.InsertUserParams{
		UserName: sql.NullString{String: username, Valid: true},
		Password: sql.NullString{String: hex.EncodeToString(hashedPassword), Valid: true},
		Email:    email,
		RoleName: roleName,
	})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("creating new user failed: %s", err))
	}

	//role, err := queries.RoleByUserId(ctx, user.ID)
	//if err != nil {
	//	return nil, errors.New(fmt.Sprintf("getting user role failed: %s", err))
	//}
	//fmt.Println(role.RolePermissions.([]string), roleName)

	return &user, nil
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

func RegisterAccount(username, password, email string) (*db.User, error) {
	return CreateAccount(username, password, email, "member")
}

func RegisterOauthAccount(email string) (*db.User, error) {
	return CreateOauthAccount(email, "member")
}

func UserByLoginInfo(usernameOrEmail string, password string) (*db.User, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	user, err := queries.UserByUsernameOrEmail(ctx, sql.NullString{String: usernameOrEmail, Valid: true})
	if err != nil {
		return nil, errors.New("user not found")
	}

	hexPassword := user.Password

	if !hexPassword.Valid {
		return nil, errors.New("can't access oauth user")
	}

	var bytePassword []byte

	_, err = hex.Decode([]byte(hexPassword.String), bytePassword)
	if err != nil {
		return nil, err
	}

	if !EqualPasswords(bytePassword, []byte(password)) {
		return nil, errors.New("incorrect password")
	}

	return &user, nil
}
