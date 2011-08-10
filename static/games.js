var games = ["Lobby", "Uno", "Canasta"];
var players = new Object();
var player;
var name;
var connection;
$(document).ready(function() {
    
    connection = new WebSocket("ws://localhost:6900/lobby");
    $("#nameform").submit(function() {
        connection.send("connect " + $("input#name").val() + "\n");
        name = $("input#name").val();
        $("#nameform").fadeOut();
        $("#creategame").fadeIn();

        return false;
    });

    $("#creategame").submit(function() {
        connection.send("create " + $("select#games").val() + "\n");
        $("#creategame").fadeOut();
        return false;
    });
  
 
    connection.onmessage = function(e) {
        var args = e.data.split(" ", 2);
        switch (args[0]) {
            case "player":
                player = new Object();
                var info = args[1].split(":", 4);
                player.game = games[info[0]];
                player.room = info[0] == 0 ? "" : info[1];
                player.name = info[2];
                player.point = info[3];
                player.Do = info[3];
                player.x = info[4];
                player.y = info[5];
                if (!players.hasOwnProperty(player.name)) {
                    $("#userlist").append("<tr id=\"player-"+player.name+"\">");
                }
                $("#userlist #player-"+player.name).html("<td>"+player.name+"</td><td>"+player.game+"</td><td>"+player.point+"</td><td>"+player.room+"</td></tr>");
                players[player.name] = player;
      
                switch(Do){
                    case "a":
                        x-=5;
                        break;
                    case "d":
                        x+=5;
                        break;
                    case "w":
                        y-=5;
                        break;
                    case "s":
                        y+=5;
                        break;
                }
                

                break;
            case "error":
                alert("Error: " + args[1]);

                break;
        }
    };
 
  
});

function send(){
    connection.send("ans " +name+" "+ $("#ans").val()+"\n");
    return false;
}
