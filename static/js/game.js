/* -------------------------------------------------------------
   Dream Dress-Up Room - Complete Frontend Game Controller
   ------------------------------------------------------------- */

// Global Sound & Music Synthesizer Class
class SoundManager {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = false;
        
        // Music sequencers
        this.musicTimer = null;
        this.tempo = 900; // ms per beat
        this.step = 0;
        
        // Cmaj7 - Am7 - Fmaj7 - G7 chords (Notes frequencies)
        this.chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7: C4, E4, G4, B4
            [220.00, 261.63, 329.63, 392.00], // Am7: A3, C4, E4, G4
            [174.61, 220.00, 261.63, 329.63], // Fmaj7: F3, A3, C4, E4
            [196.00, 246.94, 293.66, 349.23]  // G7: G3, B3, D4, F4
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

    // Cozy retro chime for UI interactions
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

    // Elegant level-up sound for equipping clothes
    playEquip() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Arpeggio)
        
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

    // Sparkle click chime
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

    // Wardrobe slide creak/whoosh sound
    playWardrobe(isOpen) {
        if (!this.soundEnabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        const startFreq = isOpen ? 150 : 350;
        const endFreq = isOpen ? 350 : 150;
        
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.38);
    }

    // Celebratory melody for successful save
    playSaveSuccess() {
        if (!this.soundEnabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50]; // C5, D5, E5, G5, A5, B5, C6
        
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

    // Toggle BG Cozy Music
    toggleMusic(forceState = null) {
        this.musicEnabled = forceState !== null ? forceState : !this.musicEnabled;
        const musicBtn = document.getElementById('btn-music-toggle');
        
        if (this.musicEnabled) {
            this.init();
            musicBtn.classList.remove('muted');
            musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
            this.startMusicLoop();
        } else {
            musicBtn.classList.add('muted');
            musicBtn.innerHTML = '<i class="fa-solid fa-music-slash"></i>';
            this.stopMusicLoop();
        }
    }

    startMusicLoop() {
        if (this.musicInterval) return;
        this.step = 0;
        
        const playStep = () => {
            if (!this.musicEnabled) return;
            
            // Choose chord based on measure (4 beats per chord)
            const chordIdx = Math.floor(this.step / 4) % 4;
            const chord = this.chords[chordIdx];
            
            // Choose note within chord (arpeggiator pattern)
            const notePattern = [0, 2, 1, 3, 2, 1, 3, 0];
            const patternIdx = this.step % 8;
            const noteFreq = chord[notePattern[patternIdx % chord.length]];
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);
            
            // Slow soft attack and decay (rhodes/musicbox effect)
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.82);
            
            this.step++;
            
            // Schedule next beat
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

// Instantiate Sound Manager
const sound = new SoundManager();

// Setup Sound toggle triggers
document.getElementById('btn-sound-toggle').addEventListener('click', () => {
    sound.soundEnabled = !sound.soundEnabled;
    const btn = document.getElementById('btn-sound-toggle');
    if (sound.soundEnabled) {
        btn.classList.remove('muted');
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        sound.playClick();
    } else {
        btn.classList.add('muted');
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
});

document.getElementById('btn-music-toggle').addEventListener('click', () => {
    sound.toggleMusic();
    sound.playClick();
});


/* -------------------------------------------------------------
   CHARACTER LAYER VECTOR GRAPHICS (SVG definitions)
   ------------------------------------------------------------- */
const BASE_VIEWBOX = "0 0 260 440";

// Base skin/character model templates
const CHAR_BASE = {
    // Skin base (torso, arms, head, legs, underwear)
    body: (skinColor) => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Shadow under feet -->
            <ellipse cx="130" cy="418" rx="35" ry="6" fill="rgba(0,0,0,0.06)" />
            
            <!-- Left Leg -->
            <path d="M108,300 L124,300 L121,415 Q114,418 106,415 Z" fill="${skinColor}" />
            <!-- Right Leg -->
            <path d="M136,300 L152,300 L154,415 Q146,418 139,415 Z" fill="${skinColor}" />
            
            <!-- Torso (Shoulders to Waist) -->
            <path d="M98,190 Q130,195 162,190 L150,270 L110,270 Z" fill="${skinColor}" />
            <!-- Hips -->
            <path d="M110,270 L150,270 L152,305 L108,305 Z" fill="${skinColor}" />
            
            <!-- Left Arm -->
            <path d="M98,190 Q80,230 83,275 Q85,286 80,286 Q75,286 77,268 Q72,225 94,190 Z" fill="${skinColor}" />
            <!-- Right Arm -->
            <path d="M162,190 Q180,230 177,275 Q175,286 180,286 Q185,286 183,268 Q188,225 166,190 Z" fill="${skinColor}" />
            
            <!-- Neck -->
            <rect x="122" y="160" width="16" height="36" fill="${skinColor}" />
            <path d="M122,185 Q130,192 138,185" stroke="rgba(0,0,0,0.08)" stroke-width="2" fill="none" />
            
            <!-- Head -->
            <ellipse cx="130" cy="130" rx="38" ry="42" fill="${skinColor}" />
            <!-- Ears -->
            <ellipse cx="90" cy="133" rx="7" ry="11" fill="${skinColor}" transform="rotate(-5 90 133)" />
            <ellipse cx="170" cy="133" rx="7" ry="11" fill="${skinColor}" transform="rotate(5 170 133)" />
        </svg>
    `,
    
    // Default base undergarments
    underwear: () => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Pink Bralette top -->
            <path d="M102,205 Q130,225 158,205 L154,235 Q130,248 106,235 Z" fill="#FDC3D1" stroke="#FDA8BF" stroke-width="1.5" />
            <path d="M108,192 L112,208" stroke="#FDA8BF" stroke-width="2" />
            <path d="M152,192 L148,208" stroke="#FDA8BF" stroke-width="2" />
            
            <!-- Cute bow in center of bra -->
            <circle cx="130" cy="216" r="3" fill="#FF5C89" />
            
            <!-- Pink Knickers -->
            <path d="M109,268 L151,268 L152,285 Q130,312 108,285 Z" fill="#FDC3D1" stroke="#FDA8BF" stroke-width="1.5" />
        </svg>
    `,

    // Face components (blinking eyes, nose, mouth)
    face: (blinking = false) => `
        <svg viewBox="${BASE_VIEWBOX}">
            <!-- Blush cheeks -->
            <ellipse cx="106" cy="144" rx="8" ry="5" fill="#FF8CA9" opacity="0.45" />
            <ellipse cx="154" cy="144" rx="8" ry="5" fill="#FF8CA9" opacity="0.45" />
            
            <!-- Eyebrows -->
            <path d="M102,118 Q113,111 121,116" stroke="#5d4037" stroke-width="2" stroke-linecap="round" fill="none" />
            <path d="M139,116 Q147,111 158,118" stroke="#5d4037" stroke-width="2" stroke-linecap="round" fill="none" />
            
            <!-- Nose -->
            <path d="M130,138 Q131.5,141 130,143" stroke="#e0a3b0" stroke-width="1.5" stroke-linecap="round" fill="none" />
            
            <!-- Cute Smiling Mouth -->
            <path d="M124,151 Q130,158 136,151 Z" fill="#FF5C89" stroke="#de2e5d" stroke-width="1" />
            <path d="M127,153 Q130,157 133,153 Z" fill="#FFAAB3" />

            <!-- Blinking/Normal Eyes -->
            ${blinking ? `
                <!-- Closed/Blinking Eyes -->
                <path d="M103,132 Q113,138 123,132" stroke="#4a373a" stroke-width="3" stroke-linecap="round" fill="none" />
                <path d="M137,132 Q147,138 157,132" stroke="#4a373a" stroke-width="3" stroke-linecap="round" fill="none" />
            ` : `
                <!-- Open Cute Anime Eyes -->
                <g class="eyes-normal">
                    <!-- Left Eye Contour & Pupil -->
                    <ellipse cx="113" cy="132" rx="9" ry="12" fill="#4A373A" />
                    <!-- Left Reflection -->
                    <circle cx="110" cy="127" r="3" fill="#FFFFFF" />
                    <circle cx="115" cy="134" r="1.2" fill="#FFFFFF" />
                    <path d="M102,126 Q113,121 124,126" stroke="#4a373a" stroke-width="2.5" stroke-linecap="round" fill="none" />
                    
                    <!-- Right Eye Contour & Pupil -->
                    <ellipse cx="147" cy="132" rx="9" ry="12" fill="#4A373A" />
                    <!-- Right Reflection -->
                    <circle cx="144" cy="127" r="3" fill="#FFFFFF" />
                    <circle cx="149" cy="134" r="1.2" fill="#FFFFFF" />
                    <path d="M136,126 Q147,121 158,126" stroke="#4a373a" stroke-width="2.5" stroke-linecap="round" fill="none" />
                </g>
            `}
        </svg>
    `
};

/* -------------------------------------------------------------
   WARDROBE CLOTHING ASSETS (SVG layers)
   ------------------------------------------------------------- */
const CLOTHING_ITEMS = {
    hairstyles: {
        wavy: {
            name: "Long Wavy Hair",
            colorVar: "--hair-color",
            defaultColor: "#FDA8BF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Front Bangs & Highlights -->
                    <path d="M92,120 Q130,85 168,120 Q162,142 162,142 Q130,125 98,142 Z" fill="${color}" />
                    <!-- Left face strand -->
                    <path d="M92,120 Q88,150 95,180 Q90,140 92,120 Z" fill="${color}" opacity="0.95" />
                    <!-- Right face strand -->
                    <path d="M168,120 Q172,150 165,180 Q170,140 168,120 Z" fill="${color}" opacity="0.95" />
                    <!-- Hair Highlights shine -->
                    <path d="M105,108 Q130,96 155,108" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" fill="none" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Wavy Hair cascading behind shoulders -->
                    <path d="M92,110 Q130,75 168,110 Q188,180 185,270 Q165,310 145,290 Q130,310 115,290 Q95,310 75,270 Q72,180 92,110 Z" fill="${color}" />
                </svg>
            `
        },
        ponytail: {
            name: "Cozy Ponytail",
            colorVar: "--hair-color",
            defaultColor: "#8C5847",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Bangs sweeping across forehead -->
                    <path d="M91,122 Q125,95 169,122 Q164,136 156,134 Q130,122 104,134 Z" fill="${color}" />
                    <path d="M91,122 Q95,145 98,162 Q92,142 91,122 Z" fill="${color}" />
                    <!-- Highlight -->
                    <path d="M102,114 Q130,104 158,114" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Base head wrap -->
                    <path d="M92,120 Q130,85 168,120 Q172,150 162,160 Q130,165 98,160 Z" fill="${color}" />
                    <!-- Hair Tie -->
                    <circle cx="160" cy="98" r="8" fill="#FF5C89" />
                    <!-- High bouncy ponytail waving off to the right -->
                    <path d="M160,98 Q195,60 210,120 Q225,185 188,220 Q170,200 178,160 Q158,130 160,98 Z" fill="${color}" />
                </svg>
            `
        },
        bob: {
            name: "Classic Bob",
            colorVar: "--hair-color",
            defaultColor: "#FFDE6A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Curved bob enclosing the cheeks -->
                    <path d="M92,120 Q130,80 168,120 Q178,175 166,192 Q162,175 158,175 Q130,165 102,175 Q98,175 94,192 Q82,175 92,120 Z" fill="${color}" />
                    <!-- Highlights -->
                    <path d="M106,106 Q130,95 154,106" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" fill="none" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Back hair behind neck -->
                    <path d="M90,120 Q130,80 170,120 L168,180 Q130,195 92,180 Z" fill="${color}" />
                </svg>
            `
        },
        curly: {
            name: "Fluffy Curls",
            colorVar: "--hair-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Bubbly interlocking cloud shapes enclosing the face -->
                    <path d="M94,115 C85,115 80,130 85,145 C80,155 85,170 95,175 C90,185 105,190 115,180 C125,188 135,188 145,180 C155,190 170,185 165,175 C175,170 180,155 175,145 C180,130 175,115 166,115 C166,100 150,90 130,95 C110,90 94,100 94,115 Z" fill="${color}" />
                    <!-- Curly bangs detail -->
                    <path d="M102,128 Q113,118 122,125 Q130,118 138,125 Q147,118 158,128 Q152,138 142,133 Q130,138 118,133 Q108,138 102,128 Z" fill="${color}" opacity="0.9" />
                    <!-- Soft curl highlights -->
                    <path d="M102,106 Q115,100 125,104" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round" fill="none" />
                    <path d="M135,104 Q145,100 158,106" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round" fill="none" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Fluffy curls behind -->
                    <path d="M85,120 C70,120 65,150 75,180 C70,200 80,225 100,230 C120,240 140,240 160,230 C180,225 190,200 185,180 C195,150 190,120 175,120 C175,100 160,85 130,85 C100,85 85,100 85,120 Z" fill="${color}" />
                </svg>
            `
        },
        braided: {
            name: "Double Braids",
            colorVar: "--hair-color",
            defaultColor: "#9ECBFF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Straight cut bangs -->
                    <path d="M91,120 Q130,85 169,120 L166,134 Q130,122 94,134 Z" fill="${color}" />
                    <!-- Highlight line -->
                    <path d="M102,110 Q130,99 158,110" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" fill="none" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Head base -->
                    <path d="M90,120 Q130,85 170,120 L168,160 Q130,165 92,160 Z" fill="${color}" />
                    
                    <!-- Left Braid -->
                    <g transform="translate(80, 150) scale(0.9)">
                        <path d="M0,0 Q10,15 -5,30 Q5,45 -10,60 Q0,75 -12,90 Q-5,105 -15,120 Q-25,120 -20,105 Q-12,90 -22,75 Q-10,60 -18,45 Q-5,30 -12,15 Z" fill="${color}" />
                        <!-- Pink Bow -->
                        <path d="M-22,118 L-8,126 L-15,134 Z M-8,118 L-22,126 L-15,134 Z" fill="#FF5C89" />
                        <!-- Braid tail -->
                        <path d="M-15,132 Q-10,150 -18,160 Q-23,150 -15,132" fill="${color}" />
                    </g>
                    
                    <!-- Right Braid -->
                    <g transform="translate(180, 150) scale(0.9) scaleX(-1)">
                        <path d="M0,0 Q10,15 -5,30 Q5,45 -10,60 Q0,75 -12,90 Q-5,105 -15,120 Q-25,120 -20,105 Q-12,90 -22,75 Q-10,60 -18,45 Q-5,30 -12,15 Z" fill="${color}" />
                        <!-- Pink Bow -->
                        <path d="M-22,118 L-8,126 L-15,134 Z M-8,118 L-22,126 L-15,134 Z" fill="#FF5C89" />
                        <!-- Braid tail -->
                        <path d="M-15,132 Q-10,150 -18,160 Q-23,150 -15,132" fill="${color}" />
                    </g>
                </svg>
            `
        }
    },
    tops: {
        sweater: {
            name: "Cozy Sweater",
            colorVar: "--top-color",
            defaultColor: "#C6E2FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Oversized sweater outline -->
                    <path d="M102,190 Q130,198 158,190 L166,275 Q130,282 94,275 Z" fill="${color}" stroke="rgba(0,0,0,0.05)" stroke-width="1.5" />
                    <!-- Left Sleeve -->
                    <path d="M102,190 Q80,225 82,270 Q75,270 78,260 Q72,220 96,190 Z" fill="${color}" />
                    <!-- Right Sleeve -->
                    <path d="M158,190 Q180,225 178,270 Q185,270 182,260 Q188,220 164,190 Z" fill="${color}" />
                    <!-- Collar ribbing -->
                    <path d="M116,191 Q130,200 144,191" stroke="rgba(255,255,255,0.5)" stroke-width="4" fill="none" />
                    <!-- Knit stripes texture -->
                    <path d="M115,210 L115,260 M130,212 L130,265 M145,210 L145,260" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round" fill="none" />
                </svg>
            `
        },
        crop: {
            name: "Strappy Crop Top",
            colorVar: "--top-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Crop chest wrap -->
                    <path d="M103,200 Q130,210 157,200 L152,240 Q130,250 108,240 Z" fill="${color}" />
                    <!-- Straps -->
                    <path d="M109,190 L111,202 M151,190 L149,202" stroke="${color}" stroke-width="3" />
                    <!-- Lace trim bottom -->
                    <path d="M108,240 Q113.5,245 119,240 Q124.5,245 130,240 Q135.5,245 141,240 Q146.5,245 152,240" stroke="rgba(255,255,255,0.8)" stroke-width="2" fill="none" />
                </svg>
            `
        },
        hoodie: {
            name: "Cozy Hoodie",
            colorVar: "--top-color",
            defaultColor: "#D4EDDA",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Hoodie body -->
                    <path d="M98,188 Q130,195 162,188 L168,276 Q130,285 92,276 Z" fill="${color}" />
                    <!-- Pouch Pocket -->
                    <path d="M110,245 L150,245 Q154,272 130,272 Q106,272 110,245 Z" fill="rgba(0,0,0,0.05)" />
                    <!-- Left Baggy Sleeve -->
                    <path d="M98,188 Q75,225 80,275 Q72,275 75,265 Q70,220 94,188 Z" fill="${color}" />
                    <!-- Right Baggy Sleeve -->
                    <path d="M162,188 Q185,225 180,275 Q188,275 185,265 Q190,220 166,188 Z" fill="${color}" />
                    <!-- Drawstrings -->
                    <path d="M124,196 L124,225" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" />
                    <path d="M136,196 L136,220" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" />
                </svg>
            `,
            back: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Hood lying on back -->
                    <path d="M106,170 Q130,140 154,170 Q160,200 130,198 Q100,200 106,170 Z" fill="${color}" stroke="rgba(0,0,0,0.06)" stroke-width="1.5" />
                </svg>
            `
        },
        blouse: {
            name: "Collared Blouse",
            colorVar: "--top-color",
            defaultColor: "#FFFFFF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Blouse Body -->
                    <path d="M102,192 Q130,198 158,192 L152,270 Q130,278 108,270 Z" fill="${color}" stroke="#FDA8BF" stroke-width="1" />
                    <!-- Puff sleeve left -->
                    <path d="M102,192 Q72,210 90,230 Q98,225 102,192 Z" fill="${color}" stroke="#FDA8BF" stroke-width="1" />
                    <!-- Puff sleeve right -->
                    <path d="M158,192 Q188,210 170,230 Q162,225 158,192 Z" fill="${color}" stroke="#FDA8BF" stroke-width="1" />
                    <!-- Collar -->
                    <path d="M114,192 L130,206 L146,192 Z" fill="#FFE5E5" stroke="#FDA8BF" stroke-width="1.5" />
                    <!-- Small buttons -->
                    <circle cx="130" cy="220" r="2.5" fill="#FF5C89" />
                    <circle cx="130" cy="238" r="2.5" fill="#FF5C89" />
                    <circle cx="130" cy="256" r="2.5" fill="#FF5C89" />
                </svg>
            `
        },
        casual: {
            name: "Heart Tee",
            colorVar: "--top-color",
            defaultColor: "#FFF0F0",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Simple T-shirt body -->
                    <path d="M102,190 L158,190 L154,265 L106,265 Z" fill="${color}" />
                    <path d="M102,190 L85,210 L94,222 L104,210 Z" fill="${color}" />
                    <path d="M158,190 L175,210 L166,222 L156,210 Z" fill="${color}" />
                    <!-- Heart Graphic -->
                    <path d="M130,225 C130,225 124,218 120,222 C116,226 120,234 130,240 C140,234 144,226 140,222 C136,218 130,225 130,225 Z" fill="#FF5C89" />
                </svg>
            `
        }
    },
    bottoms: {
        jeans: {
            name: "Classic Jeans",
            colorVar: "--bottom-color",
            defaultColor: "#87CEFA",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Denim jeans waist and legs -->
                    <path d="M110,268 L150,268 L152,305 L153,395 Q145,398 136,395 L133,310 L127,310 L124,395 Q115,398 107,395 L108,305 Z" fill="${color}" />
                    <!-- Pockets & Zipper stitch lines (Yellow) -->
                    <path d="M110,280 Q120,285 122,270" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.6" />
                    <path d="M150,280 Q140,285 138,270" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.6" />
                    <path d="M130,268 L130,295 Q130,305 126,305" stroke="#FFD700" stroke-width="1.5" fill="none" opacity="0.6" />
                    <!-- Folded cuffs -->
                    <rect x="107" y="390" width="16" height="7" rx="2" fill="#EBF4FA" />
                    <rect x="137" y="390" width="16" height="7" rx="2" fill="#EBF4FA" />
                </svg>
            `
        },
        skirt: {
            name: "Pleated Skirt",
            colorVar: "--bottom-color",
            defaultColor: "#FDA8BF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Flared skirt -->
                    <path d="M110,268 L150,268 L168,325 Q130,335 92,325 Z" fill="${color}" />
                    <!-- Pleat lines -->
                    <path d="M120,270 L110,326 M130,270 L130,330 M140,270 L150,326" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />
                    <!-- White stripe accent -->
                    <path d="M95,316 Q130,327 165,316" stroke="#FFFFFF" stroke-width="2" fill="none" />
                </svg>
            `
        },
        shorts: {
            name: "Denim Shorts",
            colorVar: "--bottom-color",
            defaultColor: "#B5A0F5",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Distressed shorts -->
                    <path d="M110,268 L150,268 L154,298 L133,298 L131,288 L129,288 L127,298 L106,298 Z" fill="${color}" />
                    <path d="M106,298 Q118,302 125,298" stroke="rgba(0,0,0,0.1)" stroke-width="1.5" fill="none" />
                    <path d="M135,298 Q144,302 154,298" stroke="rgba(0,0,0,0.1)" stroke-width="1.5" fill="none" />
                </svg>
            `
        },
        trousers: {
            name: "Cozy Trousers",
            colorVar: "--bottom-color",
            defaultColor: "#FFF2E6",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- High waist baggy trousers -->
                    <path d="M108,260 L152,260 L156,310 L160,414 Q142,416 134,414 L132,320 L128,320 L126,414 Q118,416 100,414 L104,310 Z" fill="${color}" />
                    <!-- Bow tie belt -->
                    <ellipse cx="130" cy="268" rx="8" ry="4" fill="#FF5C89" />
                    <path d="M130,268 Q120,282 122,290" stroke="#FF5C89" stroke-width="2.5" fill="none" />
                    <path d="M130,268 Q140,282 138,290" stroke="#FF5C89" stroke-width="2.5" fill="none" />
                </svg>
            `
        }
    },
    dresses: {
        casual: {
            name: "Summer Sundress",
            colorVar: "--dress-color",
            defaultColor: "#FFF5B8",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Sundress body -->
                    <path d="M103,202 Q130,218 157,202 L165,340 Q130,355 95,340 Z" fill="${color}" />
                    <!-- Straps -->
                    <path d="M109,190 L110,204 M151,190 L150,204" stroke="${color}" stroke-width="3" />
                    <!-- Gingham grid check overlay -->
                    <path d="M110,230 Q130,240 150,230 M105,260 Q130,272 155,260 M100,290 Q130,305 160,290 M98,320 Q130,336 162,320" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" />
                    <path d="M115,210 L110,341 M130,212 L130,348 M145,210 L150,341" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" />
                </svg>
            `
        },
        party: {
            name: "Sparkle Cocktail",
            colorVar: "--dress-color",
            defaultColor: "#E0B0FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Sweetheart neck fitted bodice and layered short skirt -->
                    <path d="M103,205 Q115,198 130,205 Q145,198 157,205 L151,268 L170,320 Q130,332 90,320 L109,268 Z" fill="${color}" />
                    <!-- Sparkly sequin dots -->
                    <circle cx="115" cy="220" r="2.5" fill="#FFF" opacity="0.8" />
                    <circle cx="145" cy="220" r="2.5" fill="#FFF" opacity="0.8" />
                    <circle cx="130" cy="235" r="2" fill="#FFF" opacity="0.8" />
                    <circle cx="120" cy="255" r="2.5" fill="#FFF" opacity="0.8" />
                    <circle cx="140" cy="255" r="2" fill="#FFF" opacity="0.8" />
                    <circle cx="110" cy="285" r="3" fill="#FFF" opacity="0.8" />
                    <circle cx="150" cy="285" r="3" fill="#FFF" opacity="0.8" />
                    <circle cx="130" cy="300" r="3.5" fill="#FFF" opacity="0.8" />
                    <!-- Glitter star shape -->
                    <path d="M125,280 L127,283 L130,283 L128,285 L129,288 L127,286 L125,288 L126,285 L124,283 L127,283 Z" fill="#FFF" />
                    <path d="M140,295 L141.5,297 L144,297 L142,299 L143,302 L141.5,300.5 L140,302 L141,299 L139,297 L141.5,297 Z" fill="#FFF" />
                </svg>
            `
        },
        princess: {
            name: "Princess Gown",
            colorVar: "--dress-color",
            defaultColor: "#FFC0CB",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Elegant ballgown expanding out past legs -->
                    <path d="M103,205 Q130,215 157,205 L151,265 Q230,340 215,410 Q130,422 45,410 Q30,340 109,265 Z" fill="${color}" />
                    <!-- Corset ribbon details -->
                    <path d="M124,215 L136,225 M136,215 L124,225 M124,225 L136,235 M136,225 L124,235 M124,235 L136,245 M136,235 L124,245" stroke="#FFF" stroke-width="1.5" />
                    <!-- Puffy off-shoulder sleeve drape left -->
                    <path d="M103,205 C88,212 90,230 105,225 Z" fill="${color}" stroke="rgba(0,0,0,0.08)" />
                    <!-- Puffy off-shoulder sleeve drape right -->
                    <path d="M157,205 C172,212 170,230 155,225 Z" fill="${color}" stroke="rgba(0,0,0,0.08)" />
                    <!-- Dress bottom frill -->
                    <path d="M45,410 Q66.25,415 87.5,410 Q108.75,415 130,410 Q151.25,415 172.5,410 Q193.75,415 215,410" stroke="rgba(255,255,255,0.7)" stroke-width="4" fill="none" />
                </svg>
            `
        },
        floral: {
            name: "Floral Wrap Dress",
            colorVar: "--dress-color",
            defaultColor: "#E0F8FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Wrap neck A-line floral dress -->
                    <path d="M103,200 L130,225 L157,200 L161,268 L168,360 Q130,372 92,360 L99,268 Z" fill="${color}" />
                    <!-- Waist ribbon wrap -->
                    <rect x="108" y="260" width="44" height="6" rx="2" fill="#FF5C89" />
                    <!-- Floral clusters (pink circles with yellow center) -->
                    <g fill="#FF8CA9">
                        <!-- Cluster 1 -->
                        <circle cx="115" cy="240" r="3" /><circle cx="120" cy="243" r="3" /><circle cx="113" cy="245" r="3" />
                        <!-- Cluster 2 -->
                        <circle cx="145" cy="235" r="3" /><circle cx="149" cy="239" r="3" /><circle cx="142" cy="240" r="3" />
                        <!-- Cluster 3 -->
                        <circle cx="110" cy="290" r="3.5" /><circle cx="116" cy="293" r="3.5" /><circle cx="109" cy="296" r="3.5" />
                        <!-- Cluster 4 -->
                        <circle cx="150" cy="300" r="3.5" /><circle cx="156" cy="303" r="3.5" /><circle cx="149" cy="306" r="3.5" />
                        <!-- Cluster 5 -->
                        <circle cx="130" cy="330" r="4" /><circle cx="136" cy="334" r="4" /><circle cx="129" cy="337" r="4" />
                    </g>
                    <g fill="#FFDE6A">
                        <!-- Center buds -->
                        <circle cx="116" cy="243" r="1.5" />
                        <circle cx="145" cy="238" r="1.5" />
                        <circle cx="112" cy="293" r="1.8" />
                        <circle cx="152" cy="303" r="1.8" />
                        <circle cx="132" cy="334" r="2" />
                    </g>
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
                    <!-- Black collar band -->
                    <path d="M122,175 Q130,181 138,175" stroke="#4A373A" stroke-width="2" fill="none" />
                    <!-- Gold star pendant -->
                    <polygon points="130,178 131.5,181 134.5,181 132,183 133,186 130,184 127,186 128,183 125.5,181 128.5,181" fill="${color}" />
                </svg>
            `
        },
        earrings: {
            name: "Star Danglers",
            colorVar: "--jewel-color",
            defaultColor: "#FFDE6A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Left Earring chain + star -->
                    <line x1="88" y1="138" x2="88" y2="146" stroke="#4a373a" stroke-width="1" />
                    <polygon points="88,144 89.5,147 92.5,147 90,149 91,152 88,150 85,152 86,149 83.5,147 86.5,147" fill="${color}" />
                    
                    <!-- Right Earring chain + star -->
                    <line x1="172" y1="138" x2="172" y2="146" stroke="#4a373a" stroke-width="1" />
                    <polygon points="172,144 173.5,147 176.5,147 174,149 175,152 172,150 169,152 170,149 167.5,147 170.5,147" fill="${color}" />
                </svg>
            `
        },
        bracelet: {
            name: "Beaded Bracelet",
            colorVar: "--jewel-color",
            defaultColor: "#FB8CAC",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Beaded ring on right wrist -->
                    <ellipse cx="178" cy="272" rx="6.5" ry="3" fill="none" stroke="${color}" stroke-dasharray="3,2" stroke-width="3" />
                </svg>
            `
        },
        ring: {
            name: "Diamond Ring",
            colorVar: "--jewel-color",
            defaultColor: "#C6E2FF",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Tiny gold circle with white diamond on left hand -->
                    <circle cx="80" cy="284" r="2.5" fill="#FFDE6A" />
                    <polygon points="80,281 81.5,283 80,285 78.5,283" fill="${color}" />
                </svg>
            `
        }
    },
    accessories: {
        handbag: {
            name: "Strawberry Bag",
            colorVar: "--acc-color",
            defaultColor: "#FF5C89",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Strawberry shape bag held in left hand/hip area -->
                    <!-- Strap -->
                    <path d="M80,280 Q65,240 76,290" stroke="#8c6a5c" stroke-width="1.5" fill="none" />
                    <!-- Strawberry body -->
                    <path d="M68,292 Q80,286 92,292 Q96,306 80,318 Q64,306 68,292 Z" fill="${color}" stroke="#de2e5d" stroke-width="1" />
                    <!-- Green leaves cap -->
                    <path d="M68,292 Q72,284 80,288 Q88,284 92,292 Q80,296 68,292 Z" fill="#C1E1C1" />
                    <!-- Yellow Seeds -->
                    <circle cx="74" cy="298" r="0.8" fill="#FFDE6A" />
                    <circle cx="86" cy="298" r="0.8" fill="#FFDE6A" />
                    <circle cx="80" cy="304" r="0.8" fill="#FFDE6A" />
                    <circle cx="76" cy="310" r="0.8" fill="#FFDE6A" />
                    <circle cx="84" cy="310" r="0.8" fill="#FFDE6A" />
                </svg>
            `
        },
        hairclips: {
            name: "Cute Hair Bows",
            colorVar: "--acc-color",
            defaultColor: "#FF5C89",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Two bows on the front hair sides -->
                    <!-- Left bow -->
                    <g transform="translate(100, 112)">
                        <polygon points="0,0 -8,-5 -8,5 0,0 8,-5 8,5" fill="${color}" />
                        <circle cx="0" cy="0" r="2" fill="#fff" />
                    </g>
                    <!-- Right bow -->
                    <g transform="translate(160, 112)">
                        <polygon points="0,0 -8,-5 -8,5 0,0 8,-5 8,5" fill="${color}" />
                        <circle cx="0" cy="0" r="2" fill="#fff" />
                    </g>
                </svg>
            `
        },
        glasses: {
            name: "Round Wireframes",
            colorVar: "--acc-color",
            defaultColor: "#4A373A",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Left round glass frame -->
                    <circle cx="113" cy="132" r="11" fill="rgba(255,255,255,0.15)" stroke="${color}" stroke-width="2.5" />
                    <!-- Right round glass frame -->
                    <circle cx="147" cy="132" r="11" fill="rgba(255,255,255,0.15)" stroke="${color}" stroke-width="2.5" />
                    <!-- Center nose bridge -->
                    <path d="M124,132 Q130,129 136,132" stroke="${color}" stroke-width="2" fill="none" />
                    <!-- Temples/Sides -->
                    <path d="M102,132 L94,130" stroke="${color}" stroke-width="2" />
                    <path d="M158,132 L166,130" stroke="${color}" stroke-width="2" />
                </svg>
            `
        },
        hat: {
            name: "Pastel Beret",
            colorVar: "--acc-color",
            defaultColor: "#B5A0F5",
            front: (color) => `
                <svg viewBox="${BASE_VIEWBOX}">
                    <!-- Cozy beret tilted on head -->
                    <ellipse cx="128" cy="94" rx="42" ry="16" fill="${color}" stroke="rgba(0,0,0,0.05)" transform="rotate(-8 128 94)" />
                    <!-- Small stem on top -->
                    <path d="M125,78 Q125,72 122,74" stroke="${color}" stroke-width="3.5" stroke-linecap="round" fill="none" />
                </svg>
            `
        }
    }
};

/* -------------------------------------------------------------
   GAME STATE CONTROLLER
   ------------------------------------------------------------- */
const GameState = {
    skinColor: "#fdd7cf", // Peach
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
    
    // Set skin tone color
    setSkin(color) {
        this.skinColor = color;
        this.renderLayer('body');
    },

    // Equip an item from category
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
            this.equipped.dresses = null;
            this.equipped[category] = this.equipped[category] === itemId ? null : itemId;
            this.colors[category] = this.equipped[category] ? CLOTHING_ITEMS[category][itemId].defaultColor : null;
        } else {
            // Standard category toggle behavior
            this.equipped[category] = this.equipped[category] === itemId ? null : itemId;
            this.colors[category] = this.equipped[category] ? CLOTHING_ITEMS[category][itemId].defaultColor : null;
        }

        this.renderAllLayers();
        this.updateSummary();
        this.updateColorPalette();
        
        // Show floating hearts when styling
        createFloatingParticles('heart-particle', 3);
        
        // Random comment from mascot
        triggerRandomDialogue();
    },

    // Change current category color
    setItemColor(category, colorHex) {
        if (!this.equipped[category]) return;
        this.colors[category] = colorHex;
        this.renderAllLayers();
        
        // Flash swatches
        sound.playClick();
    },

    // Update UI summary listing equipped items
    updateSummary() {
        const categories = ['hairstyles', 'tops', 'bottoms', 'dresses', 'jewelry', 'accessories'];
        categories.forEach(cat => {
            const el = document.getElementById(`summary-${cat}`);
            const itemId = this.equipped[cat];
            if (itemId && CLOTHING_ITEMS[cat][itemId]) {
                el.innerText = CLOTHING_ITEMS[cat][itemId].name;
                el.classList.add('equipped-active');
            } else {
                el.innerText = "None";
                el.classList.remove('equipped-active');
            }
        });
    },

    // Render a specific layer by container ID
    renderLayer(layerId) {
        const container = document.getElementById(`layer-${layerId}`);
        if (!container) return;

        let svgHtml = "";

        if (layerId === 'body') {
            svgHtml = CHAR_BASE.body(this.skinColor);
        } else if (layerId === 'underwear') {
            // Underwear only shows if no dress is covering
            if (!this.equipped.dresses) {
                svgHtml = CHAR_BASE.underwear();
            }
        } else if (layerId === 'face') {
            svgHtml = CHAR_BASE.face(this.blinking);
        } else if (layerId === 'back-hair') {
            const hairId = this.equipped.hairstyles;
            if (hairId && CLOTHING_ITEMS.hairstyles[hairId].back) {
                const color = this.colors.hairstyles;
                svgHtml = CLOTHING_ITEMS.hairstyles[hairId].back(color);
            }
        } else if (layerId === 'front-hair') {
            const hairId = this.equipped.hairstyles;
            if (hairId && CLOTHING_ITEMS.hairstyles[hairId].front) {
                const color = this.colors.hairstyles;
                svgHtml = CLOTHING_ITEMS.hairstyles[hairId].front(color);
            }
        } else {
            // General outfit layers (top, bottom, dresses, jewelry, accessories)
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
                    // Sub-item filter mapping for specific layers
                    if (layerId === 'necklaces' && itemId !== 'necklace') return;
                    if (layerId === 'earrings' && itemId !== 'earrings') return;
                    if (layerId === 'bracelets' && itemId !== 'bracelet') return;
                    if (layerId === 'rings' && itemId !== 'ring') return;
                    
                    if (layerId === 'hats' && itemId !== 'hat') return;
                    if (layerId === 'glasses' && itemId !== 'glasses') return;
                    if (layerId === 'handbags' && itemId !== 'handbag') return;
                    if (layerId === 'front-hair' && category === 'accessories' && itemId === 'hairclips') return; // clips drawn front

                    if (item.front) {
                        const color = this.colors[category];
                        svgHtml = item.front(color);
                    }
                }
            }
        }

        container.innerHTML = svgHtml;
    },

    // Refresh all rendering containers
    renderAllLayers() {
        this.renderLayer('back-hair');
        this.renderLayer('body');
        this.renderLayer('underwear');
        this.renderLayer('face');
        this.renderLayer('bottom');
        this.renderLayer('top');
        this.renderLayer('dress');
        this.renderLayer('front-hair');
        
        // Render detailed sub-layers for jewels and accessories
        const layers = ['necklaces', 'earrings', 'bracelets', 'rings', 'hats', 'glasses', 'handbags'];
        layers.forEach(layer => this.renderLayer(layer));
        
        // Highlight active equip cards in wardrobe
        updateActiveCardSelections();
    },

    // Randomize outfit configuration
    randomize() {
        sound.playEquip();
        
        const rollChance = (prob) => Math.random() < prob;
        
        // Random Skin
        const skins = ["#fdd7cf", "#f9beae", "#d99781", "#8c5847"];
        this.skinColor = skins[Math.floor(Math.random() * skins.length)];
        
        // Apply active skin UI selection
        const swatches = document.querySelectorAll('.skin-swatch');
        swatches.forEach(sw => {
            if (sw.dataset.color === this.skinColor) {
                sw.classList.add('active');
            } else {
                sw.classList.remove('active');
            }
        });

        // Hairstyles (always equipped)
        const hairKeys = Object.keys(CLOTHING_ITEMS.hairstyles);
        this.equipped.hairstyles = hairKeys[Math.floor(Math.random() * hairKeys.length)];
        this.colors.hairstyles = getRandomColor();

        // 50% Dress or Top/Bottom split
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

        // Jewelry
        const jewelKeys = Object.keys(CLOTHING_ITEMS.jewelry);
        jewelKeys.forEach(jk => {
            if (rollChance(0.6)) {
                this.equipped.jewelry = jk;
                this.colors.jewelry = getRandomColor();
            }
        });

        // Accessories
        const accKeys = Object.keys(CLOTHING_ITEMS.accessories);
        if (rollChance(0.7)) {
            this.equipped.accessories = accKeys[Math.floor(Math.random() * accKeys.length)];
            this.colors.accessories = getRandomColor();
        } else {
            this.equipped.accessories = null;
        }

        this.renderAllLayers();
        this.updateSummary();
        this.updateColorPalette();
        generateRandomOutfitName();
        showNotification("💖 Sparkled up a random cute outfit! 💖");
        createFloatingParticles('sparkle-particle', 8);
    },

    // Reset everything back to basics
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
        
        // Reset active skin
        const swatches = document.querySelectorAll('.skin-swatch');
        swatches.forEach((sw, idx) => {
            if (idx === 0) sw.classList.add('active');
            else sw.classList.remove('active');
        });

        this.renderAllLayers();
        this.updateSummary();
        this.updateColorPalette();
        this.outfitName = "Cozy Dreamer";
        document.getElementById('outfit-name-input').value = this.outfitName;
        
        showNotification("🎀 Outfit styling reset! 🎀");
    },

    // Dynamic Color Customizer swatches generator
    updateColorPalette() {
        const container = document.getElementById('item-color-palette');
        container.innerHTML = "";

        // Find active tab category
        const activeTab = document.querySelector('.wardrobe-tab.active');
        if (!activeTab) return;
        const category = activeTab.dataset.category;

        // If nothing is equipped in this category, disable color pickers
        if (!this.equipped[category]) {
            container.innerHTML = "<p class='no-item-color-msg'>Equip an item first to customize color! 🎨</p>";
            return;
        }

        // Curated colors for wardrobe styling
        const fashionColors = [
            "#FFDBDB", "#FDC3D1", "#FDA8BF", "#FB8CAC", "#FF5C89", // Sweet Pinks
            "#FFF5B8", "#FFDE6A", "#FFE082", // Sunny Yellows
            "#D4EDDA", "#C1E1C1", "#A8E6CF", // Minty Greens
            "#C6E2FF", "#9ECBFF", "#87CEFA", // Sky Blues
            "#E0B0FF", "#B5A0F5", "#D7BDE2", // Lavender Lilacs
            "#FFE4E1", "#F5CBA7", "#E59866", // Nude/Peach
            "#FFFFFF", "#EEEEEE", "#BDBDBD", "#5D4037", "#4A373A"  // Neutrals/Darks
        ];

        const activeColor = this.colors[category];

        fashionColors.forEach(colorHex => {
            const button = document.createElement('button');
            button.className = "color-swatch";
            button.style.backgroundColor = colorHex;
            button.ariaLabel = `Apply ${colorHex}`;
            
            if (activeColor && activeColor.toLowerCase() === colorHex.toLowerCase()) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => {
                this.setItemColor(category, colorHex);
                // Refresh active swatches
                document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
                button.classList.add('active');
            });

            container.appendChild(button);
        });
    }
};

/* Helper generator colors */
function getRandomColor() {
    const list = [
        "#FFDBDB", "#FDC3D1", "#FDA8BF", "#FB8CAC", "#FF5C89", 
        "#FFF5B8", "#FFDE6A", "#D4EDDA", "#C1E1C1", 
        "#C6E2FF", "#9ECBFF", "#E0B0FF", "#B5A0F5", 
        "#FFE4E1", "#FFFFFF", "#5D4037", "#4A373A"
    ];
    return list[Math.floor(Math.random() * list.length)];
}

/* -------------------------------------------------------------
   POPULATE WARDROBE UI LISTS
   ------------------------------------------------------------- */
function loadWardrobeCategoryGrid(category) {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = "";
    
    const items = CLOTHING_ITEMS[category];
    if (!items) return;

    Object.keys(items).forEach(itemId => {
        const item = items[itemId];
        const card = document.createElement('div');
        card.className = "item-card";
        card.dataset.id = itemId;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        
        // Check if equipped
        if (GameState.equipped[category] === itemId) {
            card.classList.add('equipped');
        }

        // Render preview SVG icon (fill with default color)
        let previewSvg = "";
        const defaultCol = item.defaultColor;
        if (item.front) {
            previewSvg = item.front(defaultCol);
        } else if (item.back) {
            previewSvg = item.back(defaultCol);
        }

        card.innerHTML = previewSvg;

        // Equip click handler
        card.addEventListener('click', () => {
            GameState.equipItem(category, itemId);
        });

        // Keydown support for accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                GameState.equipItem(category, itemId);
            }
        });

        grid.appendChild(card);
    });

    // Refresh color customizers
    GameState.updateColorPalette();
}

function updateActiveCardSelections() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.item-card');
    const activeTab = document.querySelector('.wardrobe-tab.active');
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


/* Setup Wardrobe Cabinet Open/Close doors */
const wardrobeCloset = document.getElementById('wardrobe-closet');
const toggleWardrobeBtn = document.getElementById('btn-toggle-wardrobe');

toggleWardrobeBtn.addEventListener('click', () => {
    const isOpen = wardrobeCloset.classList.toggle('open');
    sound.playWardrobe(isOpen);
    
    if (isOpen) {
        // First tab load
        const activeTab = document.querySelector('.wardrobe-tab.active') || document.querySelector('.wardrobe-tab');
        if (activeTab) {
            activeTab.classList.add('active');
            loadWardrobeCategoryGrid(activeTab.dataset.category);
        }
        triggerDialogue("Cute wardrobe opened! What outfit are we building? 👗");
    } else {
        triggerDialogue("Wardrobe closed. Ready to download your style? ✨");
    }
});


// Tab selectors click listener
document.querySelectorAll('.wardrobe-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        sound.playClick();
        
        // Remove active from others
        document.querySelectorAll('.wardrobe-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        const category = tab.dataset.category;
        loadWardrobeCategoryGrid(category);
    });
});


/* Skin selector change listeners */
document.querySelectorAll('.skin-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        GameState.setSkin(sw.dataset.color);
        
        createFloatingParticles('sparkle-particle', 3);
    });
});

/* Control buttons: randomize, reset, name */
document.getElementById('btn-randomize').addEventListener('click', () => GameState.randomize());
document.getElementById('btn-reset').addEventListener('click', () => GameState.reset());
document.getElementById('btn-refresh-name').addEventListener('click', () => {
    sound.playClick();
    generateRandomOutfitName();
});


/* -------------------------------------------------------------
   SOUNDS & MUSICS INITIALIZATION IN DIALOGUE CLICK
   ------------------------------------------------------------- */
// Many browsers block Web Audio on load. Initialize on first user click.
window.addEventListener('click', () => {
    sound.init();
}, { once: true });


/* -------------------------------------------------------------
   DIALOGUE SPEECH BUBBLE LOGIC
   ------------------------------------------------------------- */
const WELCOME_DIALOGUES = [
    "Welcome to Dream Dress-Up Room! 💕",
    "Let's create your perfect outfit today!",
    "Open the wardrobe to start styling."
];

const RANDOM_STYLER_COMMENTS = [
    "That hairstyle looks adorable! 😍",
    "You're creating such a cute look!",
    "Try mixing accessories! 🎀",
    "Fashion icon in the making!",
    "Omg, this combination is super cozy!",
    "Don't forget to save your look in the diary!",
    "Looking absolutely fabulous!"
];

let dialogueIndex = 0;
let typingTimeout = null;

function triggerDialogue(text) {
    const box = document.getElementById('dialogue-box');
    const textEl = document.getElementById('dialogue-text');
    
    // Reset typing
    clearTimeout(typingTimeout);
    box.style.animation = 'none';
    box.offsetHeight; // trigger reflow
    box.style.animation = 'bubblePopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

    // Typewriter effect
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
    // 35% chance to output a comment when equipping to avoid spamming
    if (Math.random() < 0.35) {
        const comment = RANDOM_STYLER_COMMENTS[Math.floor(Math.random() * RANDOM_STYLER_COMMENTS.length)];
        triggerDialogue(comment);
    }
}

// Initial intro sequence
function runIntroDialogue() {
    if (dialogueIndex < WELCOME_DIALOGUES.length) {
        triggerDialogue(WELCOME_DIALOGUES[dialogueIndex]);
        dialogueIndex++;
        // Cycle every 4.5 seconds
        setTimeout(runIntroDialogue, 4500);
    }
}


/* -------------------------------------------------------------
   AUTOPLAY EYES BLINKING EFFECTS
   ------------------------------------------------------------- */
function startBlinkingLoop() {
    setInterval(() => {
        // Toggle face blink
        GameState.blinking = true;
        GameState.renderLayer('face');
        
        setTimeout(() => {
            GameState.blinking = false;
            GameState.renderLayer('face');
        }, 180); // Blink duration
        
    }, 4500); // Blink interval
}


/* -------------------------------------------------------------
   FLOATING SPARKLES & HEART PARTICLES
   ------------------------------------------------------------- */
function createFloatingParticles(particleClass, count) {
    const area = document.getElementById('character-click-sparkles');
    if (!area) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `fa-solid ${particleClass === 'heart-particle' ? 'fa-heart heart-particle' : 'fa-star sparkle-particle'}`;
        
        // Random coords around the character chest/head
        const rx = 50 + Math.random() * 160;
        const ry = 80 + Math.random() * 260;
        
        particle.style.left = `${rx}px`;
        particle.style.top = `${ry}px`;
        
        // Random transform landing destinations
        const tx = (Math.random() - 0.5) * 120;
        const ty = - (30 + Math.random() * 100);
        const rot = (Math.random() - 0.5) * 360;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        area.appendChild(particle);
        
        // Clean up
        setTimeout(() => particle.remove(), 1200);
    }
}

// Click anywhere on character canvas triggers sparkles
document.getElementById('screenshot-area').addEventListener('mousedown', (e) => {
    // Only trigger sparkles if clicking the character canvas area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    sound.playSparkle();
    
    const area = document.getElementById('character-click-sparkles');
    const p = document.createElement('div');
    p.className = "fa-solid fa-sparkles sparkle-particle";
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
});


/* -------------------------------------------------------------
   TOAST NOTIFICATION popup
   ------------------------------------------------------------- */
function showNotification(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = "toast-notification";
    toast.innerHTML = `<i class="fa-solid fa-star"></i> <span>${msg}</span>`;
    
    container.appendChild(toast);
    
    // Automatic cleanup
    setTimeout(() => {
        toast.remove();
    }, 3500);
}


/* -------------------------------------------------------------
   FLASK BACKEND API INTEGRATIONS
   ------------------------------------------------------------- */

// Generate outfit name using endpoint
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
            // Local fallback
            const adj = ["Pastel", "Cutie", "Cozy", "Dreamy", "Strawberry"];
            const noun = ["Pixie", "Princess", "Dolly", "Glow", "Cloud"];
            const fallback = adj[Math.floor(Math.random()*adj.length)] + " " + noun[Math.floor(Math.random()*noun.length)];
            GameState.outfitName = fallback;
            document.getElementById('outfit-name-input').value = fallback;
        });
}

// Fetch all saved outfits on load
function fetchDiaryOutfits() {
    fetch('/api/outfits')
        .then(res => res.json())
        .then(outfits => {
            populateDiaryGrid(outfits);
        })
        .catch(err => console.error("Error fetching outfits:", err));
}

// Populate diary grid with Polaroid cards
function populateDiaryGrid(outfits) {
    const container = document.getElementById('gallery-items-container');
    container.innerHTML = "";
    
    if (outfits.length === 0) {
        container.innerHTML = `
            <div class="gallery-empty-state">
                <i class="fa-solid fa-heart-crack"></i>
                <p>No outfits saved in your diary yet!</p>
                <button id="btn-start-styling" class="cozy-pill-btn">Start Styling</button>
            </div>
        `;
        document.getElementById('btn-start-styling').addEventListener('click', () => {
            sound.playClick();
            closeGallery();
        });
        return;
    }

    outfits.forEach(outfit => {
        const card = document.createElement('div');
        card.className = "polaroid-card";
        
        // Format Date
        let dateStr = "Recently";
        if (outfit.created_at) {
            const dateObj = new Date(outfit.created_at + " UTC");
            dateStr = dateObj.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
        }

        // Draw a miniature rendering of the outfit in SVG inside the polaroid frame!
        // This is incredibly cute and creative.
        const config = outfit.configuration;
        const skinColor = config.skinColor || "#fdd7cf";
        
        // Assemble mini SVGs
        let backHairSvg = "";
        let frontHairSvg = "";
        let bodySvg = CHAR_BASE.body(skinColor);
        let underwearSvg = !config.dresses ? CHAR_BASE.underwear() : "";
        let faceSvg = CHAR_BASE.face(false);
        let bottomSvg = "";
        let topSvg = "";
        let dressSvg = "";
        
        // Hair
        if (config.hairstyles && CLOTHING_ITEMS.hairstyles[config.hairstyles]) {
            const h = CLOTHING_ITEMS.hairstyles[config.hairstyles];
            if (h.back) backHairSvg = h.back(config.colors.hairstyles || h.defaultColor);
            if (h.front) frontHairSvg = h.front(config.colors.hairstyles || h.defaultColor);
        }
        
        // Clothes
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

        // Accessories & Jewels
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
            const itemKey = config[m.cat];
            if (itemKey === m.sub) {
                const item = CLOTHING_ITEMS[m.cat][itemKey];
                if (item && item.front) {
                    accsSvg += item.front(config.colors[m.cat] || item.defaultColor);
                }
            }
        });

        // Combined Mini SVG representation
        const miniSvg = `
            <svg viewBox="${BASE_VIEWBOX}" width="100" height="100">
                <g transform="scale(0.95) translate(6, 10)">
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
            <div class="polaroid-date">${dateStr}</div>
            <div class="polaroid-actions">
                <button class="polaroid-btn load" data-id="${outfit.id}" title="Wear Look"><i class="fa-solid fa-shirt"></i> Wear</button>
                <button class="polaroid-btn delete" data-id="${outfit.id}" title="Delete Look"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        // Wear button listener
        card.querySelector('.polaroid-btn.load').addEventListener('click', () => {
            sound.playEquip();
            applyOutfitConfiguration(config, outfit.name);
            closeGallery();
            showNotification(`Wearing look "${outfit.name}"! 💖`);
        });

        // Delete button listener
        card.querySelector('.polaroid-btn.delete').addEventListener('click', () => {
            sound.playClick();
            deleteOutfitFromServer(outfit.id);
        });

        container.appendChild(card);
    });
}

// Wear outfit applied from diary card
function applyOutfitConfiguration(config, name) {
    GameState.skinColor = config.skinColor || "#fdd7cf";
    GameState.equipped = { ...config.equipped };
    GameState.colors = { ...config.colors };
    GameState.outfitName = name;
    document.getElementById('outfit-name-input').value = name;
    
    // Sync skin active swatches
    const swatches = document.querySelectorAll('.skin-swatch');
    swatches.forEach(sw => {
        if (sw.dataset.color === GameState.skinColor) sw.classList.add('active');
        else sw.classList.remove('active');
    });

    GameState.renderAllLayers();
    GameState.updateSummary();
    GameState.updateColorPalette();
}

// Save look to database route
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
            showNotification("Outfit saved in your Diary! 💖");
            createFloatingParticles('sparkle-particle', 12);
            fetchDiaryOutfits(); // reload list
        } else {
            showNotification("Error saving look.");
        }
    })
    .catch(err => {
        console.error("Error saving look:", err);
        showNotification("Failed to save look.");
    });
}

