window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let previewMode = false;
let gameOver = false;
let gameWon = false;
let zoom = 1;

let she = { 
    x: canvas.width * 0.2, 
    y: canvas.height/2, 
    size: 90 
};

let you = {
    x: canvas.width * 0.8,
    y: canvas.height/2,
    size: 110
};

let obstacles = [];
let petals = [];

let speed = 1.1; // slower smoother pace
let moveUp = false;
let moveDown = false;

// ================= CREATE PETALS =================
function createPetals(){
    petals=[];
    for(let i=0;i<120;i++){
        petals.push({
            x:Math.random()*canvas.width*2,
            y:Math.random()*canvas.height,
            size:3+Math.random()*5,
            speed:0.2+Math.random()*0.3
        });
    }
}

// ================= CREATE OBSTACLES =================
function createObstacles(){
    obstacles=[];
    let gap = 400;
    for(let i=0;i<18;i++){
        obstacles.push({
            x: canvas.width + i * gap + Math.random()*200,
            y: 150 + Math.random()*(canvas.height-300),
            size: 80,
            type: ["🌹","🌵","🍫","💔","✨"][Math.floor(Math.random()*5)]
        });
    }
}

function drawTextObstacle(o){
    ctx.font = `${o.size}px serif`;
    ctx.textAlign = "center";

    if(o.type === "🌹"){
        ctx.fillStyle = "#c4001d";
    } else if(o.type === "🌵"){
        ctx.fillStyle = "#006400";
    } else if(o.type === "🍫"){
        ctx.fillStyle = "#5C3317";
    } else if(o.type === "💔"){
        ctx.fillStyle = "#ff4d88";
    } else {
        ctx.fillStyle = "#ff99bb";
    }

    ctx.fillText(o.type, o.x, o.y);
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

// ================= DRAW =================
function draw(){
    ctx.setTransform(zoom,0,0,zoom,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Petals
    petals.forEach(p=>{
        ctx.fillStyle="#ffc0cb";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    obstacles.forEach(drawTextObstacle);

    let distance = you.x - she.x;
    let glow = Math.max(0, 250 - distance) * 0.4;

    drawLeftHeart(she.x,she.y,she.size,"#ff4d88");
    drawRightHeart(
        you.x,you.y,you.size,"#ff3366",glow
    );
}

// ================= UPDATE =================
function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.6){
            zoom += 0.002; // cinematic zoom
        }
        return;
    }

    // Vertical movement
    if(moveUp && she.y > she.size) she.y -= 4;
    if(moveDown && she.y < canvas.height - she.size) she.y += 4;

    // Move obstacles toward her
    obstacles.forEach(o=>{
        o.x -= speed;

        // circle vs zone collision
        let dx = she.x - o.x;
        let dy = she.y - o.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < she.size/1.8 + o.size/1.8){
            showRetry();
        }
    });

    // Win condition
    if(obstacles.length>0 && obstacles[obstacles.length-1].x < you.x - 50){
        winGame();
    }
}

// ================= RETRY =================
function showRetry(){
    gameOver = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="💞 Almost There!";
    document.querySelector("#winScreen p").innerText="Try again to reach your love!";
}

// ================= WIN =================
function winGame(){
    gameWon = true;
    document.getElementById("winScreen").classList.remove("hidden");
    document.querySelector("#winScreen h2").innerText="💖 Happy Valentine's Day!";
    document.querySelector("#winScreen p").innerText="She finally reached her love!";

    confetti({
        particleCount:60,
        spread:70,
        origin:{x:0,y:0.8}
    });
    confetti({
        particleCount:60,
        spread:70,
        origin:{x:1,y:0.8}
    });
}

// ================= GAME LOOP =================
function loop(){
    draw();
    update();
    requestAnimationFrame(loop);
}

// ================= START BUTTON =================
document.getElementById("startBtn").onclick=function(){
    document.getElementById("startScreen").style.display="none";
    previewMode = true;

    document.getElementById("bgMusic").play().catch(()=>{});

    setTimeout(()=>{
        previewMode = false;
    }, 3000);
};

// ================= CONTROLS =================
canvas.addEventListener("mousemove",e=>{
    if(!previewMode){
        if(e.clientY < she.y) moveUp=true, moveDown=false;
        else moveDown=true, moveUp=false;
    }
});

canvas.addEventListener("touchmove",e=>{
    e.preventDefault();
    if(!previewMode){
        let touch = e.touches[0];
        if(touch.clientY < she.y) moveUp=true, moveDown=false;
        else moveDown=true, moveUp=false;
    }
},{passive:false});

document.addEventListener("mouseup",()=>{
    moveUp=false; moveDown=false;
});
document.addEventListener("touchend",()=>{
    moveUp=false; moveDown=false;
});

// ================= RESTART =================
window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.y = canvas.height/2;
    obstacles.forEach((o,i)=> o.x = canvas.width + i*250);
    gameOver=false;
    gameWon=false;
    zoom=1;
    previewMode=false;
};

// ================= INIT =================
createPetals();
createObstacles();
loop();

};
