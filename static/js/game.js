/* -------------------------------------------------------------
   Dream Dress-Up Room - Retro Paint Edition Client Controller
   ------------------------------------------------------------- */

// Global Sound & Music Synthesizer Class
class SoundManager {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = false;
        
        // Music sequencer
        this.musicTimer = null;
        this.tempo = 900; // ms per beat
        this.step = 0;
        
        // Chords: Cmaj7 - Am7 - Fmaj7 - G7
        this.chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (!this.soundEnabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08); // A5
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playEquip() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.04 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);
            
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.2);
        });
    }

    playSparkle() {
        if (!this.soundEnabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playSaveSuccess() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.3);
        });
    }

    toggleMusic(forceState = null) {
        this.musicEnabled = forceState !== null ? forceState : !this.musicEnabled;
        const airbrushBtn = document.getElementById('tool-spray');
        
        if (this.musicEnabled) {
            this.init();
            airbrushBtn.classList.add('active');
            this.startMusicLoop();
            showNotification("Cozy background music playing! 📻");
        } else {
            airbrushBtn.classList.remove('active');
            this.stopMusicLoop();
            showNotification("Music stopped.");
        }
    }

    startMusicLoop() {
        if (this.musicInterval) return;
        this.step = 0;
        
        const playStep = () => {
            if (!this.musicEnabled) return;
            
            const chordIdx = Math.floor(this.step / 4) % 4;
            const chord = this.chords[chordIdx];
            
            const notePattern = [0, 2, 1, 3, 2, 1, 3, 0];
            const patternIdx = this.step % 8;
            const noteFreq = chord[notePattern[patternIdx % chord.length]];
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.82);
            
            this.step++;
            
            this.musicInterval = setTimeout(playStep, this.tempo);
        };
        
        playStep();
    }

    stopMusicLoop() {
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

const sound = new SoundManager();

/* -------------------------------------------------------------
   PIXEL-ART CHARACTER & ASSETS DEFINITIONS (Snapped 4px steps)
   ------------------------------------------------------------- */
const BASE_VIEWBOX = "0 0 240 380";

// Pixel doll base builder
const CHAR_BASE = {
    body: (skinColor) => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Pixel Shadow -->
            <rect x="76" y="360" width="88" height="12" fill="rgba(0,0,0,0.08)" />
            
            <!-- Left Leg -->
            <rect x="96" y="240" width="16" height="120" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Right Leg -->
            <rect x="128" y="240" width="16" height="120" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Torso / Hips -->
            <rect x="92" y="160" width="56" height="84" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Left Arm -->
            <rect x="76" y="160" width="16" height="88" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Right Arm -->
            <rect x="148" y="160" width="16" height="88" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Neck -->
            <rect x="112" y="136" width="16" height="24" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Head -->
            <rect x="96" y="72" width="48" height="64" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            
            <!-- Ears -->
            <rect x="88" y="92" width="8" height="16" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
            <rect x="144" y="92" width="8" height="16" fill="${skinColor}" stroke="#6d4c51" stroke-width="4" />
        </svg>
    `,
    
    underwear: () => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Pink Pixel Bralette -->
            <rect x="96" y="168" width="48" height="24" fill="#FDC3D1" stroke="#6D4C51" stroke-width="4" />
            <rect x="104" y="160" width="4" height="8" fill="#FF5C89" />
            <rect x="132" y="160" width="4" height="8" fill="#FF5C89" />
            <!-- Pink Pixel Knickers -->
            <rect x="96" y="220" width="48" height="20" fill="#FDC3D1" stroke="#6D4C51" stroke-width="4" />
        </svg>
    `,

    face: (blinking = false) => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Blush Cheek pixels -->
            <rect x="100" y="112" width="8" height="8" fill="#FF8CA9" opacity="0.6" />
            <rect x="132" y="112" width="8" height="8" fill="#FF8CA9" opacity="0.6" />
            
            <!-- Eyebrows -->
            <rect x="100" y="92" width="12" height="4" fill="#5D4037" />
            <rect x="128" y="92" width="12" height="4" fill="#5D4037" />
            
            <!-- Eyes (Blinking/Open) -->
            ${blinking ? `
                <!-- Blinking eyes (horizontal lines) -->
                <rect x="100" y="100" width="16" height="4" fill="#4A373A" />
                <rect x="124" y="100" width="16" height="4" fill="#4A373A" />
            ` : `
                <!-- Open Pixel Eyes -->
                <rect x="100" y="98" width="12" height="12" fill="#4A373A" />
                <rect x="128" y="98" width="12" height="12" fill="#4A373A" />
                <!-- White shine reflection pixels -->
                <rect x="100" y="98" width="4" height="4" fill="#FFFFFF" />
                <rect x="128" y="98" width="4" height="4" fill="#FFFFFF" />
            `}
            
            <!-- Nose -->
            <rect x="118" y="110" width="4" height="4" fill="#EAD5D8" stroke="#6D4C51" stroke-width="2" />
            
            <!-- Pixel Mouth -->
            <rect x="116" y="120" width="8" height="4" fill="#FF5C89" stroke="#6D4C51" stroke-width="2" />
        </svg>
    `
};

/* -------------------------------------------------------------
   PIXEL-ART CLOTHING ASSETS (MS Paint & Inspo Inspired)
   ------------------------------------------------------------- */
const CLOTHING_ITEMS = {
    hairstyles: {
        wavy: {
            name: "Wavy Locks",
            colorVar: "--hair-color",
            defaultColor: "#FDA8BF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Bangs outline -->
                    <rect x="92" y="68" width="56" height="24" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Left face strand -->
                    <rect x="88" y="92" width="12" height="64" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Right face strand -->
                    <rect x="140" y="92" width="12" height="64" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Cascading hair behind -->
                    <rect x="84" y="64" width="72" height="220" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Highlights -->
                    <rect x="96" y="76" width="48" height="8" fill="rgba(255,255,255,0.25)" />
                </svg>
            `
        },
        ponytail: {
            name: "High Ponytail",
            colorVar: "--hair-color",
            defaultColor: "#8C5847",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Front sweep bangs -->
                    <rect x="96" y="68" width="48" height="20" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Head cap -->
                    <rect x="92" y="64" width="56" height="60" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Hair band -->
                    <rect x="140" y="60" width="8" height="12" fill="#FF5C89" />
                    <!-- Tail flying to the right -->
                    <rect x="148" y="52" width="32" height="120" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `
        },
        bob: {
            name: "Short Bob",
            colorVar: "--hair-color",
            defaultColor: "#FFDE6A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Flat pixel bob surrounding head -->
                    <rect x="92" y="68" width="56" height="60" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="88" y="80" width="64" height="40" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="92" y="68" width="56" height="72" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `
        },
        curly: {
            name: "Pixel Curls",
            colorVar: "--hair-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Fluffy cloud hair -->
                    <rect x="88" y="60" width="64" height="68" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="80" y="72" width="80" height="48" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="80" y="56" width="80" height="120" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `
        },
        braided: {
            name: "Braided Tails",
            colorVar: "--hair-color",
            defaultColor: "#9ECBFF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Bangs -->
                    <rect x="92" y="68" width="56" height="24" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Back base -->
                    <rect x="92" y="64" width="56" height="60" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Left braided strand hanging -->
                    <g transform="translate(72, 120)">
                        <rect x="8" y="0" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="4" y="12" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="8" y="24" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="4" y="36" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <!-- Ribbon bow -->
                        <rect x="4" y="48" width="12" height="6" fill="#FF5C89" />
                    </g>
                    <!-- Right braided strand hanging -->
                    <g transform="translate(148, 120)">
                        <rect x="0" y="0" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="4" y="12" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="0" y="24" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <rect x="4" y="36" width="12" height="12" fill="${color}" stroke="#6D4C51" stroke-width="2"/>
                        <!-- Ribbon bow -->
                        <rect x="4" y="48" width="12" height="6" fill="#FF5C89" />
                    </g>
                </svg>
            `
        }
    },
    tops: {
        sweater: {
            name: "Knit Sweater",
            colorVar: "--top-color",
            defaultColor: "#C6E2FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Cozy boxy sweater -->
                    <rect x="88" y="160" width="64" height="92" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Sleeves -->
                    <rect x="72" y="160" width="16" height="88" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="152" y="160" width="16" height="88" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- White stripes texture -->
                    <rect x="88" y="180" width="64" height="4" fill="#FFF" opacity="0.3" />
                    <rect x="88" y="210" width="64" height="4" fill="#FFF" opacity="0.3" />
                </svg>
            `
        },
        crop: {
            name: "Crop Top",
            colorVar: "--top-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Tube crop -->
                    <rect x="92" y="168" width="56" height="40" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Left strap -->
                    <rect x="100" y="160" width="4" height="8" fill="${color}" />
                    <!-- Right strap -->
                    <rect x="136" y="160" width="4" height="8" fill="${color}" />
                </svg>
            `
        },
        hoodie: {
            name: "Cozy Hoodie",
            colorVar: "--top-color",
            defaultColor: "#D4EDDA",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="84" y="160" width="72" height="96" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Sleeves -->
                    <rect x="68" y="160" width="16" height="92" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="156" y="160" width="16" height="92" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Pocket -->
                    <rect x="100" y="215" width="40" height="30" fill="rgba(0,0,0,0.06)" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Hood on back -->
                    <rect x="96" y="136" width="48" height="32" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                </svg>
            `
        },
        blouse: {
            name: "Puff Blouse",
            colorVar: "--top-color",
            defaultColor: "#FFFFFF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="92" y="160" width="56" height="88" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Puff sleeves -->
                    <rect x="76" y="160" width="20" height="40" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="144" y="160" width="20" height="40" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Collar -->
                    <rect x="108" y="160" width="24" height="12" fill="#FDC3D1" stroke="#6D4C51" stroke-width="2" />
                </svg>
            `
        },
        casual: {
            name: "Heart Tee",
            colorVar: "--top-color",
            defaultColor: "#FFF0F0",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="92" y="160" width="56" height="88" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Sleeves -->
                    <rect x="76" y="160" width="16" height="32" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="148" y="160" width="16" height="32" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Heart design -->
                    <rect x="116" y="184" width="8" height="8" fill="#FF5C89" />
                </svg>
            `
        }
    },
    bottoms: {
        jeans: {
            name: "Cuffed Jeans",
            colorVar: "--bottom-color",
            defaultColor: "#87CEFA",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Jeans legs and waist -->
                    <rect x="92" y="244" width="56" height="106" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Middle seam -->
                    <rect x="118" y="244" width="4" height="106" fill="#6D4C51" />
                    <!-- White cuffed bottoms -->
                    <rect x="90" y="342" width="20" height="8" fill="#FFF" stroke="#6D4C51" stroke-width="2" />
                    <rect x="130" y="342" width="20" height="8" fill="#FFF" stroke="#6D4C51" stroke-width="2" />
                </svg>
            `
        },
        skirt: {
            name: "Pleated Skirt",
            colorVar: "--bottom-color",
            defaultColor: "#FDA8BF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Pleated flounce -->
                    <polygon points="92,244 148,244 164,300 76,300" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- White stripes -->
                    <polygon points="90,290 150,290 148,296 92,296" fill="#FFF" />
                </svg>
            `
        },
        shorts: {
            name: "Denim Shorts",
            colorVar: "--bottom-color",
            defaultColor: "#B5A0F5",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="92" y="244" width="56" height="40" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="118" y="244" width="4" height="40" fill="#6D4C51" />
                </svg>
            `
        },
        trousers: {
            name: "Cozy Trousers",
            colorVar: "--bottom-color",
            defaultColor: "#FFF2E6",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Baggy wide leg -->
                    <rect x="88" y="244" width="64" height="116" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="118" y="244" width="4" height="116" fill="#6D4C51" />
                </svg>
            `
        }
    },
    dresses: {
        casual: {
            name: "Gingham Sundress",
            colorVar: "--dress-color",
            defaultColor: "#FFF5B8",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Sundress cream base, check patterns (dress-2.jpg inspired) -->
                    <rect x="92" y="168" width="56" height="152" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="100" y="160" width="4" height="8" fill="${color}" />
                    <rect x="136" y="160" width="4" height="8" fill="${color}" />
                    <!-- Gingham grid checkers -->
                    <rect x="92" y="190" width="56" height="4" fill="#FF8CA9" opacity="0.3" />
                    <rect x="92" y="220" width="56" height="4" fill="#FF8CA9" opacity="0.3" />
                    <rect x="92" y="250" width="56" height="4" fill="#FF8CA9" opacity="0.3" />
                    <rect x="92" y="280" width="56" height="4" fill="#FF8CA9" opacity="0.3" />
                    
                    <rect x="108" y="168" width="4" height="152" fill="#FF8CA9" opacity="0.3" />
                    <rect x="128" y="168" width="4" height="152" fill="#FF8CA9" opacity="0.3" />
                </svg>
            `
        },
        party: {
            name: "Sage Green Bow",
            colorVar: "--dress-color",
            defaultColor: "#75A47C", // Sage green from dress-1.jpg
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Green dress with bow on chest, inspired by dress-1.jpg -->
                    <rect x="92" y="164" width="56" height="160" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Off shoulder sleeves -->
                    <rect x="80" y="164" width="12" height="24" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="148" y="164" width="12" height="24" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Cream neck insert trim -->
                    <rect x="104" y="164" width="32" height="12" fill="#FFF9F9" stroke="#6D4C51" stroke-width="2" />
                    <!-- Red Bow chest -->
                    <rect x="114" y="176" width="12" height="6" fill="#FF5C89" />
                    <rect x="118" y="174" width="4" height="10" fill="#FF5C89" />
                </svg>
            `
        },
        princess: {
            name: "Star Halter",
            colorVar: "--dress-color",
            defaultColor: "#FFC0CB", // Star pink dress from dress-3.jpg
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Halter star pink dress, inspired by dress-3.jpg -->
                    <rect x="92" y="168" width="56" height="156" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Halter neck straps -->
                    <rect x="110" y="152" width="4" height="16" fill="${color}" />
                    <rect x="126" y="152" width="4" height="16" fill="${color}" />
                    <!-- Dark pink pixel star graphics on skirt -->
                    <g fill="#FF5C89">
                        <rect x="100" y="270" width="8" height="8" />
                        <rect x="104" y="266" width="4" height="16" />
                        <rect x="96" y="272" width="16" height="4" />
                        
                        <rect x="132" y="280" width="8" height="8" />
                        <rect x="136" y="276" width="4" height="16" />
                        <rect x="128" y="282" width="16" height="4" />
                    </g>
                </svg>
            `
        },
        floral: {
            name: "Blue Striped",
            colorVar: "--dress-color",
            defaultColor: "#bae6fd", // Blue striped dress from dress-2.jpg
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Off shoulder stripe dress, inspired by dress-2.jpg -->
                    <rect x="92" y="168" width="56" height="152" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="80" y="168" width="12" height="16" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="148" y="168" width="12" height="16" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- White horizontal stripes -->
                    <rect x="92" y="184" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="200" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="216" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="232" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="248" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="264" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="280" width="56" height="4" fill="#FFFFFF" />
                    <rect x="92" y="296" width="56" height="4" fill="#FFFFFF" />
                </svg>
            `
        }
    },
    jewelry: {
        necklace: {
            name: "Star Choker",
            colorVar: "--jewel-color",
            defaultColor: "#FFDE6A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Black ribbon choker -->
                    <rect x="112" y="146" width="16" height="4" fill="#4A373A" />
                    <!-- Gold star block -->
                    <rect x="118" y="148" width="4" height="4" fill="${color}" />
                </svg>
            `
        },
        earrings: {
            name: "Star Ear studs",
            colorVar: "--jewel-color",
            defaultColor: "#FFDE6A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Star earrings -->
                    <rect x="86" y="104" width="4" height="4" fill="${color}" />
                    <rect x="150" y="104" width="4" height="4" fill="${color}" />
                </svg>
            `
        },
        bracelet: {
            name: "Wrist Beads",
            colorVar: "--jewel-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="146" y="220" width="20" height="6" fill="${color}" stroke="#6D4C51" stroke-width="2" />
                </svg>
            `
        },
        ring: {
            name: "Pixel Ring",
            colorVar: "--jewel-color",
            defaultColor: "#C6E2FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="74" y="228" width="6" height="6" fill="${color}" />
                </svg>
            `
        }
    },
    accessories: {
        handbag: {
            name: "Studded Bag",
            colorVar: "--acc-color",
            defaultColor: "#4A373A", // Black spangled bag from dress-up inspo.jpg
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Black spangled purse, inspired by dress-up inspo.jpg -->
                    <!-- Strap -->
                    <rect x="70" y="160" width="4" height="80" fill="#6D4C51" />
                    <!-- Bag body -->
                    <rect x="62" y="210" width="24" height="24" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- White studs -->
                    <rect x="66" y="214" width="2" height="2" fill="#FFF" />
                    <rect x="72" y="214" width="2" height="2" fill="#FFF" />
                    <rect x="78" y="214" width="2" height="2" fill="#FFF" />
                    <rect x="66" y="224" width="2" height="2" fill="#FFF" />
                    <rect x="72" y="224" width="2" height="2" fill="#FFF" />
                    <rect x="78" y="224" width="2" height="2" fill="#FFF" />
                </svg>
            `
        },
        hairclips: {
            name: "Hair Bandana",
            colorVar: "--acc-color",
            defaultColor: "#75A47C", // Green bandana from dress-up inspo.jpg
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Green bandana wrap over head, inspired by dress-up inspo.jpg -->
                    <rect x="92" y="66" width="56" height="16" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Stepped curve sides -->
                    <rect x="88" y="74" width="64" height="8" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <!-- Knot tie on left -->
                    <rect x="82" y="76" width="10" height="10" fill="${color}" stroke="#6D4C51" stroke-width="2" />
                </svg>
            `
        },
        glasses: {
            name: "Wire Frames",
            colorVar: "--acc-color",
            defaultColor: "#4A373A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Black rectangular glasses frames -->
                    <rect x="98" y="98" width="16" height="12" fill="none" stroke="${color}" stroke-width="2" />
                    <rect x="126" y="98" width="16" height="12" fill="none" stroke="${color}" stroke-width="2" />
                    <rect x="114" y="104" width="12" height="2" fill="${color}" />
                </svg>
            `
        },
        hat: {
            name: "Pixel Beret",
            colorVar: "--acc-color",
            defaultColor: "#B5A0F5",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <rect x="88" y="52" width="64" height="16" fill="${color}" stroke="#6D4C51" stroke-width="4" />
                    <rect x="116" y="44" width="8" height="8" fill="${color}" stroke="#6D4C51" stroke-width="2" />
                </svg>
            `
        }
    }
};

/* -------------------------------------------------------------
   GAME STATE CONTROLLER
   ------------------------------------------------------------- */
const GameState = {
    skinColor: "#fdd7cf", // Peach default
    equipped: {
        hairstyles: "wavy",
        tops: "sweater",
        bottoms: "jeans",
        dresses: null,
        jewelry: "necklace",
        accessories: "hat"
    },
    colors: {
        hairstyles: CLOTHING_ITEMS.hairstyles.wavy.defaultColor,
        tops: CLOTHING_ITEMS.tops.sweater.defaultColor,
        bottoms: CLOTHING_ITEMS.bottoms.jeans.defaultColor,
        dresses: null,
        jewelry: CLOTHING_ITEMS.jewelry.necklace.defaultColor,
        accessories: CLOTHING_ITEMS.accessories.hat.defaultColor
    },
    blinking: false,
    soundEnabled: true,
    outfitName: "Cozy Dreamer",
    activeTool: "pencil", // MS Paint active tool

    setSkin(color) {
        this.skinColor = color;
        this.renderLayer('body');
    },

    equipItem(category, itemId) {
        sound.playEquip();
        
        // Dress and Top/Bottom mutual exclusion rules
        if (category === 'dresses') {
            this.equipped.tops = null;
            this.equipped.bottoms = null;
            this.equipped.dresses = itemId;
            this.colors.dresses = itemId ? CLOTHING_ITEMS.dresses[itemId].defaultColor : null;
        } else if (category === 'tops' || category === 'bottoms') {
            this.equipped.dresses = null;
            this.equipped[category] = this.equipped[category] === itemId ? null : itemId;
            this.colors[category] = this.equipped[category] ? CLOTHING_ITEMS[category][itemId].defaultColor : null;
        } else {
            this.equipped[category] = this.equipped[category] === itemId ? null : itemId;
            this.colors[category] = this.equipped[category] ? CLOTHING_ITEMS[category][itemId].defaultColor : null;
        }

        this.renderAllLayers();
        this.updateColorPalette();
        
        // Trigger dialog mascot comments
        triggerRandomDialogue();
    },

    setItemColor(category, colorHex) {
        if (!this.equipped[category]) return;
        this.colors[category] = colorHex;
        this.renderAllLayers();
    },

    renderLayer(layerId) {
        const container = document.getElementById(`layer-${layerId}`);
        if (!container) return;

        let svgHtml = "";

        if (layerId === 'body') {
            svgHtml = CHAR_BASE.body(this.skinColor);
        } else if (layerId === 'underwear') {
            if (!this.equipped.dresses) {
                svgHtml = CHAR_BASE.underwear();
            }
        } else if (layerId === 'face') {
            svgHtml = CHAR_BASE.face(this.blinking);
        } else if (layerId === 'back-hair') {
            const hairId = this.equipped.hairstyles;
            if (hairId && CLOTHING_ITEMS.hairstyles[hairId].back) {
                svgHtml = CLOTHING_ITEMS.hairstyles[hairId].back(this.colors.hairstyles);
            }
        } else if (layerId === 'front-hair') {
            const hairId = this.equipped.hairstyles;
            if (hairId && CLOTHING_ITEMS.hairstyles[hairId].front) {
                svgHtml = CLOTHING_ITEMS.hairstyles[hairId].front(this.colors.hairstyles);
            }
        } else {
            // General layers mapping
            const catMap = {
                'top': 'tops',
                'bottom': 'bottoms',
                'dress': 'dresses',
                'necklaces': 'jewelry',
                'earrings': 'jewelry',
                'bracelets': 'jewelry',
                'rings': 'jewelry',
                'hats': 'accessories',
                'glasses': 'accessories',
                'handbags': 'accessories'
            };

            const category = catMap[layerId];
            if (category) {
                const itemId = this.equipped[category];
                if (itemId) {
                    const item = CLOTHING_ITEMS[category][itemId];
                    if (layerId === 'necklaces' && itemId !== 'necklace') return;
                    if (layerId === 'earrings' && itemId !== 'earrings') return;
                    if (layerId === 'bracelets' && itemId !== 'bracelet') return;
                    if (layerId === 'rings' && itemId !== 'ring') return;
                    
                    if (layerId === 'hats' && itemId !== 'hat') return;
                    if (layerId === 'glasses' && itemId !== 'glasses') return;
                    if (layerId === 'handbags' && itemId !== 'handbag') return;
                    if (layerId === 'front-hair' && category === 'accessories' && itemId === 'hairclips') return;

                    if (item.front) {
                        svgHtml = item.front(this.colors[category]);
                    }
                }
            }
        }

        container.innerHTML = svgHtml;
    },

    renderAllLayers() {
        this.renderLayer('back-hair');
        this.renderLayer('body');
        this.renderLayer('underwear');
        this.renderLayer('face');
        this.renderLayer('bottom');
        this.renderLayer('top');
        this.renderLayer('dress');
        this.renderLayer('front-hair');
        
        const layers = ['necklaces', 'earrings', 'bracelets', 'rings', 'hats', 'glasses', 'handbags'];
        layers.forEach(layer => this.renderLayer(layer));
        
        updateActiveCardSelections();
    },

    randomize() {
        sound.playEquip();
        
        const rollChance = (prob) => Math.random() < prob;
        const skins = ["#fdd7cf", "#f9beae", "#d99781", "#8c5847"];
        this.skinColor = skins[Math.floor(Math.random() * skins.length)];
        
        document.querySelectorAll('.skin-swatch').forEach(sw => {
            if (sw.dataset.color === this.skinColor) sw.classList.add('active');
            else sw.classList.remove('active');
        });

        const hairKeys = Object.keys(CLOTHING_ITEMS.hairstyles);
        this.equipped.hairstyles = hairKeys[Math.floor(Math.random() * hairKeys.length)];
        this.colors.hairstyles = getRandomColor();

        if (rollChance(0.5)) {
            const dressKeys = Object.keys(CLOTHING_ITEMS.dresses);
            this.equipped.dresses = dressKeys[Math.floor(Math.random() * dressKeys.length)];
            this.colors.dresses = getRandomColor();
            this.equipped.tops = null;
            this.equipped.bottoms = null;
        } else {
            this.equipped.dresses = null;
            const topKeys = Object.keys(CLOTHING_ITEMS.tops);
            this.equipped.tops = topKeys[Math.floor(Math.random() * topKeys.length)];
            this.colors.tops = getRandomColor();
            
            const bottomKeys = Object.keys(CLOTHING_ITEMS.bottoms);
            this.equipped.bottoms = bottomKeys[Math.floor(Math.random() * bottomKeys.length)];
            this.colors.bottoms = getRandomColor();
        }

        const jewelKeys = Object.keys(CLOTHING_ITEMS.jewelry);
        jewelKeys.forEach(jk => {
            if (rollChance(0.6)) {
                this.equipped.jewelry = jk;
                this.colors.jewelry = getRandomColor();
            }
        });

        const accKeys = Object.keys(CLOTHING_ITEMS.accessories);
        if (rollChance(0.7)) {
            this.equipped.accessories = accKeys[Math.floor(Math.random() * accKeys.length)];
            this.colors.accessories = getRandomColor();
        } else {
            this.equipped.accessories = null;
        }

        this.renderAllLayers();
        this.updateColorPalette();
        generateRandomOutfitName();
        showNotification("🎨 Shuffled a cute pixel look! 🎨");
        createFloatingParticles('sparkle-particle', 8);
    },

    reset() {
        sound.playClick();
        this.skinColor = "#fdd7cf";
        this.equipped = {
            hairstyles: "wavy",
            tops: "sweater",
            bottoms: "jeans",
            dresses: null,
            jewelry: null,
            accessories: null
        };
        this.colors = {
            hairstyles: CLOTHING_ITEMS.hairstyles.wavy.defaultColor,
            tops: CLOTHING_ITEMS.tops.sweater.defaultColor,
            bottoms: CLOTHING_ITEMS.bottoms.jeans.defaultColor,
            dresses: null,
            jewelry: null,
            accessories: null
        };
        
        document.querySelectorAll('.skin-swatch').forEach((sw, idx) => {
            if (idx === 0) sw.classList.add('active');
            else sw.classList.remove('active');
        });

        this.renderAllLayers();
        this.updateColorPalette();
        this.outfitName = "Cozy Dreamer";
        document.getElementById('outfit-name-input').value = this.outfitName;
        showNotification("🎨 Reset pixel doll! 🎨");
    },

    updateColorPalette() {
        const container = document.getElementById('item-color-palette');
        container.innerHTML = "";

        const activeTab = document.querySelector('.category-tab-btn.active');
        if (!activeTab) return;
        const category = activeTab.dataset.category;

        if (!this.equipped[category]) {
            container.innerHTML = "<p style='grid-column: 1/-1; font-size: 0.65rem; font-weight:bold; color:var(--color-win-shadow-dark); text-align:center;'>Equip item to color! 🎨</p>";
            return;
        }

        // Stepped paint colors swatches
        const fashionColors = [
            "#FFDBDB", "#FDC3D1", "#FDA8BF", "#FB8CAC", "#FF5C89", 
            "#FFF5B8", "#FFDE6A", "#FFE082", 
            "#D4EDDA", "#C1E1C1", "#A8E6CF", 
            "#C6E2FF", "#9ECBFF", "#87CEFA", 
            "#E0B0FF", "#B5A0F5", "#D7BDE2", 
            "#FFE4E1", "#F5CBA7", "#E59866", 
            "#FFFFFF", "#EEEEEE", "#BDBDBD", "#5D4037", "#4A373A"
        ];

        const activeColor = this.colors[category];
        const indicator = document.getElementById('current-color-indicator');
        if (activeColor) indicator.style.backgroundColor = activeColor;

        fashionColors.forEach(colorHex => {
            const swatch = document.createElement('div');
            swatch.className = "palette-pixel-swatch";
            swatch.style.backgroundColor = colorHex;
            
            if (activeColor && activeColor.toLowerCase() === colorHex.toLowerCase()) {
                swatch.classList.add('active');
            }

            swatch.addEventListener('click', () => {
                this.setItemColor(category, colorHex);
                document.querySelectorAll('.palette-pixel-swatch').forEach(sw => sw.classList.remove('active'));
                swatch.classList.add('active');
                indicator.style.backgroundColor = colorHex;
                sound.playClick();
            });

            container.appendChild(swatch);
        });
    }
};

function getRandomColor() {
    const list = [
        "#FFDBDB", "#FDC3D1", "#FDA8BF", "#FB8CAC", "#FF5C89", 
        "#FFF5B8", "#FFDE6A", "#D4EDDA", "#C1E1C1", 
        "#C6E2FF", "#9ECBFF", "#E0B0FF", "#B5A0F5", 
        "#FFE4E1", "#FFFFFF", "#4A373A"
    ];
    return list[Math.floor(Math.random() * list.length)];
}

/* -------------------------------------------------------------
   LOAD ITEMS DRAWER GRID (Blue Card Boxes)
   ------------------------------------------------------------- */
function loadWardrobeCategoryGrid(category) {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = "";
    
    const items = CLOTHING_ITEMS[category];
    if (!items) return;

    Object.keys(items).forEach(itemId => {
        const item = items[itemId];
        const card = document.createElement('div');
        card.className = "blue-item-card";
        card.dataset.id = itemId;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        
        if (GameState.equipped[category] === itemId) {
            card.classList.add('equipped');
        }

        let previewSvg = "";
        const defaultCol = item.defaultColor;
        if (item.front) {
            previewSvg = item.front(defaultCol);
        } else if (item.back) {
            previewSvg = item.back(defaultCol);
        }

        card.innerHTML = previewSvg;

        card.addEventListener('click', () => {
            GameState.equipItem(category, itemId);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                GameState.equipItem(category, itemId);
            }
        });

        grid.appendChild(card);
    });

    GameState.updateColorPalette();
}

function updateActiveCardSelections() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.blue-item-card');
    const activeTab = document.querySelector('.category-tab-btn.active');
    if (!activeTab) return;
    const category = activeTab.dataset.category;

    cards.forEach(card => {
        const itemId = card.dataset.id;
        if (GameState.equipped[category] === itemId) {
            card.classList.add('equipped');
        } else {
            card.classList.remove('equipped');
        }
    });
}

// Category tabs
document.querySelectorAll('.category-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.category-tab-btn').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        loadWardrobeCategoryGrid(tab.dataset.category);
    });
});

// Skin Swatches
document.querySelectorAll('.skin-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        GameState.setSkin(sw.dataset.color);
        createFloatingParticles('sparkle-particle', 3);
    });
});

/* -------------------------------------------------------------
   PAINT TOOLBOX TRIGGERS & SPARKLES
   ------------------------------------------------------------- */
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const toolId = btn.id.replace('tool-', '');
        GameState.activeTool = toolId;
        
        // Tool direct actions mapping
        if (toolId === 'eraser') {
            GameState.reset();
        } else if (toolId === 'shapes') {
            GameState.randomize();
        } else if (toolId === 'magnifier') {
            openGallery();
        } else if (toolId === 'spray') {
            sound.toggleMusic();
        } else if (toolId === 'text') {
            generateRandomOutfitName();
        } else if (toolId === 'bucket') {
            // Simulated fill bucket sound & trigger comments
            showNotification("🎨 Paint Bucket tool selected! recolor active category below.");
            triggerDialogue("Bucket tool ready! Click the bottom swatches to fill item colors.");
        }
    });
});

// Track coordinates on canvas mousemove
document.getElementById('screenshot-area').addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 2) * 2; // snap to 2px
    const y = Math.round((e.clientY - rect.top) / 2) * 2;
    document.getElementById('status-pixel-coord').innerText = `x: ${x} , y: ${y}`;
});

// Click on Canvas sparks actions depending on tool selected
document.getElementById('screenshot-area').addEventListener('mousedown', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (GameState.activeTool === 'pencil') {
        sound.playSparkle();
        spawnCustomParticle(x, y, 'fa-star sparkle-particle');
    } else if (GameState.activeTool === 'brush') {
        sound.playSparkle();
        spawnCustomParticle(x, y, 'fa-heart heart-particle');
    } else {
        sound.playSparkle();
        spawnCustomParticle(x, y, 'fa-sparkles sparkle-particle');
    }
});

function spawnCustomParticle(x, y, iconClass) {
    const area = document.getElementById('character-click-sparkles');
    const p = document.createElement('div');
    p.className = `fa-solid ${iconClass}`;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    
    const tx = (Math.random() - 0.5) * 80;
    const ty = (Math.random() - 0.5) * 80;
    const rot = (Math.random() - 0.5) * 180;
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    p.style.setProperty('--rot', `${rot}deg`);
    
    area.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

function createFloatingParticles(particleClass, count) {
    const area = document.getElementById('character-click-sparkles');
    if (!area) return;

    for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * 140;
        const y = 80 + Math.random() * 200;
        const cl = particleClass === 'heart-particle' ? 'fa-heart heart-particle' : 'fa-star sparkle-particle';
        spawnCustomParticle(x, y, cl);
    }
}


/* -------------------------------------------------------------
   DIALOGUE MASCOT SYSTEM (Retro OS Window Warning Warning style)
   ------------------------------------------------------------- */
const RANDOM_STYLER_COMMENTS = [
    "That green bandana looks adorable! 🌟",
    "You're creating such a cute pixel look!",
    "Try mixing accessories! 🎀",
    "MS Paint fashion icon in the making!",
    "The sage green dress is super aesthetic!",
    "This combination is extremely cozy!",
    "Did you save the BMP look to your diary?",
    "Looking pixel-perfect!"
];

let typingTimeout = null;

function triggerDialogue(text) {
    const box = document.getElementById('dialogue-box');
    const textEl = document.getElementById('dialogue-text');
    
    // Popup animations
    box.style.animation = 'none';
    box.offsetHeight;
    box.style.animation = 'dialogPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards';

    textEl.innerHTML = "";
    let idx = 0;
    
    function type() {
        if (idx < text.length) {
            textEl.innerHTML += text.charAt(idx);
            idx++;
            typingTimeout = setTimeout(type, 20);
        }
    }
    type();
}

function triggerRandomDialogue() {
    if (Math.random() < 0.4) {
        const comment = RANDOM_STYLER_COMMENTS[Math.floor(Math.random() * RANDOM_STYLER_COMMENTS.length)];
        triggerDialogue(comment);
    }
}

// Dialog buttons click closures
document.getElementById('dialogue-ok-btn').addEventListener('click', () => {
    sound.playClick();
    document.getElementById('dialogue-box').style.animation = 'none';
    document.getElementById('dialogue-box').style.transform = 'translateX(-50%) scale(0)';
});

document.getElementById('btn-dialog-ok').addEventListener('click', () => {
    sound.playClick();
    document.getElementById('dialogue-box').style.animation = 'none';
    document.getElementById('dialogue-box').style.transform = 'translateX(-50%) scale(0)';
});


/* -------------------------------------------------------------
   AUTOPLAY EYES BLINKING EFFECTS
   ------------------------------------------------------------- */
function startBlinkingLoop() {
    setInterval(() => {
        GameState.blinking = true;
        GameState.renderLayer('face');
        
        setTimeout(() => {
            GameState.blinking = false;
            GameState.renderLayer('face');
        }, 180);
    }, 4500);
}


/* -------------------------------------------------------------
   TOAST NOTIFICATION popup
   ------------------------------------------------------------- */
function showNotification(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = "toast-notification";
    toast.innerHTML = `<i class="fa-solid fa-star"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


/* -------------------------------------------------------------
   FLASK BACKEND API INTEGRATIONS
   ------------------------------------------------------------- */
function generateRandomOutfitName() {
    fetch('/api/generate_name')
        .then(res => res.json())
        .then(data => {
            if (data.name) {
                GameState.outfitName = data.name;
                document.getElementById('outfit-name-input').value = data.name;
            }
        })
        .catch(err => {
            console.error("Error generating name:", err);
            const adj = ["Pixel", "Cozy", "Retro", "Strawberry", "Sage"];
            const noun = ["Doll", "Breeze", "Dolly", "Glow", "Angel"];
            const fallback = adj[Math.floor(Math.random()*adj.length)] + " " + noun[Math.floor(Math.random()*noun.length)];
            GameState.outfitName = fallback;
            document.getElementById('outfit-name-input').value = fallback;
        });
}

function fetchDiaryOutfits() {
    fetch('/api/outfits')
        .then(res => res.json())
        .then(outfits => {
            populateDiaryGrid(outfits);
        })
        .catch(err => console.error("Error fetching outfits:", err));
}

function populateDiaryGrid(outfits) {
    const container = document.getElementById('gallery-items-container');
    container.innerHTML = "";
    
    if (outfits.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px 0; font-weight:bold; color:var(--color-win-shadow-dark);">
                <i class="fa-solid fa-heart-crack" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No bitmap looks saved in diary!</p>
            </div>
        `;
        return;
    }

    outfits.forEach(outfit => {
        const card = document.createElement('div');
        card.className = "polaroid-card";
        
        const config = outfit.configuration;
        const skinColor = config.skinColor || "#fdd7cf";
        
        // Mini SVG builder for diary listing
        let backHairSvg = "";
        let frontHairSvg = "";
        let bodySvg = CHAR_BASE.body(skinColor);
        let underwearSvg = !config.dresses ? CHAR_BASE.underwear() : "";
        let faceSvg = CHAR_BASE.face(false);
        let bottomSvg = "";
        let topSvg = "";
        let dressSvg = "";
        
        if (config.hairstyles && CLOTHING_ITEMS.hairstyles[config.hairstyles]) {
            const h = CLOTHING_ITEMS.hairstyles[config.hairstyles];
            if (h.back) backHairSvg = h.back(config.colors.hairstyles || h.defaultColor);
            if (h.front) frontHairSvg = h.front(config.colors.hairstyles || h.defaultColor);
        }
        
        if (config.dresses && CLOTHING_ITEMS.dresses[config.dresses]) {
            dressSvg = CLOTHING_ITEMS.dresses[config.dresses].front(config.colors.dresses || CLOTHING_ITEMS.dresses[config.dresses].defaultColor);
        } else {
            if (config.tops && CLOTHING_ITEMS.tops[config.tops]) {
                topSvg = CLOTHING_ITEMS.tops[config.tops].front(config.colors.tops || CLOTHING_ITEMS.tops[config.tops].defaultColor);
            }
            if (config.bottoms && CLOTHING_ITEMS.bottoms[config.bottoms]) {
                bottomSvg = CLOTHING_ITEMS.bottoms[config.bottoms].front(config.colors.bottoms || CLOTHING_ITEMS.bottoms[config.bottoms].defaultColor);
            }
        }

        let accsSvg = "";
        const mapping = [
            { cat: 'jewelry', sub: 'necklace' },
            { cat: 'jewelry', sub: 'earrings' },
            { cat: 'jewelry', sub: 'bracelet' },
            { cat: 'jewelry', sub: 'ring' },
            { cat: 'accessories', sub: 'hat' },
            { cat: 'accessories', sub: 'glasses' },
            { cat: 'accessories', sub: 'handbag' }
        ];

        mapping.forEach(m => {
            const itemKey = config.equipped[m.cat];
            if (itemKey === m.sub) {
                const item = CLOTHING_ITEMS[m.cat][itemKey];
                if (item && item.front) {
                    accsSvg += item.front(config.colors[m.cat] || item.defaultColor);
                }
            }
        });

        const miniSvg = `
            <svg viewBox="${BASE_VIEWBOX}" width="70" height="90">
                <g transform="scale(0.85) translate(15, 20)">
                    ${backHairSvg}
                    ${bodySvg}
                    ${underwearSvg}
                    ${faceSvg}
                    ${bottomSvg}
                    ${topSvg}
                    ${dressSvg}
                    ${frontHairSvg}
                    ${accsSvg}
                </g>
            </svg>
        `;

        card.innerHTML = `
            <div class="polaroid-img-frame">
                ${miniSvg}
            </div>
            <div class="polaroid-caption">${outfit.name}</div>
            <div style="display:flex; gap:4px; margin-top:2px;">
                <button class="retro-btn outset-bevel load-btn" style="padding:2px 4px; font-size:0.7rem; flex-grow:1;"><i class="fa-solid fa-shirt"></i> Wear</button>
                <button class="retro-btn outset-bevel del-btn" style="padding:2px 4px; font-size:0.7rem; color:red;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        card.querySelector('.load-btn').addEventListener('click', () => {
            sound.playEquip();
            applyOutfitConfiguration(config, outfit.name);
            closeGallery();
            showNotification(`Wear look "${outfit.name}"! 🎀`);
        });

        card.querySelector('.del-btn').addEventListener('click', () => {
            sound.playClick();
            deleteOutfitFromServer(outfit.id);
        });

        container.appendChild(card);
    });
}

