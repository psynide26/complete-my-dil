window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let worldWidth = 3500;
let cameraX = 0;
let previewMode = true;

let player = { x:100, y:canvas.height/2, size:40 };
let targetX = player.x;
let targetY = player.y;

let obstacles = [];
let petals = [];
let sparkles = [];

const rightHeart = {
    x: worldWidth - 200,
    y: canvas.height/2,
    size: 45,
    emotion: "happy"
};

function createPetals(){
    petals=[];
    for(let i=0;i<60;i++){
        petals.push({
            x:Math.random()*worldWidth,
            y:Math.random()*canvas.height,
            size:3+Math.random()*4,
            speed:0.3+Math.random()*0.5
        });
    }
}

function createObstacles(){
    obstacles=[];
    for(let i=0;i<14;i++){
        obstacles.push({
            x:Math.random()*(worldWidth-400)+200,
            y:Math.random()*(canvas.height-80),
            size:40,
            type:Math.random()>0.5?"static":"moving",
            dir:Math.random()>0.5?1:-1,
            speed:0.8+Math.random()
        });
    }
}

function createSparkle(){
    sparkles.push({
        x:player.x,
        y:player.y,
        alpha:1,
        life:40
    });
}

function drawLeftHeart(x,y,size,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x-size/2,y-size/2,x-size,y+size/3,x,y+size);
    ctx.lineTo(x,y);
    ctx.fill();
}

function drawRightHeart(x,y,size,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x+size/2,y-size/2,x+size,y+size/3,x,y+size);
    ctx.lineTo(x,y);
    ctx.fill();
}

function drawFace(x,y,size,emotion){
    ctx.fillStyle="#000";
    ctx.beginPath();
    ctx.arc(x,y+size/3,size/8,0,Math.PI*2);
    ctx.fill();

    if(emotion==="happy"){
        ctx.beginPath();
        ctx.arc(x,y+size/2,size/3,0,Math.PI);
        ctx.stroke();
    }

    if(emotion==="cry"){
        ctx.fillStyle="#00f";
        ctx.beginPath();
        ctx.arc(x,y+size/1.5,size/10,0,Math.PI*2);
        ctx.fill();
    }

    if(emotion==="blush"){
        ctx.fillStyle="#ff4d88";
        ctx.beginPath();
        ctx.arc(x,y+size/2,size/6,0,Math.PI*2);
        ctx.fill();
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(-cameraX,0);

    petals.forEach(p=>{
        ctx.fillStyle="#ffb3c6";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    obstacles.forEach(o=>{
        drawLeftHeart(o.x,o.y,o.size,"#ff99bb");
    });

    drawRightHeart(
        rightHeart.x,
        rightHeart.y + Math.sin(Date.now()/400)*10,
        rightHeart.size,
        "#ff3366"
    );
    drawFace(rightHeart.x,rightHeart.y,rightHeart.size,rightHeart.emotion);

    drawLeftHeart(player.x,player.y,player.size,"#ff4d88");

    sparkles.forEach(s=>{
        ctx.fillStyle="rgba(255,255,255,"+s.alpha+")";
        ctx.beginPath();
        ctx.arc(s.x,s.y,3,0,Math.PI*2);
        ctx.fill();
    });

    ctx.restore();
}

function update(){

    if(previewMode){
        cameraX += 0.6;
        return;
    }

    player.x += (targetX-player.x)*0.08;
    player.y += (targetY-player.y)*0.08;

    petals.forEach(p=>{
        p.x-=p.speed;
        if(p.x<cameraX) p.x=cameraX+worldWidth;
    });

    obstacles.forEach(o=>{
        if(o.type==="moving"){
            o.y+=o.dir*o.speed;
            if(o.y<0||o.y>canvas.height-o.size) o.dir*=-1;
        }

        if(player.x<o.x+o.size &&
           player.x+player.size>o.x &&
           player.y<o.y+o.size &&
           player.y+player.size>o.y){
            rightHeart.emotion="cry";
            setTimeout(()=>rightHeart.emotion="happy",1500);
            resetGame();
        }
    });

    createSparkle();
    sparkles.forEach((s,i)=>{
        s.life--;
        s.alpha-=0.02;
        if(s.life<=0) sparkles.splice(i,1);
    });

    let desiredCamera=player.x-200;
    cameraX+=(desiredCamera-cameraX)*0.05;

    if(player.x>=rightHeart.x-player.size){
        winGame();
    }
}

function resetGame(){
    player.x=100;
    player.y=canvas.height/2;
    cameraX=0;
}

function winGame(){
    rightHeart.emotion="blush";
    document.getElementById("winScreen").classList.remove("hidden");
    confetti({particleCount:300,spread:150});
}

function loop(){
    draw();
    update();
    requestAnimationFrame(loop);
}

document.getElementById("startBtn").onclick=function(){
    document.getElementById("startScreen").style.display="none";
    previewMode=false;
    document.getElementById("bgMusic").play().catch(()=>{});
};

canvas.addEventListener("mousemove",e=>{
    if(!previewMode){
        targetX=e.clientX+cameraX;
        targetY=e.clientY;
    }
});

canvas.addEventListener("touchmove",e=>{
    e.preventDefault();
    if(!previewMode){
        targetX=e.touches[0].clientX+cameraX;
        targetY=e.touches[0].clientY;
    }
},{passive:false});

window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    rightHeart.emotion="happy";
    resetGame();
};

createPetals();
createObstacles();
loop();

};
