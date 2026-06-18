document.addEventListener("DOMContentLoaded", () => {
    /* =========================================
       1. SLOT TRUCADO (AHORA CON MOVIMIENTO)
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

        // --- CORRECCIÓN DE ANIMACIÓN DE RODILLOS ---
        reels.forEach((reel, index) => {
            // 1. Desactivamos la transición para devolver el rodillo a su posición inicial al instante.
            reel.style.transition = 'none';
            reel.style.transform = `translateY(0px)`;
            
            // 2. FORZAMOS EL REFLOW: Obligamos al navegador a recalcular las dimensiones.
            // Esto evita que salte la animación y garantiza que se vea el movimiento.
            void reel.offsetHeight;
            
            // 3. Reactivamos la transición con tiempos escalonados para que cada rodillo pare después del otro.
            const duracion = 1.5 + (index * 0.2); 
            reel.style.transition = `transform ${duracion}s cubic-bezier(0.15, 0.85, 0.25, 1)`;
            
            // 4. Aplicamos el desplazamiento hacia arriba (-250px) para simular la rotación de los emojis.
            reel.style.transform = `translateY(-250px)`; 
        });
        // -------------------------------------------

        // Lógica de resultados tras finalizar el giro
        setTimeout(() => {
            if (spinCount === 1) {
                credit += 50; 
                winDisplay.textContent = "WIN +50!"; 
                winDisplay.style.color = "#0f0";
            } else if (spinCount === 2) {
                credit += 20; 
                winDisplay.textContent = "WIN +20!"; 
                winDisplay.style.color = "#0f0";
            } else if (spinCount === 3) {
                credit = 0; 
                winDisplay.textContent = "YOU LOSE"; 
                winDisplay.style.color = "#f00";
                setTimeout(() => { modal.style.display = "flex"; }, 1000);
            }
            creditValue.textContent = credit;
            if (spinCount < 3) btnStart.disabled = false;
        }, 2500); // 2.5s dura la animación del último rodillo
    });

    /* =========================================
       2. EFECTO SCROLL (Oscurecimiento)
       ========================================= */
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / maxScroll;

        document.documentElement.style.setProperty('--bg-darkness', 25 - (scrollPercent * 20));
        document.documentElement.style.setProperty('--neon-intensity', 1 - (scrollPercent * 0.9));
        document.documentElement.style.setProperty('--light-opacity', 1 - (scrollPercent * 1.5));
    });

    /* =========================================
       3. GRÁFICO DE FICHAS APILADAS
       ========================================= */
    const chartContainer = document.getElementById("stacked-chart");
    const chartData = [
        { label: "2021", chips: 4 },
        { label: "2022", chips: 7 },
        { label: "2023", chips: 12 },
        { label: "2024", chips: 18 }
    ];

    if (chartContainer) {
        chartData.forEach(data => {
            const barDiv = document.createElement("div");
            barDiv.className = "chart-bar";
            
            for(let i = 0; i < data.chips; i++) {
                const chip = document.createElement("div");
                chip.className = "chip";
                barDiv.appendChild(chip);
            }

            const label = document.createElement("div");
            label.className = "bar-label";
            label.textContent = data.label;
            barDiv.appendChild(label);

            chartContainer.appendChild(barDiv);
        });
    }

    /* =========================================
       4. RULETA BÁSICA
       ========================================= */
    const canvas = document.getElementById("roulette-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const btnSpin = document.getElementById("btn-spin");
        const resultText = document.getElementById("result-text");
        const resultDiv = document.getElementById("roulette-result");
        const colors = ["#ff0000", "#111111", "#ff0000", "#111111", "#ff0000", "#111111"];
        const labels = ["0%", "0%", "0%", "0%", "0%", "0%"];
        let currentRotation = 0;

        function drawRoulette() {
            const arc = (2 * Math.PI) / colors.length;
            for (let i = 0; i < colors.length; i++) {
                ctx.beginPath(); ctx.fillStyle = colors[i];
                ctx.moveTo(150, 150); ctx.arc(150, 150, 150, i * arc, (i + 1) * arc, false);
                ctx.lineTo(150, 150); ctx.fill();
                ctx.save(); ctx.translate(150, 150); ctx.rotate(i * arc + arc / 2);
                ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "bold 20px Fredoka";
                ctx.fillText(labels[i], 130, 10); ctx.restore();
            }
        }
        drawRoulette();

        btnSpin.addEventListener("click", () => {
            btnSpin.disabled = true;
            currentRotation += 360 * 5 + 180; 
            canvas.style.transform = `rotate(${currentRotation}deg)`;
            setTimeout(() => {
                resultDiv.style.display = "block";
                resultText.innerHTML = "<strong>0% RECUPERADO</strong>";
            }, 4000); 
        });
    }
});
