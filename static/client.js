var c;
var cx;
var str="";
var cv,ccv,x=0,y=0,ballX=10,ballY=10,stepX=1,stepY=1,score=0,lv=1;
function loop(){
    setTimeout("end()",3)
    }
function end(){
    update();
    draw();
    loop();
}
function update(){
	
    onmousemove=function(){
        x = event.x+document.body.scrollLeft;
        y = event.y+document.body.scrollTop;
    }
    if(ballX>=545||ballX<5){
        stepX*=(-1);
    }
    if(ballY<5){
        stepY*=(-1);
    }
    if(ballY>=485&&(ballX>x&&ballX<=(x+100))){
        stepY*=(-1);
        score+=lv;
        connection.send("point "+name+" "+score+"\n")
        if(score%(10*lv)==0){
            lv++;
        }
    }
if(ballY>=495){
    document.getElementById("status").innerHTML="สถานะ : คุณแพ้แล้ว";
    return;
}
ballX+=(stepX);
ballY+=(stepY);	
document.getElementById("level").innerHTML="ระดับ: "+lv;
document.getElementById("score").innerHTML="คะแนน : "+score;
}
function draw(){
    cv = document.getElementById("cv");
    ccv = cv.getContext("2d");
    ccv.fillStyle="#000000";
    ccv.fillRect(0,0,550,500);
    ccv.fillStyle="#FFFFFF";
    ccv.fillRect(2,2,546,496);
        
    ccv.fillStyle="#FF0000";
    ccv.fillRect(x,490,100,10);
    ccv.fillStyle="#000000";
    ccv.beginPath();
    ccv.arc(ballX,ballY,7,0,Math.PI*2,true);
    ccv.closePath();
    ccv.fill();
	
}