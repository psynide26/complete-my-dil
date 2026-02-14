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
    x: canvas.width * 0.15, 
    y: canvas.height/2, 
    size: 90 
};

let you = {
    x: canvas.width * 0.85,
    y: canvas.height/2,
    size: 110
};

let obstacles = [];
let petals = [];

let speed = 3; // horizontal movement speed
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
            speed:0.2+Math.random()*0.3,
            drift: Math.random()*0.5 - 0.25
        });
    }
}

// ================= CREATE OBSTACLES =================
function createObstacles(){
    obstacles=[];
    let gap = 350;
    let startX = canvas.width * 0.25;
    let endX = canvas.width * 0.80;
    let totalDistance = endX - startX;
    let numObstacles = Math.floor(totalDistance / gap);
    
    const emojiList = ["🌹", "🌵", "🍫", "💔", "✨", "🥀", "🔥", "💐"];
    
    for(let i=0; i<numObstacles; i++){
        obstacles.push({
            x: startX + i * gap + Math.random()*100,
            y: 100 + Math.random()*(canvas.height-200),
            size: 70,
            emoji: emojiList[Math.floor(Math.random()*emojiList.length)]
        });
    }
}

function drawEmojiObstacle(o){
    ctx.font = `${o.size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.emoji, o.x, o.y);
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

    // Background gradient
    let gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0,"#ffe0e8");
    gradient.addColorStop(1,"#ffb3c6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Petals
    petals.forEach(p=>{
        ctx.fillStyle="rgba(255, 192, 203, 0.7)";
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });

    // Draw obstacles
    obstacles.forEach(drawEmojiObstacle);

    // Calculate glow based on distance
    let distance = you.x - she.x;
    let glow = Math.max(0, 250 - distance) * 0.4;

    // Draw hearts
    drawLeftHeart(she.x,she.y,she.size,"#ff4d88");
    drawRightHeart(you.x,you.y,you.size,"#ff3366",glow);
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

    // Petals animation
    petals.forEach(p=>{
        p.y += p.speed;
        p.x += p.drift;
        if(p.y > canvas.height){
            p.y = -10;
            p.x = Math.random()*canvas.width;
        }
    });

    // Vertical movement for the left heart
    if(moveUp && she.y > she.size) she.y -= 5;
    if(moveDown && she.y < canvas.height - she.size) she.y += 5;

    // Move the left heart to the right
    if(she.x < you.x - 100){
        she.x += speed;
    }

    // Collision detection with obstacles
    obstacles.forEach(o=>{
        let dx = she.x - o.x;
        let dy = she.y - o.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < she.size/1.5 + o.size/2.5){
            showRetry();
        }
    });

    // Win condition - when she reaches close to him
    if(she.x >= you.x - 120){
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

    // Confetti if available
    if(typeof confetti !== 'undefined'){
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

    let bgMusic = document.getElementById("bgMusic");
    if(bgMusic){
        bgMusic.play().catch(()=>{});
    }

    setTimeout(()=>{
        previewMode = false;
    }, 3000);
};

// ================= CONTROLS =================
canvas.addEventListener("mousemove",e=>{
    if(!previewMode && !gameOver && !gameWon){
        if(e.clientY < she.y) {
            moveUp=true; 
            moveDown=false;
        } else {
            moveDown=true; 
            moveUp=false;
        }
    }
});

canvas.addEventListener("touchmove",e=>{
    e.preventDefault();
    if(!previewMode && !gameOver && !gameWon){
        let touch = e.touches[0];
        if(touch.clientY < she.y) {
            moveUp=true; 
            moveDown=false;
        } else {
            moveDown=true; 
            moveUp=false;
        }
    }
},{passive:false});

document.addEventListener("mouseup",()=>{
    moveUp=false; moveDown=false;
});

document.addEventListener("touchend",()=>{
    moveUp=false; moveDown=false;
});

canvas.addEventListener("mouseleave",()=>{
    moveUp=false; moveDown=false;
});

// ================= RESTART =================
window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.x = canvas.width * 0.15;
    she.y = canvas.height/2;
    createObstacles();
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
