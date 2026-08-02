// ==========================================
// UI MANAGER - DOM MANIPULATION & RENDERING
// ==========================================

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

export const showToast = (title, message, icon = '🔔') => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'premium-glass p-4 rounded-2xl flex items-center gap-4 shadow-2xl transform transition-all duration-500 translate-y-[-20px] opacity-0 border-l-4 border-accent';
    toast.innerHTML = `
        <div class="text-3xl">${icon}</div>
        <div class="flex flex-col">
            <span class="text-sm font-bold text-white">${title}</span>
            <span class="text-xs text-slate-300 mt-1">${message}</span>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
};

// ==========================================
// UPTIME COUNTER
// ==========================================

export const initUptimeCounter = () => {
    const uptimeDisplay = document.getElementById('uptime-counter');
    if (!uptimeDisplay) return;
    
    const startDate = new Date('2026-03-25T00:00:00');

    const updateUptime = () => {
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        uptimeDisplay.textContent = `${days} Days, ${hours} Hrs, ${minutes} Min`;
    };
    
    updateUptime();
    setInterval(updateUptime, 60000);
};

// ==========================================
// TAWJIHI EASTER EGG
// ==========================================

export const triggerTawjihiEasterEgg = () => {
    const overlay = document.getElementById('tawjihi-overlay');
    const card = document.getElementById('tawjihi-card');
    const confettiContainer = document.getElementById('confetti-container');

    if (!overlay || !card || !confettiContainer) return;

    // Generate particles
    confettiContainer.innerHTML = '';
    const particles = ['🎓', '✨', '🎉', '🤍'];
    for(let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.innerText = particles[Math.floor(Math.random() * particles.length)];
        p.className = 'absolute particle-fall';
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `-10%`;
        p.style.animationDuration = `${Math.random() * 4 + 3}s`;
        p.style.animationDelay = `${Math.random() * 3}s`;
        confettiContainer.appendChild(p);
    }
    
    // Audio
    const audio = document.getElementById('tawjihi-audio');
    if (audio) {
        audio.volume = 0.6;
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play blocked by browser:", e));
    }

    // Show overlay
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }, 50);

    // Close button
    const closeBtn = document.getElementById('close-tawjihi-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeBtn.innerHTML = 'Opening The Vault... ⏳';
            closeBtn.disabled = true;

            overlay.classList.add('opacity-0');
            card.classList.remove('scale-100');
            card.classList.add('scale-95');

            if (audio) {
                let fadeAudio = setInterval(() => {
                    if (audio.volume > 0.1) {
                        audio.volume -= 0.1;
                    } else {
                        audio.pause();
                        clearInterval(fadeAudio);
                    }
                }, 80);
            }

            setTimeout(() => {
                overlay.classList.add('hidden');
                closeBtn.innerHTML = 'Start The Journey ✨';
                closeBtn.disabled = false;
            }, 700);
        };
    }
};

// ==========================================
// COUNTDOWN TIMER
// ==========================================

export const startCountdown = (unlockDateString, displayElementId) => {
    const unlockDate = new Date(unlockDateString).getTime();
    const displayElement = document.getElementById(displayElementId);

    if (!displayElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = unlockDate - now;

        if (distance < 0) {
            clearInterval(interval);
            displayElement.innerHTML = `<span class="text-emerald-400 font-bold tracking-widest animate-pulse">🔓 Unlocking The Memory...</span>`;
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        displayElement.innerHTML = `
            <div class="flex gap-2 justify-center font-mono text-sm tracking-widest text-pink-400">
                <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${days}d</div>
                <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${hours}h</div>
                <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${minutes}m</div>
                <div class="bg-black/30 px-2 py-1 rounded text-white shadow-inner">${seconds}s</div>
            </div>
        `;
    }, 1000);
};

// ==========================================
// LINKS RENDERING
// ==========================================

export const renderLinks = (links) => {
    const linkGrid = document.getElementById('link-grid');
    if (!linkGrid) return;
    linkGrid.innerHTML = '';

    links.forEach((link) => {
        const card = document.createElement('div');
        card.className = 'flex items-center justify-between bg-dark p-3 rounded-xl border border-slate-700 hover:border-accent hover:bg-slate-800 transition-all group relative overflow-hidden';

        let isLocked = false;
        if (link.unlockDate) {
            const unlockDateObj = new Date(link.unlockDate.replace('Z', ''));
            if (unlockDateObj > new Date()) {
                isLocked = true;
            }
        }

        if (isLocked) {
            const timerId = `timer-link-${link.id}`;
            card.innerHTML = `
                <div class="flex items-center gap-3 flex-grow overflow-hidden cursor-not-allowed select-none" title="This is a time capsule!">
                    <div class="bg-card p-2 rounded-lg text-indigo-400 shadow-sm text-lg animate-pulse">🔒</div>
                    <div class="flex flex-col w-full pr-2">
                        <span class="text-sm font-medium text-slate-400 truncate mb-1">Hidden Surprise</span>
                        <div id="${timerId}"></div>
                    </div>
                </div>
                <button onclick="window.deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors z-10 relative">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            linkGrid.appendChild(card);
            startCountdown(link.unlockDate, timerId);
        } else {
            card.innerHTML = `
                <a href="${link.url}" target="_blank" class="flex items-center gap-3 flex-grow overflow-hidden">
                    <div class="bg-card p-2 rounded-lg text-accent group-hover:text-white transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-medium text-slate-300 group-hover:text-white truncate pr-2">${link.title}</span>
                        ${link.unlockDate ? `<span class="text-[9px] text-emerald-400 font-bold uppercase tracking-wide">Unlocked ✨</span>` : ''}
                    </div>
                </a>
                <button onclick="window.deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors z-10 relative">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            linkGrid.appendChild(card);
        }
    });
};

// ==========================================
// COMMITS RENDERING
// ==========================================

const optimizeOldImages = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_1080,c_limit/');
};

export const renderCommits = (commits) => {
    const commitTimeline = document.getElementById('commit-timeline');
    if (!commitTimeline) return;
    commitTimeline.innerHTML = '';

    commits.forEach((commit) => {
        const item = document.createElement('div');
        item.className = 'polaroid-card group fade-in relative overflow-hidden flex flex-col';

        const dateObj = new Date(commit.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let isLocked = false;
        let finalUnlockDate = commit.unlockDate;

        if (finalUnlockDate) {
            if (finalUnlockDate.length === 10) {
                finalUnlockDate += 'T00:00:00Z';
            }
            const unlockDateObj = new Date(finalUnlockDate);
            if (unlockDateObj.getTime() > new Date().getTime()) {
                isLocked = true;
            }
        }

        if (isLocked) {
            const timerId = `timer-commit-${commit.id}`;
            item.innerHTML = `
                <div class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-center z-10 rounded-xl border border-indigo-500/30">
                    <button onclick="window.deleteCommit(${commit.id})" class="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all p-1 active:scale-90 z-20">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <span class="text-4xl mb-2 animate-bounce">⏳</span>
                    <p class="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-3">Time Capsule</p>
                    <div id="${timerId}" class="w-full min-h-[30px] flex justify-center items-center"></div>
                </div>
                <div class="opacity-10">
                    <div class="h-20 bg-white/5 rounded-lg mb-2"></div>
                    <div class="h-32 bg-white/5 rounded-lg"></div>
                </div>
            `;
            commitTimeline.appendChild(item);
            startCountdown(finalUnlockDate, timerId);
        } else {
            const safeMessage = commit.message || '';
            const isArabic = /[\u0600-\u06FF]/.test(safeMessage);

            const textFormatClasses = isArabic
                ? 'font-poetic text-base md:text-lg leading-loose text-right'
                : 'text-sm leading-relaxed text-left';

            const dirAttr = isArabic ? 'rtl' : 'ltr';
            const displayMessage = isArabic ? `${safeMessage}&#x200F;` : safeMessage;

            item.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">${formattedDate}</span>
                    <button onclick="window.deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                ${safeMessage ? `<p dir="${dirAttr}" class="${textFormatClasses} whitespace-pre-wrap text-slate-200 font-medium tracking-wide ${commit.imageUrl ? 'mb-4' : 'mb-0'}">${displayMessage}</p>` : ''}
                ${commit.imageUrl ? `<img src="${optimizeOldImages(commit.imageUrl)}" alt="Memory" loading="lazy" decoding="async" style="width: calc(100% + 3rem); margin-left: -1.5rem; ${commit.audioUrl ? 'margin-bottom: 1.5rem;' : 'margin-bottom: -1.5rem;'}" class="max-w-none h-auto object-cover block">` : ''}
                ${commit.audioUrl ? `<audio controls preload="none" src="${commit.audioUrl}" class="w-full grayscale opacity-90 hover:opacity-100 transition-opacity duration-300 rounded-full"></audio>` : ''}
            `;
            commitTimeline.appendChild(item);
        }
    });
};

// ==========================================
// EVENTS RENDERING
// ==========================================

window.eventTimers = window.eventTimers || [];

export const renderEvents = (events) => {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    window.eventTimers.forEach(clearInterval);
    window.eventTimers = [];

    eventsGrid.innerHTML = '';

    events.forEach((ev) => {
        const card = document.createElement('div');
        card.className = `flex items-center justify-between p-4 rounded-[1.5rem] transition-all group premium-glass border-white/5 mb-3`;

        const timerId = `live-timer-${ev.id}`;

        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="bg-black/40 p-3 rounded-xl shadow-inner text-xl">
                    ${ev.type === 'Meeting' ? '✈️' : ev.type === 'Task' ? '📌' : '🤍'}
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm tracking-wide">${ev.title}</h4>
                    <div id="${timerId}" class="flex gap-2 mt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400"></div>
                </div>
            </div>
            <button onclick="window.deleteEvent(${ev.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        eventsGrid.appendChild(card);

        const updateTimer = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const ammanTime = new Date(utc + (3600000 * 3));
            const targetDate = new Date(ev.date + 'T00:00:00+03:00');
            const distance = targetDate - ammanTime;
            const timerEl = document.getElementById(timerId);

            if (distance < 0) {
                timerEl.innerHTML = `<span class="text-emerald-400">PASSED ✔️</span>`;
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            timerEl.innerHTML = `<span>${d}d ${h}h ${m}m ${s}s</span>`;
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        window.eventTimers.push(intervalId);
    });
};

// ==========================================
// PENALTIES RENDERING
// ==========================================

export const renderPenalties = (penalties) => {
    const ledgerTimeline = document.getElementById('penalty-timeline');
    if (!ledgerTimeline) return;

    ledgerTimeline.innerHTML = penalties.map(p => {
        const displayPunisher = p.punisher === 'Mohammad' ? '7amodee' : (p.punisher === 'Zainab' ? 'ZoZo' : p.punisher);
        const displayPunished = p.punished === 'Mohammad' ? '7amodee' : (p.punished === 'Zainab' ? 'ZoZo' : p.punished);
        const isDone = p.isCompleted;
        const textStyleClasses = isDone ? 'line-through text-slate-500 opacity-70' : 'text-slate-200';
        const isArabic = /[\u0600-\u06FF]/.test(p.penaltyText);
        const dirAttr = isArabic ? 'rtl' : 'ltr';
        const fontClass = isArabic ? 'font-poetic text-base md:text-lg text-right' : 'text-sm text-left';

        return `
            <div class="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col relative group transition-all duration-300 hover:bg-white/10 fade-in mb-3">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 uppercase tracking-widest">${displayPunisher} ⚖️</span>
                        <span class="text-slate-500 text-[9px] uppercase tracking-widest">sentenced</span>
                        <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase tracking-widest">${displayPunished}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-[9px] text-slate-500">${p.date}</span>
                        <button onclick="window.deletePenalty(${p.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90 p-1 z-10">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="flex items-start gap-4 mt-2">
                    <label class="relative flex items-start cursor-pointer mt-1 z-10">
                        <input type="checkbox" class="peer hidden" onchange="window.togglePenalty(${p.id}, this.checked)" ${isDone ? 'checked' : ''}>
                        <div class="w-5 h-5 rounded border-2 border-slate-600 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition-all duration-300 shadow-inner hover:border-emerald-400">
                            <svg class="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-all duration-300 transform scale-50 peer-checked:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </label>
                    <p id="penalty-text-${p.id}" dir="${dirAttr}" class="${fontClass} leading-relaxed transition-all duration-300 w-full ${textStyleClasses}">
                        ${p.penaltyText}
                    </p>
                </div>
            </div>
        `;
    }).join('');
};

// ==========================================
// BUCKET LIST RENDERING
// ==========================================

export const updateBucketProgress = (total, completed) => {
    const progressText = document.getElementById('bucket-progress-text');
    const progressBar = document.getElementById('bucket-progress-bar');

    if (progressText && progressBar) {
        progressText.innerText = `${completed} / ${total}`;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;

        if (percentage === 100 && total > 0) {
            progressBar.classList.replace('from-pink-500', 'from-emerald-400');
            progressBar.classList.replace('to-rose-400', 'to-teal-400');
            progressText.classList.replace('text-pink-400', 'text-emerald-400');
        } else {
            progressBar.classList.replace('from-emerald-400', 'from-pink-500');
            progressBar.classList.replace('to-teal-400', 'to-rose-400');
            progressText.classList.replace('text-emerald-400', 'text-pink-400');
        }
    }
};

export const renderBucketList = (items) => {
    const bucketGrid = document.getElementById('bucket-grid');
    if (!bucketGrid) return;
    bucketGrid.innerHTML = '';

    let completedCount = 0;

    items.forEach((item, index) => {
        const isDone = item.isCompleted;
        if (isDone) completedCount++;

        const nodeStyle = isDone
            ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] scale-110"
            : "bg-black border-2 border-pink-500 hover:scale-125 hover:bg-pink-500/20";

        const cardBg = isDone
            ? "bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20 opacity-70"
            : "bg-white/5 border-white/10 hover:border-pink-500/30 hover:bg-white/10 shadow-sm";

        const textColor = isDone ? "text-slate-400 line-through decoration-emerald-500/50" : "text-white";
        const delay = index * 0.05;

        const card = document.createElement('div');
        card.className = `relative pl-8 md:pl-10 transition-all duration-500 ease-out group`;
        card.style.animation = `fadeInUp 0.5s ease-out ${delay}s both`;

        card.innerHTML = `
            <div class="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 z-10 cursor-pointer ${nodeStyle}" onclick="window.toggleBucketItem(${item.id})"></div>
            <div class="flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${cardBg}">
                <h4 class="${textColor} font-medium text-sm md:text-base leading-snug flex-grow cursor-pointer select-none" onclick="window.toggleBucketItem(${item.id})">${item.title}</h4>
                <button onclick="window.deleteBucketItem(${item.id})" class="text-slate-500 hover:text-rose-400 p-2 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90 flex-shrink-0 ml-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `;
        bucketGrid.appendChild(card);
    });

    updateBucketProgress(items.length, completedCount);
};

