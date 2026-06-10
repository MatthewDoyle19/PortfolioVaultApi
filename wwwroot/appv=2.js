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
                    document.getElementById('bottom-nav').classList.remove('hidden'); // إظهار شريط التنقل
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
        linkGrid.innerHTML = '';
        links.forEach((link) => {
            const card = document.createElement('div');
            card.className = 'flex items-center justify-between bg-dark p-3 rounded-xl border border-slate-700 hover:border-accent hover:bg-slate-800 transition-all group';
            card.innerHTML = `
                <a href="${link.url}" target="_blank" class="flex items-center gap-3 flex-grow overflow-hidden">
                    <div class="bg-card p-2 rounded-lg text-accent group-hover:text-white transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </div>
                    <span class="text-sm font-medium text-slate-300 group-hover:text-white truncate pr-2">${link.title}</span>
                </a>
                <button onclick="deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            linkGrid.appendChild(card);
        });
    };

    document.getElementById('add-link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE_URL}/api/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: document.getElementById('link-title').value, url: document.getElementById('link-url').value })
        });
        e.target.reset();
        fetchLinks();
    });

    window.deleteLink = async (id) => {
        await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
        fetchLinks();
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

    // 🛠️ BUG FIXED: Removed duplicate 'item' declaration that caused the crash
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
            let lockedText = "";
            if (commit.unlockDate) {
                const unlockDateObj = new Date(commit.unlockDate);
                const now = new Date();
                if (unlockDateObj > now) {
                    isLocked = true;
                    const daysLeft = Math.ceil((unlockDateObj - now) / (1000 * 60 * 60 * 24));
                    lockedText = `Unlocks in ${daysLeft} days 🔒`;
                }
            }

            if (isLocked) {
                item.innerHTML = `
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center z-10 rounded-xl border border-indigo-500/30">
                        <span class="text-4xl mb-2 animate-bounce">⏳</span>
                        <p class="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-1">Time Capsule</p>
                        <p class="text-white text-sm font-medium">${lockedText}</p>
                    </div>
                    <div class="opacity-10 blur-sm">
                        <div class="h-20 bg-white/5 rounded-lg mb-2"></div>
                        <div class="h-32 bg-white/5 rounded-lg"></div>
                    </div>
                `;
            } else {
                item.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">${formattedDate}</span>
                    <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                <p class="text-sm text-slate-200 font-medium leading-relaxed tracking-wide ${commit.imageUrl ? 'mb-4' : 'mb-0'}">${commit.message}</p>
                
                ${commit.imageUrl ? `<img src="${optimizeOldImages(commit.imageUrl)}" alt="Memory" style="width: calc(100% + 3rem); margin-left: -1.5rem; ${commit.audioUrl ? 'margin-bottom: 1.5rem;' : 'margin-bottom: -1.5rem;'}" class="max-w-none h-auto object-cover block">` : ''}
                
                ${commit.audioUrl ? `<audio controls src="${commit.audioUrl}" class="w-full invert hue-rotate-180 grayscale contrast-125 opacity-85 hover:opacity-100 transition-all duration-300 rounded-full"></audio>` : ''}
            `;
            }
            commitTimeline.appendChild(item);
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
            // Note: Make sure penaltyVault is accessible globally from penalties.js
            pool = penaltyVault.Shared;
            displayTarget = "7amodee & Zozo (together)";
        } else {
            pool = penaltyVault[punished];
            displayTarget = punished;
        }

        const randomPenalty = pool[Math.floor(Math.random() * pool.length)];

        currentPendingPenalty = {
            punisher: punisher,
            punished: displayTarget,
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
            ledgerTimeline.innerHTML = penalties.map(p => `
                <div class="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center fade-in">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent uppercase">${p.punisher} ⚖️</span>
                            <span class="text-slate-500 text-[9px]">sentenced</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white uppercase">${p.punished}</span>
                        </div>
                        <p class="text-xs text-slate-200 font-medium">${p.penaltyText}</p>
                    </div>
                    <span class="text-[8px] text-slate-600">${p.date}</span>
                </div>
            `).join('');
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
        const rawInput = prompt(`Update ${user}'s mood:\nType one of these options:\n\n${moodKeys}`);

        if (!rawInput) return;

        const cleanInput = rawInput.trim().toLowerCase();
        const matchedKey = Object.keys(moodsList).find(key => key.toLowerCase() === cleanInput);

        if (matchedKey) {
            const moodData = {
                user: user,
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
                showToast('Mood Radar', `${user}'s mood updated to: ${moodsList[matchedKey].text}`, moodsList[matchedKey].icon);
            } catch (error) {
                console.error("Failed to update mood", error);
            }
        } else {
            alert("Write it exactly as shown!");
        }
    };

    const fetchSystemState = async () => {
        try {
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

            moods.forEach(m => {
                const iconEl = document.getElementById(`${m.user.toLowerCase()}-mood-icon`);
                const textEl = document.getElementById(`${m.user.toLowerCase()}-mood-text`);
                if (iconEl && textEl && moodsList[m.status]) {
                    iconEl.innerText = moodsList[m.status].icon;
                    textEl.innerText = `${moodsList[m.status].text} (${m.updatedAt})`;

                    if(m.status === 'SOS') iconEl.classList.add('animate-pulse', 'bg-rose-500/50', 'border-rose-500');
                    else iconEl.classList.remove('animate-pulse', 'bg-rose-500/50', 'border-rose-500');
                }
            });

            const penRes = await fetch(`${API_BASE_URL}/api/penalties`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });
            const penalties = await penRes.json();

            if (!initialLoad && penalties.length > lastPenaltyCount) {
                const newestPenalty = penalties[0];
                showToast('⚖️ Digital Court', `New verdict issued for ${newestPenalty.punished}!`, '⚖️');
                if(typeof fetchPenaltiesFromServer === "function") fetchPenaltiesFromServer();
            }
            lastPenaltyCount = penalties.length;

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

            initialLoad = false;

        } catch (error) {
            console.error("System Watcher error:", error);
            document.getElementById('mohammad-mood-text').innerText = "Connecting...";
            document.getElementById('zainab-mood-text').innerText = "Connecting...";
        }

        // --- 📡 مراقبة النبضات (Sparks) ---
        const hbRes = await fetch(`${API_BASE_URL}/api/heartbeats/latest`, {
            headers: { 'Cache-Control': 'no-cache' },
            cache: 'no-store'
        });

        if (hbRes.ok) {
            const latestHb = await hbRes.json();
            // إذا كان هناك نبضة جديدة، والصفحة ليست في أول تحميل لها
            if (latestHb && !initialLoad && latestHb.id > lastHeartbeatId) {
                showToast('✨ Incoming Spark!', `${latestHb.sender} is thinking of you right now...`, '❤️');
            }
            // تحديث رقم آخر نبضة لتجنب التكرار
            if (latestHb) {
                lastHeartbeatId = latestHb.id;
            }
        }
    };

    fetchSystemState();
    setInterval(fetchSystemState, 10000);

    const addMansafBtn = document.getElementById('add-mansaf-btn');
    if (addMansafBtn) {
        addMansafBtn.addEventListener('click', async () => {
            addMansafBtn.disabled = true;
            addMansafBtn.classList.add('opacity-50');

            try {
                await fetch(`${API_BASE_URL}/api/commits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        message: "The Court recorded that Mohammad ate Mansaf today! 🥘 (By Zozo's request)",
                        imageUrl: null,
                        audioUrl: null
                    })
                });

                const countEl = document.getElementById('mansaf-count');
                countEl.classList.add('text-emerald-400', 'scale-125');
                setTimeout(() => countEl.classList.remove('text-emerald-400', 'scale-125'), 500);

                fetchCommits();

            } catch (error) {
                console.error("Error recording Mansaf:", error);
            } finally {
                addMansafBtn.disabled = false;
                addMansafBtn.classList.remove('opacity-50');
            }
        });
    }

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
            // إذا تحقق الحلم، نجعل الكارت شفافاً مع خط أخضر يمر فوق النص
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

    // دالة تغيير حالة الهدف (تم / لم يتم)
    window.toggleBucketItem = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'PUT' });
            fetchBucketList();
        } catch (error) { console.error("Update failed", error); }
    };

    // دالة الحذف
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

            // 🛠️ الإصلاح الجراحي: نأخذ رقم النبضة التي أرسلناها للتو من السيرفر
            const savedHb = await res.json();
            // 🛠️ نحدث العداد المحلي بصمت حتى لا نستقبل إشعاراً لنبضتنا الخاصة!
            lastHeartbeatId = savedHb.id;

            const targetName = sender === 'Mohammad' ? 'Zozo 👸🏻' : '7modee 👨🏻‍💻';
            showToast('Sent! ✨', `Your spark is flying to ${targetName}!`, '🕊️');

            fetchSystemState(); // تحديث فوري لباقي البيانات
        } catch (error) {
            console.error("Failed to send spark", error);
            showToast('Error', 'Could not send spark. Check your connection.', '❌');
        }
    };

    // --- ✈️ THE VISIT PLANNER LOGIC (RELATIONAL) ---
    const visitTasksGrid = document.getElementById('visit-tasks-grid');
    const addVisitTaskForm = document.getElementById('add-visit-task-form');
    const visitStartInput = document.getElementById('visit-start');
    const visitEndInput = document.getElementById('visit-end');

    let activeVisitDatesId = null; // Tracks the current active trip container ID

    const fetchVisitData = async () => {
        try {
            // 1. Get the latest active date range
            const datesRes = await fetch(`${API_BASE_URL}/api/visit/dates`);
            if (datesRes.ok) {
                const dates = await datesRes.json();
                if (dates) {
                    visitStartInput.value = dates.startDate;
                    visitEndInput.value = dates.endDate;
                    activeVisitDatesId = dates.id; // Store the ID globally

                    // 2. Fetch tasks strictly linked to THIS trip ID
                    const tasksRes = await fetch(`${API_BASE_URL}/api/visit/tasks/${activeVisitDatesId}`);
                    if (tasksRes.ok) {
                        const tasks = await tasksRes.json();
                        renderVisitTasks(tasks);
                    }
                } else {
                    if(visitTasksGrid) visitTasksGrid.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Set a date range to unlock the itinerary.</p>';
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
            const res = await fetch(`${API_BASE_URL}/api/visit/dates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: visitStartInput.value,
                    endDate: visitEndInput.value
                })
            });
            const savedDates = await res.json();
            activeVisitDatesId = savedDates.id; // Lock in the new trip container ID

            showToast('Trip Activated! ✈️', 'A fresh itinerary list has been opened!', '🗺️');
            fetchVisitData(); // Refresh the grid
        } catch (error) { console.error("Failed to save dates", error); }
    };

    const renderVisitTasks = (tasks) => {
        if (!visitTasksGrid) return;
        visitTasksGrid.innerHTML = '';

        if (tasks.length === 0) {
            visitTasksGrid.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No plans added for this trip yet.</p>';
            return;
        }

        tasks.forEach((task) => {
            const isDone = task.isCompleted;
            const bgClass = isDone ? "bg-white/5 border-indigo-500/30 opacity-70" : "premium-glass border-white/5 hover:border-indigo-500/30";
            const textClass = isDone ? "text-slate-400 line-through decoration-indigo-500/50" : "text-white";
            const checkIcon = isDone ? "☑️" : "⬜";

            const card = document.createElement('div');
            card.className = `flex flex-col p-4 rounded-2xl transition-all group ${bgClass}`;

            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="toggleVisitTask(${task.id})">
                        <div class="text-xl transition-transform active:scale-75 select-none">${checkIcon}</div>
                        <h4 class="${textClass} font-bold text-sm tracking-wide flex-grow select-none">${task.title}</h4>
                    </div>
                    <button onclick="deleteVisitTask(${task.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90 ml-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                ${isDone && task.completedAt ? `<div class="mt-2 ml-9 text-[10px] text-indigo-400 font-bold tracking-wide bg-indigo-500/10 self-start px-2 py-1 rounded-md">Logged: ${task.completedAt} 🕒</div>` : ''}
            `;
            visitTasksGrid.appendChild(card);
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
                        visitDatesId: activeVisitDatesId // Injecting the active Foreign Key!
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
            await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, { method: 'PUT' });
            fetchVisitData();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteVisitTask = async (id) => {
        if(confirm('Delete this trip plan?')) {
            await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, { method: 'DELETE' });
            fetchVisitData();
        }
    };

    fetchVisitData();
    
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