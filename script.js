const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const dt = 0.01;
const frictionHL = 0.040;
let rMax = 0.1;
const m = 5;
let matrix = makeRandomMatrix();
let is3d = false;
const worldScale = 2.0;

const frictionFactor = Math.pow(0.5, dt / frictionHL);
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr); // Use scale instead of setTransform
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let colors, positionsX, positionsY, positionsZ, velocitiesX, velocitiesY, velocitiesZ;

function initParticles(count) {
    n = count;

    colors = new Int32Array(n);
    positionsX = new Float32Array(n);
    positionsY = new Float32Array(n);
    velocitiesX = new Float32Array(n);
    velocitiesY = new Float32Array(n);

    for (let i = 0; i < n; i++) {
        colors[i] = Math.floor(Math.random() * m);
        positionsX[i] = Math.random();
        positionsY[i] = Math.random();
        velocitiesX[i] = 0;
        velocitiesY[i] = 0;
    }
}

function initParticles3d(count) {
    n = count;

    colors = new Int32Array(n);
    positionsX = new Float32Array(n);
    positionsY = new Float32Array(n);
    positionsZ = new Float32Array(n);
    velocitiesX = new Float32Array(n);
    velocitiesY = new Float32Array(n);
    velocitiesZ = new Float32Array(n);

    for (let i = 0; i < n; i++) {
        colors[i] = Math.floor(Math.random() * m);
        positionsX[i] = Math.random() * 2 - 1;
        positionsY[i] = Math.random() * 2 - 1;
        positionsZ[i] = Math.random() * 2 - 1;
        velocitiesX[i] = 0;
        velocitiesY[i] = 0;
        velocitiesZ[i] = 0;
    }
}
const particleSlider = document.getElementById("particleSlider");
const particleValue = document.getElementById("particleValue");

initParticles(Number(particleSlider.value));
particleValue.textContent = particleSlider.value;


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

let forceFactor = 10;

function loop() {
    if (is3d) {
        updateParticles3d();
    } else {
        updateParticles();
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // const size = Math.min(canvas.clientclientWidth, canvas.clientclientHeight);
    // const offsetX = (canvas.clientclientWidth - size) / 2;
    // const offsetY = (canvas.clientclientHeight - size) / 2;

    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        let f = 1;
        if (is3d) {
            f = 1 / (positionsZ[i] + 2);
        }
        const screenX = is3d
            ? (f * positionsX[i] + 1) * 0.5 * canvas.clientWidth : positionsX[i] * canvas.clientWidth;

        const screenY = is3d
            ? (f * positionsY[i] + 1) * 0.5 * canvas.clientHeight : positionsY[i] * canvas.clientHeight;

        ctx.globalAlpha = is3d ? Math.min(1, f * 1.3) : 1; // for "depth"
        ctx.arc(screenX, screenY, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${360 * (colors[i] / m)},80%,75%)`;
        ctx.fill();
        ctx.globalAlpha = 1;

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
        while (positionsX[i] < 0) positionsX[i] += 1;
        while (positionsX[i] >= 1) positionsX[i] -= 1;
        while (positionsY[i] < 0) positionsY[i] += 1;
        while (positionsY[i] >= 1) positionsY[i] -= 1;
    }
}

function updateParticles3d() {
    for (let i = 0; i < n; i++) {
        let totalForceX = 0;
        let totalForceY = 0;
        let totalForceZ = 0;

        for (let j = 0; j < n; j++) {
            if (j == i) continue;
            let rx = positionsX[j] - positionsX[i];
            let ry = positionsY[j] - positionsY[i];
            let rz = positionsZ[j] - positionsZ[i];

            if (rx > 1) rx -= 2;
            if (rx < -1) rx += 2;

            if (ry > 1) ry -= 2;
            if (ry < -1) ry += 2;

            if (rz > 1) rz -= 2;
            if (rz < -1) rz += 2;

            const r = Math.sqrt(rx*rx + ry*ry + rz*rz); // sqrt(rx^2 + ry^2 + rz^2) => finds distance between particles (3d)
            if (r > 0 && r < rMax) {
                const f = force(r / rMax, matrix[colors[i]][colors[j]]);
                totalForceX += rx / r * f; // Force amount, sends in direction of the vector by normalizing it
                totalForceY += ry / r * f;
                totalForceZ += rz / r * f;
            }

        }

        totalForceX *= rMax * forceFactor;
        totalForceY *= rMax * forceFactor;
        totalForceZ *= rMax * forceFactor;

        velocitiesX[i] *= frictionFactor;
        velocitiesY[i] *= frictionFactor;
        velocitiesZ[i] *= frictionFactor;

        velocitiesX[i] += totalForceX * dt;
        velocitiesY[i] += totalForceY * dt;
        velocitiesZ[i] += totalForceZ * dt;
    }

    for (let i = 0; i < n; i++) {
        positionsX[i] += velocitiesX[i] * dt;
        positionsY[i] += velocitiesY[i] * dt;
        positionsZ[i] += velocitiesZ[i] * dt;
        while (positionsX[i] > 1) positionsX[i] -= 2;
        while (positionsX[i] < -1) positionsX[i] += 2;
        while (positionsY[i] > 1) positionsY[i] -= 2;
        while (positionsY[i] < -1) positionsY[i] += 2;
        while (positionsZ[i] > 1) positionsZ[i] -= 2;
        while (positionsZ[i] < -1) positionsZ[i] += 2;
        // positionsX[i] = ((positionsX[i] + 1) % 2) - 1;
        // positionsY[i] = ((positionsY[i] + 1) % 2) - 1;
        // positionsZ[i] = ((positionsZ[i] + 1) % 2) - 1;
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
const snakeButton = document.getElementById("snakePreset");
const dimButton = document.getElementById("dimButton");


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

dimButton.addEventListener("click", () => {
    is3d = !is3d;
    if (is3d) {
        rMax = 0.4;
        radiusSlider.min = 0.1;
        radiusSlider.max = 1.0;
        radiusSlider.value = 0.4;
        radiusValue.textContent = "0.40";
        initParticles3d(Number(particleSlider.value));
    } else {
        rMax = 0.1;
        radiusSlider.min = 0.02;
        radiusSlider.max = 0.3;
        radiusSlider.value = 0.1;
        radiusValue.textContent = "0.10";
        initParticles(Number(particleSlider.value));
    }
    dimButton.innerHTML = (is3d) ? "Make 2D" : "Make 3D";
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

snakeButton.addEventListener("click", () => {
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
            if (i === j) {
                matrix[i][j] = 1.0;
            } else if (i === j - 1 || (j === 0 && i === m - 1)) {
                matrix[i][j] = 0.2;
            } else {
                matrix[i][j] = 0.0;
            }
        }
    }
    renderMatrixEditor(matrix);
});

particleSlider.addEventListener("input", () => {
    const count = Number(particleSlider.value);
    if (is3d) {
        initParticles3d(count);
    } else {
        initParticles(count);
    }
    particleValue.textContent = count;
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