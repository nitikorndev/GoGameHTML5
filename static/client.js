var c;
var cx;
var str="";
function init(){
    str = document.getElementById("ans").value;
    c=document.getElementById("cv");
    cx=c.getContext("2d");
    cx.fillStyle="black";
    cx.fillRect(0,0,550,400);
    cx.font = "30pt Calibri";
    cx.fillStyle = "white";
    cx.fillText(str, 100, 380);
    cx.font = "30pt Calibri";
    cx.fillStyle = "red";
    cx.fillText(str, 100, 379);
     $("#ans").focus();
}
