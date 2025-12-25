const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr); // Use scale instead of setTransform
}


resizeCanvas();
window.addEventListener("resize", resizeCanvas);


let n = 1000;
const dt = 0.01;
const frictionHL = 0.040;
let rMax = 0.1;
let m = 5;
let matrix = makeRandomMatrix();

const frictionFactor = Math.pow(0.5, dt / frictionHL);

function makeRandomMatrix() {
    const rows = [];
    for (let i = 0; i < m; i++) {
        const row = [];
        for (let j = 0; j < m; j++) {
            row.push(Math.random() * 2 - 1);
        }
        rows.push(row);
    }
    return rows;
}

const colors = new Int32Array(n);
const positionsX = new Float32Array(n);
const positionsY = new Float32Array(n);
const velocitiesX = new Float32Array(n);
const velocitiesY = new Float32Array(n);
let forceFactor = 10;
for (let i = 0; i < n; i++) {
    colors[i] = Math.floor(Math.random() * m);
    positionsX[i] = Math.random();
    positionsY[i] = Math.random();
    velocitiesX[i] = 0;
    velocitiesY[i] = 0;
}

function loop() {
    updateParticles();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const size = Math.min(canvas.clientWidth, canvas.clientHeight);
    const offsetX = (canvas.clientWidth - size) / 2;
    const offsetY = (canvas.clientHeight - size) / 2;

    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        const screenX = positionsX[i] * size + offsetX;
        const screenY = positionsY[i] * size + offsetY;
        
        ctx.arc(screenX, screenY, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${360 * (colors[i] / m)},80%,75%)`;
        ctx.fill();
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function updateParticles() {
    for (let i = 0; i < n; i++) {
        let totalForceX = 0;
        let totalForceY = 0;

        for (let j = 0; j < n; j++) {
            if (j == i) continue;
            let rx = positionsX[j] - positionsX[i];
            let ry = positionsY[j] - positionsY[i];

            if (rx > 0.5) rx -= 1;
            if (rx < -0.5) rx += 1;

            if (ry > 0.5) ry -= 1;
            if (ry < -0.5) ry += 1;

            const r = Math.hypot(rx, ry); // sqrt(rx^2 + ry^2) => finds distance between particles
            if (r > 0 && r < rMax) {
                const f = force(r / rMax, matrix[colors[i]][colors[j]]);
                totalForceX += rx / r * f; // Force amount, sends in direction of the vector by normalizing it
                totalForceY += ry / r * f;
            }

        }

        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;

        velocitiesX[i] *= frictionFactor;
        velocitiesY[i] *= frictionFactor;

        velocitiesX[i] += totalForceX * dt;
        velocitiesY[i] += totalForceY * dt;
    }

    for (let i = 0; i < n; i++) {
        positionsX[i] += velocitiesX[i] * dt;
        positionsY[i] += velocitiesY[i] * dt;
        positionsX[i] = (positionsX[i] + 1) % 1;
        positionsY[i] = (positionsY[i] + 1) % 1;
    }
}

function force(r, a) {
    const beta = 0.3;
    if (r < beta) {
        return r / beta - 1;
    } else if (beta < r && r < 1) {
        return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
        return 0;
    }
}

const forceSlider = document.getElementById("forceSlider");
const radiusSlider = document.getElementById("radiusSlider");
const forceValue = document.getElementById("forceValue");
const radiusValue = document.getElementById("radiusValue");
const randomizeBtn = document.getElementById("randomize");
const pauseBtn = document.getElementById("pause");

forceSlider.addEventListener("input", () => {
    forceFactor = Number(forceSlider.value);
    forceValue.textContent = forceFactor;
});

radiusSlider.addEventListener("input", () => {
    rMax = Number(radiusSlider.value);
    radiusValue.textContent = rMax.toFixed(2);
});

randomizeBtn.addEventListener("click", () => {
    matrix = makeRandomMatrix();
    renderMatrixEditor(matrix);
});

pauseBtn.addEventListener("click", () => {
    if (pauseBtn.innerHTML === "Pause") {
        forceFactor = 0;
        pauseBtn.innerHTML = "Play";
    } else {
        forceFactor = Number(forceSlider.value);
        pauseBtn.innerHTML = "Pause";
    }

});

particleSlider.addEventListener("input", () => {
    n = Number(particleSlider.value);
    particleValue.textContent = n;
});

function renderMatrixEditor(matrix) {
    const container = document.getElementById("matrixContainer");
    container.innerHTML = ""; // clear previous content

    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${matrix.length}, 50px)`;
    container.style.gap = "4px";

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {

            const cell = document.createElement("div");
            cell.contentEditable = "true";
            cell.textContent = matrix[i][j].toFixed(2);

            cell.style.border = "1px solid #ccc";
            cell.style.padding = "6px";
            cell.style.textAlign = "center";
            cell.style.background = "#fff";
            cell.style.borderRadius = "4px";

            // Update matrix when edited
            cell.addEventListener("input", () => {
                const value = parseFloat(cell.textContent);
                if (!isNaN(value)) {
                    matrix[i][j] = value;
                }
            });

            container.appendChild(cell);
        }
    }
}
renderMatrixEditor(matrix);