// ==========================================
// WATCHLIST RENDERING
// ==========================================

export const renderWatchlist = (mediaItems) => {
    const listContainer = document.getElementById('simple-media-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (mediaItems.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-slate-500 text-sm py-4 font-medium">The list is empty. Add something to watch!</div>`;
        return;
    }

    mediaItems.forEach(item => {
        const card = document.createElement('div');
        const itemId = item.id || item.Id;
        const isWatched = item.status === 'watched';
        const textStyle = isWatched ? 'line-through text-slate-500' : 'text-slate-200';
        const cardStyle = isWatched ? 'bg-black/20 border-white/5' : 'bg-black/40 border-white/10 hover:bg-black/60 hover:border-blue-500/30';
        const checkIcon = isWatched
            ? `<svg class="w-5 h-5 text-emerald-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
            : `<div class="w-4 h-4 border-2 border-slate-500 rounded-full group-hover:border-blue-400 transition-colors"></div>`;

        card.className = `p-3 rounded-xl border flex justify-between items-center group transition-all duration-300 shadow-sm ${cardStyle} mb-2`;

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <button onclick="window.toggleMediaStatus(${itemId}, '${item.status}')" class="p-1 active:scale-75 transition-transform shrink-0 flex items-center justify-center">
                    ${checkIcon}
                </button>
                <div class="flex flex-col">
                    <span class="text-sm font-bold ${textStyle} leading-tight transition-all duration-300">${item.title}</span>
                    <span class="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                        Added by <span class="${item.addedBy === 'Mohammad' ? 'text-blue-400' : (item.addedBy === 'Zainab' ? 'text-pink-400' : 'text-slate-400')}">${item.addedBy === 'Mohammad' ? '7amodee' : (item.addedBy === 'Zainab' ? 'ZoZo' : item.addedBy)}</span>
                    </span>
                </div>
            </div>
            <button onclick="window.deleteMedia(${itemId})" class="text-rose-400/50 hover:text-rose-400 transition-colors p-2 font-bold active:scale-90 bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        listContainer.appendChild(card);
    });
};

// ==========================================
// GOALS RENDERING
// ==========================================

export const updateGoalsProgress = (total, completed) => {
    const progressText = document.getElementById('goals-progress-text');
    const progressBar = document.getElementById('goals-progress-bar');

    if (progressText && progressBar) {
        progressText.innerText = `${completed} / ${total}`;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;

        if (percentage === 100 && total > 0) {
            progressBar.classList.replace('from-indigo-500', 'from-emerald-400');
            progressBar.classList.replace('to-cyan-400', 'to-teal-400');
            progressText.classList.replace('text-indigo-400', 'text-emerald-400');
        } else {
            progressBar.classList.replace('from-emerald-400', 'from-indigo-500');
            progressBar.classList.replace('to-teal-400', 'to-cyan-400');
            progressText.classList.replace('text-emerald-400', 'text-indigo-400');
        }
    }
};

export const renderGoals = (items) => {
    const goalsList = document.getElementById('goals-list');
    if (!goalsList) return;
    goalsList.innerHTML = '';

    let completedCount = 0;

    items.forEach((item) => {
        const isDone = item.isCompleted;
        if (isDone) completedCount++;

        const bgClass = isDone
            ? "bg-indigo-500/10 border-indigo-500/30 opacity-60"
            : "bg-white/5 border-transparent hover:border-indigo-500/30 hover:bg-white/10";

        const textClass = isDone ? "text-slate-400 line-through decoration-indigo-500/50" : "text-white";
        const icon = isDone ? "✅" : "🎯";

        const card = document.createElement('div');
        card.className = `flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300 group ${bgClass}`;

        card.innerHTML = `
            <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="window.toggleGoal(${item.id})">
                <div class="text-xl flex-shrink-0 transition-transform active:scale-75 select-none">${icon}</div>
                <h4 class="${textClass} font-medium text-sm md:text-base leading-snug flex-grow transition-all select-none">${item.title}</h4>
            </div>
            <button onclick="window.deleteGoal(${item.id})" class="text-slate-500 hover:text-rose-400 p-2 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90 flex-shrink-0 ml-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        goalsList.appendChild(card);
    });

    updateGoalsProgress(items.length, completedCount);
};

