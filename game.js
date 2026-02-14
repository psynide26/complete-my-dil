window.onload = function(){

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Mobile-optimized canvas sizing
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Prevent scrolling on mobile
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.height = '100%';

let previewMode = false;
let gameOver = false;
let gameWon = false;
let zoom = 1;

// Scale sizes based on screen size for mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const baseSize = Math.min(canvas.width, canvas.height) * 0.08;

// Left heart stays STATIONARY on left side
let she = { 
    x: canvas.width * 0.2, 
    y: canvas.height/2, 
    size: baseSize
};

// Right heart also stationary (goal)
let you = {
    x: canvas.width * 5.5, // far to the right (off-screen initially)
    y: canvas.height/2,
    size: baseSize * 1.2
};

let obstacles = [];
let petals = [];
let courseOffset = 0; // tracks how far the course has moved

let speed = canvas.width * 0.003; // speed of course movement
let moveUp = false;
let moveDown = false;
let touchStartY = 0;

// ================= CREATE PETALS =================
function createPetals(){
    petals=[];
    const petalCount = isMobile ? 80 : 150;
    for(let i=0; i<petalCount; i++){
        petals.push({
            x:Math.random()*canvas.width*6, // wider range for scrolling
            y:Math.random()*canvas.height,
            size:2+Math.random()*4,
            speed:0.3+Math.random()*0.5,
            drift: Math.random()*0.3 - 0.15
        });
    }
}

// ================= CREATE OBSTACLES =================
function createObstacles(){
    obstacles=[];
    const gap = canvas.width * 0.25; // closer obstacles for more challenge
    const startX = canvas.width * 0.5; // start after left heart
    const courseLength = canvas.width * 5; // MUCH longer course
    const numObstacles = Math.floor(courseLength / gap);
    
    const emojiList = ["🌹", "🌵", "🍫", "💔", "✨", "🥀", "🔥", "💐", "⚡", "❄️", "🌺", "🪨"];
    const obstacleSize = baseSize * 0.9;
    
    for(let i=0; i<numObstacles; i++){
        obstacles.push({
            initialX: startX + i * gap + Math.random()*(gap*0.4),
            x: startX + i * gap + Math.random()*(gap*0.4),
            y: canvas.height * 0.15 + Math.random()*(canvas.height*0.7),
            size: obstacleSize,
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

    // Petals (only draw visible ones for performance)
    petals.forEach(p=>{
        if(p.x > -20 && p.x < canvas.width + 20){
            ctx.fillStyle="rgba(255, 192, 203, 0.6)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
    });

    // Draw obstacles (only visible ones)
    obstacles.forEach(o=>{
        if(o.x > -100 && o.x < canvas.width + 100){
            drawEmojiObstacle(o);
        }
    });

    // Calculate glow based on distance to goal
    let distance = you.x - she.x - courseOffset;
    let glow = Math.max(0, Math.min(50, 300 - distance)) * 0.8;

    // Draw stationary left heart
    drawLeftHeart(she.x, she.y, she.size, "#ff4d88");
    
    // Draw right heart (goal) - moves with the course
    drawRightHeart(you.x, you.y, you.size, "#ff3366", glow);
}

// ================= UPDATE =================
function update(){

    if(previewMode || gameOver) return;

    if(gameWon){
        if(zoom < 1.6){
            zoom += 0.003; // cinematic zoom
        }
        return;
    }

    // Petals animation
    petals.forEach(p=>{
        p.y += p.speed;
        p.x -= speed + p.drift; // petals move with course
        if(p.y > canvas.height){
            p.y = -10;
            p.x = canvas.width + Math.random()*200;
        }
        if(p.x < -20){
            p.x = canvas.width + Math.random()*200;
        }
    });

    // Vertical movement for the left heart (stays horizontal)
    const moveSpeed = canvas.height * 0.008;
    if(moveUp && she.y > she.size) she.y -= moveSpeed;
    if(moveDown && she.y < canvas.height - she.size) she.y += moveSpeed;

    // Move the COURSE to the left (making it seem like heart moves right)
    courseOffset += speed;
    
    // Update obstacle positions
    obstacles.forEach(o=>{
        o.x = o.initialX - courseOffset;
    });
    
    // Update goal heart position
    you.x = canvas.width * 5.5 - courseOffset;

    // Collision detection with obstacles
    obstacles.forEach(o=>{
        // Only check visible obstacles
        if(o.x > -100 && o.x < canvas.width + 100){
            let dx = she.x - o.x;
            let dy = she.y - o.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            // More forgiving collision on mobile
            const collisionRadius = isMobile ? 
                (she.size/1.8 + o.size/2.8) : 
                (she.size/1.5 + o.size/2.5);

            if(dist < collisionRadius){
                showRetry();
            }
        }
    });

    // Win condition - when goal heart reaches close to left heart
    if(you.x <= she.x + she.size * 1.5){
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
            particleCount:80,
            spread:80,
            origin:{x:0.5,y:0.6}
        });
        setTimeout(()=>{
            confetti({
                particleCount:60,
                spread:70,
                origin:{x:0.3,y:0.7}
            });
        }, 200);
        setTimeout(()=>{
            confetti({
                particleCount:60,
                spread:70,
                origin:{x:0.7,y:0.7}
            });
        }, 400);
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
    }, 2500);
};

// ================= MOBILE TOUCH CONTROLS =================
canvas.addEventListener("touchstart", e=>{
    e.preventDefault();
    if(!previewMode && !gameOver && !gameWon){
        let touch = e.touches[0];
        touchStartY = touch.clientY;
    }
}, {passive: false});

canvas.addEventListener("touchmove",e=>{
    e.preventDefault();
    if(!previewMode && !gameOver && !gameWon){
        let touch = e.touches[0];
        
        // Move based on touch position relative to heart
        if(touch.clientY < she.y) {
            moveUp = true; 
            moveDown = false;
        } else {
            moveDown = true; 
            moveUp = false;
        }
    }
},{passive:false});

canvas.addEventListener("touchend",e=>{
    e.preventDefault();
    moveUp = false; 
    moveDown = false;
},{passive:false});

// Desktop fallback controls
canvas.addEventListener("mousemove",e=>{
    if(!previewMode && !gameOver && !gameWon){
        if(e.clientY < she.y) {
            moveUp = true; 
            moveDown = false;
        } else {
            moveDown = true; 
            moveUp = false;
        }
    }
});

document.addEventListener("mouseup",()=>{
    moveUp = false; 
    moveDown = false;
});

canvas.addEventListener("mouseleave",()=>{
    moveUp = false; 
    moveDown = false;
});

// ================= RESTART =================
window.restartGame=function(){
    document.getElementById("winScreen").classList.add("hidden");
    she.x = canvas.width * 0.2;
    she.y = canvas.height/2;
    courseOffset = 0;
    createObstacles();
    createPetals();
    gameOver = false;
    gameWon = false;
    zoom = 1;
    previewMode = false;
};

// ================= WINDOW RESIZE HANDLER =================
window.addEventListener('resize', ()=>{
    const oldWidth = canvas.width;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recalculate positions on resize
    she.x = canvas.width * 0.2;
    she.y = canvas.height/2;
    
    // Adjust course offset proportionally
    courseOffset = (courseOffset / oldWidth) * canvas.width;
    
    createObstacles();
    createPetals();
});

// Prevent default touch behaviors
document.addEventListener('touchmove', function(e) {
    if(e.target === canvas) {
        e.preventDefault();
    }
}, {passive: false});

// ================= INIT =================
createPetals();
createObstacles();
loop();

};
