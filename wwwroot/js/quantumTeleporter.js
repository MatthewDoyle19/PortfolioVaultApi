// ==========================================
// 🌀 THE QUANTUM TELEPORTER (Fully Independent Component)
// ==========================================

export const initQuantumTeleporter = () => {
    // 1. حقن واجهة المستخدم (UI Card) داخل الحاوية المخصصة
    const uiContainer = document.getElementById('quantum-portal-container');

    if (uiContainer && !document.getElementById('teleport-btn')) {
        uiContainer.innerHTML = `
        <div class="bg-black/40 border border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-lg w-full max-w-sm mx-auto mt-6 flex flex-col gap-4">
            <div class="flex items-center justify-center mb-2">
                <h3 class="text-white/80 font-bold tracking-[0.2em] text-xs uppercase flex items-center gap-2 drop-shadow-md">
                    <span class="text-pink-400 animate-pulse">🌀</span> Quantum Portal
                </h3>
            </div>
            <div class="flex gap-3">
                <div class="relative w-1/2">
                    <select id="teleport-who" class="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-pink-500/50 transition-colors appearance-none text-center cursor-pointer">
                        <option value="Mohammad" class="bg-gray-900 text-white">7amodee 👨🏻‍💻</option>
                        <option value="Zainab" class="bg-gray-900 text-white">ZoZo 👸🏻</option>
                    </select>
                </div>
                <div class="relative w-1/2">
                    <select id="teleport-where" class="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors appearance-none text-center cursor-pointer">
                        <option value="KafrKanna" class="bg-gray-900 text-white">Palestine 🇵🇸</option>
                        <option value="Jordan" class="bg-gray-900 text-white">Jordan 🇯🇴</option>
                    </select>
                </div>
            </div>
            <button id="teleport-btn" class="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/30 hover:to-purple-500/30 border border-white/10 p-3 transition-all duration-300 flex items-center justify-center gap-2">
                <span class="text-sm font-bold text-white tracking-widest z-10">Initiate Flight</span>
                <span class="text-lg z-10 group-hover:translate-x-1 transition-transform">✈️</span>
            </button>
        </div>
        `;
    }

    // 2. حقن الشاشة السوداء (Overlay) في نهاية الـ body
    if (!document.getElementById('teleport-overlay')) {
        const teleporterHtml = `
        <div id="teleport-overlay" class="fixed inset-0 z-[9999] hidden flex-col items-center justify-center bg-black/95 backdrop-blur-3xl transition-opacity duration-1000 opacity-0 pointer-events-none overflow-hidden" style="height: 100dvh;">
            <div class="absolute inset-0 opacity-20 filter invert brightness-50 portal-map"></div>
            
            <div id="flight-path" class="absolute left-1/2 transform -translate-x-1/2 w-full max-w-lg opacity-0 transition-all duration-1000 flex flex-col items-center z-10 flight-path-container px-4">
                <div class="flex justify-between w-full mb-3 px-4 z-10 relative mt-4">
                    <div class="flex flex-col items-center" id="node-start">
                        <span id="route-start-flag" class="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] mb-1.5">🇯🇴</span>
                        <span id="route-start-text" class="text-[9px] font-black text-white tracking-widest uppercase bg-black/80 px-2 py-1 rounded-md border border-white/10 shadow-lg backdrop-blur-md">Jordan</span>
                    </div>
                    <div class="flex flex-col items-center" id="node-end">
                        <span id="route-end-flag" class="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] mb-1.5">🇵🇸</span>
                        <span id="route-end-text" class="text-[9px] font-black text-white tracking-widest uppercase bg-black/80 px-2 py-1 rounded-md border border-white/10 shadow-lg backdrop-blur-md">Palestine</span>
                    </div>
                </div>
                <svg class="w-full h-24 overflow-visible z-10 relative -mt-4" viewBox="0 0 200 80">
                    <path d="M 30 50 Q 100 -10 170 50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4" stroke-linecap="round" />
                    <path id="flight-line" d="M 30 50 Q 100 -10 170 50" fill="none" stroke="url(#line-gradient)" stroke-width="3" stroke-dasharray="220" stroke-dashoffset="220" stroke-linecap="round" class="opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                    <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop id="grad-start" offset="0%" stop-color="#34d399" />
                            <stop id="grad-end" offset="100%" stop-color="#f472b6" />
                        </linearGradient>
                    </defs>
                    <g id="flight-spark" class="opacity-0 drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                        <circle cx="0" cy="0" r="3" fill="#ffffff" />
                        <text x="-7" y="-8" font-size="12">✈️</text>
                    </g>
                </svg>
            </div>

            <div id="passport-stamp" class="hidden absolute flex-col items-center p-8 rounded-[2rem] bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transform translate-y-8 opacity-0 transition-all duration-1000 ease-out z-20 mx-4">
                <h3 class="text-[10px] text-slate-400 tracking-[0.4em] uppercase mb-4 flex items-center gap-2">
                    <span class="text-emerald-400 animate-pulse">●</span> Secured Arrival
                </h3>
                <h2 id="stamp-location" class="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-xl">KAFR KANNA</h2>
                <div class="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
                <p id="stamp-note" class="text-xs font-medium text-slate-300 tracking-wider text-center leading-loose"></p>
            </div>

            <audio id="warp-audio" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784790052/avm5wuqlsotpg7uovass.m4a" preload="auto"></audio>
            <audio id="stamp-audio" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784367056/sh42px6jewdrrtctacwf.mp3" preload="auto"></audio>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', teleporterHtml);
    }

    // 3. ربط العناصر بالأحداث
    const teleportBtn = document.getElementById('teleport-btn');
    const teleportWho = document.getElementById('teleport-who');
    const teleportWhere = document.getElementById('teleport-where');
    const teleportOverlay = document.getElementById('teleport-overlay');
    const flightPath = document.getElementById('flight-path');
    const flightLine = document.getElementById('flight-line');
    const flightSpark = document.getElementById('flight-spark');
    const passportStamp = document.getElementById('passport-stamp');
    const stampLocation = document.getElementById('stamp-location');
    const stampNote = document.getElementById('stamp-note');
    const routeStartFlag = document.getElementById('route-start-flag');
    const routeStartText = document.getElementById('route-start-text');
    const routeEndFlag = document.getElementById('route-end-flag');
    const routeEndText = document.getElementById('route-end-text');
    const gradStart = document.getElementById('grad-start');
    const gradEnd = document.getElementById('grad-end');
    const warpAudio = document.getElementById('warp-audio');
    const stampAudio = document.getElementById('stamp-audio');

    if (!teleportBtn) return;

    teleportBtn.addEventListener('click', async () => {
        const who = teleportWho ? teleportWho.value : 'Mohammad';
        const where = teleportWhere ? teleportWhere.value : 'KafrKanna';

        teleportBtn.disabled = true;
        const originalBtnText = teleportBtn.innerHTML;
        teleportBtn.innerHTML = '<span class="text-sm font-bold text-white tracking-widest">Routing Flight... ✈️</span>';

        if (where === 'KafrKanna') {
            if(routeStartFlag) routeStartFlag.innerText = '🇯🇴';
            if(routeStartText) routeStartText.innerText = 'Jordan';
            if(routeEndFlag) routeEndFlag.innerText = '🇵🇸';
            if(routeEndText) routeEndText.innerText = 'Palestine';
            if(gradStart) gradStart.setAttribute('stop-color', '#34d399');
            if(gradEnd) gradEnd.setAttribute('stop-color', '#f472b6');
        } else {
            if(routeStartFlag) routeStartFlag.innerText = '🇵🇸';
            if(routeStartText) routeStartText.innerText = 'Palestine';
            if(routeEndFlag) routeEndFlag.innerText = '🇯🇴';
            if(routeEndText) routeEndText.innerText = 'Jordan';
            if(gradStart) gradStart.setAttribute('stop-color', '#f472b6');
            if(gradEnd) gradEnd.setAttribute('stop-color', '#34d399');
        }

        if (stampAudio) {
            stampAudio.volume = 0;
            stampAudio.play().then(() => {
                stampAudio.pause(); stampAudio.currentTime = 0; stampAudio.volume = 1;
            }).catch(e => {});
        }

        teleportOverlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            teleportOverlay.classList.remove('opacity-0');
            teleportOverlay.classList.add('pointer-events-auto');
        });

        if (warpAudio) {
            warpAudio.currentTime = 0; warpAudio.volume = 0.5; warpAudio.play().catch(e => {});
        }

        try {
            await fetch(`/api/teleport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: who, destination: where })
            });
        } catch (e) {
            console.error("Teleport Error:", e);
        }

        setTimeout(() => {
            if(flightPath) flightPath.classList.remove('opacity-0');
            if(flightLine) flightLine.classList.add('animate-draw-line');
            if(flightSpark) flightSpark.classList.add('animate-spark-fly');
        }, 800);

        await new Promise(resolve => setTimeout(resolve, 3000));

        if(flightPath) flightPath.classList.add('opacity-0');
        setTimeout(() => {
            if(flightLine) flightLine.classList.remove('animate-draw-line');
            if(flightSpark) flightSpark.classList.remove('animate-spark-fly');
        }, 700);

        if(stampLocation) {
            stampLocation.innerText = where === 'Jordan' ? 'JORDAN 🇯🇴' : 'KAFR KANNA 🇵🇸';
            let themeColor = where === 'Jordan' ? 'text-emerald-400' : 'text-pink-400';
            stampLocation.className = `text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md ${themeColor}`;
        }

        if (stampNote) {
            if (who === 'Mohammad' && where === 'KafrKanna') {
                stampNote.innerHTML = 'Traveler: <span class="text-white font-bold">7amodee 👨🏻‍💻</span><br><span class="text-[10px] text-slate-500 uppercase mt-1 block">To: ZoZo 👸🏻</span>';
            } else if (who === 'Zainab' && where === 'Jordan') {
                stampNote.innerHTML = 'Traveler: <span class="text-white font-bold">ZoZo 👸🏻</span><br><span class="text-[10px] text-slate-500 uppercase mt-1 block">To: 7amodee 👨🏻‍💻</span>';
            } else if (who === 'Mohammad' && where === 'Jordan') {
                stampNote.innerHTML = 'Returning Base: <span class="text-white font-bold">7amodee 👨🏻‍💻</span>';
            } else if (who === 'Zainab' && where === 'KafrKanna') {
                stampNote.innerHTML = 'Returning Base: <span class="text-white font-bold">ZoZo 👸🏻</span>';
            }
        }

        setTimeout(() => {
            if (passportStamp) {
                passportStamp.classList.remove('hidden');
                requestAnimationFrame(() => {
                    passportStamp.classList.remove('opacity-0', 'translate-y-8');
                    passportStamp.classList.add('opacity-100', 'translate-y-0');
                });
            }
            if (stampAudio) {
                stampAudio.currentTime = 0; stampAudio.volume = 0.6; stampAudio.play().catch(e => {});
            }
        }, 500);

        await new Promise(resolve => setTimeout(resolve, 3500));

        if (passportStamp) {
            passportStamp.classList.remove('opacity-100', 'translate-y-0');
            passportStamp.classList.add('opacity-0', 'translate-y-8');
        }

        teleportOverlay.classList.add('opacity-0');
        teleportOverlay.classList.remove('pointer-events-auto');

        setTimeout(() => {
            teleportOverlay.classList.add('hidden');
            if (passportStamp) passportStamp.classList.add('hidden');
            teleportBtn.disabled = false;
            teleportBtn.innerHTML = originalBtnText;
        }, 1000);
    });
};