window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 1000);
    }, 2500); 
});

// ==========================================
// VARIABLES DE SEGUIMIENTO Y AUDIO
// ==========================================
let currentPhase = 1; 
const btnBack = document.getElementById('btn-back');
const bgMusic = document.getElementById('bg-music');
if (bgMusic) bgMusic.volume = 0.3; // Volumen agradable de fondo

// ELEMENTOS DE INTERFAZ - FASE 1 (SLOT)
const spinButton = document.getElementById('spin-button');
const slotLever = document.getElementById('slot-lever'); 
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const winScore = document.getElementById('win-score');
const cabinet = document.querySelector('.arcade-cabinet-real');
const blinkOverlay = document.getElementById('blink-overlay');
const slotDataOverlay = document.getElementById('slot-data-overlay');
const btnSlotContinue = document.getElementById('btn-slot-continue');

// ELEMENTOS DE INTERFAZ - FASES SIGUIENTES
const contextScreen = document.getElementById('context-screen');
const btnContextContinue = document.getElementById('btn-context-continue');
const btnContinue = document.getElementById('btn-continue');
const darkScreen = document.getElementById('dark-screen');
const dealerScreen = document.getElementById('dealer-screen');
const articleScreen = document.getElementById('article-screen');
const slotBorders = document.getElementById('slot-borders');
const glassContainer = document.querySelector('.glass-container');
const cards = document.querySelectorAll('.playing-card');

// ¡AQUÍ ESTABAN LOS ELEMENTOS FANTASMAS QUE TE ATRAPABAN!
const dealerDialogue = document.querySelector('.dealer-dialogue');
const cardsRevelation = document.getElementById('cards-revelation');
const btnCardsContinue = document.getElementById('btn-cards-continue');

// ELEMENTOS DE INTERFAZ - CIERRES (FASE 6 Y 7)
const btnToInfluence = document.getElementById('btn-to-influence');
const influenceScreen = document.getElementById('influence-screen');
const collageCanvas = document.getElementById('collage-canvas');
const finalClosureText = document.getElementById('final-closure-text');
const influenceHeader = document.querySelector('.influence-header');
const scrollArrow = document.getElementById('scroll-arrow');
const btnToReflection = document.getElementById('btn-to-reflection');
const reflectionScreen = document.getElementById('reflection-screen');
const btnLoopBack = document.getElementById('btn-loop-back');

const fruits = ['🍒', '🍋', '🍉', '🍇', '🔔', '⭐'];
let audioCtx;
let scoreInterval;
let mapInitialized = false;
const totalImagesCount = 27;
const imageFolder = "imagenes/"; // Ruta de tu carpeta raíz

// ==========================================
// MOTOR NATIVO DE AUDIO (WEB AUDIO API)
// ==========================================
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playRetroWinSound() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1200, audioCtx.currentTime); 
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
            oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1);
        }, i * 100);
    }
}

function playCardSound() {
    if (!audioCtx) return;
    const gainNode = audioCtx.createGain();
    const bufferSize = audioCtx.sampleRate * 0.08; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1; 
    const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1000; 
    gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    noise.connect(filter); filter.connect(gainNode); gainNode.connect(audioCtx.destination);
    noise.start();
}

function playGlassShatter() {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.5; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const freqs = [5000, 7500, 9800, 13000];
    freqs.forEach(freq => {
        const osc = audioCtx.createOscillator(); osc.type = 'square'; osc.frequency.value = freq + (Math.random() * 600);
        const oscGain = audioCtx.createGain(); oscGain.gain.setValueAtTime(0.12, audioCtx.currentTime); oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25 + Math.random() * 0.2);
        osc.connect(oscGain); oscGain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.5);
    });
    const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 4500; 
    const gainNode = audioCtx.createGain(); gainNode.gain.setValueAtTime(0.9, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    noise.connect(filter); filter.connect(gainNode); gainNode.connect(audioCtx.destination); noise.start();
}

function playTypewriterSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280 + Math.random() * 80, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
}

