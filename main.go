package main

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/dqhieuu/novo-app/server"
)

func main() {
	db.Init()
	defer db.Pool().Close()
	//server.TryOutsideTest()

	server.Run()
}
