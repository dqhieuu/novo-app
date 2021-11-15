package server

import (
	"context"
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

func CreateAccount(username, password, email, roleName string) error {
	if validUsername, _ := regexp.MatchString(`^\w{6,20}$`, username); !validUsername {
		return errors.New(fmt.Sprintf(`Invalid user name: "%s"`, username))
	}

	if validUsername, _ := regexp.MatchString(`^.{8,50}$`, password); !validUsername {
		return errors.New(fmt.Sprintf(`Invalid password: "%s"`, password))
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return errors.New(fmt.Sprintf(`Invalid email address: "%s"`, email))
	}

	hashedPassword, err := GeneratePasswordHash(password)
	if err != nil {
		return errors.New(fmt.Sprintf("Error while generating password: %s", err))
	}

	ctx := context.Background()
	queries := db.New(db.Pool())

	err = queries.InsertUser(ctx, db.InsertUserParams{
		Username: username,
		Password: hex.EncodeToString(hashedPassword),
		Email:    email,
		RoleName: roleName,
	})

	if err != nil {
		return errors.New(fmt.Sprintf("Creating new user failed: %s", err))
	}

	return nil
}

func DeleteAccount(username string) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteUser(ctx, username)

	if err != nil {
		return errors.New(fmt.Sprintf(`Failed to delete account "%s": %s`, username, err))
	}
	return nil
}