function blink(duration, stayClosed = false, callback = null) {
    blinkOverlay.classList.add('eyes-closed'); 
    setTimeout(() => {
        if (callback) callback(); 
        if (!stayClosed) blinkOverlay.classList.remove('eyes-closed');
    }, duration);
}

// ==========================================
// MAQUINARIA EFECTO MÁQUINA DE ESCRIBIR
// ==========================================
function typeTextSequential(elements, index, onComplete) {
    if (index >= elements.length) {
        if (onComplete) onComplete();
        return;
    }
    const el = elements[index];
    const text = el.getAttribute('data-text');
    
    if (el.innerHTML.length === text.length) {
        typeTextSequential(elements, index + 1, onComplete);
        return;
    }

    el.innerHTML = '';
    el.classList.add('typing');
    
    let charIndex = 0;
    function typeNextChar() {
        if (charIndex < text.length) {
            el.innerHTML += text.charAt(charIndex);
            playTypewriterSound();
            charIndex++;
            setTimeout(typeNextChar, 25 + Math.random() * 25);
        } else {
            el.classList.remove('typing');
            el.classList.add('done');
            setTimeout(() => typeTextSequential(elements, index + 1, onComplete), 500);
        }
    }
    typeNextChar();
}

// ==========================================
// FASE 1: TRAGAMONEDAS ENGINE
// ==========================================
spinButton.addEventListener('click', () => {
    initAudio();
    
    // Activa la música ambiente al interactuar
    if (bgMusic && bgMusic.paused) { bgMusic.play(); }

    spinButton.disabled = true;
    spinButton.style.opacity = '0.7';
    spinButton.innerText = 'GIRANDO...';

    slotLever.classList.add('pulled');
    setTimeout(() => slotLever.classList.remove('pulled'), 250);

    let isSpinning = [true, true, true];
    let spinInterval = setInterval(() => {
        reels.forEach((reel, index) => {
            if (isSpinning[index]) reel.innerText = fruits[Math.floor(Math.random() * fruits.length)];
        });
    }, 80);

    setTimeout(() => { isSpinning[0] = false; reels[0].innerText = '🍒'; playCardSound(); }, 1000);
    setTimeout(() => { isSpinning[1] = false; reels[1].innerText = '🍒'; playCardSound(); }, 1800);
    setTimeout(() => {
        isSpinning[2] = false; reels[2].innerText = '🍒'; playCardSound();
        clearInterval(spinInterval); 

        scoreInterval = setInterval(() => {
            winScore.innerText = '$ ' + (Math.floor(Math.random() * 400000000) + 600000000).toLocaleString('es-CL');
        }, 50);

        spinButton.innerText = '¡JACKPOT!';
        cabinet.classList.add('jackpot-flash');
        playRetroWinSound();

        setTimeout(() => {
            cabinet.classList.remove('jackpot-flash'); 
            blinkOverlay.classList.add('eyes-closed'); 
            setTimeout(() => {
                slotDataOverlay.classList.remove('hidden'); 
                blinkOverlay.classList.remove('eyes-closed'); 
            }, 500);
        }, 3000);
    }, 2600);
});

slotLever.addEventListener('click', () => {
    if (!spinButton.disabled) spinButton.click();
});

btnSlotContinue.addEventListener('click', () => {
    clearInterval(scoreInterval);
    slotDataOverlay.classList.add('hidden');
    currentPhase = 1.5; 
    
    if (bgMusic) bgMusic.pause(); // Pausar música para la zona de texto

    blink(500, true, () => {
        document.getElementById('slot-screen').style.display = 'none';
        contextScreen.classList.remove('hidden');
        contextScreen.style.display = 'flex';
        contextScreen.style.opacity = '1';
        btnBack.classList.remove('hidden'); 
        
        setTimeout(() => {
            blinkOverlay.classList.remove('eyes-closed');
            const contextLines = document.querySelectorAll('.context-text');
            typeTextSequential(contextLines, 0, () => {
                btnContextContinue.classList.add('visible');
            });
        }, 1500);
    });
});

