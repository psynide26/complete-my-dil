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

let worldWidth = 6000;
let cameraX = 0;

let she = { 
    x: 150, 
    y: canvas.height/2, 
    size: 90 
};

let you = {
    x: worldWidth - 300,
    y: canvas.height/2,
    size: 110
};

let targetX = she.x;
let targetY = she.y;

let obstacles = [];
let petals = [];

let speed = 1.6; // slower smoother pace

// ================= CREATE BACKGROUND PETALS =================
function createPetals(){
    petals=[];
    for(let i=0;i<120;i++){
        petals.push({
            x:Math.random()*worldWidth,
            y:Math.random()*canvas.height,
            size:4+Math.random()*5,
            speed:0.2+Math.random()*0.3
        });
    }
}

// ================= CREATE OBSTACLES =================
function createObstacles(){
    obstacles=[];
    for(let i=0;i<20;i++){
        obstacles.push({
            x:600 + i*250,
            y:150 + Math.random()*(canvas.height-300),
            size:100,
            type:["rose","chocolate","broken"][Math.floor(Math.random()*3)]
        });
    }
}

// ================= HEART DRAWING =================
function drawLeftHeart(x,y,size,color){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x-size/2,y-size/2,x-size,y+size/3,x,y+size);
    ctx.lineTo(x,y);
    ctx.fill();
}

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

// ================= OBSTACLES =================
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
        ctx.lineTo(o.x,o.y+140);
        ctx.lineTo(o.x+50,o.y+90);
        ctx.closePath();
        ctx.fill();
    }
}

// ================= DRAW =================
function draw(){
    ctx.setTransform(zoom,0,0,zoom,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.save();
    ctx.translate(-cameraX,0);

    petals.forEach(p=>{
        ctx.fillStyle="#ffc0cb";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    obstacles.forEach(drawObstacle);

    let distance = you.x - she.x;
    let glow = Math.max(0, 300 - distance) * 0.4;

    drawLeftHeart(she.x,she.y,she.size,"#ff4d88");
    drawRightHeart(
        you.x,
        you.y + Math.sin(Date.now()/700)*10,
        you.size,
        "#ff3366",
        glow
    );

    ctx.restore();
}

// ================= UPDATE =================
function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.8){
            zoom += 0.003;
        }
        return;
    }

    // Smooth movement
    she.x += (targetX - she.x) * 0.05;
    she.y += (targetY - she.y) * 0.05;

    petals.forEach(p=>{
        p.x -= p.speed;
        if(p.x < cameraX) p.x = cameraX + worldWidth;
    });

    obstacles.forEach(o=>{
        o.y += Math.sin(Date.now()/900 + o.x) * 0.6;

        // circle collision
        let dx = she.x - o.x;
        let dy = she.y - o.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < she.size/2 + o.size/2){
            showRetry();
        }
    });

    let desiredCamera = she.x - 300;
    cameraX += (desiredCamera - cameraX) * 0.03;

    if(she.x >= you.x - she.size){
        startMerge();
    }
}

// ================= MERGE =================
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

// ================= RETRY =================
function showRetry(){
    gameOver = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Almost There ❤️";
    document.querySelector("#winScreen p").innerText="Love just needs one more try 💕";
}

// ================= WIN =================
function winGame(){
    gameWon = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Happy Valentine's Day ❤️";
    document.querySelector("#winScreen p").innerText="She fought through everything… and chose you.";

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

// ================= LOOP =================
function loop(){
    draw();
    update();
    requestAnimationFrame(loop);
}

// ================= START =================
document.getElementById("startBtn").onclick=function(){
    document.getElementById("startScreen").style.display="none";
    previewMode=false;
    document.getElementById("bgMusic").play().catch(()=>{});
};

// ================= CONTROLS =================
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

// ================= RESTART =================
window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.x=150;
    she.y=canvas.height/2;
    cameraX=0;
    zoom=1;
    gameOver=false;
    gameWon=false;
    previewMode=false;
};

createPetals();
createObstacles();
loop();

};