// ==========================================
// VISIT PLANNER RENDERING
// ==========================================

const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const renderGroupedTrips = (trips) => {
    const visitTasksGrid = document.getElementById('visit-tasks-grid');
    if (!visitTasksGrid) return;
    visitTasksGrid.innerHTML = '';

    if (trips.length === 0) {
        visitTasksGrid.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No trips planned yet.</p>';
        return;
    }

    trips.forEach(trip => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'mb-8 bg-black/20 p-4 rounded-3xl border border-white/5';

        let html = `
            <div class="flex justify-between items-center mb-4 bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                <span class="text-xs text-indigo-300 font-bold uppercase tracking-widest">
                    ✈️ Trip: ${formatShortDate(trip.startDate)} to ${formatShortDate(trip.endDate)}
                </span>
                <button onclick="window.deleteWholeTrip(${trip.id})" class="text-indigo-400 hover:text-rose-400 p-1 transition-colors active:scale-90">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <div class="flex flex-col gap-3">
        `;

        if (trip.tasks.length === 0) {
            html += `<p class="text-xs text-slate-500 pl-2 py-2">No plans added for this trip yet.</p>`;
        } else {
            trip.tasks.forEach(task => {
                const isDone = task.isCompleted;
                const bgClass = isDone ? "bg-white/5 border-indigo-500/30 opacity-70" : "premium-glass border-white/5 hover:border-indigo-500/30";
                const textClass = isDone ? "text-slate-400 line-through decoration-indigo-500/50" : "text-white";
                const checkIcon = isDone ? "✅" : "⬜";

                html += `
                    <div class="flex flex-col p-4 rounded-2xl transition-all group ${bgClass}">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="window.toggleVisitTask(${task.id})">
                                <div class="text-xl transition-transform active:scale-75 select-none">${checkIcon}</div>
                                <h4 class="${textClass} font-bold text-sm tracking-wide flex-grow select-none">${task.title}</h4>
                            </div>
                            <button onclick="window.deleteVisitTask(${task.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90 ml-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        ${isDone && task.completedAt ? `<div class="mt-2 ml-9 text-[10px] text-indigo-400 font-bold tracking-wide bg-indigo-500/10 self-start px-2 py-1 rounded-md">Logged: ${task.completedAt}</div>` : ''}
                    </div>
                `;
            });
        }

        html += `</div>`;
        groupDiv.innerHTML = html;
        visitTasksGrid.appendChild(groupDiv);
    });
};

