// Audio Manager for Squart Game
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.music = {};
        this.isMuted = false;
        this.volume = 0.7;
        this.musicVolume = 0.3;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;

            // Create sound effects
            await this.createSoundEffects();
            
            // Create background music
            await this.createBackgroundMusic();
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio system could not be initialized:', error);
        }
    }

    async createSoundEffects() {
        // Token placement sound (electric zap)
        this.sounds.tokenPlace = this.createElectricZapSound();
        
        // AI thinking sound (processing)
        this.sounds.aiThinking = this.createProcessingSound();
        
        // UI click sound (neon click)
        this.sounds.uiClick = this.createNeonClickSound();
        
        // Winner sound (triumph)
        this.sounds.winner = this.createTriumphSound();
        
        // Game over sound (defeat)
        this.sounds.gameOver = this.createDefeatSound();
        
        // Hover sound (soft beep)
        this.sounds.hover = this.createHoverSound();
        
        // Error sound (warning)
        this.sounds.error = this.createWarningSound();
    }

    async createBackgroundMusic() {
        // CRT ambient music
        this.music.ambient = this.createCRTAmbientMusic();
        
        // Victory music
        this.music.victory = this.createVictoryMusic();
        
        // Tension music (for close games)
        this.music.tension = this.createTensionMusic();
    }

    // Electric zap sound for token placement
    createElectricZapSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 800 + Math.random() * 400;
            const amplitude = Math.exp(-t * 8) * (0.3 + Math.random() * 0.2);
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t) * 
                      Math.sin(2 * Math.PI * 50 * t); // Modulation
        }

        return buffer;
    }

    // Processing sound for AI thinking
    createProcessingSound() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 200 + Math.sin(t * 10) * 50;
            const amplitude = Math.exp(-t * 2) * 0.2;
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    // Neon click sound for UI interactions
    createNeonClickSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 1200 * Math.exp(-t * 20);
            const amplitude = Math.exp(-t * 15) * 0.3;
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    // Triumph sound for winner
    createTriumphSound() {
        const duration = 2.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C major chord
        const startTime = 0.1;
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                if (t > startTime) {
                    const noteTime = t - startTime;
                    const noteIndex = Math.floor(noteTime * 2) % frequencies.length;
                    const frequency = frequencies[noteIndex];
                    const amplitude = Math.exp(-noteTime * 1.5) * 0.2;
                    sample = amplitude * Math.sin(2 * Math.PI * frequency * noteTime);
                }
                
                data[i] = sample;
            }
        }

        return buffer;
    }

    // Defeat sound for game over
    createDefeatSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 200 * Math.exp(-t * 3);
            const amplitude = Math.exp(-t * 2) * 0.3;
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    // Hover sound for UI elements
    createHoverSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 800;
            const amplitude = Math.exp(-t * 20) * 0.1;
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    // Warning sound for errors
    createWarningSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 400 + Math.sin(t * 20) * 100;
            const amplitude = Math.exp(-t * 4) * 0.2;
            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    // CRT ambient background music
    createCRTAmbientMusic() {
        const duration = 10.0; // Loop every 10 seconds
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const baseFreq = 60; // Low hum
            const modFreq = 0.1; // Slow modulation
            const amplitude = 0.05; // Very quiet
            
            let sample = amplitude * Math.sin(2 * Math.PI * baseFreq * t);
            sample += amplitude * 0.3 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t);
            sample += amplitude * 0.2 * Math.sin(2 * Math.PI * modFreq * t);
            
            // Add some randomness for CRT effect
            sample += (Math.random() - 0.5) * 0.01;
            
            data[i] = sample;
        }

        return buffer;
    }

    // Victory music
    createVictoryMusic() {
        const duration = 5.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        const melody = [
            { freq: 523.25, time: 0.0, duration: 0.5 },   // C
            { freq: 659.25, time: 0.5, duration: 0.5 },   // E
            { freq: 783.99, time: 1.0, duration: 0.5 },   // G
            { freq: 1046.50, time: 1.5, duration: 0.5 },  // C (high)
            { freq: 783.99, time: 2.0, duration: 0.5 },   // G
            { freq: 659.25, time: 2.5, duration: 0.5 },   // E
            { freq: 523.25, time: 3.0, duration: 1.0 },   // C (long)
        ];
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                for (const note of melody) {
                    if (t >= note.time && t < note.time + note.duration) {
                        const noteT = t - note.time;
                        const amplitude = Math.exp(-noteT * 2) * 0.15;
                        sample += amplitude * Math.sin(2 * Math.PI * note.freq * noteT);
                    }
                }
                
                data[i] = sample;
            }
        }

        return buffer;
    }

    // Tension music for close games
    createTensionMusic() {
        const duration = 8.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const baseFreq = 80;
            const tensionFreq = 200 + Math.sin(t * 0.5) * 50;
            const amplitude = 0.08;
            
            let sample = amplitude * Math.sin(2 * Math.PI * baseFreq * t);
            sample += amplitude * 0.5 * Math.sin(2 * Math.PI * tensionFreq * t);
            sample += amplitude * 0.3 * Math.sin(2 * Math.PI * tensionFreq * 1.5 * t);
            
            data[i] = sample;
        }

        return buffer;
    }

    // Play a sound effect
    playSound(soundName, volume = 1.0) {
        if (this.isMuted || !this.audioContext || !this.sounds[soundName]) return;

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = volume * this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Could not play sound:', soundName, error);
        }
    }

    // Play background music
    playMusic(musicName, loop = true) {
        if (this.isMuted || !this.audioContext || !this.music[musicName]) return;

        try {
            // Stop any currently playing music
            this.stopMusic();
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.music[musicName];
            source.loop = loop;
            gainNode.gain.value = this.musicVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
            
            // Store reference to stop later
            this.currentMusic = { source, gainNode };
        } catch (error) {
            console.warn('Could not play music:', musicName, error);
        }
    }

    // Stop background music
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.source.stop();
                this.currentMusic = null;
            } catch (error) {
                console.warn('Could not stop music:', error);
            }
        }
    }

    // Set master volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.gainNode.gain.value = this.musicVolume;
        }
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }

    // Resume audio context (needed for mobile browsers)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Cleanup
    destroy() {
        this.stopMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager };
}