// Delete look route
function deleteOutfitFromServer(id) {
    if (!confirm("Are you sure you want to delete this look from your diary? 😢")) return;

    fetch(`/api/outfits/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showNotification("Look removed from diary.");
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
const btnGalleryToggle = document.getElementById('btn-gallery-toggle');

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

btnGalleryToggle.addEventListener('click', openGallery);
btnCloseGallery.addEventListener('click', closeGallery);
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeGallery();
});

// Save Look handler trigger
document.getElementById('btn-save').addEventListener('click', () => {
    saveOutfitToServer();
});


/* -------------------------------------------------------------
   SCREENSHOT / PNG EXPORT DOWNLOAD COMPILER
   ------------------------------------------------------------- */
function compileAndDownloadOutfitImage() {
    sound.playSparkle();
    
    // Create a temporary Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');

    // Assemble the complete styling scene in a single master SVG
    // Background Wallpaper
    ctx.fillStyle = "#FFECEC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wallpaper stripes
    ctx.fillStyle = "#FFF2F2";
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, 0, 20, canvas.height * 0.8);
    }
    ctx.fillStyle = "#FFE5E5";
    for (let i = 20; i < canvas.width; i += 40) {
        ctx.fillRect(i, 0, 20, canvas.height * 0.8);
    }

    // Draw Window Background and window
    // Draw Rug
    const rugGrad = ctx.createRadialGradient(250, 480, 20, 250, 480, 150);
    rugGrad.addColorStop(0, "#FFE4EC");
    rugGrad.addColorStop(0.7, "#FDC3D1");
    rugGrad.addColorStop(1, "rgba(253, 195, 209, 0)");
    ctx.fillStyle = rugGrad;
    ctx.beginPath();
    ctx.ellipse(250, 480, 160, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw Table (Vanity shelf right side)
    ctx.fillStyle = "#FDA8BF";
    ctx.fillRect(360, 250, 120, 150);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(350, 240, 140, 12);
    
    // Draw Plant left side
    // Plant pot
    ctx.fillStyle = "#ffccd5";
    ctx.beginPath();
    ctx.moveTo(35, 410);
    ctx.lineTo(75, 410);
    ctx.lineTo(70, 440);
    ctx.lineTo(40, 440);
    ctx.closePath();
    ctx.fill();

    // Draw Character Layers stack
    // We serialize character SVGs
    const container = document.getElementById('character-avatar');
    const layers = Array.from(container.children);
    
    let combinedSvgContent = "";
    
    layers.forEach(layer => {
        const svgEl = layer.querySelector('svg');
        if (svgEl) {
            // Keep the inner SVGs paths
            combinedSvgContent += svgEl.innerHTML;
        }
    });

    // Create a master image containing all SVGs overlays
    const masterSvgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${BASE_VIEWBOX}" width="320" height="520">
            ${combinedSvgContent}
        </svg>
    `;

    const img = new Image();
    // Encode SVG string to base64 dataURI
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(masterSvgString);

    img.onload = function() {
        // Draw character at center of canvas
        ctx.drawImage(img, 90, 20, 320, 520);
        
        // Title logo tag watermark
        ctx.fillStyle = "rgba(255, 92, 137, 0.9)";
        ctx.beginPath();
        ctx.roundRect(15, 15, 200, 40, 20);
        ctx.fill();
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Quicksand, Fredoka, sans-serif";
        ctx.fillText(GameState.outfitName, 30, 40);

        // Trigger file download
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `${GameState.outfitName.replace(/\s+/g, '_')}_look.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification("📸 Fashion photo saved! 📸");
        createFloatingParticles('sparkle-particle', 6);
    };

    img.onerror = function(e) {
        console.error("Screenshot compile error:", e);
        showNotification("Failed compiling photo.");
    };
}

document.getElementById('btn-screenshot').addEventListener('click', compileAndDownloadOutfitImage);


/* -------------------------------------------------------------
   INITIAL RUN ASSEMBLY
   ------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    // Populate first categories
    loadWardrobeCategoryGrid('hairstyles');
    GameState.renderAllLayers();
    GameState.updateSummary();
    
    // Set dialogue intro
    runIntroDialogue();
    
    // Set blinking
    startBlinkingLoop();
    
    // Sync active skin color button
    const swatches = document.querySelectorAll('.skin-swatch');
    swatches.forEach((sw, idx) => {
        if (idx === 0) sw.classList.add('active');
        else sw.classList.remove('active');
    });
});