// ==========================================
// FASE 1.5 A FASE 2
// ==========================================
btnContextContinue.addEventListener('click', () => {
    initAudio();
    contextScreen.style.opacity = '0';
    currentPhase = 2; 
    
    setTimeout(() => {
        contextScreen.classList.add('hidden');
        contextScreen.style.display = 'none';
        darkScreen.classList.remove('hidden');
        darkScreen.style.display = 'flex';
        setTimeout(() => darkScreen.style.opacity = '1', 50);
    }, 800);
});

// ==========================================
// FASE 2 A FASE 3 (CARTAS MESA)
// ==========================================
btnContinue.addEventListener('click', () => {
    darkScreen.style.opacity = '0';
    currentPhase = 3; 
    
    setTimeout(() => {
        darkScreen.classList.add('hidden');
        darkScreen.style.display = 'none';
        dealerScreen.classList.remove('hidden');
        dealerScreen.style.display = 'flex';
        void dealerScreen.offsetWidth; 
        dealerScreen.style.opacity = '1';
        setTimeout(playCardSound, 200); setTimeout(playCardSound, 500); setTimeout(playCardSound, 800);
    }, 1500); 
});

// LÓGICA DE CARTAS (El error estaba en la falta de variables)
let hasRevealed = false;
cards.forEach((card) => {
    card.addEventListener('click', function() {
        this.classList.toggle('is-flipped');
        playCardSound();

        if (!hasRevealed) {
            hasRevealed = true;
            dealerDialogue.style.opacity = '0';
            setTimeout(() => {
                cardsRevelation.classList.remove('hidden');
                void cardsRevelation.offsetWidth; 
                cardsRevelation.classList.add('fade-in');
            }, 1000); 
        }
    });
});

// ==========================================
// FASE 4: CRÓNICA SCROLLYTELLING Y VIDRIO
// ==========================================
const glassBreakObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        glassContainer.classList.add('exploded');
        playGlassShatter(); 
        
        // Retomar la música ambiente al quebrar el vidrio
        if (bgMusic) bgMusic.play();

        articleScreen.classList.add('lights-on');
        slotBorders.classList.add('active');
        initScrollText();
        
        setTimeout(() => {
            const cinLines = document.querySelectorAll('.cin-text');
            typeTextSequential(cinLines, 0, null);
        }, 800);

        glassBreakObserver.disconnect();
    }
}, { threshold: 0.1 });

// Ahora el botón sí funcionará porque la variable está declarada
btnCardsContinue.addEventListener('click', () => {
    dealerScreen.style.opacity = '0';
    currentPhase = 4; 
    
    setTimeout(() => {
        dealerScreen.classList.add('hidden');
        dealerScreen.style.display = 'none';
        articleScreen.classList.remove('hidden');
        articleScreen.style.display = 'block';
        document.body.style.overflow = 'auto'; 
        void articleScreen.offsetWidth;
        articleScreen.style.opacity = '1';
        
        glassBreakObserver.observe(document.getElementById('intro-text'));
    }, 1500);
});

function initScrollText() {
    const fadeElements = document.querySelectorAll('.fade-sequence, .neon-text-bridge');
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.25 });
    
    fadeElements.forEach(el => textObserver.observe(el));
}

document.querySelector('.play-btn').addEventListener('click', function() {
    this.innerText = this.innerText === '▶' ? '⏸' : '▶';
    initAudio();
});

// INTERACCIÓN DE TRIVIA
const triviaOptionsContainer = document.querySelector('.trivia-options');
const triviaButtons = document.querySelectorAll('.trivia-btn');
const triviaFeedback = document.querySelector('.trivia-feedback');

triviaButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        triviaOptionsContainer.classList.add('answered');
        if (this.getAttribute('data-correct') === "false") this.classList.add('selected-wrong');
        triviaFeedback.classList.remove('hidden');
        initAudio(); playCardSound(); 
    });
});

// ==========================================
// FASE 5: ZONA CIEGA CORE ENGINE
// ==========================================
const btnToScene5 = document.getElementById('btn-to-scene-5');
const doorsTransition = document.getElementById('doors-transition');
const scene5 = document.getElementById('scene-5-screen');

const fechaProyecto = new Date(2022, 2, 7, 0, 0, 0); 
let timerIntervalId = null;

