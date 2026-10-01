export const initLoveSurprise = () => {
    let systemClickCount = 0;
    let clickTimer;

    document.addEventListener('click', (e) => {
        const badge = e.target.closest('#system-badge');

        if (badge) {
            systemClickCount++;
            clearTimeout(clickTimer);

            clickTimer = setTimeout(() => {
                systemClickCount = 0;
            }, 2000);

            if (systemClickCount === 3) {
                systemClickCount = 0;
                trigger100DaysSurprise();
            }
        }
    });

    const trigger100DaysSurprise = () => {
        const styleBlock = document.createElement('style');
        styleBlock.innerHTML = `
        @keyframes breatheAura {
            0% { background-position: 0% 50%; transform: scale(1); }
            50% { background-position: 100% 50%; transform: scale(1.03); }
            100% { background-position: 0% 50%; transform: scale(1); }
        }
        @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            20% { opacity: 0.7; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes levitate {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
        }
    `;
        document.head.appendChild(styleBlock);

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[999999] flex flex-col items-center justify-center p-4 md:p-6 opacity-0 transition-opacity duration-[2500ms] ease-in-out overflow-hidden bg-black';
        overlay.style.height = '100dvh';

        overlay.innerHTML = `
        <div class="absolute inset-0 bg-[linear-gradient(45deg,#020104,#150711,#0a0815,#020104)] bg-[length:300%_300%] opacity-90 origin-center" style="animation: breatheAura 20s ease-in-out infinite;"></div>
        <div class="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full mix-blend-screen animate-pulse" style="animation-duration: 7s;"></div>
        <div class="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full mix-blend-screen animate-pulse" style="animation-duration: 9s;"></div>
        <div id="fireflies-container" class="absolute inset-0 pointer-events-none"></div>
        
        <div class="w-full h-full max-w-2xl text-center relative z-10 flex flex-col items-center justify-center" style="animation: levitate 6s ease-in-out infinite;">
            <div class="text-4xl md:text-6xl mb-4 md:mb-8 select-none opacity-0 transition-all duration-[2000ms] transform translate-y-6 filter drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse" id="egg-icon" style="animation-duration: 4s;">
                🚀
            </div>
            
            <div dir="ltr" id="typewriter-text" class="w-full mx-auto text-[15.5px] md:text-[22px] text-slate-100 font-mono text-center leading-[2.1] md:leading-[2.5] tracking-wide min-h-[220px] md:min-h-[250px] px-4 md:px-6 select-none drop-shadow-2xl" style="max-width: 650px;"></div>
            
            <button id="close-egg-btn" class="mt-8 md:mt-14 opacity-0 scale-90 transition-all duration-1000 bg-white/5 border border-white/10 text-slate-300 hover:text-white px-8 md:px-10 py-3 md:py-3.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 backdrop-blur-2xl">
                Return to Dashboard
            </button>
        </div>
    `;

        document.body.appendChild(overlay);

        const firefliesContainer = document.getElementById('fireflies-container');
        for (let i = 0; i < 45; i++) {
            const firefly = document.createElement('div');
            const size = Math.random() * 2.5 + 1;
            firefly.className = 'absolute rounded-full bg-blue-100/90';
            firefly.style.width = `${size}px`;
            firefly.style.height = `${size}px`;
            firefly.style.left = `${Math.random() * 100}%`;
            firefly.style.bottom = '-20px';
            firefly.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.8)';
            firefly.style.animation = `floatUp ${Math.random() * 10 + 8}s ease-in ${Math.random() * 5}s infinite`;
            firefliesContainer.appendChild(firefly);
        }

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            setTimeout(() => {
                document.getElementById('egg-icon').classList.remove('opacity-0', 'translate-y-6');
                setTimeout(startTypewriter, 1000);
            }, 1800);
        }, 100);

        const fullText = "System Architecture Milestone Achieved.\n\nThis digital workspace represents hours of structured development, seamless API integrations, and robust database management.\n\nBuilt to showcase scalable code, modern web patterns, and resilient backend services.\n\nKeep building, keep scaling. 💻";

        let index = 0;
        const startTypewriter = () => {
            const textContainer = document.getElementById('typewriter-text');
            textContainer.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.6)';
            textContainer.style.transition = 'text-shadow 2s ease-out';
            let currentHTML = "";

            function type() {
                if (index < fullText.length) {
                    const char = fullText.charAt(index);
                    if (char === '\n') {
                        currentHTML += '<br>';
                    } else {
                        currentHTML += char;
                    }
                    textContainer.innerHTML = currentHTML;
                    index++;
                    setTimeout(type, 40);
                } else {
                    textContainer.style.textShadow = '0 0 0px rgba(255, 255, 255, 0)';
                    const closeBtn = document.getElementById('close-egg-btn');
                    setTimeout(() => {
                        closeBtn.classList.remove('opacity-0', 'scale-90');
                    }, 1000);

                    closeBtn.onclick = () => {
                        overlay.classList.add('opacity-0');
                        setTimeout(() => {
                            overlay.remove();
                            const styleBlock = document.querySelector('style:last-of-type');
                            if (styleBlock) styleBlock.remove();
                        }, 2500);
                    };
                }
            }
            type();
        };
    };
};