// ==========================================
// PROMPTS RENDERING
// ==========================================

export const renderEmptyPrompt = () => {
    const promptContainer = document.getElementById('blind-prompt-container');
    if (!promptContainer) return;
    
    promptContainer.innerHTML = `
        <div class="text-center">
            <span class="text-4xl mb-3 block">💭</span>
            <h3 class="text-white font-bold text-lg mb-2">No Active Prompt</h3>
            <p class="text-xs text-slate-400 mb-4">Generate a deep question for both of you to answer blindly.</p>
            <button onclick="window.generatePrompt()" class="bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold py-2 px-6 rounded-xl hover:bg-pink-500 hover:text-white transition-all active:scale-95 shadow-lg">
                Generate Blind Prompt ✨
            </button>
        </div>
    `;
};

export const renderPrompt = (prompt) => {
    const promptContainer = document.getElementById('blind-prompt-container');
    if (!promptContainer) return;

    const moAns = prompt.mohammadAnswer;
    const zaAns = prompt.zainabAnswer;
    const isUnlocked = moAns && zaAns;

    let html = `
        <div class="text-center mb-6">
            <span class="text-[10px] text-pink-400 font-bold uppercase tracking-widest border border-pink-500/30 bg-pink-500/10 px-3 py-1 rounded-full">Dual-Lock Prompt 🔒</span>
            <h3 class="text-white font-bold text-xl mt-4 leading-relaxed tracking-wide">"${prompt.question}"</h3>
        </div>
    `;

    if (isUnlocked) {
        html += `
            <div class="flex flex-col gap-4 mb-6 relative z-10">
                <div class="bg-black/30 p-4 rounded-2xl border border-emerald-500/30 border-l-4 border-l-emerald-500 text-left fade-in">
                    <span class="text-[10px] text-emerald-400 font-bold uppercase block mb-1">7amodee 👨🏻‍💻</span>
                    <p class="text-slate-200 text-sm font-medium">"${moAns}"</p>
                </div>
                <div class="bg-black/30 p-4 rounded-2xl border border-pink-500/30 border-l-4 border-l-pink-500 text-left fade-in" style="animation-delay: 0.2s">
                    <span class="text-[10px] text-pink-400 font-bold uppercase block mb-1">ZoZo 👸🏻</span>
                    <p class="text-slate-200 text-sm font-medium">"${zaAns}"</p>
                </div>
            </div>
            <button onclick="window.generatePrompt()" class="mt-2 text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-4">Generate Next Prompt 🔄</button>
        `;
    } else {
        html += `<div class="flex justify-center gap-6 mb-6">`;

        html += moAns
            ? `<div class="flex flex-col items-center"><div class="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl border border-emerald-500/30 mb-2">✅</div><span class="text-[10px] text-slate-400 uppercase">7amodee Locked</span></div>`
            : `<div class="flex flex-col items-center"><div class="bg-black/40 text-slate-500 p-3 rounded-xl border border-white/5 mb-2 animate-pulse">⏳</div><span class="text-[10px] text-slate-400 uppercase">Waiting 7amodee</span></div>`;

        html += zaAns
            ? `<div class="flex flex-col items-center"><div class="bg-pink-500/20 text-pink-400 p-3 rounded-xl border border-pink-500/30 mb-2">✅</div><span class="text-[10px] text-slate-400 uppercase">ZoZo Locked</span></div>`
            : `<div class="flex flex-col items-center"><div class="bg-black/40 text-slate-500 p-3 rounded-xl border border-white/5 mb-2 animate-pulse">⏳</div><span class="text-[10px] text-slate-400 uppercase">Waiting ZoZo</span></div>`;

        html += `</div>`;

        html += `
            <form id="submit-prompt-form" class="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div id="submit-prompt-form" class="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div class="flex items-center gap-2">
                        <label class="text-xs text-slate-400 font-medium">Answering as:</label>
                        <select id="prompt-user" class="bg-black/60 text-white text-xs px-2 py-1 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500">
                            <option value="Mohammad">7amodee 👨🏻‍💻</option>
                            <option value="Zainab">ZoZo 👸🏻</option>
                        </select>
                    </div>
                    <textarea id="prompt-answer" rows="2" placeholder="Write your honest answer..." required class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 shadow-inner resize-none"></textarea>
    
                    <!-- السحر هنا: نوع الزر button وليس submit، ومربوط مباشرة بالدالة -->
                    <button type="button" onclick="window.lockMyAnswer()" class="w-full bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        Lock My Answer 🔒
                    </button>
                </div>
            </form>
            <div class="flex justify-between items-center mt-4 px-2">
                <button onclick="window.cancelPrompt()" class="text-[10px] text-rose-400 hover:text-rose-300 uppercase font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95">
                    ❌ Cancel Session
                </button>
                <button onclick="window.generatePrompt()" class="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95">
                    🔄 Change Question
                </button>
            </div>
        `;
    }

    promptContainer.innerHTML = html;
};

