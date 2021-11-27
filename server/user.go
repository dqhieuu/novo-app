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

func createAccount(username, password, email, roleName string) (*db.User, *db.RoleRow, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

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

	var bytePassword []byte

	_, err = hex.Decode([]byte(hexPassword.String), bytePassword)
	if err != nil {
		return nil, nil, err
	}

	if !EqualPasswords(bytePassword, []byte(loginInfo.Password)) {
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
