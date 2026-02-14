window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let worldWidth = 4000;
let cameraX = 0;
let previewMode = true;

let player = { x:120, y:canvas.height/2, size:75 };
let targetX = player.x;
let targetY = player.y;

let obstacles = [];
let petals = [];
let sparkles = [];

const rightHeart = {
    x: worldWidth - 250,
    y: canvas.height/2,
    size: 90,
};

function createPetals(){
    petals=[];
    for(let i=0;i<80;i++){
        petals.push({
            x:Math.random()*worldWidth,
            y:Math.random()*canvas.height,
            size:4+Math.random()*6,
            speed:0.2+Math.random()*0.3
        });
    }
}

function createObstacles(){
    obstacles=[];
    for(let i=0;i<18;i++){
        obstacles.push({
            x:Math.random()*(worldWidth-500)+300,
            y:Math.random()*(canvas.height-200),
            size:100,
            type:["rose","chocolate","broken"][Math.floor(Math.random()*3)]
        });
    }
}

function createSparkle(){
    sparkles.push({
        x:player.x,
        y:player.y,
        alpha:1,
        life:25
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

function drawObstacle(o){
    if(o.type==="rose"){
        ctx.fillStyle="#8B0000";
        ctx.beginPath();
        ctx.arc(o.x,o.y,o.size/2,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle="#006400";
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(o.x,o.y);
        ctx.lineTo(o.x,o.y+o.size);
        ctx.stroke();
    }
    if(o.type==="chocolate"){
        ctx.fillStyle="#5C3317";
        ctx.fillRect(o.x-o.size/2,o.y-o.size/2,o.size,o.size);
    }
    if(o.type==="broken"){
        ctx.fillStyle="#ff4d88";
        ctx.beginPath();
        ctx.moveTo(o.x,o.y);
        ctx.lineTo(o.x-40,o.y+60);
        ctx.lineTo(o.x,o.y+100);
        ctx.lineTo(o.x+40,o.y+60);
        ctx.closePath();
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

    obstacles.forEach(drawObstacle);

    drawRightHeart(
        rightHeart.x,
        rightHeart.y + Math.sin(Date.now()/600)*15,
        rightHeart.size,
        "#ff3366"
    );

    drawLeftHeart(player.x,player.y,player.size,"#ff4d88");

    sparkles.forEach(s=>{
        ctx.fillStyle="rgba(255,255,255,"+s.alpha+")";
        ctx.beginPath();
        ctx.arc(s.x,s.y,4,0,Math.PI*2);
        ctx.fill();
    });

    ctx.restore();
}

function update(){

    if(previewMode){
        cameraX += 0.4; // slower intro pan
        return;
    }

    // SLOWER SMOOTH MOVEMENT
    player.x += (targetX - player.x) * 0.04;
    player.y += (targetY - player.y) * 0.04;

    petals.forEach(p=>{
        p.x -= p.speed;
        if(p.x < cameraX) p.x = cameraX + worldWidth;
    });

    // GENTLE FLOATING OBSTACLES
    obstacles.forEach(o=>{
        o.y += Math.sin(Date.now()/800 + o.x) * 0.8;

        if(
            player.x < o.x + o.size/2 &&
            player.x + player.size > o.x - o.size/2 &&
            player.y < o.y + o.size/2 &&
            player.y + player.size > o.y - o.size/2
        ){
            showHitScreen();
        }
    });

    createSparkle();
    sparkles.forEach((s,i)=>{
        s.life--;
        s.alpha-=0.04;
        if(s.life<=0) sparkles.splice(i,1);
    });

    // SLOWER CAMERA FOLLOW
    let desiredCamera = player.x - 300;
    cameraX += (desiredCamera - cameraX) * 0.03;

    if(player.x >= rightHeart.x - player.size){
        winGame();
    }
}

function showHitScreen(){
    previewMode=true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Oops! Love Got Distracted 💔";
    document.querySelector("#winScreen p").innerText="Avoid the temptations and reach your Wifey again!";
}

function winGame(){
    previewMode=true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Happy Valentine's Day Wifey ❤️";
    document.querySelector("#winScreen p").innerText="You complete my heart. Always have. Always will.";

    // SOFT FIREWORK STYLE CONFETTI (doesn't block text)
    confetti({
        particleCount:80,
        spread:60,
        origin:{y:0.75}
    });
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
    player.x=120;
    player.y=canvas.height/2;
    cameraX=0;
    previewMode=false;
};

createPetals();
createObstacles();
loop();

};
