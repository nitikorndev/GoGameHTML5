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
                var info = args[1].split(":", 8);
                player.game = games[info[0]];
                player.room = info[0] == 0 ? "" : info[1];
                player.name = info[2];
                player.point = info[3];
                player.Do = info[4];
                player.hp = info[5];
                player.x = info[6];
                player.y = info[7];
                
                c=document.getElementById("cv");
                cx=c.getContext("2d");
                cx.fillStyle="white";
                cx.fillRect(player.x,player.y,10,10);
                cx.font = "10pt Calibri";
                cx.fillStyle = "white";
                cx.fillText(player.name, player.x+20, player.y+20);
    
                if (!players.hasOwnProperty(player.name)) {
                    $("#userlist").append("<tr id=\"player-"+player.name+"\">");
                }
                $("#userlist #player-"+player.name).html("<td>"+player.name+"</td><td>"+player.game+"</td><td>"+player.point+"</td><td>"+player.room+"</td><td>"+player.Do+"</td><td>"+player.hp+"</td><td>"+player.x+"</td><td>"+player.y+"</td></tr>");
                players[player.name] = player;                

                break;
            case "error":
                alert("Error: " + args[1]);


                break;
        }
    };
});

function send(){
    if($("#ans").val().indexOf(",")>-1){
        var str = $("#ans").val().replace(",","");
        var tx = str.split(" ", 3);
        switch(tx[0]){
            case "go":
                var x=0;
                var y=0;
                x = parseInt(tx[1]);
                y = parseInt(tx[2]);
                connection.send("ans " +name+" "+str+" "+x+" "+y+"\n");
                document.getElementById("ans").value="";
                break;
        }
      
    }
    
    return false;
}