function actualizarContador() {
    const ahora = new Date();
    let diferenciaMs = ahora - fechaProyecto;

    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenciaMs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenciaMs / 1000 / 60) % 60);
    const segundos = Math.floor((diferenciaMs / 1000) % 60);

    document.getElementById("timer-days").innerText = dias;
    document.getElementById("timer-hours").innerText = horas.toString().padStart(2, '0');
    document.getElementById("timer-minutes").innerText = minutos.toString().padStart(2, '0');
    document.getElementById("timer-seconds").innerText = segundos.toString().padStart(2, '0');
}

function initLeafletPro() {
    if (mapInitialized) return;
    const map = L.map('leaflet-map', { zoomControl: false, dragging: true, scrollWheelZoom: false }).setView([18, -40], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO'
    }).addTo(map);

    const coords = { chile: [-33.4489, -70.6693], malta: [35.9375, 14.3754], curazao: [12.1696, -68.9900] };

    L.circleMarker(coords.chile, { color: '#ff3333', radius: 7, fillColor: '#ff3333', fillOpacity: 0.8 }).addTo(map).bindPopup("<b>Usuario Final</b><br>Santiago, Chile").openPopup();
    L.circleMarker(coords.malta, { color: '#ffff00', radius: 6, fillColor: '#ffff00', fillOpacity: 0.8 }).addTo(map).bindPopup("<b>Paraíso Fiscal</b><br>Licencia MGA, Malta");
    L.circleMarker(coords.curazao, { color: '#ffff00', radius: 6, fillColor: '#ffff00', fillOpacity: 0.8 }).addTo(map).bindPopup("<b>Paraíso Fiscal</b><br>Licencia de Juego, Curazao");

    L.polyline([coords.chile, coords.curazao], { color: '#ff3333', dashArray: '6, 6', weight: 2, opacity: 0.8 }).addTo(map);
    L.polyline([coords.chile, coords.malta], { color: '#ff3333', dashArray: '6, 6', weight: 2, opacity: 0.8 }).addTo(map);

    mapInitialized = true;
    setTimeout(() => { map.invalidateSize(); }, 300);
}

btnToScene5.addEventListener('click', () => {
    initAudio();
    if (bgMusic) bgMusic.pause(); // Pausamos la música al dejar el reporte
    
    doorsTransition.classList.add('closed');
    document.body.style.overflow = 'hidden'; 
    currentPhase = 5; 
    
    setTimeout(() => {
        articleScreen.style.display = 'none';
        scene5.classList.remove('hidden');
        doorsTransition.style.opacity = '0'; 
        
        window.scrollTo(0, 0); // FORZADO AL TOPE
        document.body.style.overflow = 'auto'; 
        
        setTimeout(() => document.getElementById('s5-title').classList.add('visible'), 500);
        setTimeout(() => document.querySelector('.subtitle-s5').classList.add('visible'), 1800);
        
        setTimeout(() => {
            document.getElementById('s5-map').classList.add('visible');
            initLeafletPro();
            playCardSound(); 
        }, 3200);
        
        setTimeout(() => {
            document.getElementById('s5-timer').classList.add('visible');
            actualizarContador(); 
            if (!timerIntervalId) timerIntervalId = setInterval(actualizarContador, 1000);
        }, 5200);
        
        setTimeout(() => document.getElementById('s5-comp').classList.add('visible'), 7500);
    }, 1500); 
});

// ==========================================
// FASE 6: EL BOMBARDEO VISUAL (COLLAGE)
// ==========================================
function buildCollageCanvas() {
    collageCanvas.innerHTML = ""; 
    
    for (let i = 1; i <= totalImagesCount; i++) {
        const img = document.createElement('img');
        
        // Ruta adaptada exactamente al nombre físico de tus archivos
        img.src = `${imageFolder}apuesta${i}.png.png`; 
        img.alt = "Prueba de influencia publicitaria";
        img.classList.add('collage-img');
        img.id = `evidencia-${i}`;

        img.onerror = function() {
            this.style.display = 'none';
        };

        // Mayor sesgo probabilístico hacia el sector derecho inferior
        let left, top;
        if (i % 3 === 0) {
            left = Math.floor(Math.random() * 30) + 52; 
            top = Math.floor(Math.random() * 30) + 48;  
        } else {
            left = Math.floor(Math.random() * 72); 
            top = Math.floor(Math.random() * 68);  
        }

        const rotation = Math.floor(Math.random() * 32) - 16; 
        const width = Math.floor(Math.random() * 120) + 240;  

        img.style.left = `${left}%`;
        img.style.top = `${top}%`;
        img.style.width = `${width}px`;
        img.style.setProperty('--r', `${rotation}deg`); 
        img.style.zIndex = i; 

        collageCanvas.appendChild(img);
    }
}

