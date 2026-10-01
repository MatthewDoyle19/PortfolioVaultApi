export const initSecretCinematic = () => {
    if (!document.getElementById('secret-experience')) {
        const cinematicHtml = `
        <div id="secret-experience" class="fixed inset-0 h-[100dvh] w-full z-[9999] bg-[#050505] opacity-0 pointer-events-none transition-opacity duration-1000 flex flex-col items-center justify-center overflow-hidden">
            <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div class="absolute inset-0 bg-[#050505] z-0"></div>
                <!-- Placeholder Backgrounds -->
                <img src="https://via.placeholder.com/1200x800/1a1a2e/ffffff?text=Portfolio+Showcase" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://via.placeholder.com/1200x800/16213e/ffffff?text=System+Architecture" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
            </div>

            <canvas id="stardust-canvas" class="absolute inset-0 z-0"></canvas>

            <div class="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none mix-blend-screen">
                <div class="w-[80vw] max-w-lg h-[60vh] bg-white/5 rounded-full blur-[100px] animate-pulse" style="animation-duration: 8s;"></div>
            </div>

            <div id="secret-photos-container" class="relative w-full max-w-md h-[60vh] mb-28 z-10 flex items-center justify-center pointer-events-none mx-auto px-4">
                <img src="https://via.placeholder.com/600x800/1a1a2e/ffffff?text=Project+View+1" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://via.placeholder.com/600x800/16213e/ffffff?text=Project+View+2" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
            </div>

            <div class="absolute bottom-0 w-full h-56 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-15 pointer-events-none"></div>

            <div class="absolute bottom-20 w-full text-center z-20 px-6">
                <p id="cinematic-subtitle" class="text-xl md:text-2xl text-white font-mono tracking-[0.1em] leading-relaxed opacity-0 blur-md transform translate-y-2 transition-all duration-[1500ms] ease-out drop-shadow-lg" dir="ltr"></p>
            </div>

            <button id="close-secret" class="absolute bottom-6 z-[99999] px-8 py-2 bg-white/5 text-slate-400 border border-white/10 rounded-full font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all opacity-0 pointer-events-none transform translate-y-4 duration-1000">
                Close Cinematic
            </button>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', cinematicHtml);
    }

    const secretTrigger = document.getElementById('secret-trigger');
    const secretExperience = document.getElementById('secret-experience');
    const closeSecretBtn = document.getElementById('close-secret');
    const photos = document.querySelectorAll('.secret-photo');

    if (!secretTrigger || !secretExperience) return;

    let cinematicClickCount = 0;
    let cinematicClickTimeout;
    let cinematicPhotoInterval;
    let cinematicPhotoIndex = 0;
    let subtitleTimeouts = [];
    let animationFrameId;

    secretTrigger.addEventListener('click', () => {
        cinematicClickCount++;
        clearTimeout(cinematicClickTimeout);
        cinematicClickTimeout = setTimeout(() => { cinematicClickCount = 0; }, 1500);

        if (cinematicClickCount === 3) {
            cinematicClickCount = 0;
            startSecretExperience();
        }
    });

    const subtitlesSequence = [
        { text: "System Initializing...", time: 500 },
        { text: "Loading backend infrastructure...", time: 2500 },
        { text: "Establishing secure API connections...", time: 5500 },
        { text: "Optimizing database queries...", time: 8500 },
        { text: "Rendering user interfaces...", time: 11500 },
        { text: "System Ready. Welcome to the Vault.", time: 14500 }
    ];

    function startSecretExperience() {
        secretExperience.classList.remove('pointer-events-none');
        secretExperience.classList.replace('opacity-0', 'opacity-100');
        startStardust();

        const auraPhotos = document.querySelectorAll('.aura-photo');
        cinematicPhotoIndex = 0;

        if(photos.length > 0) {
            photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
            photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105', 'brightness-110');

            if(auraPhotos[cinematicPhotoIndex]) {
                auraPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                auraPhotos[cinematicPhotoIndex].classList.add('opacity-40');
            }

            cinematicPhotoInterval = setInterval(() => {
                photos[cinematicPhotoIndex].classList.remove('opacity-100', 'blur-0', 'scale-105', 'brightness-110');
                photos[cinematicPhotoIndex].classList.add('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');

                if(auraPhotos[cinematicPhotoIndex]) {
                    auraPhotos[cinematicPhotoIndex].classList.remove('opacity-40');
                    auraPhotos[cinematicPhotoIndex].classList.add('opacity-0');
                }

                let nextIndex = (cinematicPhotoIndex + 1) % photos.length;

                setTimeout(() => {
                    cinematicPhotoIndex = nextIndex;
                    photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
                    photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105', 'brightness-110');

                    if(auraPhotos[cinematicPhotoIndex]) {
                        auraPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                        auraPhotos[cinematicPhotoIndex].classList.add('opacity-40');
                    }
                }, 100);

            }, 5500);
        }

        const subtitleEl = document.getElementById('cinematic-subtitle');
        subtitlesSequence.forEach((item, index) => {
            const timeout = setTimeout(() => {
                if(!subtitleEl) return;
                subtitleEl.classList.replace('opacity-100', 'opacity-0');
                subtitleEl.classList.replace('blur-0', 'blur-md');
                subtitleEl.classList.replace('translate-y-0', 'translate-y-2');

                setTimeout(() => {
                    subtitleEl.innerText = item.text;
                    subtitleEl.classList.replace('opacity-0', 'opacity-100');
                    subtitleEl.classList.replace('blur-md', 'blur-0');
                    subtitleEl.classList.replace('translate-y-2', 'translate-y-0');
                }, 1000);

            }, item.time);
            subtitleTimeouts.push(timeout);
        });

        setTimeout(() => {
            if(closeSecretBtn) {
                closeSecretBtn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                closeSecretBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }, 18000);
    }

    if (closeSecretBtn) {
        closeSecretBtn.addEventListener('click', () => {
            secretExperience.classList.remove('opacity-100');
            secretExperience.classList.add('opacity-0');
            setTimeout(() => {
                secretExperience.classList.add('pointer-events-none');
            }, 1000);

            clearInterval(cinematicPhotoInterval);
            photos.forEach(p => {
                p.classList.remove('opacity-100', 'blur-0', 'scale-105', 'brightness-110');
                p.classList.add('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
            });

            document.querySelectorAll('.aura-photo').forEach(bg => {
                bg.classList.remove('opacity-40');
                bg.classList.add('opacity-0');
            });

            closeSecretBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            closeSecretBtn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');

            stopStardust();
            subtitleTimeouts.forEach(t => clearTimeout(t));

            const subtitleEl = document.getElementById('cinematic-subtitle');
            if (subtitleEl) {
                subtitleEl.innerText = "";
                subtitleEl.classList.remove('opacity-100', 'blur-0', 'translate-y-0');
                subtitleEl.classList.add('opacity-0', 'blur-md', 'translate-y-2');
            }
        });
    }

    function startStardust() {
        const canvas = document.getElementById('stardust-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        const numberOfParticles = 150;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.6 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = `rgba(100, 200, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopStardust() {
        cancelAnimationFrame(animationFrameId);
    }
};