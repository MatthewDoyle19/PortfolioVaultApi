document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE_URL = '';

    // --- 1. Authentication ---
    const handleLogin = async () => {
        const key = authKey.value;
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                loginScreen.classList.add('fade-out');
                setTimeout(() => {
                    loginScreen.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    dashboard.classList.add('fade-in');
                    document.getElementById('bottom-nav').classList.remove('hidden');

                    const sosBtn = document.getElementById('sos-btn');
                    if (sosBtn) sosBtn.classList.remove('hidden');

                    window.scrollTo(0, 0);
                }, 500);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            errorMsg.style.opacity = '1';
            authKey.value = '';
            authKey.focus();
            setTimeout(() => errorMsg.style.opacity = '0', 2000);
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    authKey.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

    // --- 2. Uptime Counter ---
    const uptimeDisplay = document.getElementById('uptime-counter');
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

    // --- 3. Digital Keepsakes (Links) ---
    const fetchLinks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/links`);
            const links = await response.json();
            renderLinks(links);
        } catch (error) { console.error(error); }
    };

    const renderLinks = (links) => {
        const linkGrid = document.getElementById('link-grid');
        if (!linkGrid) return;
        linkGrid.innerHTML = '';

        links.forEach((link) => {
            const card = document.createElement('div');
            card.className = 'flex items-center justify-between bg-dark p-3 rounded-xl border border-slate-700 hover:border-accent hover:bg-slate-800 transition-all group relative overflow-hidden';

            let isLocked = false;
            if (link.unlockDate) {
                const unlockDateObj = new Date(link.unlockDate);
                if (unlockDateObj > new Date()) {
                    isLocked = true;
                }
            }

            if (isLocked) {
                // Create a unique identifier for this specific link's countdown
                const timerId = `timer-link-${link.id}`;

                card.innerHTML = `
                <div class="flex items-center gap-3 flex-grow overflow-hidden cursor-not-allowed select-none" title="This is a time capsule!">
                    <div class="bg-card p-2 rounded-lg text-indigo-400 shadow-sm text-lg animate-pulse">🔒</div>
                    <div class="flex flex-col w-full pr-2">
                        <span class="text-sm font-medium text-slate-400 truncate mb-1">Hidden Surprise</span>
                        
                        <!-- The countdown will be injected right here -->
                        <div id="${timerId}"></div>
                    </div>
                </div>
                <button onclick="deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors z-10 relative">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
                linkGrid.appendChild(card);

                // 🔥 IGNITE THE COUNTDOWN
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
                <button onclick="deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors z-10 relative">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
                linkGrid.appendChild(card);
            }
        });
    };

    const addLinkForm = document.getElementById('add-link-form');

    if (addLinkForm) {
        addLinkForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Storing... ⏳';

            try {
                const unlockDateInput = document.getElementById('link-unlock-date').value;

                await fetch(`${API_BASE_URL}/api/links`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.getElementById('link-title').value,
                        url: document.getElementById('link-url').value,
                        unlockDate: unlockDateInput ? unlockDateInput : null
                    })
                });

                e.target.reset();
                fetchLinks();
            } catch (error) {
                console.error("Failed to add link", error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    window.deleteLink = async (id) => {
        if(confirm('Delete this link?')) {
            await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
            fetchLinks();
        }
    };

    // --- Optimizers ---
    const optimizeOldImages = (url) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        return url.replace('/upload/', '/upload/q_auto,f_auto,w_1080,c_limit/');
    };

    const compressImage = (file, maxWidth = 1080, quality = 0.8) => {
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

    // --- 4. The Timeline & Mansaf Counter ---
    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();

            if (document.getElementById('commit-count')) {
                document.getElementById('commit-count').innerText = commits.length;
            }

            const mansafCount = commits.filter(c => c.message.includes('Mansaf')).length;
            const mansafEl = document.getElementById('mansaf-count');
            if (mansafEl) {
                mansafEl.innerText = mansafCount;
            }

            renderCommits(commits);
        } catch (error) { console.error(error); }
    };

    const renderCommits = (commits) => {
        const commitTimeline = document.getElementById('commit-timeline');
        if (!commitTimeline) return;
        commitTimeline.innerHTML = '';

        commits.forEach((commit) => {
            const item = document.createElement('div');
            item.className = 'polaroid-card group fade-in relative overflow-hidden flex flex-col';

            const dateObj = new Date(commit.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            let isLocked = false;
            if (commit.unlockDate) {
                const unlockDateObj = new Date(commit.unlockDate);
                if (unlockDateObj > new Date()) {
                    isLocked = true;
                }
            }

            if (isLocked) {
                const timerId = `timer-commit-${commit.id}`;
                item.innerHTML = `
            <div class="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center z-10 rounded-xl border border-indigo-500/30">
                <span class="text-4xl mb-2 animate-bounce">⏳</span>
                <p class="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-3">Time Capsule</p>
                <div id="${timerId}" class="w-full min-h-[30px]"></div>
            </div>
            <div class="opacity-10 blur-sm">
                <div class="h-20 bg-white/5 rounded-lg mb-2"></div>
                <div class="h-32 bg-white/5 rounded-lg"></div>
            </div>
        `;
                commitTimeline.appendChild(item);
                startCountdown(commit.unlockDate, timerId);

            } else {
                // 🛡️ درع الحماية: التأكد من وجود نص
                const safeMessage = commit.message || '';

                // 🧠 الذكاء الاصطناعي لاكتشاف اللغة
                const isArabic = /[\u0600-\u06FF]/.test(safeMessage);

                // 🎯 السحر هنا: فصل التنسيق بالكامل بين اللغتين!
                // إذا عربي: خط أميري، حجم كبير، مسافات واسعة، يمين
                // إذا إنجليزي: نفس تنسيق موقعك الأصلي بالضبط (حجم صغير text-sm)، يسار
                const textFormatClasses = isArabic
                    ? 'font-poetic text-base md:text-lg leading-loose text-right'
                    : 'text-sm leading-relaxed text-left';

                const dirAttr = isArabic ? 'rtl' : 'ltr';
                const displayMessage = isArabic ? `${safeMessage}&#x200F;` : safeMessage;

                item.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">${formattedDate}</span>
            <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        
        ${safeMessage ? `<p dir="${dirAttr}" class="${textFormatClasses} whitespace-pre-wrap text-slate-200 font-medium tracking-wide ${commit.imageUrl ? 'mb-4' : 'mb-0'}">${displayMessage}</p>` : ''}
        
        ${commit.imageUrl ? `<img src="${optimizeOldImages(commit.imageUrl)}" alt="Memory" style="width: calc(100% + 3rem); margin-left: -1.5rem; ${commit.audioUrl ? 'margin-bottom: 1.5rem;' : 'margin-bottom: -1.5rem;'}" class="max-w-none h-auto object-cover block">` : ''}
        
        ${commit.audioUrl ? `<audio controls src="${commit.audioUrl}" class="w-full invert hue-rotate-180 grayscale contrast-125 opacity-85 hover:opacity-100 transition-all duration-300 rounded-full"></audio>` : ''}
    `;
                commitTimeline.appendChild(item);
            }
        });
    };

    // --- Media & Cloudinary ---
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhr6waydw/auto/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'i7dhiwzb';

    let audioBlob = null;
    let mediaRecorder = null;
    let audioChunks = [];

    const recordBtn = document.getElementById('record-btn');
    recordBtn.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", e => audioChunks.push(e.data));
                mediaRecorder.addEventListener("stop", () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });
                    recordBtn.innerHTML = '✅ Saved';
                    const preview = document.createElement('audio');
                    preview.controls = true;
                    preview.src = URL.createObjectURL(audioBlob);
                    preview.className = 'w-full mt-4 mb-2 invert hue-rotate-180 grayscale contrast-125 opacity-85 hover:opacity-100 transition-all duration-300 drop-shadow-xl rounded-full';
                    const commitForm = document.getElementById('add-commit-form');
                    commitForm.insertBefore(preview, commitForm.querySelector('button[type="submit"]'));
                });
                recordBtn.innerHTML = '🛑 Stop';
                document.getElementById('record-status').classList.remove('hidden');
            } catch (err) { alert("Mic access required."); }
        } else {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
            document.getElementById('record-status').classList.add('hidden');
        }
    });

    document.getElementById('add-commit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Encrypting & Storing... ⏳';
        submitBtn.disabled = true;

        try {
            let finalImageUrl = null, finalAudioUrl = null;
            if (document.getElementById('commit-image').files[0]) {
                const originalFile = document.getElementById('commit-image').files[0];
                const compressedBase64 = await compressImage(originalFile, 1080, 0.8);
                const resBase64 = await fetch(compressedBase64);
                const blob = await resBase64.blob();
                const compressedFile = new File([blob], "compressed_image.jpg", { type: "image/jpeg" });

                const fd = new FormData();
                fd.append('file', compressedFile);
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
                const data = await res.json();
                finalImageUrl = data.secure_url;
            }
            if (audioBlob) {
                const fd = new FormData();
                fd.append('file', audioBlob, 'voice.mp4');
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
                const data = await res.json();
                finalAudioUrl = data.secure_url;
            }
            await fetch(`${API_BASE_URL}/api/commits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: document.getElementById('commit-date').value,
                    message: document.getElementById('commit-message').value,
                    imageUrl: finalImageUrl,
                    audioUrl: finalAudioUrl,
                    unlockDate: document.getElementById('commit-unlock-date').value || null
                })
            });
            e.target.reset();
            audioBlob = null;
            recordBtn.innerHTML = '🎤 Record';
            const previewAudio = document.querySelector('#add-commit-form audio');
            if(previewAudio) previewAudio.remove();
            fetchCommits();
        } catch (error) { console.error(error); }
        finally { submitBtn.innerHTML = 'Store Memory'; submitBtn.disabled = false; }
    });

    window.deleteCommit = async (id) => {
        if(confirm('Delete memory?')) {
            await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
            fetchCommits();
        }
    };

    // --- 🗓️ Shared Calendar ---
    const eventsGrid = document.getElementById('events-grid');
    const addEventForm = document.getElementById('add-event-form');

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events`);
            const events = await response.json();
            renderEvents(events);
        } catch (error) { console.error("Failed to fetch events", error); }
    };

    const renderEvents = (events) => {
        eventsGrid.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        events.forEach((ev) => {
            const [year, month, day] = ev.date.split('-');
            const eventDate = new Date(year, month - 1, day);
            eventDate.setHours(0, 0, 0, 0);

            const timeDiff = eventDate.getTime() - today.getTime();
            const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

            let countdownText = "";
            let colorClass = "text-purple-400";
            let bgClass = "premium-glass border-white/5";

            if (daysDiff === 0) {
                countdownText = "Today! 🎉";
                colorClass = "text-emerald-400";
                bgClass = "premium-glass border-emerald-500/30";
            } else if (daysDiff > 0) {
                countdownText = `${daysDiff} Days Left`;
            } else {
                countdownText = "Passed ✔️";
                colorClass = "text-slate-500";
                bgClass = "premium-glass border-white/5 opacity-60";
            }

            const card = document.createElement('div');
            card.className = `flex items-center justify-between p-4 rounded-[1.5rem] transition-all group ${bgClass}`;

            card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="${colorClass} bg-black/40 p-3 rounded-xl shadow-inner">
                    <span class="text-xl">${ev.type === 'Meeting' ? '✈️' : ev.type === 'Task' ? '📌' : '🤍'}</span>
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm tracking-wide">${ev.title}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[10px] uppercase font-black ${colorClass} tracking-wider bg-black/30 px-2 py-0.5 rounded-md">${countdownText}</span>
                        <span class="text-xs text-slate-400">${ev.date}</span>
                    </div>
                </div>
            </div>
            <button onclick="deleteEvent(${ev.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
            eventsGrid.appendChild(card);
        });
    };

    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '...';

        try {
            await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: document.getElementById('event-title').value,
                    date: document.getElementById('event-date').value,
                    type: document.getElementById('event-type').value
                })
            });
            addEventForm.reset();
            fetchEvents();
        } catch (error) { console.error("Save failed", error); }
        finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Event';
        }
    });

    window.deleteEvent = async (id) => {
        if(confirm('Are you sure you want to delete this event?')) {
            await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
            fetchEvents();
        }
    };

    fetchEvents();

    // --- ⚖️ The Digital Court ---
    const penaltyModal = document.getElementById('penalty-modal');
    const penaltyModalContent = document.getElementById('modal-content');
    const generateBtn = document.getElementById('generate-penalty-btn');
    const savePenaltyBtn = document.getElementById('save-penalty-btn');
    const penaltyText = document.getElementById('penalty-text');
    const penaltyResult = document.getElementById('penalty-result');
    const ledgerTimeline = document.getElementById('penalty-timeline');

    let currentPendingPenalty = null;

    document.getElementById('penalty-btn').addEventListener('click', () => {
        penaltyModal.classList.remove('hidden');
        setTimeout(() => {
            penaltyModal.classList.remove('opacity-0');
            penaltyModalContent.classList.add('scale-100');
        }, 10);
    });

    const punishedSelect = document.getElementById('punished');
    if (!punishedSelect.querySelector('option[value="Both"]')) {
        const bothOption = document.createElement('option');
        bothOption.value = 'Both';
        bothOption.text = 'Both 👩‍❤️‍👨';
        punishedSelect.appendChild(bothOption);
    }

    generateBtn.addEventListener('click', () => {
        const punisher = document.getElementById('punisher').value;
        const punished = document.getElementById('punished').value;

        if (punisher === punished && punished !== 'Both') {
            alert("You can't punish Yourself ⚖️");
            return;
        }

        let pool = [];
        let displayTarget = "";

        if (punished === 'Both') {
            pool = penaltyVault.Shared;
            displayTarget = "7amodee & ZoZo (together)";
        } else {
            pool = penaltyVault[punished];
            displayTarget = punished === 'Mohammad' ? '7amodee' : (punished === 'Zainab' ? 'ZoZo' : punished);
        }

        const randomPenalty = pool[Math.floor(Math.random() * pool.length)];

        currentPendingPenalty = {
            punisher: punisher,
            punished: punished, // Backend value preserved
            penaltyText: randomPenalty.title + ": " + randomPenalty.desc,
            date: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
        };

        penaltyText.innerHTML = `
            <span class="text-white block text-xs mb-1">The Digital Court assigns the charge to ${displayTarget}:</span>
            <b class="text-accent">${randomPenalty.title}</b><br>
            <span class="text-sm opacity-90 italic">${randomPenalty.desc}</span>
        `;
        penaltyResult.classList.remove('hidden');
        savePenaltyBtn.classList.remove('hidden');
        generateBtn.innerText = "Change Verdict? 🔄";
    });

    savePenaltyBtn.addEventListener('click', async () => {
        if (!currentPendingPenalty) return;
        try {
            await fetch(`${API_BASE_URL}/api/penalties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: currentPendingPenalty.date,
                    punisher: currentPendingPenalty.punisher,
                    punished: currentPendingPenalty.punished,
                    penaltyText: currentPendingPenalty.penaltyText,
                    isCompleted: false
                })
            });
            fetchPenaltiesFromServer();
            closePenaltyModal();
        } catch (error) { console.error("Save failed", error); }
    });

    const fetchPenaltiesFromServer = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/penalties`);
            const penalties = await response.json();
            ledgerTimeline.innerHTML = penalties.map(p => {
                // UI Transform to protect DB integrity
                const displayPunisher = p.punisher === 'Mohammad' ? '7amodee' : (p.punisher === 'Zainab' ? 'ZoZo' : p.punisher);
                const displayPunished = p.punished === 'Mohammad' ? '7amodee' : (p.punished === 'Zainab' ? 'ZoZo' : p.punished);

                return `
                <div class="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center fade-in">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent uppercase">${displayPunisher} ⚖️</span>
                            <span class="text-slate-500 text-[9px]">sentenced</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white uppercase">${displayPunished}</span>
                        </div>
                        <p class="text-xs text-slate-200 font-medium">${p.penaltyText}</p>
                    </div>
                    <span class="text-[8px] text-slate-600">${p.date}</span>
                </div>
            `}).join('');
        } catch (error) { console.error(error); }
    };

    const closePenaltyModal = () => {
        penaltyModal.classList.add('opacity-0');
        penaltyModalContent.classList.remove('scale-100');
        setTimeout(() => {
            penaltyModal.classList.add('hidden');
            penaltyResult.classList.add('hidden');
            savePenaltyBtn.classList.add('hidden');
            generateBtn.innerText = "Issue Verdict ⚡️";
        }, 300);
    };

    document.getElementById('close-modal-btn').addEventListener('click', closePenaltyModal);

    fetchLinks();
    fetchCommits();
    fetchPenaltiesFromServer();

    // --- 📡 Mood Radar & Live Notifications ---
    const toastContainer = document.getElementById('toast-container');
    let lastPenaltyCount = 0;
    let lastCommitCount = 0;
    let initialLoad = true;

    const showToast = (title, message, icon = '🔔') => {
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

    const moodsList = {
        'Happy': { icon: '✨', text: 'Chill / Happy' },
        'Study': { icon: '📚', text: 'Focus Mode / Studying' },
        'Coding': { icon: '👨🏻‍💻', text: 'Coding / Deep Focus' },
        'Relaxing': {icon: '😌', text: 'Relaxing / Chilling'},
        'Working': {icon: '😓', text: 'At Work / Busy' },
        'Gym': { icon: '🏋️‍♂️', text: 'At the Gym / Beast Mode' },
        'Coffee': { icon: '☕', text: 'Coffee Time' },
        'Tired': { icon: '🔋', text: 'Out of Energy / Tired' },
        'MissYou': { icon: '🥺', text: 'Missing You' },
        'Bored': { icon: '🥱', text: 'Bored / Need You' },
        'Excited': { icon: '🤩', text: 'Excited / Good News' },
        'Overthinking': { icon: '🧠', text: 'Overthinking' },
        'Sleeping': { icon: '😴', text: 'Sleeping / DND' },
        'SOS': { icon: '🚨', text: 'Need You ASAP' }
    };

    window.openMoodSelector = async (user) => {
        const moodKeys = Object.keys(moodsList).join('\n');
        const displayName = user === 'Mohammad' ? '7amodee' : (user === 'Zainab' ? 'ZoZo' : user);
        const rawInput = prompt(`Update ${displayName}'s mood:\nType one of these options:\n\n${moodKeys}`);

        if (!rawInput) return;

        const cleanInput = rawInput.trim().toLowerCase();
        const matchedKey = Object.keys(moodsList).find(key => key.toLowerCase() === cleanInput);

        if (matchedKey) {
            const moodData = {
                user: user, // DB Value safe
                status: matchedKey,
                updatedAt: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
            };
            try {
                await fetch(`${API_BASE_URL}/api/moods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(moodData)
                });
                fetchSystemState();
                showToast('Mood Radar', `${displayName}'s mood updated to: ${moodsList[matchedKey].text}`, moodsList[matchedKey].icon);
            } catch (error) {
                console.error("Failed to update mood", error);
            }
        } else {
            alert("Write it exactly as shown!");
        }
    };

    let lastHeartbeatId = null;

    const fetchSystemState = async () => {
        try {
            // --- 1. فحص الحالة المزاجية (Moods) ---
            const moodRes = await fetch(`${API_BASE_URL}/api/moods`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
                cache: 'no-store'
            });
            const moods = await moodRes.json();

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

            // --- 2. فحص العقوبات (Penalties) ---
            const penRes = await fetch(`${API_BASE_URL}/api/penalties`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });
            const penalties = await penRes.json();

            if (!initialLoad && penalties.length > lastPenaltyCount) {
                const newestPenalty = penalties[0];
                const displayPunished = newestPenalty.punished === 'Mohammad' ? '7amodee' : (newestPenalty.punished === 'Zainab' ? 'ZoZo' : newestPenalty.punished);
                showToast('⚖️ Digital Court', `New verdict issued for ${displayPunished}!`, '⚖️');
                if(typeof fetchPenaltiesFromServer === "function") fetchPenaltiesFromServer();
            }
            lastPenaltyCount = penalties.length;

            // --- 3. فحص الذكريات (Commits) ---
            const commitRes = await fetch(`${API_BASE_URL}/api/commits`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });
            const commits = await commitRes.json();

            if (!initialLoad && commits.length > lastCommitCount) {
                showToast('📸 New Memory', `A new moment was added to the Vault!`, '✨');
                if(typeof fetchCommits === "function") fetchCommits();
            }
            lastCommitCount = commits.length;

            // --- 4. 📡 مراقبة النبضات (Sparks) ---
            const hbRes = await fetch(`${API_BASE_URL}/api/heartbeats/latest`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });

            if (hbRes.ok) {
                const latestHb = await hbRes.json();
                // الآن initialLoad لا تزال true في أول مرة، فلن يعمل الإشعار الكاذب!
                if (latestHb && !initialLoad && latestHb.id > lastHeartbeatId) {
                    const displaySender = latestHb.sender === 'Mohammad' ? '7amodee' : (latestHb.sender === 'Zainab' ? 'ZoZo' : latestHb.sender);
                    showToast('✨ Incoming Spark!', `${displaySender} is thinking of you right now...`, '❤️');
                }
                if (latestHb) {
                    // نحدث الـ ID بصمت في أول تحميل
                    lastHeartbeatId = latestHb.id;
                }
            }

            // 🚨 الحل النهائي: تأجيل إغلاق التحميل المبدئي حتى تنتهي كل الفحوصات بنجاح
            initialLoad = false;

        } catch (error) {
            console.error("System Watcher error:", error);
            document.getElementById('mohammad-mood-text').innerText = "Connecting...";
            document.getElementById('zainab-mood-text').innerText = "Connecting...";
        }
    };

    fetchSystemState();
    setInterval(fetchSystemState, 10000);

    // --- 🥘 MANSAF LOGIC (CLEAN & INDEPENDENT) ---
    document.addEventListener('DOMContentLoaded', () => {
        const countEl = document.getElementById('mansaf-count');
        const API_URL = 'https://zainabvaultapi.onrender.com'; // تأكد من الرابط الصحيح

        const updateMansaf = async (change) => {
            const currentCount = parseInt(countEl.innerText);
            const newCount = currentCount + change;

            // تحديث بصري فوراً
            countEl.innerText = newCount;
            countEl.classList.add('text-emerald-400', 'scale-125');
            setTimeout(() => countEl.classList.remove('text-emerald-400', 'scale-125'), 300);

            // إرسال الطلب للسيرفر فقط (بدون ذكريات)
            try {
                const response = await fetch(`${API_URL}/api/mansaf/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ change: change })
                });

                if (!response.ok) throw new Error("Server failed");
                console.log("✅ Success!");
            } catch (error) {
                console.error("❌ Mansaf update failed:", error);
                // إعادة الرقم القديم إذا فشل السيرفر
                countEl.innerText = currentCount;
            }
        };

        // ربط الأزرار
        document.getElementById('add-mansaf-btn').onclick = () => updateMansaf(1);
        document.getElementById('minus-mansaf-btn').onclick = () => {
            if(parseInt(countEl.innerText) > 0) updateMansaf(-1);
        };
    });

    // --- 🗺️ THE BUCKET LIST ---
    const bucketGrid = document.getElementById('bucket-grid');
    const addBucketForm = document.getElementById('add-bucket-form');

    const fetchBucketList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bucketlist`);
            const items = await response.json();
            renderBucketList(items);
        } catch (error) { console.error("Failed to fetch bucket list", error); }
    };

    const renderBucketList = (items) => {
        if (!bucketGrid) return;
        bucketGrid.innerHTML = '';

        items.forEach((item) => {
            const isDone = item.isCompleted;
            const bgClass = isDone ? "bg-white/5 border-emerald-500/30 opacity-60" : "premium-glass border-white/5 hover:border-pink-500/30";
            const textClass = isDone ? "text-slate-400 line-through decoration-emerald-500/50" : "text-white";
            const checkIcon = isDone ? "✅" : "⬜";

            const card = document.createElement('div');
            card.className = `flex items-center justify-between p-4 rounded-2xl transition-all group ${bgClass}`;

            card.innerHTML = `
                <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="toggleBucketItem(${item.id})">
                    <div class="text-xl transition-transform active:scale-75 select-none">${checkIcon}</div>
                    <h4 class="${textClass} font-bold text-sm tracking-wide flex-grow transition-all select-none">${item.title}</h4>
                </div>
                <button onclick="deleteBucketItem(${item.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90 ml-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            bucketGrid.appendChild(card);
        });
    };

    if (addBucketForm) {
        addBucketForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '...';

            try {
                await fetch(`${API_BASE_URL}/api/bucketlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.getElementById('bucket-title').value,
                        isCompleted: false
                    })
                });
                addBucketForm.reset();
                fetchBucketList();
            } catch (error) { console.error("Save failed", error); }
            finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Add Dream';
            }
        });
    }

    window.toggleBucketItem = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'PUT' });
            fetchBucketList();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteBucketItem = async (id) => {
        if(confirm('Delete this dream from the list?')) {
            await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'DELETE' });
            fetchBucketList();
        }
    };

    fetchBucketList();

    // --- ✨ THE SPARK (Heartbeat) LOGIC ---
    window.sendHeartbeat = async (sender) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/heartbeats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: sender })
            });

            if (!res.ok) throw new Error("Server rejected the heartbeat");

            const savedHb = await res.json();
            lastHeartbeatId = savedHb.id;

            const targetName = sender === 'Mohammad' ? 'ZoZo 👸🏻' : '7amodee 👨🏻‍💻';
            showToast('Sent! ✨', `Your spark is flying to ${targetName}!`, '🕊️');

            fetchSystemState();
        } catch (error) {
            console.error("Failed to send spark", error);
            showToast('Error', 'Could not send spark. Check your connection.', '❌');
        }
    };

    // --- ✈️ THE VISIT PLANNER LOGIC (GROUPED & LOCAL TIME) ---
    const visitTasksGrid = document.getElementById('visit-tasks-grid');
    const addVisitTaskForm = document.getElementById('add-visit-task-form');
    const visitStartInput = document.getElementById('visit-start');
    const visitEndInput = document.getElementById('visit-end');

    let activeVisitDatesId = null;

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    const fetchVisitData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/visit/all`);
            if (res.ok) {
                const trips = await res.json();
                renderGroupedTrips(trips);

                if (trips.length > 0) {
                    activeVisitDatesId = trips[0].id;
                    visitStartInput.value = trips[0].startDate;
                    visitEndInput.value = trips[0].endDate;
                }
            }
        } catch (error) { console.error("Failed to fetch visit data", error); }
    };

    window.saveVisitDates = async () => {
        if (!visitStartInput.value || !visitEndInput.value) {
            alert("Please pick both start and end dates!");
            return;
        }
        try {
            await fetch(`${API_BASE_URL}/api/visit/dates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: visitStartInput.value,
                    endDate: visitEndInput.value
                })
            });
            showToast('Trip Activated! ✈️', 'A fresh itinerary list has been opened!', '🗺️');
            fetchVisitData();
        } catch (error) { console.error("Failed to save dates", error); }
    };

    const renderGroupedTrips = (trips) => {
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
                    <button onclick="deleteWholeTrip(${trip.id})" class="text-indigo-400 hover:text-rose-400 p-1 transition-colors active:scale-90">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
                                <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="toggleVisitTask(${task.id})">
                                    <div class="text-xl transition-transform active:scale-75 select-none">${checkIcon}</div>
                                    <h4 class="${textClass} font-bold text-sm tracking-wide flex-grow select-none">${task.title}</h4>
                                </div>
                                <button onclick="deleteVisitTask(${task.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90 ml-2">
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

    if (addVisitTaskForm) {
        addVisitTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeVisitDatesId) {
                alert("Please set and save a Date Range first before adding tasks!");
                return;
            }
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                await fetch(`${API_BASE_URL}/api/visit/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.getElementById('visit-task-title').value,
                        isCompleted: false,
                        visitDatesId: activeVisitDatesId
                    })
                });
                document.getElementById('visit-task-title').value = '';
                fetchVisitData();
            } catch (error) { console.error("Save failed", error); }
            finally { submitBtn.disabled = false; }
        });
    }

    window.toggleVisitTask = async (id) => {
        try {
            const now = new Date();
            const localTimeString = now.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

            await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ localTime: localTimeString })
            });
            fetchVisitData();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteVisitTask = async (id) => {
        if(confirm('Delete this trip plan?')) {
            await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, { method: 'DELETE' });
            fetchVisitData();
        }
    };

    window.deleteWholeTrip = async (id) => {
        if (confirm("⚠️ WARNING: Are you sure you want to delete this ENTIRE trip and all of its logged tasks? This cannot be undone!")) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/visit/dates/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error("Server rejected deletion");

                showToast('Trip Wiped 🗑️', 'The entire itinerary has been deleted.', 'ℹ️');
                fetchVisitData();
            } catch (error) {
                console.error("Failed to delete entire trip", error);
                showToast('Error', 'Could not delete trip.', '❌');
            }
        }
    };

    fetchVisitData();

    // --- 🚨 SOS & GEOLOCATION LOGIC ---
    window.triggerSOS = async () => {
        const rawWho = prompt("🚨 EMERGENCY PROTOCOL 🚨\nWho is sending this SOS? (Type: 7amodee or ZoZo)");
        if (!rawWho) return;

        const cleanWho = rawWho.trim().toLowerCase();
        let standardUser = "";

        if (cleanWho === '7amodee' || cleanWho === 'mohammad') {
            standardUser = 'Mohammad'; // DB Safe
        } else if (cleanWho === 'zozo' || cleanWho === 'zainab') {
            standardUser = 'Zainab'; // DB Safe
        } else {
            alert("Invalid name. SOS Aborted.");
            return;
        }

        const targetName = standardUser === 'Mohammad' ? 'ZoZo 👸🏻' : '7amodee 👨🏻‍💻';
        if (!confirm(`⚠️ Send high-priority SOS alert to ${targetName} with your LIVE GPS location?`)) return;

        showToast('Processing...', 'Acquiring GPS coordinates 🛰️', '⏳');

        const sendSosReq = async (lat, lng) => {
            try {
                await fetch(`${API_BASE_URL}/api/sos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user: standardUser, lat: lat, lng: lng })
                });
                showToast('SOS SENT! 🚨', 'Emergency alert has been fired!', '🚨');
                fetchSystemState();
            } catch (e) {
                console.error("SOS failed", e);
                showToast('Error', 'Failed to connect to server.', '❌');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    sendSosReq(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Location access denied or failed.", error);
                    showToast('GPS Failed', 'Sending SOS without location data.', '⚠️');
                    sendSosReq(null, null);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            sendSosReq(null, null);
        }
    };

    // --- 💭 DUAL-LOCK BLIND PROMPT LOGIC ---
    const promptContainer = document.getElementById('blind-prompt-container');

    const fetchBlindPrompt = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/prompts/current`);
            if (res.status === 204 || !res.ok) {
                renderEmptyPrompt();
                return;
            }
            const prompt = await res.json();
            if (!prompt) renderEmptyPrompt();
            else renderPrompt(prompt);
        } catch (error) { console.error(error); }
    };

    const renderEmptyPrompt = () => {
        if (!promptContainer) return;
        promptContainer.innerHTML = `
            <div class="text-center">
                <span class="text-4xl mb-3 block">💭</span>
                <h3 class="text-white font-bold text-lg mb-2">No Active Prompt</h3>
                <p class="text-xs text-slate-400 mb-4">Generate a deep question for both of you to answer blindly.</p>
                <button onclick="generatePrompt()" class="bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold py-2 px-6 rounded-xl hover:bg-pink-500 hover:text-white transition-all active:scale-95 shadow-lg">
                    Generate Blind Prompt ✨
                </button>
            </div>
        `;
    };

    window.generatePrompt = async () => {
        promptContainer.innerHTML = `<p class="text-center text-slate-400 animate-pulse">Consulting the Vault... 🔮</p>`;
        await fetch(`${API_BASE_URL}/api/prompts/generate`, { method: 'POST' });
        fetchBlindPrompt();
    };

    window.cancelPrompt = async () => {
        if(confirm("Are you sure you want to cancel this prompt session?")) {
            promptContainer.innerHTML = `<p class="text-center text-slate-400 animate-pulse">Cancelling... 🚫</p>`;
            await fetch(`${API_BASE_URL}/api/prompts/current`, { method: 'DELETE' });
            fetchBlindPrompt();
        }
    };

    const renderPrompt = (prompt) => {
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
                <button onclick="generatePrompt()" class="mt-2 text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-4">Generate Next Prompt 🔄</button>
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
                    <div class="flex items-center gap-2">
                        <label class="text-xs text-slate-400 font-medium">Answering as:</label>
                        <select id="prompt-user" class="bg-black/60 text-white text-xs px-2 py-1 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500">
                            <option value="Mohammad">7amodee 👨🏻‍💻</option>
                            <option value="Zainab">ZoZo 👸🏻</option>
                        </select>
                    </div>
                    <textarea id="prompt-answer" rows="2" placeholder="Write your honest answer..." required class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 shadow-inner resize-none"></textarea>
                    <button type="submit" class="w-full bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        Lock My Answer 🔒
                    </button>
                </form>

                <div class="flex justify-between items-center mt-4 px-2">
                    <button onclick="cancelPrompt()" class="text-[10px] text-rose-400 hover:text-rose-300 uppercase font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95">
                        ❌ Cancel Session
                    </button>
                    <button onclick="generatePrompt()" class="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase font-bold tracking-wider transition-colors flex items-center gap-1 active:scale-95">
                        🔄 Change Question
                    </button>
                </div>
            `;
        }

        promptContainer.innerHTML = html;

        const form = document.getElementById('submit-prompt-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                btn.disabled = true;
                btn.innerHTML = 'Encrypting... ⏳';

                try {
                    await fetch(`${API_BASE_URL}/api/prompts/${prompt.id}/answer`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user: document.getElementById('prompt-user').value,
                            answer: document.getElementById('prompt-answer').value
                        })
                    });
                    fetchBlindPrompt();
                    fetchPromptHistory();
                } catch (error) { console.error(error); btn.disabled = false; }
            });
        }
    };

    fetchBlindPrompt();

    // --- 📜 PROMPTS HISTORY LOGIC ---
    const fetchPromptHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/prompts/history`);
            const history = await res.json();
            renderPromptHistory(history);
        } catch(e) { console.error(e); }
    };

    const renderPromptHistory = (history) => {
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

    fetchPromptHistory();

    // --- ⏳ TIME CAPSULE COUNTDOWN LOGIC ---
    const startCountdown = (unlockDateString, displayElementId) => {
        const unlockDate = new Date(unlockDateString).getTime();
        const displayElement = document.getElementById(displayElementId);

        if (!displayElement) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = unlockDate - now;

            // If the countdown is finished
            if (distance < 0) {
                clearInterval(interval);
                displayElement.innerHTML = `<span class="text-emerald-400 animate-pulse">🔓 It's time. You can open this now.</span>`;
                // You can also trigger a function here to actually reveal the content!
                return;
            }

            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Render the ticking clock
            displayElement.innerHTML = `
            <div class="flex gap-2 justify-center font-mono text-sm tracking-widest text-pink-400">
                <div class="bg-black/30 px-2 py-1 rounded">${days}d</div>
                <div class="bg-black/30 px-2 py-1 rounded">${hours}h</div>
                <div class="bg-black/30 px-2 py-1 rounded">${minutes}m</div>
                <div class="bg-black/30 px-2 py-1 rounded text-white">${seconds}s</div>
            </div>
        `;
        }, 1000);
    };

    // --- 🍿 THE WATCHLIST LOGIC ---
    const fetchMedia = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/media`);
            const media = await res.json();
            renderWatchlist(media);
        } catch (e) {
            console.error("Media fetch error:", e);
        }
    };

    const renderWatchlist = (mediaItems) => {
        const listContainer = document.getElementById('simple-media-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        // Show empty state if there are no movies
        if (mediaItems.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-slate-500 text-sm py-4 font-medium">The list is empty. Add something to watch!</div>`;
            return;
        }

        mediaItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center group transition-all hover:bg-black/60 hover:border-blue-500/30 shadow-sm';

            card.innerHTML = `
            <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-200 leading-tight">${item.title}</span>
                <span class="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                    Added by ${item.addedBy === 'Mohammad' ? '7amodee' : (item.addedBy === 'Zainab' ? 'ZoZo' : item.addedBy)}
                </span>
            </div>
            <button onclick="deleteMedia(${item.id})" class="text-rose-400/50 hover:text-rose-400 transition-colors p-2 font-bold active:scale-90 bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
            listContainer.appendChild(card);
        });
    };

    // 🚨 Critical fix: Attached to window so your HTML button can actually find it
    window.deleteMedia = async (id) => {
        if(!confirm("Remove this from the watchlist?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/media/${id}`, { method: 'DELETE' });
            fetchMedia();
        } catch (e) {
            console.error("Delete media error:", e);
        }
    };

    const addMediaForm = document.getElementById('add-media-form');

    if (addMediaForm) {
        addMediaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titleInput = document.getElementById('media-title');
            const title = titleInput.value;

            if (!title || title.trim() === '') return;

            const currentUser = localStorage.getItem('vault_user') || 'Unknown';
            const submitBtn = e.target.querySelector('button[type="submit"]');

            submitBtn.disabled = true;

            try {
                await fetch(`${API_BASE_URL}/api/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title.trim(),
                        addedBy: currentUser,
                        status: 'backlog'
                    })
                });

                titleInput.value = '';
                fetchMedia();
            } catch (e) {
                console.error("Add media error:", e);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    fetchMedia();

    // ==========================================
// 🚀 V2.0.0 EASTER EGG & SECRET DOOR (CINEMATIC PEARL EDITION)
// ==========================================
    const easterEggOverlay = document.getElementById('easter-egg-overlay');
    const easterEggAudio = document.getElementById('easter-egg-audio');
    const closeEasterEggBtn = document.getElementById('close-easter-egg');
    const v2PromptForm = document.getElementById('v2-prompt-form');
    const versionTrigger = document.getElementById('version-trigger'); // تأكد من إضافة id="version-trigger" لنص الإصدار في الـ HTML

// --- [1] فحص حالة النظام وتحديث رقم الإصدار فور دخول الموقع ---
    if (versionTrigger) {
        if (localStorage.getItem('v2_unlocked') === 'true') {
            versionTrigger.innerText = 'v2.0.0';
            versionTrigger.classList.add('text-pink-400', 'font-bold', 'drop-shadow-md');
        } else {
            versionTrigger.innerText = 'v1.5.9';
        }
    }

// --- [2] دالة السحر: تفتح الشاشة وتشغل الموسيقى ---
    const openEasterEgg = () => {
        if (easterEggOverlay) {
            easterEggOverlay.classList.remove('hidden');
            if (easterEggAudio) {
                easterEggAudio.volume = 0.5;
                easterEggAudio.play().catch(e => console.log("Audio play blocked", e));
            }
            setTimeout(() => {
                easterEggOverlay.classList.remove('opacity-0');
            }, 50);
        }
    };

// --- [3] التحقق من الموعد لفتحها تلقائياً لأول مرة ---
    const checkMilestone = () => {
        const startDate = new Date('2026-03-25T00:00:00');
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        // تذكر إعادتها إلى 90 بعد التجربة
        if (days >= 90 && localStorage.getItem('v2_unlocked') !== 'true') {
            const loginCheckInterval = setInterval(() => {
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen && loginScreen.classList.contains('hidden')) {
                    clearInterval(loginCheckInterval);
                    setTimeout(() => {
                        openEasterEgg();
                    }, 3000);
                }
            }, 500);
        }
    };
    checkMilestone();

// --- [4] الباب السري: النقر 3 مرات بسرعة على رقم الإصدار ---
    let clickCount = 0;
    let clickTimeout;

    if (versionTrigger) {
        versionTrigger.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimeout);

            if (clickCount >= 3) {
                clickCount = 0;
                openEasterEgg(); // فتح الشاشة!
            } else {
                clickTimeout = setTimeout(() => {
                    clickCount = 0;
                }, 800);
            }
        });
    }

// --- [5] إغلاق الواجهة وإيقاف الصوت بنعومة (Bulletproof Close) ---
    const closeFunctions = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        const audio = document.getElementById('easter-egg-audio');

        if (overlay) overlay.classList.add('opacity-0');

        if (audio) {
            let vol = audio.volume;
            let fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    audio.volume = vol;
                } else {
                    clearInterval(fadeOut);
                    audio.pause();
                    audio.currentTime = 0;
                }
            }, 100);
        }
        setTimeout(() => { if (overlay) overlay.classList.add('hidden'); }, 1000);
    };

// استخدام Event Delegation لضمان استجابة الأزرار دائماً
    document.addEventListener('click', (e) => {
        if (e.target.id === 'close-easter-egg' || e.target.id === 'close-gallery-btn') {
            closeFunctions();
        }
    });

// --- [6] قفل النسخة، حفظ الإجابة، والانتقال للألبوم ---
    if (v2PromptForm) {
        v2PromptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = v2PromptForm.querySelector('button');
            const answerInput = document.getElementById('v2-answer').value;

            // 1. عرض حالة التحميل
            btn.disabled = true;
            btn.innerHTML = 'Encrypting & Saving to Vault... ⏳';

            try {
                // 🛑 السحر هنا: إضافة تأخير وهمي (ثانيتين) لترى رسالة التحميل بوضوح!
                await new Promise(resolve => setTimeout(resolve, 2000));

                await fetch(`${API_BASE_URL}/api/commits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        message: `[V2.0.0 SYSTEM UPGRADE UNLOCKED] ❤️ ZoZo's Answer: "${answerInput}"`,
                        imageUrl: null,
                        audioUrl: null
                    })
                });

                // 2. تسجيل الإنجاز في المتصفح
                localStorage.setItem('v2_unlocked', 'true');

                // التحديث الفوري للإصدار في الخلفية (قمنا بإزالة animate-pulse ليكون طبيعياً)
                if (versionTrigger) {
                    versionTrigger.innerText = 'v2.0.0';
                    versionTrigger.classList.add('text-pink-400', 'font-bold');
                }

                // 3. التحول للأخضر الزمردي
                // 3. التحول للأخضر الزمردي المطلق (تدمير الكلاسات القديمة والـ hover)
                btn.innerHTML = 'System Upgraded & Saved ✨';
                btn.className = 'w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] tracking-wide pointer-events-none';
                btn.classList.replace('from-indigo-500', 'from-emerald-500');
                btn.classList.replace('to-purple-500', 'to-emerald-400');
                btn.classList.replace('shadow-[0_10px_20px_rgba(99,102,241,0.3)]', 'shadow-[0_10px_20px_rgba(16,185,129,0.3)]');

                if (typeof fetchCommits === "function") fetchCommits();

                // 4. تلاشي النص وظهور الألبوم السري
                setTimeout(() => {
                    const textContent = document.getElementById('easter-egg-content');
                    const gallery = document.getElementById('easter-egg-gallery');

                    if (textContent) textContent.classList.add('opacity-0', 'scale-95');

                    setTimeout(() => {
                        if (textContent) textContent.classList.add('hidden');

                        if (gallery) {
                            // 🚀 التعديل الجديد: إرجاع السحب للأعلى فوراً قبل ظهور الصور
                            const scrollContainer = gallery.closest('.overflow-y-auto');
                            if (scrollContainer) {
                                // إعادة السحب لنقطة الصفر (أعلى الشاشة)
                                scrollContainer.scrollTop = 0;
                            }

                            gallery.classList.remove('hidden');
                            setTimeout(() => gallery.classList.remove('opacity-0', 'translate-y-10'), 50);
                        } else {
                            console.error("⚠️ لم يظهر الألبوم لأن كود الـ HTML الخاص به مفقود!");
                        }
                    }, 1000);
                }, 2500);

            } catch (error) {
                console.error("Failed to execute V2 save:", error);
                btn.innerHTML = 'Error Saving. Try Again.';
                btn.disabled = false;
            }
        });
    }

    // 🪄 سحر الظهور المتتابع للصور في الألبوم
    document.querySelectorAll('.polaroid').forEach((p, index) => {
        // 1. تأخير الظهور (نصف ثانية بين كل صورة)
        p.style.animationDelay = `${index * 0.4}s`;

        // 2. 🛠️ استعادة تأثير الـ Hover بمجرد انتهاء حركة الظهور
        p.addEventListener('animationend', () => {
            p.style.animation = 'none'; // تحرير العنصر من سيطرة الأنيميشن
            p.style.opacity = '1'; // تثبيت الرؤية
            p.style.transform = 'rotate(var(--rot))'; // تثبيت زاوية الميلان العشوائية
        });
    });

    // --- 📱 Bottom Navigation Logic (4 Tabs) ---
    window.switchTab = (tabName) => {
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-memories').classList.add('hidden');
        document.getElementById('view-calendar').classList.add('hidden');
        document.getElementById('view-court').classList.add('hidden');

        const inactiveClass = "flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all";
        document.getElementById('tab-home').className = inactiveClass;
        document.getElementById('tab-memories').className = inactiveClass;
        document.getElementById('tab-calendar').className = inactiveClass;
        document.getElementById('tab-court').className = inactiveClass;

        document.getElementById(`view-${tabName}`).classList.remove('hidden');

        const activeClass = "flex flex-col items-center gap-1 text-accent transition-all scale-110 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]";
        document.getElementById(`tab-${tabName}`).className = activeClass;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});