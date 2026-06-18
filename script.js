document.addEventListener("DOMContentLoaded", () => {
    /* =========================================
       1. LÓGICA DEL SLOT TRUCADO (3 Giros)
       ========================================= */
    let credit = 100;
    let spinCount = 0;
    const btnStart = document.getElementById("btn-start");
    const creditValue = document.getElementById("credit-value");
    const winDisplay = document.getElementById("win-text");
    const reels = document.querySelectorAll(".reel-content");
    const modal = document.getElementById("modal-perdida");

    btnStart.addEventListener("click", () => {
        if (credit <= 0) return;
        
        spinCount++;
        btnStart.disabled = true;
        winDisplay.style.color = "#550000";
        winDisplay.textContent = "SPINNING...";

        // Animación visual de rodillos (movimiento CSS hacia abajo)
        reels.forEach((reel, index) => {
            reel.style.transition = 'none';
            reel.style.transform = `translateY(0px)`;
            setTimeout(() => {
                reel.style.transition = `transform ${1.5 + (index * 0.2)}s cubic-bezier(0.15, 0.85, 0.25, 1)`;
                reel.style.transform = `translateY(-300px)`; // Simula el giro bajando el texto
            }, 50);
        });

        // Esperar a que terminen de girar
        setTimeout(() => {
            if (spinCount === 1) {
                // Giro 1: Enganche
                credit += 50;
                winDisplay.textContent = "WIN +50!";
                winDisplay.style.color = "#0f0";
            } else if (spinCount === 2) {
                // Giro 2: Ganancia menor
                credit += 20;
                winDisplay.textContent = "WIN +20!";
                winDisplay.style.color = "#0f0";
            } else if (spinCount === 3) {
                // Giro 3: Pérdida total
                credit = 0;
                winDisplay.textContent = "YOU LOSE";
                winDisplay.style.color = "#f00";
                setTimeout(() => {
                    modal.style.display = "flex";
                }, 1000);
            }
            
            creditValue.textContent = credit;
            if (spinCount < 3) btnStart.disabled = false;
        }, 2500); // 2.5s dura la animación
    });

    /* =========================================
       2. EFECTO NARRATIVO: OSCURECIMIENTO AL BAJAR
       ========================================= */
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / maxScroll;

        // Oscurece el fondo (De 30 a 5)
        const newDarkness = 30 - (scrollPercent * 25);
        document.documentElement.style.setProperty('--bg-darkness', newDarkness);

        // Apaga las luces neón (De 1 a 0.1)
        const newIntensity = 1 - (scrollPercent * 0.9);
        document.documentElement.style.setProperty('--neon-intensity', newIntensity);
    });

    /* =========================================
       3. RULETA BÁSICA EN CANVAS
       ========================================= */
    const canvas = document.getElementById("roulette-canvas");
    const ctx = canvas.getContext("2d");
    const btnSpin = document.getElementById("btn-spin");
    const resultText = document.getElementById("result-text");
    const resultDiv = document.getElementById("roulette-result");
    
    const colors = ["#ff0055", "#00ffcc", "#ffcc00", "#9900ff", "#ff0055", "#00ffcc", "#ffcc00", "#9900ff"];
    const labels = ["0%", "50%", "0%", "10%", "0%", "20%", "0%", "5%"];
    let currentRotation = 0;

    function drawRoulette() {
        const numSectors = colors.length;
        const arc = (2 * Math.PI) / numSectors;
        
        for (let i = 0; i < numSectors; i++) {
            ctx.beginPath();
            ctx.fillStyle = colors[i];
            ctx.moveTo(150, 150); // Centro del canvas (300x300)
            ctx.arc(150, 150, 150, i * arc, (i + 1) * arc, false);
            ctx.lineTo(150, 150);
            ctx.fill();
            
            // Textos
            ctx.save();
            ctx.translate(150, 150);
            ctx.rotate(i * arc + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px Fredoka";
            ctx.fillText(labels[i], 130, 10);
            ctx.restore();
        }
    }
    
    drawRoulette(); // Dibujar inicialmente

    btnSpin.addEventListener("click", () => {
        btnSpin.disabled = true;
        resultDiv.style.display = "none";
        
        // Matemáticas para trucar la ruleta y que caiga siempre en el mismo sector de "0%"
        const extraSpins = 5; // Vueltas completas
        const riggedAngle = 360 * extraSpins + 200; // Ángulo final fijo
        currentRotation += riggedAngle; 

        canvas.style.transform = `rotate(${currentRotation}deg)`;

        setTimeout(() => {
            resultDiv.style.display = "block";
            resultText.innerHTML = "<strong>0% RECUPERADO</strong><br>El algoritmo siempre gana a largo plazo.";
        }, 4000); // 4s dura la transición en CSS
    });
});