export const renderPromptHistory = (history) => {
    const container = document.getElementById('prompts-history');
    if(!container) return;

    if(history.length === 0) {
        container.innerHTML = `<p class="text-[10px] text-slate-600 text-center italic py-4">The archives are empty. Unlock prompts to save them here.</p>`;
        return;
    }

    container.innerHTML = history.map(p => `
        <div class="bg-black/20 border border-white/5 p-4 rounded-3xl fade-in relative overflow-hidden group hover:border-pink-500/20 transition-all">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-pink-500 opacity-50"></div>
            <p class="text-sm text-pink-300 font-bold mb-4 leading-relaxed pl-2">"${p.question}"</p>
            <div class="flex flex-col gap-3 pl-2">
                <div class="bg-black/40 p-3 rounded-2xl border-l-2 border-emerald-500/50">
                    <span class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">7amodee 👨🏻‍💻</span>
                    <p class="text-xs text-slate-300 font-medium">"${p.mohammadAnswer}"</p>
                </div>
                <div class="bg-black/40 p-3 rounded-2xl border-l-2 border-pink-500/50">
                    <span class="text-[9px] text-pink-400 font-bold uppercase tracking-widest block mb-1">ZoZo 👸🏻</span>
                    <p class="text-xs text-slate-300 font-medium">"${p.zainabAnswer}"</p>
                </div>
            </div>
            <div class="flex justify-end mt-3">
                <span class="text-[8px] text-slate-600 font-bold tracking-widest uppercase bg-black/40 px-2 py-1 rounded-md border border-white/5">${p.dateAdded}</span>
            </div>
        </div>
    `).join('');
};

