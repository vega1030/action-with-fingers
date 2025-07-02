
const video = document.querySelector('#webcam');
const startButton = document.querySelector('#startCam');
const canvasElement = document.querySelector('#canvas');
const canvasCtx = canvasElement.getContext('2d');


const isFingerUp = (tip, pip, axis = 'y', threshold = 0.02) => {
    return (pip[ axis ] - tip[ axis ]) > threshold;
}

const getFingersStatus = (landmarks) => {
    return {
        pulgar: isFingerUp(landmarks[ 4 ], landmarks[ 3 ], 'x'),
        indice: isFingerUp(landmarks[ 8 ], landmarks[ 6 ]),
        medio: isFingerUp(landmarks[ 12 ], landmarks[ 10 ]),
        anular: isFingerUp(landmarks[ 16 ], landmarks[ 14 ]),
        meñique: isFingerUp(landmarks[ 20 ], landmarks[ 18 ]),
    };
}

const drawTest = (ctx, text, x, y) => {
    ctx.font = `1.25rem, Arial`;
    ctx.fillStyle = 'cyan';
    ctx.fillText(text, x, y);
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
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if(!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        canvasCtx.restore();
        return;
    }
    const landmarks = results.multiHandLandmarks[ 0 ];
    const fingers = getFingersStatus(landmarks);

    for (const [ name, isUp ] of Object.entries(fingers)) {
        if (isUp) {
            let tipIndex
            switch (name) {
                case 'pulgar': tipIndex = 4; break;
                case 'indice': tipIndex = 8; break;
                case 'medio': tipIndex = 12; break;
                case 'anular': tipIndex = 16; break;
                case 'meñique': tipIndex = 20; break;
            }
            const x = landmarks[ tipIndex ].x * canvasElement.width;
            const y = landmarks[ tipIndex ].y * canvasElement.height;

            drawTest(canvasCtx, name.toUpperCase(), x, y);
        }
}
        canvasCtx.restore();
    })


/* startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Verifica permisos del navegador.');
    }
}); */
