window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let previewMode = true;
let gameOver = false;
let gameWon = false;
let merging = false;
let zoom = 1;

let she = { 
    x: 120, 
    y: canvas.height/2, 
    size: 95 
};

let you = {
    x: canvas.width - 250,
    y: canvas.height/2,
    size: 110
};

let obstacles = [];
let petals = [];

let speed = 1.4; // slower romantic speed

// 🌸 Petals
function createPetals(){
    petals=[];
    for(let i=0;i<120;i++){
        petals.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            size:3+Math.random()*6,
            speed:0.2+Math.random()*0.4
        });
    }
}

// 🌹 Obstacles
function createObstacles(){
    obstacles=[];
    for(let i=0;i<18;i++){
        obstacles.push({
            x:400 + i*300,
            y:Math.random()*(canvas.height-200),
            size:120,
            type:["rose","chocolate","broken"][Math.floor(Math.random()*3)]
        });
    }
}

// ❤️ Left Heart (SHE)
function drawLeftHeart(x,y,size,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x-size/2,y-size/2,x-size,y+size/3,x,y+size);
    ctx.lineTo(x,y);
    ctx.fill();
}

// ❤️ Right Heart (YOU)
function drawRightHeart(x,y,size,color,glow=0){
    ctx.shadowColor="#ff4d88";
    ctx.shadowBlur=glow;
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x+size/2,y-size/2,x+size,y+size/3,x,y+size);
    ctx.lineTo(x,y);
    ctx.fill();
    ctx.shadowBlur=0;
}

// 🍫 Obstacles
function drawObstacle(o){
    if(o.type==="rose"){
        ctx.fillStyle="#8B0000";
        ctx.beginPath();
        ctx.arc(o.x,o.y,o.size/2,0,Math.PI*2);
        ctx.fill();
    }
    if(o.type==="chocolate"){
        ctx.fillStyle="#5C3317";
        ctx.fillRect(o.x-o.size/2,o.y-o.size/2,o.size,o.size);
    }
    if(o.type==="broken"){
        ctx.fillStyle="#ff4d88";
        ctx.beginPath();
        ctx.moveTo(o.x,o.y);
        ctx.lineTo(o.x-50,o.y+90);
        ctx.lineTo(o.x,o.y+130);
        ctx.lineTo(o.x+50,o.y+90);
        ctx.closePath();
        ctx.fill();
    }
}

function draw(){
    ctx.setTransform(zoom,0,0,zoom,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // petals
    petals.forEach(p=>{
        ctx.fillStyle="#ffc0cb";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    obstacles.forEach(drawObstacle);

    let distance = you.x - she.x;
    let glow = Math.max(0, 300 - distance) * 0.4;

    drawLeftHeart(she.x, she.y, she.size, "#ff4d88");
    drawRightHeart(
        you.x,
        you.y + Math.sin(Date.now()/700)*10,
        you.size,
        "#ff3366",
        glow
    );
}

function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.8){
            zoom += 0.003; // cinematic zoom
        }
        return;
    }

    // SHE MOVES
    she.x += speed;

    // obstacles slight movement
    obstacles.forEach(o=>{
        o.y += Math.sin(Date.now()/800 + o.x) * 0.6;

        if(
            she.x < o.x + o.size/2 &&
            she.x + she.size > o.x - o.size/2 &&
            she.y < o.y + o.size/2 &&
            she.y + she.size > o.y - o.size/2
        ){
            showHitScreen();
        }
    });

    if(she.x >= you.x - she.size){
        startMerge();
    }
}

function startMerge(){
    merging = true;

    let mergeInterval = setInterval(()=>{
        she.x += 2;
        if(she.x >= you.x){
            clearInterval(mergeInterval);
            winGame();
        }
    },16);
}

function showHitScreen(){
    gameOver = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="She Faced Distractions 💔";
    document.querySelector("#winScreen p").innerText="But she will always find her way back to you.";
}

function winGame(){
    gameWon = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Happy Valentine's Day ❤️";
    document.querySelector("#winScreen p").innerText="She fought through everything… and chose you.";

    // soft side fireworks
    confetti({
        particleCount:50,
        spread:60,
        origin:{x:0,y:0.8}
    });
    confetti({
        particleCount:50,
        spread:60,
        origin:{x:1,y:0.8}
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

window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.x=120;
    zoom=1;
    gameOver=false;
    gameWon=false;
    previewMode=false;
};

createPetals();
createObstacles();
loop();

};
