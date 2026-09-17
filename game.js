const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Configurações do Jogador (Seu Carro)
const car = {
    x: 180,
    y: 500,
    width: 40,
    height: 70,
    speed: 5
};

// Configurações dos Obstáculos
const obstacles = [];
const obstacleWidth = 40;
const obstacleHeight = 70;
let obstacleSpeed = 4;
let score = 0;
let gameOver = false;

// Controles por teclado
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Função para gerar obstáculos aleatórios
function spawnObstacle() {
    if (Math.random() < 0.02) { // Chance de aparecer a cada frame
        const x = Math.random() * (canvas.width - obstacleWidth);
        obstacles.push({ x: x, y: -obstacleHeight });
    }
}

// Atualiza a lógica do jogo
function update() {
    if (gameOver) return;

    // Movimentação do jogador
    if (keys["ArrowLeft"] && car.x > 0) car.x -= car.speed;
    if (keys["ArrowRight"] && car.x < canvas.width - car.width) car.x += car.speed;

    // Movimentação dos obstáculos
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;

        // Detecção de colisão (AABB)
        if (
            car.x < obstacles[i].x + obstacleWidth &&
            car.x + car.width > obstacles[i].x &&
            car.y < obstacles[i].y + obstacleHeight &&
            car.y + car.height > obstacles[i].y
        ) {
            gameOver = true;
            alert("Fim de Jogo! Pontuação: " + score);
            window.location.reload(); // Reinicia o jogo
        }

        // Se o obstáculo passar da tela, ganha ponto
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
            score++;
            scoreElement.innerText = score;
            
            // Aumenta a velocidade a cada 10 pontos
            if (score % 10 === 0) obstacleSpeed += 0.5;
        }
    }

    spawnObstacle();
}

// Desenha os elementos na tela
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador (Carro Azul)
    ctx.fillStyle = "#00a8ff";
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Desenha os obstáculos (Carros Vermelhos)
    ctx.fillStyle = "#ff4757";
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obstacleWidth, obstacleHeight);
    }
}

// Loop Principal do Jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
