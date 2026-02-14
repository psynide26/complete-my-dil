window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
let speed = 2.2; // world speed
let moveUp = false;
let moveDown = false;

// 🎯 Create obstacles
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

// ❤️ Draw heart (simple circle style for clean collision)
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

function draw(){
    ctx.setTransform(zoom,0,0,zoom,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    obstacles.forEach(drawObstacle);

    let distance = you.x - she.x;
    let glow = Math.max(0, 250 - distance) * 0.4;

    drawHeart(she.x,she.y,she.size,"#ff4d88");
    drawHeart(you.x,you.y,you.size,"#ff3366",glow);
}

function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.6){
            zoom += 0.002;
        }
        return;
    }

    // SHE vertical control
    if(moveUp && she.y > 60) she.y -= 4;
    if(moveDown && she.y < canvas.height-60) she.y += 4;

    // Move obstacles toward her
    obstacles.forEach(o=>{
        o.x -= speed;

        // Proper circle collision
        let dx = she.x - o.x;
        let dy = she.y - o.y;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if(distance < she.size + o.size){
            showRetry();
        }
    });

    // Check win
    if(she.x >= you.x - 40){
        winGame();
    }
}

function showRetry(){
    gameOver = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="Almost There ❤️";
    document.querySelector("#winScreen p").innerText="Love just needs one more try 💕";
}

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
    she.y = canvas.height/2;
    obstacles.forEach((o,i)=> o.x = canvas.width + i*400);
    gameOver=false;
    gameWon=false;
    zoom=1;
    previewMode=false;
};

// Keyboard controls
document.addEventListener("keydown",e=>{
    if(e.key==="ArrowUp") moveUp=true;
    if(e.key==="ArrowDown") moveDown=true;
});
document.addEventListener("keyup",e=>{
    if(e.key==="ArrowUp") moveUp=false;
    if(e.key==="ArrowDown") moveDown=false;
});

createObstacles();
loop();

};