window.addEventListener('scroll', () => {
    if (currentPhase !== 6) return; 

    const rect = influenceScreen.getBoundingClientRect();
    const sectionHeight = influenceScreen.scrollHeight - window.innerHeight;
    const scrolledInsideSection = -rect.top;

    let progress = scrolledInsideSection / sectionHeight;
    progress = Math.max(0, Math.min(progress, 1)); 

    if (progress > 0.04) {
        scrollArrow.style.opacity = "0";
    } else {
        scrollArrow.style.opacity = "1";
    }

    const imagesToTrigger = Math.floor(progress * (totalImagesCount + 4)); 

    for (let i = 1; i <= totalImagesCount; i++) {
        const imgElement = document.getElementById(`evidencia-${i}`);
        if (!imgElement) continue;

        if (i <= imagesToTrigger) {
            imgElement.classList.add('triggered');
        } else {
            imgElement.classList.remove('triggered');
        }
    }

    if (progress > 0.82) {
        collageCanvas.classList.add('dimmed');
        influenceHeader.style.opacity = "0.05";
        finalClosureText.classList.add('reveal');
    } else {
        collageCanvas.classList.remove('dimmed');
        influenceHeader.style.opacity = "1";
        finalClosureText.classList.remove('reveal');
    }
});

btnToInfluence.addEventListener('click', () => {
    initAudio();
    doorsTransition.classList.add('closed');
    document.body.style.overflow = 'hidden'; 
    currentPhase = 6; 
    
    setTimeout(() => {
        scene5.style.display = 'none';
        scene5.classList.add('hidden');
        
        // Solución al bug de Loop (devuelve opacidad)
        influenceScreen.style.opacity = '1'; 
        
        influenceScreen.classList.remove('hidden');
        doorsTransition.style.opacity = '0'; 
        
        window.scrollTo(0, 0); 
        document.body.style.overflow = 'auto'; 
        buildCollageCanvas(); 
        playGlassShatter(); 
    }, 1500);
});

// ==========================================
// FASE 7: AVANCE A LA REFLEXIÓN FINAL
// ==========================================
btnToReflection.addEventListener('click', () => {
    initAudio();
    influenceScreen.style.opacity = '0';
    currentPhase = 7;
    document.body.style.overflow = 'hidden';
    
    // Ocultar botón Volver al entrar al callejón sin salida
    btnBack.classList.add('hidden');

    setTimeout(() => {
        influenceScreen.classList.add('hidden');
        influenceScreen.style.display = 'none';
        reflectionScreen.classList.remove('hidden');
        reflectionScreen.style.display = 'flex';
        reflectionScreen.style.opacity = '1';

        setTimeout(() => {
            const reflectionLines = document.querySelectorAll('.ref-text');
            typeTextSequential(reflectionLines, 0, () => {
                btnLoopBack.classList.add('visible');
            });
        }, 1000);
    }, 800);
});

