
const video = document.querySelector('#webcam');
const startButton = document.querySelector('#startCam');
const canvasElement = document.querySelector('#canvas');
const canvasCtx = canvasElement.getContext('2d');


const isFingerUp = (landmarks, tipIdx, pipIdx) => {
    return landmarks[ tipIdx ].y < landmarks[ pipIdx ].y;
}

const getFingersStatus = (landmarks) => {
    return {
        pulgar: isFingerUp(landmarks, 4, 2),
        indice: isFingerUp(landmarks, 8, 6),
        medio: isFingerUp(landmarks, 12, 10),
        anular: isFingerUp(landmarks, 16, 14),
        meñique: isFingerUp(landmarks, 20, 18),
    };
}

const videoElement = document.querySelector('#webcam');

const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log(stream);
    videoElement.srcObject = stream;
    await videoElement.play();

    const detectHands = async () => {
        await hands.send({ image: videoElement });
        requestAnimationFrame(detectHands);
    }
    detectHands();
}

startCamera();


const hands = new Hands({
    locateFile:
        file => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${ file }`;
        }
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

const particles = []

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 5 + 2;
        this.alpha = 1;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.alpha -= 0.02;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    isAlive() {
        return this.alpha > 0;
    }
}

const renderParticles = () => {
    particles.forEach(p => {
        p.update();
        p.draw(canvasCtx);
    });
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[ i ].isAlive()) {
            particles.splice(i, 1);
        }
    }
};

let lastLogTime = 0;
const logInterval = 1000; // 1 segundo

hands.onResults((results) => {
    const now = Date.now();
    if (now - lastLogTime > logInterval) {
        lastLogTime = now;
    }
    const landmarks = results.multiHandLandmarks?.[ 0 ];
    if (!landmarks) return;
    const dedos = getFingersStatus(landmarks);


    const estado = Object.entries(dedos)
        .map(([ dedo, levantado ]) => `${ dedo }: ${ levantado ? '↑' : '↓' }`)
        .join(' | ');

    console.log(estado);

});


/* startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Verifica permisos del navegador.');
    }
}); */