// ==========================================
// TAB SWITCHING
// ==========================================

export const switchTab = (tabName) => {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-memories').classList.add('hidden');
    document.getElementById('view-calendar').classList.add('hidden');
    document.getElementById('view-court').classList.add('hidden');
    document.getElementById('view-goals').classList.add('hidden');

    const inactiveClass = "flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all";
    document.getElementById('tab-home').className = inactiveClass;
    document.getElementById('tab-memories').className = inactiveClass;
    document.getElementById('tab-calendar').className = inactiveClass;
    document.getElementById('tab-court').className = inactiveClass;
    document.getElementById('tab-goals').className = inactiveClass;

    document.getElementById(`view-${tabName}`).classList.remove('hidden');

    const activeClass = "flex flex-col items-center gap-1 text-accent transition-all scale-110 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]";
    document.getElementById(`tab-${tabName}`).className = activeClass;

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==========================================
// USER SWITCHING
// ==========================================

export const switchUser = (username) => {
    localStorage.setItem('vault_user', username);

    const btn7amodee = document.getElementById('btn-7amodee');
    const btnZozo = document.getElementById('btn-zozo');
    const submitBtn = document.querySelector('#add-media-form button[type="submit"]');

    if (!btn7amodee || !btnZozo) return;

    const inactiveClasses = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-slate-300 hover:bg-white/10 hover:text-white scale-95 cursor-pointer';

    if (username === 'Mohammad') {
        btn7amodee.className = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-400 border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-100 z-10 relative';
        btnZozo.className = inactiveClasses;
        if (submitBtn) submitBtn.className = 'bg-blue-500/20 text-blue-300 border border-blue-500/50 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-lg';
    } else {
        btnZozo.className = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-white bg-gradient-to-r from-pink-600 to-pink-400 border border-pink-400/50 shadow-[0_0_20px_rgba(244,114,182,0.4)] scale-100 z-10 relative';
        btn7amodee.className = inactiveClasses;
        if (submitBtn) submitBtn.className = 'bg-pink-500/20 text-pink-300 border border-pink-500/50 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-pink-500 hover:text-white active:scale-95 shadow-lg';
    }
};

// ==========================================
// MOOD DISPLAY UPDATE
// ==========================================

export const updateMoodDisplay = (moods, moodsList) => {
    document.getElementById('mohammad-mood-text').innerText = "Not set yet";
    document.getElementById('zainab-mood-text').innerText = "Not set yet";

    let isEmergency = false;

    moods.forEach(m => {
        const iconEl = document.getElementById(`${m.user.toLowerCase()}-mood-icon`);
        const textEl = document.getElementById(`${m.user.toLowerCase()}-mood-text`);
        if (iconEl && textEl && moodsList[m.status]) {
            iconEl.innerText = moodsList[m.status].icon;
            textEl.innerText = `${moodsList[m.status].text} (${m.updatedAt})`;

            if(m.status === 'SOS') {
                iconEl.classList.add('animate-pulse', 'bg-rose-500/50', 'border-rose-500');
                isEmergency = true;
            } else {
                iconEl.classList.remove('animate-pulse', 'bg-rose-500/50', 'border-rose-500');
            }
        }
    });

    if (isEmergency) {
        document.body.classList.add('emergency-mode');
    } else {
        document.body.classList.remove('emergency-mode');
    }
};

// ==========================================
// PENALTY MODAL
// ==========================================

export const closePenaltyModal = () => {
    const penaltyModal = document.getElementById('penalty-modal');
    const penaltyModalContent = document.getElementById('modal-content');
    const penaltyResult = document.getElementById('penalty-result');
    const savePenaltyBtn = document.getElementById('save-penalty-btn');
    const generateBtn = document.getElementById('generate-penalty-btn');

    if (penaltyModal) penaltyModal.classList.add('opacity-0');
    if (penaltyModalContent) penaltyModalContent.classList.remove('scale-100');
    
    setTimeout(() => {
        if (penaltyModal) penaltyModal.classList.add('hidden');
        if (penaltyResult) penaltyResult.classList.add('hidden');
        if (savePenaltyBtn) savePenaltyBtn.classList.add('hidden');
        if (generateBtn) generateBtn.innerText = "Issue Verdict ⚡️";
    }, 300);
};

// ==========================================
// IMAGE COMPRESSION
// ==========================================

export const compressImage = (file, maxWidth = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// ==========================================
// ☕ DEEP TALKS UI RENDERER
// ==========================================

export const renderDeepTalks = (talks) => {
    const container = document.getElementById('deep-talks-list');
    if (!container) return;

    if (!talks || talks.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-500 text-sm mt-10">No deep talks yet.</p>`;
        return;
    }

    container.innerHTML = talks.map(talk => `
        <div class="bg-black/30 border border-white/5 p-4 rounded-xl flex items-start gap-3 group hover:border-pink-500/30 transition-all ${talk.isDiscussed ? 'opacity-50' : ''}">
            <input type="checkbox" 
                   onchange="window.toggleDeepTalk(${talk.id}, this.checked)" 
                   ${talk.isDiscussed ? 'checked' : ''}
                   class="mt-1 w-4 h-4 rounded border-gray-600 text-pink-500 focus:ring-pink-500/50 bg-black/50 cursor-pointer">
            <div class="flex-1">
                <p class="text-sm ${talk.isDiscussed ? 'text-slate-500 line-through' : 'text-slate-200'}">${talk.title}</p>
            </div>
            <!-- زر الحذف يظهر فقط عند التمرير -->
            <button onclick="window.deleteDeepTalk(${talk.id})" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-opacity p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    `).join('');
};