export const initV2EasterEgg = () => {
    if (!document.getElementById('easter-egg-overlay')) {
        const easterEggHtml = `
        <div id="easter-egg-overlay" class="hidden fixed inset-0 z-[9999] transition-opacity duration-[2000ms] opacity-0 v2-light-theme">
            <div class="absolute inset-0 living-bg backdrop-blur-2xl"></div>

            <div class="absolute inset-0 overflow-y-auto overflow-x-hidden z-10" style="-webkit-overflow-scrolling: touch;">
                <div class="flex min-h-full items-start justify-center p-4 py-16 md:py-24">
                    <div id="easter-egg-content" class="breathing-card relative max-w-2xl w-full bg-white/75 p-6 md:p-10 rounded-[2.5rem] border-2 shadow-[0_20px_60px_rgba(59,130,246,0.15)] backdrop-blur-xl transition-all duration-[2000ms]">

                        <h1 class="smooth-reveal text-xl md:text-3xl font-extrabold mb-8 tracking-wide text-center drop-shadow-sm" style="animation-delay: 1s;">
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
                                SYSTEM ARCHITECTURE<br>VERSION 2.0.0
                            </span>
                        </h1>

                        <div class="space-y-6">
                            <div class="smooth-reveal bg-blue-50/60 p-5 md:p-6 rounded-2xl border border-blue-100 shadow-sm" dir="ltr" style="animation-delay: 2s;">
                                <h2 class="text-base md:text-lg font-extrabold text-blue-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">🛠️</span> Core Logic & Backend
                               </h2>
                                <ul class="list-none ml-2 text-slate-700 space-y-3 text-sm md:text-base leading-relaxed font-medium">
                                    <li class="relative pl-6">
                                        <span class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-400"></span>
                                        <strong class="text-blue-700">Database Optimization:</strong> Transitioned to Entity Framework Core with seamless PostgreSQL integration for improved querying speed.
                                    </li>
                                </ul>
                            </div>

                            <div class="smooth-reveal bg-indigo-50/60 p-5 md:p-6 rounded-2xl border border-indigo-100 shadow-sm" dir="ltr" style="animation-delay: 4s;">
                                <h2 class="text-base md:text-lg font-extrabold text-indigo-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">💻</span> Frontend Architecture
                                </h2>
                                <ul class="list-none ml-2 text-slate-700 space-y-4 text-sm md:text-base leading-relaxed font-medium">
                                    <li class="smooth-reveal relative pl-6 border-l-2 border-indigo-200" style="animation-delay: 5.5s;">
                                        <span class="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                        <strong class="text-indigo-700">Component State:</strong> Dynamic rendering logic mapped cleanly without heavy frameworks, relying on vanilla ES6.
                                    </li>
                                </ul>
                            </div>

                            <div class="smooth-reveal bg-emerald-50/60 p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden" dir="ltr" style="animation-delay: 7s;">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                                <h2 class="text-base md:text-lg font-extrabold text-emerald-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">🔒</span> Vault Status
                                </h2>

                                <p class="text-slate-600 text-sm mb-4 font-bold border-l-4 border-emerald-300 pl-3 bg-white/50 py-2 rounded-r-lg">
                                    "Project completely sanitized and ready for deployment as a professional portfolio showcase."
                                </p>

                                <button id="close-gallery-btn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.3)] tracking-wide flex justify-center items-center gap-2">
                                    <span>Close Dashboard Module</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', easterEggHtml);
    }

    const openEasterEgg = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        const textContent = document.getElementById('easter-egg-content');

        if (overlay) {
            if (textContent) textContent.classList.remove('hidden', 'opacity-0', 'scale-95');
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
            }, 50);
        }
    };

    const closeFunctions = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        if (overlay) overlay.classList.add('opacity-0');
        setTimeout(() => { if (overlay) overlay.classList.add('hidden'); }, 1000);
    };

    let easterEggClickCount = 0;
    let easterEggTimeout;

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#version-trigger');
        if (trigger) {
            easterEggClickCount++;
            clearTimeout(easterEggTimeout);

            if (easterEggClickCount >= 3) {
                easterEggClickCount = 0;
                openEasterEgg();
            } else {
                easterEggTimeout = setTimeout(() => {
                    easterEggClickCount = 0;
                }, 800);
            }
            return;
        }

        if (e.target.id === 'close-easter-egg' || e.target.id === 'close-gallery-btn') {
            closeFunctions();
            return;
        }
    });
};