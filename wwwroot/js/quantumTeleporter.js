// ==========================================
// 🌀 QUANTUM TELEPORTER MODULE (Independent)
// ==========================================

export const initQuantumTeleporter = () => {
    // 1. الحقن التلقائي للـ HTML الخاص بنافذة السفر إذا لم يكن موجوداً
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

            <div id="passport-stamp" class="hidden absolute flex-col items-center p-8 rounded-[2rem] bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transform translate-y-8 opacity-0 transition-all duration-1000 ease-out z-20 boarding-pass mx-4">
                <h3 class="text-[10px] text-slate-400 tracking-[0.4em] uppercase mb-4 flex items-center gap-2">
                    <span class="text-emerald-400 animate-pulse">●</span> Secured Arrival
                </h3>
                <h2 id="stamp-location" class="text-4xl font-black tracking-tight text-white mb-2 drop-shadow-xl">KAFR KANNA</h2>
                <div class="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
                <p id="stamp-note" class="text-xs font-medium text-slate-300 tracking-wider text-center leading-loose">Traveler: 7amodee<br><span class="text-[10px] text-slate-500 uppercase mt-1 block">To: ZoZo</span></p>
            </div>

            <!-- أصوات الترحيل -->
            <audio id="warp-audio" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784790052/avm5wuqlsotpg7uovass.m4a" preload="auto"></audio>
            <audio id="stamp-audio" src="https://res.cloudinary.com/dhr6waydw/video/upload/v1784367056/sh42px6jewdrrtctacwf.mp3" preload="auto"></audio>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', teleporterHtml);
    }

    // 2. تفعيل منطق الطيران والربط بالعناصر
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

    if (teleportBtn) {
        teleportBtn.addEventListener('click', async () => {
            const who = teleportWho ? teleportWho.value : 'Mohammad';
            const where = teleportWhere ? teleportWhere.value : 'KafrKanna';

            teleportBtn.disabled = true;
            teleportBtn.innerHTML = '<span class="text-sm font-bold text-white tracking-widest">Routing Flight... ✈️</span>';

            // إعداد مسار الرحلة الديناميكي
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
                stampAudio.play().then(() => { stampAudio.pause(); stampAudio.currentTime = 0; stampAudio.volume = 1; }).catch(e => {});
            }

            teleportOverlay.classList.remove('hidden');
            setTimeout(() => teleportOverlay.classList.remove('opacity-0'), 50);

            try {
                await fetch(`/api/teleport`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user: who, destination: where })
                });
            } catch (e) { console.error(e); }

            if (warpAudio) { warpAudio.currentTime = 0; warpAudio.volume = 0.5; warpAudio.play().catch(e => {}); }

            setTimeout(() => {
                if(flightPath) flightPath.classList.add('animate-map-reveal');
                if(flightLine) flightLine.classList.add('animate-draw-line');
                if(flightSpark) flightSpark.classList.add('animate-spark-fly');
            }, 800);

            await new Promise(resolve => setTimeout(resolve, 3000));

            if(flightPath) flightPath.classList.remove('animate-map-reveal');
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
                if(passportStamp) passportStamp.classList.add('stamp-elegant');
                if (stampAudio) { stampAudio.currentTime = 0; stampAudio.volume = 0.6; stampAudio.play().catch(e => {}); }
            }, 500);

            await new Promise(resolve => setTimeout(resolve, 3500));

            teleportOverlay.classList.add('opacity-0');
            setTimeout(() => {
                teleportOverlay.classList.add('hidden');
                if(passportStamp) passportStamp.classList.remove('stamp-elegant');
                teleportBtn.disabled = false;
                teleportBtn.innerHTML = '<span class="text-sm font-bold text-white tracking-wide">Initiate Flight</span><span class="text-lg">✈️</span>';
            }, 1000);
        });
    }
};