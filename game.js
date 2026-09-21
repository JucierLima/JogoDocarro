const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

// Configurações do Jogador (Seu Carro)
const car = {
    x: 180,
    y: 500,
    width: 40,
    height: 70,
    speed: 5,
    moveDir: 0 // Direção do sensor (-1: Esquerda, 0: Parado, 1: Direita)
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

// Variáveis do Sensor de Movimento
let tiltX = 0; 
const TILT_THRESHOLD = 8; // Graus de inclinação para acionar o movimento

// Função para tratar os dados de orientação do celular
function handleOrientation(event) {
    // event.gamma varia de -90 a 90 (inclinação lateral)
    tiltX = event.gamma || 0;

    if (tiltX > TILT_THRESHOLD) {
        car.moveDir = 1;  // Inclinado para a Direita
    } else if (tiltX < -TILT_THRESHOLD) {
        car.moveDir = -1; // Inclinado para a Esquerda
    } else {
        car.moveDir = 0;  // Parado / Celular reto
    }
}

// Função acionada pelo botão HTML para pedir permissão e ativar os sensores
function enableMotionSensor() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Suporte a iOS 13+
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    alert("Sensor de movimento ativado!");
                } else {
                    alert("Permissão para o giroscópio foi negada.");
                }
            })
            .catch(console.error);
    } else if (window.DeviceOrientationEvent) {
        // Android e navegadores padrão
        window.addEventListener('deviceorientation', handleOrientation);
        alert("Sensor de movimento ativado!");
    } else {
        alert("Seu dispositivo não suporta sensores de movimento.");
    }
}

// Gerador de obstáculos
function spawnObstacle() {
    if (Math.random() < 0.02) {
        const x = Math.random() * (canvas.width - obstacleWidth);
        obstacles.push({ x: x, y: -obstacleHeight });
    }
}

// Atualização da lógica
function update() {
    if (gameOver) return;

    // Movimentação via Teclado
    if (keys["ArrowLeft"]) car.x -= car.speed;
    if (keys["ArrowRight"]) car.x += car.speed;

    // Movimentação via Sensor de Movimento
    if (car.moveDir !== 0) {
        car.x += car.moveDir * car.speed;
    }

    // Limites da tela para o carro não sair da área visível
    if (car.x < 0) car.x = 0;
    if (car.x > canvas.width - car.width) car.x = canvas.width - car.width;

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
            window.location.reload();
        }

        // Pontuação e remoção de obstáculos fora da tela
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
            score++;
            scoreElement.innerText = score;
            
            // Aumento progressivo de velocidade
            if (score % 10 === 0) obstacleSpeed += 0.5;
        }
    }

    spawnObstacle();
}

// Renderização gráfica
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Jogador (Carro Azul)
    ctx.fillStyle = "#00a8ff";
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Obstáculos (Carros Vermelhos)
    ctx.fillStyle = "#ff4757";
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obstacleWidth, obstacleHeight);
    }
}

// Loop Principal
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();