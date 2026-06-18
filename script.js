/**
 * SLOT MACHINE INTERACTIVE GAME - SCRIPT
 * Reportaje investigativo: El lado oscuro de los casinos online
 * 
 * Características:
 * - Máquina tragamonedas con 3 spins (2 ganancias, 1 pérdida)
 * - Ruleta interactiva con resultado predeterminado
 * - Efecto de degradación visual por scroll
 * - Animaciones suave y lógica modular
 */

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================

const config = {
    // Slot machine
    spinDuration: 2000, // ms duración del giro
    spinCount: 0, // Contador de giros realizados
    credit: 100, // Crédito inicial
    
    // Ruleta
    rouletteSpinDuration: 3000, // ms duración del giro
    
    // Datos periodísticos para modal
    modalFacts: [
        "El 87% de los jugadores pierden dinero en casinos online dentro del primer año.",
        "La industria global de casinos online genera ingresos de $41 mil millones anuales.",
        "El algoritmo de las máquinas tragamonedas está optimizado para maximizar el tiempo de juego.",
        "El RTP (Return to Player) del 95% es un promedio teórico a largo plazo, no una garantía.",
        "Las notificaciones de 'casi ganada' aumentan 3x la probabilidad de volver a jugar.",
        "La tasa de ludopatía se ha triplicado desde 2015 con la expansión del juego online."
    ]
};

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const elements = {
    // Slot machine
    reels: document.querySelectorAll('.reel'),
    creditValue: document.getElementById('credit-value'),
    btnStart: document.getElementById('btn-start'),
    winDisplay: document.getElementById('win-display'),
    winText: document.getElementById('win-text'),
    slotInfo: document.getElementById('slot-info'),
    
    // Ruleta
    canvas: document.getElementById('roulette-canvas'),
    btnSpin: document.getElementById('btn-spin'),
    rouletteResult: document.getElementById('roulette-result'),
    resultText: document.getElementById('result-text'),
    
    // Modal
    modal: document.getElementById('modal-perdida'),
    modalClose: document.getElementById('modal-close'),
    modalFact: document.getElementById('modal-fact'),
    
    // Body para aplicar filtros
    body: document.body
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Actualiza el brillo y saturación según scroll
 * Degradación visual progresiva conforme avanza la página
 */
function updateBrightnessFromScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const scrollPercentage = scrolled / scrollHeight; // 0 a 1
    
    // Degradación: comienza en 1 (100%) y llega a 0.7 (70%)
    const brightness = 1 - (scrollPercentage * 0.3); // 1 a 0.7
    
    // Desaturación progresiva
    const saturation = 1 - (scrollPercentage * 0.4); // 1 a 0.6
    
    // Aplicar variables CSS
    elements.body.style.setProperty('--main-brightness', brightness);
    elements.body.style.setProperty('--saturation', saturation * 100 + '%');
}

/**
 * Obtiene un número aleatorio entre min y max
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========================================
// SLOT MACHINE LOGIC
// ========================================

/**
 * Símbolos disponibles en los rodillos
 */
const symbols = ['🍎', '🍋', '🍇', '🍓', '🎃', '🍒'];

/**
 * Anima un rodillo hacia una posición específica
 * @param {Element} reel - El rodillo a animar
 * @param {number} targetIndex - Índice del símbolo destino
 * @param {number} duration - Duración de la animación en ms
 */
