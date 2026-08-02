// ==========================================
// 🎭 SECRET CINEMATIC EXPERIENCE MODULE (Fully Independent)
// ==========================================

export const initSecretCinematic = () => {
    // 1. الحقن التلقائي للـ HTML إذا لم يكن موجوداً في الصفحة
    if (!document.getElementById('secret-experience')) {
        const cinematicHtml = `
        <div id="secret-experience" class="fixed inset-0 h-[100dvh] w-full z-[9999] bg-[#050505] opacity-0 pointer-events-none transition-opacity duration-1000 flex flex-col items-center justify-center overflow-hidden">
            <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div class="absolute inset-0 bg-[#050505] z-0"></div>
                <!-- Aurora Photos -->
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784369079/hfxi9exn6cqxosojmdhu.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362196/cwkbx7eog12fk957a4zd.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362195/b8dkh6oqjh1vrivgx0fg.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784472201/w3iukq2fkk9qsetyt9jy.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/ttvk9k0x4khkydti5ffu.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362210/rqujntmbzs4sdo0l5zym.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441286/xghhqawzyt9jxrwqmxcm.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784385338/x8cq1tqf05e2qldzwmno.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/srqccdt3ghakm4bv6xit.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784374010/izs4pgcwihku1qcmyqe3.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/rehr8cmk8tilxercxlor.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441219/upp8cipoc3mrtmyuzs04.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362196/s0ahp0eo6ndcjj6aanlm.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362194/ljvmpi031g9jarfbwb0q.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784394684/n6tgrg2v40ogr2a81efq.png" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784394685/ozfg25gm2whs0gwy9xgo.png" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441220/qjpvnxzwos9t9cmnbdfr.jpg" class="aura-photo absolute inset-0 w-full h-full object-cover blur-[120px] scale-150 opacity-0 transition-opacity duration-[3000ms] ease-out z-10">
            </div>

            <canvas id="stardust-canvas" class="absolute inset-0 z-0"></canvas>

            <div class="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none mix-blend-screen">
                <div class="w-[80vw] max-w-lg h-[60vh] bg-white/5 rounded-full blur-[100px] animate-pulse" style="animation-duration: 8s;"></div>
            </div>

            <div id="secret-photos-container" class="relative w-full max-w-md h-[60vh] mb-28 z-10 flex items-center justify-center pointer-events-none mx-auto px-4">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784369079/hfxi9exn6cqxosojmdhu.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362196/cwkbx7eog12fk957a4zd.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362195/b8dkh6oqjh1vrivgx0fg.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784472201/w3iukq2fkk9qsetyt9jy.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/ttvk9k0x4khkydti5ffu.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362210/rqujntmbzs4sdo0l5zym.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441286/xghhqawzyt9jxrwqmxcm.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784385338/x8cq1tqf05e2qldzwmno.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/srqccdt3ghakm4bv6xit.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784374010/izs4pgcwihku1qcmyqe3.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362197/rehr8cmk8tilxercxlor.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441219/upp8cipoc3mrtmyuzs04.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362196/s0ahp0eo6ndcjj6aanlm.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784362194/ljvmpi031g9jarfbwb0q.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784394684/n6tgrg2v40ogr2a81efq.png" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784394685/ozfg25gm2whs0gwy9xgo.png" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
                <img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1784441220/qjpvnxzwos9t9cmnbdfr.jpg" class="secret-photo absolute max-w-full max-h-full w-auto h-auto m-auto inset-0 rounded-[2.5rem] border border-white/15 shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)] opacity-0 blur-xl scale-95 brightness-50 transition-all duration-[3000ms] ease-out">
            </div>

            <div class="absolute bottom-0 w-full h-56 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-15 pointer-events-none"></div>

            <div class="absolute bottom-20 w-full text-center z-20 px-6">
                <p id="cinematic-subtitle" class="text-xl md:text-2xl text-white font-light tracking-[0.1em] leading-relaxed opacity-0 blur-md transform translate-y-2 transition-all duration-[1500ms] ease-out drop-shadow-lg" dir="rtl"></p>
            </div>

            <button id="close-secret" class="absolute bottom-6 z-[99999] px-8 py-2 bg-white/5 text-slate-400 border border-white/10 rounded-full font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all opacity-0 pointer-events-none transform translate-y-4 duration-1000">
                دائماً وأبداً 🤍
            </button>

            <audio id="secret-voice" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784790052/avm5wuqlsotpg7uovass.m4a" preload="auto"></audio>
            <audio id="secret-bgm" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784367056/sh42px6jewdrrtctacwf.mp3" loop preload="auto"></audio>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', cinematicHtml);
    }

    // 2. البرمجة والمنطق التشغيلي
    const secretTrigger = document.getElementById('secret-trigger');
    const secretExperience = document.getElementById('secret-experience');
    const closeSecretBtn = document.getElementById('close-secret');
    const secretVoice = document.getElementById('secret-voice');
    const secretBgm = document.getElementById('secret-bgm');
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
        { text: "زوزو...", time: 750 },
        { text: "أنا ما صممت هذا المكان بس عشان أحفظ ذكرياتنا...", time: 1500 },
        { text: "أنا صممته عشان يكون مراية، تشوفي فيها نفسك بعيوني.", time: 5500 },
        { text: "في كل مرة بشوف فيها ملامحك...", time: 10500 },
        { text: "بتأكد إنك أجمل وأصدق شي صار بحياتي.", time: 13700 },
        { text: "أنا بحب نسختك الأصلية... بكل تفاصيلها الطبيعية...", time: 18200 },
        { text: "وما بدي إشي يتغير.", time: 22500 },
        { text: "إنتِ المعيار اللي بقيس فيه كل شي حلو.", time: 25200 },
        { text: "خليكي دائماً واثقة إنك بعيوني...", time: 28500 },
        { text: "أجمل بنت شافتها عيني، وأغلى شي بملكه.", time: 30900 },
        { text: "و... بحبك ❤️", time: 34100 }
    ];

    function startSecretExperience() {
        secretExperience.classList.remove('pointer-events-none');
        secretExperience.classList.replace('opacity-0', 'opacity-100');
        startStardust();

        if(secretBgm) {
            secretBgm.volume = 0.04;
            secretBgm.play().catch(e => console.log("BGM play blocked", e));
        }
        setTimeout(() => {
            if(secretVoice) {
                secretVoice.volume = 1.0;
                secretVoice.play().catch(e => console.log("Voice play blocked", e));
            }
        }, 1000);

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
                    if (index === subtitlesSequence.length - 1) {
                        subtitleEl.innerHTML = 'و... بحبك <span class="animate-heartbeat text-red-500 drop-shadow-md">❤️</span>';
                    } else {
                        subtitleEl.innerText = item.text;
                    }
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
        }, 39000);
    }

    if (closeSecretBtn) {
        closeSecretBtn.addEventListener('click', () => {
            secretExperience.classList.remove('opacity-100');
            secretExperience.classList.add('opacity-0');
            setTimeout(() => {
                secretExperience.classList.add('pointer-events-none');
            }, 1000);

            if(secretVoice) { secretVoice.pause(); secretVoice.currentTime = 0; }
            if(secretBgm) { secretBgm.pause(); secretBgm.currentTime = 0; }

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
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
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