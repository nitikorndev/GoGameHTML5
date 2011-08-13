var id;
var draw;
function init(){
    id = document.getElementById("cv");
    draw = id.getContext("2d");
    
    draw.fillStyle="black";
    draw.fillRect(0,0,550,400);

    draw.font = "30pt Calibri";
    draw.fillStyle = "red";
    draw.fillText(str, 100, 379);

}