function spinReel(reel, targetIndex, duration) {
    return new Promise((resolve) => {
        const reelSymbols = reel.querySelectorAll('.reel-symbol');
        const symbolHeight = reel.clientHeight / reelSymbols.length;
        
        // Distancia a recorrer: simular múltiples giros
        const totalRotations = 5; // Giros completos
        const targetTranslate = -(targetIndex * symbolHeight) - (totalRotations * symbolHeight * reelSymbols.length);
        
        // Aplicar animación CSS
        reel.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        reel.style.transform = `translateY(${targetTranslate}px)`;
        
        // Resolver cuando termina la animación
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

/**
 * Ejecuta un spin de la máquina tragamonedas
 * Spin 1: Victoria (+50)
 * Spin 2: Victoria menor (+20)
 * Spin 3: Derrota completa (todo a 0 y modal)
 */
async function executeSlotSpin() {
    config.spinCount++;
    elements.btnStart.disabled = true;
    elements.slotInfo.textContent = `Girando... Spin ${config.spinCount}`;
    
    let winAmount = 0;
    let resultSymbols = [];
    
    // Determinar resultado según spin count
    if (config.spinCount === 1) {
        // SPIN 1: Victoria (+50)
        winAmount = 50;
        resultSymbols = [0, 0, 0, 0, 0]; // Todas manzanas (🍎)
    } else if (config.spinCount === 2) {
        // SPIN 2: Victoria menor (+20)
        winAmount = 20;
        resultSymbols = [1, 1, 1, 1, 1]; // Todas peras (🍋)
    } else {
        // SPIN 3+: Derrota completa
        winAmount = -config.credit; // Pérdida total
        resultSymbols = [4, 2, 5, 3, 0]; // Símbolos variados (derrota)
    }
    
    // Animar todos los rodillos simultáneamente
    const spinPromises = [];
    elements.reels.forEach((reel, index) => {
        spinPromises.push(
            spinReel(reel, resultSymbols[index], config.spinDuration)
        );
    });
    
    // Esperar a que terminen todas las animaciones
    await Promise.all(spinPromises);
    
    // Actualizar crédito
    config.credit += winAmount;
    elements.creditValue.textContent = config.credit;
    
    // Mostrar ganancia
    if (winAmount >= 0) {
        elements.winText.textContent = `WIN +${winAmount}`;
        elements.slotInfo.textContent = `¡Ganaste ${winAmount} créditos! Total: ${config.credit}`;
    } else {
        elements.winText.textContent = 'LOSE ALL';
        elements.slotInfo.textContent = '¡PERDISTE TODO!';
    }
    
    // Si es el tercer spin, mostrar modal
    if (config.spinCount >= 3) {
        showLoseModal();
        elements.btnStart.disabled = true;
    } else {
        elements.btnStart.disabled = false;
    }
}

/**
 * Muestra el modal de pérdida total
 */
function showLoseModal() {
    const randomFact = config.modalFacts[
        getRandomInt(0, config.modalFacts.length - 1)
    ];
    elements.modalFact.textContent = randomFact;
    elements.modal.style.display = 'flex';
}

/**
 * Cierra el modal
 */
function closeModal() {
    elements.modal.style.display = 'none';
}

// ========================================
// ROULETTE LOGIC
// ========================================

/**
 * Dibuja la ruleta en canvas
 * @param {number} rotation - Rotación actual en grados
 */
function drawRoulette(rotation = 0) {
    const ctx = elements.canvas.getContext('2d');
    const centerX = elements.canvas.width / 2;
    const centerY = elements.canvas.height / 2;
    const radius = 180;
    
    // Limpiar canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    
    // Sectores de la ruleta
    const sectors = [
        { label: '10%', color: '#b700ff' },
        { label: '5%', color: '#ff006e' },
        { label: '15%', color: '#00f5ff' },
        { label: '2%', color: '#ffff00' },
        { label: '8%', color: '#39ff14' },
        { label: '20%', color: '#b700ff' },
    ];
    
    const sectorAngle = 360 / sectors.length;
    
    // Aplicar rotación
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
    
    // Dibujar sectores
    sectors.forEach((sector, index) => {
        const startAngle = ((index * sectorAngle - 90) * Math.PI) / 180;
        const endAngle = (((index + 1) * sectorAngle - 90) * Math.PI) / 180;
        
        // Sector relleno
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = sector.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Texto del sector
        const textAngle = (startAngle + endAngle) / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px VT323';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sector.label, textX, textY);
    });
    
    ctx.restore();
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff14';
    ctx.fill();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Ejecuta un giro de la ruleta
 * El resultado está predeterminado (no es azaroso)
 */
async function executeRouletteSpins() {
    elements.btnSpin.disabled = true;
    
    // Giro inicial de familiarización
    let currentRotation = 0;
    const spinInterval = setInterval(() => {
        currentRotation += 10;
        drawRoulette(currentRotation);
    }, 20);
    
    // Detener el giro rápido después de 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));
    clearInterval(spinInterval);
    
    // Giro final controlado: detenerse en un sector específico (15% - sector predeterminado)
    const targetRotation = 130; // Ángulo para detenerse en sector predeterminado
    const rotationDifference = targetRotation - (currentRotation % 360);
    const finalRotation = currentRotation + rotationDifference + 360 * 3; // 3 giros completos extras
    
    // Animación suave hasta el destino
    return new Promise(resolve => {
        const startTime = Date.now();
        const startRotation = currentRotation;
        
        const animateToTarget = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / config.rouletteSpinDuration, 1);
            
            // Easing function: ease-out (desaceleración)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentRot = startRotation + (finalRotation - startRotation) * easeProgress;
            drawRoulette(currentRot);
            
            if (progress < 1) {
                requestAnimationFrame(animateToTarget);
            } else {
                // Mostrar resultado
                showRouletteResult('15%');
                elements.btnSpin.disabled = false;
                resolve();
            }
        };
        
        animateToTarget();
    });
}

/**
 * Muestra el resultado de la ruleta
 * @param {string} result - El porcentaje ganador
 */
function showRouletteResult(result) {
    elements.resultText.textContent = `🎯 ¡GANASTE! ${result} de bonificación (predeterminado)`;
    elements.rouletteResult.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        elements.rouletteResult.style.display = 'none';
    }, 5000);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Botón START de slot machine
elements.btnStart.addEventListener('click', executeSlotSpin);

// Botón GIRAR de ruleta
elements.btnSpin.addEventListener('click', executeRouletteSpins);

// Cerrar modal
elements.modalClose.addEventListener('click', closeModal);
elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) closeModal();
});

// Degradación por scroll
window.addEventListener('scroll', updateBrightnessFromScroll, { passive: true });

// ========================================
// INICIALIZACIÓN
// ========================================

/**
 * Función de inicialización
 */
function init() {
    // Dibujar ruleta inicial
    drawRoulette(0);
    
    // Inicializar crédito
    elements.creditValue.textContent = config.credit;
    
    console.log('🎰 Slot Machine Interactive Report inicializado');
    console.log('Spin 1: +50 créditos (victoria)');
    console.log('Spin 2: +20 créditos (victoria menor)');
    console.log('Spin 3: -100 créditos (pérdida total y modal)');
}

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
