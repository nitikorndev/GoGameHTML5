package main

import (
	"bufio"
	"fmt"
	"http"
	"io"
	"os"
	"strings"
	"websocket"
	"strconv"
)

type Player struct {
	Name   string
	Point  int
	Socket *websocket.Conn
}

var users map[string]*Player = make(map[string]*Player)
var listenAddress string = ":6900"

func EchoServer(ws *websocket.Conn) {
	io.Copy(ws, ws)
}

func sendPlayers(ws *websocket.Conn) {
	for _, info := range users {
		fmt.Fprintf(ws, "player %s:%d", info.Name, info.Point)
	}
}

func sendPlayer(player *Player) {
	for _, info := range users {
		if info == player {
			continue
		}
		fmt.Fprintf(info.Socket, "player %s:%d", player.Name, player.Point)
	}
}

func LobbyServer(ws *websocket.Conn) {
	reader := bufio.NewReader(ws)
	var username string
	var player *Player
	connected := false
	sendPlayers(ws)
	inGame := false

	for {
		br, er := reader.ReadString('\n')
		if er == os.EOF {
			break
		}

		msg := strings.Split(br, " ")

		switch msg[0] {
		case "connect":
			username = strings.TrimSpace(msg[1])

			if _, ok := users[username]; !ok && !connected {
				player = &Player{Name: username, Socket: ws}
				sendPlayer(player)
				users[username] = player
				fmt.Printf("Got connection from %s\n", username)
				connected = true
			} else {
				fmt.Fprint(ws, "error Username Exists")
				ws.Close()
				return
			}
		case "create":
			if inGame {
				fmt.Fprint(ws, "error Already in a game")
				continue
			}
			fmt.Printf("Create %s\n", username)
			sendPlayer(player)
			inGame = true
			continue
			
		case "start":
			fmt.Printf("Game %s\n", br)
			for _, info := range users {
				fmt.Fprintf(info.Socket, "Game %s", "start")
			}
			
		case "point":
			user := strings.TrimSpace(msg[1])
			point,_ := strconv.Atoi(strings.TrimSpace(msg[2]))
			player = &Player{Name:user,Point:point,Socket:ws}
        	sendPlayer(player)
        	users[username] = player
			continue

		default:
			fmt.Printf("Unknown message: %s\n", br)
		}
	}
}


func main() {
	http.Handle("/echo", websocket.Handler(EchoServer))
	http.Handle("/lobby", websocket.Handler(LobbyServer))
	http.Handle("/", http.FileServer(http.Dir("/tmp")))
	fmt.Println("Listening on:", listenAddress)
	if err := http.ListenAndServe(listenAddress, nil); err != nil {
		panic("ListenAndServe: " + err.String())
	}
}