// RESET COMPLETO AL INICIO 
btnLoopBack.addEventListener('click', () => {
    initAudio();
    blink(800, true, () => {
        reflectionScreen.classList.add('hidden');
        reflectionScreen.style.display = 'none';
        
        const slotScreen = document.getElementById('slot-screen');
        slotScreen.style.display = 'flex';
        slotScreen.classList.remove('hidden');

        currentPhase = 1;
        
        // Volver a reproducir la música base
        if (bgMusic) { bgMusic.currentTime = 0; bgMusic.play(); }

        spinButton.disabled = false;
        spinButton.style.opacity = '1';
        spinButton.innerText = 'GIRAR / PLAY';
        winScore.innerText = '$ 0';
        hasRevealed = false;
        cardsRevelation.classList.add('hidden');
        cardsRevelation.classList.remove('fade-in');
        dealerDialogue.style.opacity = '1';
        
        cards.forEach(c => c.classList.remove('is-flipped'));
        glassContainer.classList.remove('exploded');
        articleScreen.classList.remove('lights-on');
        slotBorders.classList.remove('active');
        triviaOptionsContainer.classList.remove('answered');
        triviaFeedback.classList.add('hidden');
        triviaButtons.forEach(b => b.classList.remove('selected-wrong'));
        btnContextContinue.classList.remove('visible');
        btnLoopBack.classList.remove('visible');

        document.querySelectorAll('.typewriter-line').forEach(el => {
            el.innerHTML = '';
            el.classList.remove('done', 'typing');
        });

        btnBack.classList.add('hidden');
        window.scrollTo(0, 0);
    });
});

// ==========================================
// MAQUINARIA DEL BOTÓN VOLVER GLOBAL
// ==========================================
btnBack.addEventListener('click', () => {
    initAudio();
    
    if (currentPhase === 1.5) {
        contextScreen.style.opacity = '0';
        if (bgMusic) bgMusic.play(); // Volver a la música slot
        
        setTimeout(() => {
            contextScreen.classList.add('hidden');
            contextScreen.style.display = 'none';
            document.getElementById('slot-screen').style.display = 'flex';
            btnBack.classList.add('hidden'); 
            currentPhase = 1;
        }, 800);
        
    } else if (currentPhase === 2) {
        darkScreen.style.opacity = '0';
        setTimeout(() => {
            darkScreen.classList.add('hidden');
            darkScreen.style.display = 'none';
            contextScreen.classList.remove('hidden');
            contextScreen.style.display = 'flex';
            setTimeout(() => contextScreen.style.opacity = '1', 50);
            currentPhase = 1.5;
        }, 800);
        
    } else if (currentPhase === 3) {
        dealerScreen.style.opacity = '0';
        setTimeout(() => {
            dealerScreen.classList.add('hidden');
            dealerScreen.style.display = 'none';
            darkScreen.classList.remove('hidden');
            darkScreen.style.display = 'flex';
            setTimeout(() => darkScreen.style.opacity = '1', 50);
            currentPhase = 2;
        }, 800);
        
    } else if (currentPhase === 4) {
        articleScreen.style.opacity = '0';
        document.body.style.overflow = 'hidden'; 
        if (bgMusic) bgMusic.pause(); // Matar música del scroll al retroceder
        
        setTimeout(() => {
            articleScreen.classList.add('hidden');
            articleScreen.style.display = 'none';
            dealerScreen.classList.remove('hidden');
            dealerScreen.style.display = 'flex';
            setTimeout(() => dealerScreen.style.opacity = '1', 50);
            currentPhase = 3;
        }, 800);
        
    } else if (currentPhase === 5) {
        scene5.style.opacity = '0'; 
        doorsTransition.style.opacity = '1';
        doorsTransition.classList.remove('closed'); 
        if (bgMusic) bgMusic.play(); // Retomar la música del scroll
        
        setTimeout(() => {
            scene5.classList.add('hidden');
            scene5.style.opacity = '1'; 
            articleScreen.style.display = 'block';
            articleScreen.classList.remove('hidden');
            
            setTimeout(() => {
                articleScreen.style.opacity = '1';
                document.body.style.overflow = 'auto'; 
                currentPhase = 4;
            }, 50);
        }, 800);
        
    } else if (currentPhase === 6) {
        influenceScreen.style.opacity = '0';
        doorsTransition.style.opacity = '1';
        doorsTransition.classList.remove('closed');
        
        setTimeout(() => {
            influenceScreen.classList.add('hidden');
            influenceScreen.style.opacity = '1'; 
            scene5.style.display = 'block';
            scene5.classList.remove('hidden');
            
            setTimeout(() => {
                document.body.style.overflow = 'auto';
                currentPhase = 5;
            }, 50);
        }, 800);
    }
});