function applyOutfitConfiguration(config, name) {
    GameState.skinColor = config.skinColor || "#fdd7cf";
    GameState.equipped = { ...config.equipped };
    GameState.colors = { ...config.colors };
    GameState.outfitName = name;
    document.getElementById('outfit-name-input').value = name;
    
    document.querySelectorAll('.skin-swatch').forEach(sw => {
        if (sw.dataset.color === GameState.skinColor) sw.classList.add('active');
        else sw.classList.remove('active');
    });

    GameState.renderAllLayers();
    GameState.updateColorPalette();
}

function saveOutfitToServer() {
    const inputName = document.getElementById('outfit-name-input').value.trim();
    const saveName = inputName || "Cozy Dreamer";
    
    const payload = {
        name: saveName,
        configuration: {
            skinColor: GameState.skinColor,
            equipped: GameState.equipped,
            colors: GameState.colors
        }
    };

    fetch('/api/outfits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            sound.playSaveSuccess();
            showNotification("Outfit saved as BMP image look! 💾");
            createFloatingParticles('sparkle-particle', 8);
            fetchDiaryOutfits();
        } else {
            showNotification("Error saving look.");
        }
    })
    .catch(err => {
        console.error("Error saving look:", err);
        showNotification("Failed to save look.");
    });
}

