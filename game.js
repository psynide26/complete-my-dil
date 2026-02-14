window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================= STATE =================
let previewMode = true;
let gameOver = false;
let gameWon = false;
let zoom = 1;

let she = { 
    x: 200, 
    y: canvas.height/2, 
    size: 45 
};

let you = {
    x: canvas.width - 250,
    y: canvas.height/2,
    size: 55
};

let obstacles = [];
let speed = 2.2;

let moveUp = false;
let moveDown = false;

// ================= CREATE OBSTACLES =================
function createObstacles(){
    obstacles=[];
    for(let i=0;i<15;i++){
        obstacles.push({
            x: canvas.width + i*400,
            y: 150 + Math.random()*(canvas.height-300),
            size: 50
        });
    }
}

// ================= DRAW HEART =================
function drawHeart(x,y,radius,color,glow=0){
    ctx.shadowColor="#ff4d88";
    ctx.shadowBlur=glow;
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
}

function drawObstacle(o){
    ctx.fillStyle="#8B0000";
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.size,0,Math.PI*2);
    ctx.fill();
}

// ================= DRAW =================
function draw(){
    ctx.setTransform(zoom,0,0,zoom,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // PREVIEW MODE (show only YOU glowing)
    if(previewMode){
        drawHeart(you.x,you.y,you.size,"#ff3366",30);
        return;
    }

    obstacles.forEach(drawObstacle);

    let distance = you.x - she.x;
    let glow = Math.max(0, 250 - distance) * 0.4;

    drawHeart(she.x,she.y,she.size,"#ff4d88");
    drawHeart(you.x,you.y,you.size,"#ff3366",glow);
}

// ================= UPDATE =================
function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.6){
            zoom += 0.002;
        }
        return;
    }

    // Vertical movement
    if(moveUp && she.y > 60) she.y -= 4;
    if(moveDown && she.y < canvas.height-60) she.y += 4;

    // Move obstacles
    obstacles.forEach(o=>{
        o.x -= speed;

        let dx = she.x - o.x;
        let dy = she.y - o.y;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if(distance < she.size + o.size){
            showRetry();
        }
    });

    // Win condition
    if(she.x >= you.x - 40){
        winGame();
    }
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
    document.querySelector("#winScreen p").innerText="She chose you. Always.";

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

// ================= START BUTTON =================
document.getElementById("startBtn").onclick=function(){

    document.getElementById("startScreen").style.display="none";

    previewMode = true;

    let previewText = document.createElement("div");
    previewText.innerText = "He’s waiting for you ❤️";
    previewText.style.position = "absolute";
    previewText.style.top = "20%";
    previewText.style.width = "100%";
    previewText.style.textAlign = "center";
    previewText.style.fontSize = "28px";
    previewText.style.color = "#ff3366";
    previewText.style.fontWeight = "bold";
    document.body.appendChild(previewText);

    document.getElementById("bgMusic").play().catch(()=>{});

    setTimeout(()=>{
        previewMode = false;
        previewText.remove();
    },3000);
};

// ================= RESTART =================
window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.y = canvas.height/2;
    she.x = 200;
    obstacles.forEach((o,i)=> o.x = canvas.width + i*400);
    gameOver=false;
    gameWon=false;
    zoom=1;
    previewMode=false;
};

// ================= CONTROLS =================
document.addEventListener("keydown",e=>{
    if(e.key==="ArrowUp") moveUp=true;
    if(e.key==="ArrowDown") moveDown=true;
});
document.addEventListener("keyup",e=>{
    if(e.key==="ArrowUp") moveUp=false;
    if(e.key==="ArrowDown") moveDown=false;
});

// ================= INIT =================
createObstacles();
loop();

};
