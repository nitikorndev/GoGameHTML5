package main

import (
  "bufio"
  "fmt"
  "http"
  "io"
  "os"
  "strconv"
  "strings"
  "websocket"
)

// Enumeration of game types
const (
  lobby uint = iota
  uno
  canasta
)

// Structure for each connected player (client)
type Player struct {
  Name string // Player's name
  Playing uint // What the player is playing
  Room int // Which room they're playing in
  Socket *websocket.Conn // Their underlying websocket
  JoinOk chan bool // Set back from a room upon sending a join request
}

// Structure for each room
type Room struct {
  RoomID int // Unique identifier for this room
  GameID uint // Which game is being played in this room
  Players map[string]bool // The players playing in this room
  JoinChan chan *Player // Send a request to join this room
  QuitChan chan *Player // Send a request to leave this room
  StartChan chan bool // Sent by the host to start the game
}

var users map[string]*Player = make(map[string]*Player)
var rooms map[int]*Room = make(map[int]*Room)
var listenAddress string = ":12345"
var getRoomID chan int = make(chan int)

// Simple counter for room identifiers
// XXX: Perhaps this should come from a pool or something
func roomIDProvider() {
  i := 0
  for {
    getRoomID <- i
    i = i + 1
  }
}

// Simple echo server to test websocket functionality
func EchoServer(ws *websocket.Conn) {
  io.Copy(ws, ws)
}

// Send the entire player list to a client
func sendPlayers(ws *websocket.Conn) {
  for _, info := range users {
    fmt.Fprintf(ws, "player %d:%d:%s", info.Playing, info.Room, info.Name)
  }
}

// Send a single player to all clients
func sendPlayer(player *Player) {
  for _, info := range users {
    if info == player {
      continue
    }

    fmt.Fprintf(info.Socket, "player %d:%d:%s", player.Playing, player.Room, player.Name)
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

    msg := strings.Split(br, " ", 2)

    switch msg[0] {
    case "connect":
      username = strings.TrimSpace(msg[1])

      if _, ok := users[username]; !ok && !connected {
        player = &Player{Name:username,
                         Room:-1,
                         Playing:lobby,
                         Socket:ws,
                         JoinOk:make(chan bool)}
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

      gameID, err := strconv.Atoui(strings.TrimSpace(msg[1]))

      if err != nil {
        fmt.Fprint(ws, "error Malformed Message")
        continue
      }

      player.Playing = gameID
      player.Room = <-getRoomID
      sendPlayer(player)

      rooms[player.Room] = &Room{RoomID:player.Room,
                                 Players:make(map[string]bool),
                                 JoinChan:make(chan *Player),
                                 QuitChan:make(chan *Player),
                                 StartChan:make(chan bool)}

      inGame = true
      go UnoGame(rooms[player.Room])

    case "join":
      if inGame {
        fmt.Fprint(ws, "error Already in a game")
        continue
      }

      roomID, err := strconv.Atoi(strings.TrimSpace(msg[1]))

      if err != nil {
        fmt.Fprint(ws, "error Malformed Message")
        continue
      }

      rooms[roomID].JoinChan <- player

      if ok := <-player.JoinOk; !ok {
        fmt.Fprint(ws, "error Joining Game")
        continue
      }

      inGame = true

    case "leave":
      if !inGame {
        fmt.Fprint(ws, "error Not in a game")
        continue
      }

      rooms[player.Room].QuitChan <- player
      inGame = false

    default:
      fmt.Printf("Unknown message: %s\n", br)
    }
  }
}

// Send false to the JoinOk chan of all players requesting to join a room
func quitter(joinChan chan *Player, quitChan chan bool) {
  var player *Player

  for {
    select {
    case player = <-joinChan:
      player.JoinOk <- false

    case _ = <-quitChan:
      return
    }
  }
}

func UnoGame(room *Room) {
  var player *Player
  gameStarted := false

  for !gameStarted {
    select {
    case player = <-room.JoinChan:
      room.Players[player.Name] = true
      player.JoinOk <- true

    case player = <-room.QuitChan:
      room.Players[player.Name] = false, false

    case _ = <-room.StartChan:
      gameStarted = true
    }
  }

  // Deny further join requests
  go quitter(room.JoinChan, make(chan bool))
}

func main() {
  http.Handle("/echo", websocket.Handler(EchoServer))
  http.Handle("/lobby", websocket.Handler(LobbyServer))
  http.Handle("/", http.FileServer("static", ""))

  go roomIDProvider()

  fmt.Println("Listening on:", listenAddress)
  if err := http.ListenAndServe(listenAddress, nil); err != nil {
    panic("ListenAndServe: " + err.String())
  }
}