function deleteOutfitFromServer(id) {
    if (!confirm("Are you sure you want to delete this look? 😢")) return;

    fetch(`/api/outfits/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showNotification("Look removed.");
            fetchDiaryOutfits();
        }
    })
    .catch(err => console.error("Error deleting outfit:", err));
}


/* -------------------------------------------------------------
   DIARY MODAL DIALOG TOGGLE WINDOWS
   ------------------------------------------------------------- */
const galleryModal = document.getElementById('gallery-modal');
const btnCloseGallery = document.getElementById('btn-close-gallery');

function openGallery() {
    sound.playClick();
    galleryModal.classList.add('open');
    galleryModal.setAttribute('aria-hidden', 'false');
    fetchDiaryOutfits();
}

function closeGallery() {
    sound.playClick();
    galleryModal.classList.remove('open');
    galleryModal.setAttribute('aria-hidden', 'true');
}

btnCloseGallery.addEventListener('click', closeGallery);
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeGallery();
});

// Control buttons mappings
document.getElementById('btn-save').addEventListener('click', saveOutfitToServer);
document.getElementById('btn-randomize').addEventListener('click', () => GameState.randomize());
document.getElementById('btn-reset').addEventListener('click', () => GameState.reset());
document.getElementById('btn-refresh-name').addEventListener('click', () => {
    sound.playClick();
    generateRandomOutfitName();
});


/* -------------------------------------------------------------
   MENU OPTIONS MAPPINGS
   ------------------------------------------------------------- */
document.getElementById('menu-save').addEventListener('click', saveOutfitToServer);
document.getElementById('menu-reset').addEventListener('click', () => GameState.reset());
document.getElementById('menu-random').addEventListener('click', () => GameState.randomize());
document.getElementById('menu-name').addEventListener('click', () => {
    sound.playClick();
    generateRandomOutfitName();
});
document.getElementById('menu-diary').addEventListener('click', openGallery);
document.getElementById('menu-sound-toggle').addEventListener('click', () => {
    sound.soundEnabled = !sound.soundEnabled;
    showNotification(sound.soundEnabled ? "Sound FX Enabled." : "Sound FX Muted.");
});
document.getElementById('menu-music-toggle').addEventListener('click', () => {
    sound.toggleMusic();
});
document.getElementById('menu-about').addEventListener('click', () => {
    sound.playClick();
    alert("🎀 Dream Dress-Up BMP Paint 🎀\nVersion 1.0\nCreated with cozy retro pixel art inspiration.");
});
document.getElementById('menu-download').addEventListener('click', compileAndDownloadOutfitImage);
document.getElementById('win-close-btn').addEventListener('click', () => {
    sound.playClick();
    alert("Close application? Press reset or save instead!");
});


/* -------------------------------------------------------------
   SCREENSHOT / PNG EXPORT DOWNLOAD COMPILER
   ------------------------------------------------------------- */
function compileAndDownloadOutfitImage() {
    sound.playSparkle();
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Maintain pixel crispness!

    // Draw retro Canvas background grey-green
    ctx.fillStyle = "#E2ECE5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wall stripes
    ctx.fillStyle = "#FFF0F2";
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.75);
    ctx.fillStyle = "#FDC3D1";
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, 0, 15, canvas.height * 0.75);
    }
    
    // Draw Floor line separator
    ctx.fillStyle = "#6D4C51";
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, 4);
    
    // Draw Floor color
    ctx.fillStyle = "#EAD5D8";
    ctx.fillRect(0, canvas.height * 0.75 + 4, canvas.width, canvas.height * 0.25 - 4);

    // Draw Pink Oval Rug
    ctx.fillStyle = "#FDA8BF";
    ctx.strokeStyle = "#6D4C51";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(200, 430, 100, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Character Stack
    const container = document.getElementById('character-avatar');
    const layers = Array.from(container.children);
    let combinedSvgContent = "";
    
    layers.forEach(layer => {
        const svgEl = layer.querySelector('svg');
        if (svgEl) {
            combinedSvgContent += svgEl.innerHTML;
        }
    });

    const masterSvgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${BASE_VIEWBOX}" width="240" height="380">
            ${combinedSvgContent}
        </svg>
    `;

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(masterSvgString);

    img.onload = function() {
        // Draw character at center of canvas (snapped coords)
        ctx.drawImage(img, 80, 40, 240, 380);
        
        // Draw vintage MS Paint Title label at bottom right
        ctx.fillStyle = "rgba(109, 76, 81, 0.85)";
        ctx.fillRect(220, 15, 165, 30);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px Courier New, monospace";
        ctx.fillText(`${GameState.outfitName}.bmp`, 230, 33);

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `${GameState.outfitName.replace(/\s+/g, '_')}_pixel.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification("📸 Saved BMP bitmap look! 📸");
        createFloatingParticles('sparkle-particle', 6);
    };

    img.onerror = function(e) {
        console.error("Screenshot compile error:", e);
        showNotification("Failed compiling photo.");
    };
}

document.getElementById('btn-screenshot').addEventListener('click', compileAndDownloadOutfitImage);

// Autoplay init on first click
window.addEventListener('click', () => {
    sound.init();
}, { once: true });

/* -------------------------------------------------------------
   INITIAL RUN ASSEMBLY
   ------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    loadWardrobeCategoryGrid('hairstyles');
    GameState.renderAllLayers();
    
    // Set blinking
    startBlinkingLoop();
    
    // Initial welcome popup warning after 1.5 seconds
    setTimeout(() => {
        triggerDialogue("Welcome to Dream Dress-Up Room! Let's style a pixel look. 💖");
    }, 1200);
});
