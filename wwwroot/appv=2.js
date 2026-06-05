document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE_URL = ''; // السيرفر نفسه هو الذي يستضيف الملفات

    // --- 1. نظام الدخول ---
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
                    loginScreen.classList.add('hidden'); // إخفاء كامل لشاشة الدخول
                    dashboard.classList.remove('hidden'); // إظهار الشاشة الرئيسية
                    dashboard.classList.add('fade-in');
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

    // --- 2. عداد الوقت ---
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

    // --- 3. إدارة الروابط ---
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

    // 🛠️ محرك ضغط الصور الذكي
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

                    // إذا كانت الصورة أكبر من 1080 بيكسل، قم بتصغيرها مع الحفاظ على الأبعاد
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    // رسم الصورة على اللوحة المخفية
                    ctx.drawImage(img, 0, 0, width, height);

                    // تحويل اللوحة إلى صورة JPEG خفيفة الوزن
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };
    
    // --- 4. ذكريات الخط الزمني ---
    // --- 4. ذكريات الخط الزمني (مع عداد المنسف) ---
    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();

            // تحديث عدد الذكريات
            if (document.getElementById('commit-count')) {
                document.getElementById('commit-count').innerText = commits.length;
            }

            // 👇 الكود الجديد: حساب كم مرة أكلت منسف 👇
            const mansafCount = commits.filter(c => c.message.includes('منسف')).length;
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
            item.className = 'polaroid-card group fade-in relative overflow-hidden';

            const dateObj = new Date(commit.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // التحقق من كبسولة الزمن
            let isLocked = false;
            let lockedText = "";
            if (commit.unlockDate) {
                const unlockDateObj = new Date(commit.unlockDate);
                const now = new Date();
                if (unlockDateObj > now) {
                    isLocked = true;
                    const daysLeft = Math.ceil((unlockDateObj - now) / (1000 * 60 * 60 * 24));
                    lockedText = `تُفتح بعد ${daysLeft} يوم 🔒`;
                }
            }

            if (isLocked) {
                // تصميم الكبسولة المغلقة
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
                // 🔥 تم استعادة التصميم الأصلي للكروت 100%
                item.innerHTML = `
                    <div class="flex justify-between items-start mb-4 mt-1">
                        <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">${formattedDate}</span>
                        <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                    <p class="text-sm text-slate-200 mb-2 font-medium leading-relaxed tracking-wide">${commit.message}</p>
                    ${commit.imageUrl ? `<img src="${commit.imageUrl}" alt="Memory" class="polaroid-image">` : ''}
                    ${commit.audioUrl ? `<audio controls src="${commit.audioUrl}" class="w-full mt-3 invert hue-rotate-180 grayscale contrast-125 opacity-85 hover:opacity-100 transition-all duration-300 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]"></audio>` : ''}
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
                const fd = new FormData();
                fd.append('file', document.getElementById('commit-image').files[0]);
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
                    unlockDate: document.getElementById('commit-unlock-date').value || null // السطر الجديد
                })
            });
            e.target.reset();
            audioBlob = null;
            recordBtn.innerHTML = '🎤 Record';
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

    // --- 🗓️ نظام التقويم المشترك (Shared Calendar) ---
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

            // BUG FIX: Removed the muddy background colors and applied your 'premium-glass' class
            let bgClass = "premium-glass border-white/5";

            if (daysDiff === 0) {
                countdownText = "Today! 🎉";
                colorClass = "text-emerald-400";
                // Optional: Give today's card a slight emerald tint border to make it pop
                bgClass = "premium-glass border-emerald-500/30";
            } else if (daysDiff > 0) {
                countdownText = `${daysDiff} Days Left`;
            } else {
                countdownText = "Passed ✔️";
                colorClass = "text-slate-500";
                bgClass = "premium-glass border-white/5 opacity-60";
            }

            const card = document.createElement('div');
            // BUG FIX: Updated class string to use the clean variables
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

    // لا تنس إضافة fetchEvents() في آخر الملف داخل التشغيل الأولي (Initial Load)
    fetchEvents();
    
    // --- المنطق البرمجي للمحكمة (يبقى كما هو، فقط تم تحديث المصفوفة) ---
    // (تأكد من بقاء كود الـ select الخاص بـ "Both" وكود الحفظ كما هو في رسالتي السابقة)

    const penaltyModal = document.getElementById('penalty-modal');
    const penaltyModalContent = document.getElementById('modal-content');
    const generateBtn = document.getElementById('generate-penalty-btn');
    const savePenaltyBtn = document.getElementById('save-penalty-btn');
    const penaltyText = document.getElementById('penalty-text');
    const penaltyResult = document.getElementById('penalty-result');
    const ledgerTimeline = document.getElementById('penalty-timeline');

    let currentPendingPenalty = null;

    // فتح المودال
    document.getElementById('penalty-btn').addEventListener('click', () => {
        penaltyModal.classList.remove('hidden');
        setTimeout(() => {
            penaltyModal.classList.remove('opacity-0');
            penaltyModalContent.classList.add('scale-100');
        }, 10);
    });

    // توليد العقوبة
    // إضافة خيار "تحدي مشترك" للقائمة المنسدلة برمجياً
    const punishedSelect = document.getElementById('punished');
    if (!punishedSelect.querySelector('option[value="Both"]')) {
        const bothOption = document.createElement('option');
        bothOption.value = 'Both';
        bothOption.text = 'Both 👩‍❤️‍👨';
        punishedSelect.appendChild(bothOption);
    }

    // توليد العقوبة المطور
    generateBtn.addEventListener('click', () => {
        const punisher = document.getElementById('punisher').value;
        const punished = document.getElementById('punished').value;

        if (punisher === punished && punished !== 'Both') {
            alert("You can't punish Yourself ⚖️");
            return;
        }

        let pool = [];
        let displayTarget = "";

        // تحديد القائمة والاسم المعروض بناءً على الاختيار
        if (punished === 'Both') {
            pool = penaltyVault.Shared;
            displayTarget = "7modee & Zozo (together)";
        } else {
            pool = penaltyVault[punished];
            displayTarget = punished;
        }

        const randomPenalty = pool[Math.floor(Math.random() * pool.length)];

        currentPendingPenalty = {
            punisher: punisher,
            punished: displayTarget,
            penaltyText: randomPenalty.title + ": " + randomPenalty.desc,
            date: new Date().toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
        };

        penaltyText.innerHTML = `
            <span class="text-white block text-xs mb-1">قررت المحكمة الالكترونيه إسناد التهمة إلى ${displayTarget}:</span>
            <b class="text-accent">${randomPenalty.title}</b><br>
            <span class="text-sm opacity-90 italic">${randomPenalty.desc}</span>
        `;
        penaltyResult.classList.remove('hidden');
        savePenaltyBtn.classList.remove('hidden');
        generateBtn.innerText = "تغيير الحكم؟ 🔄";
    });

    // حفظ في قاعدة البيانات
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
                            <span class="text-slate-500 text-[9px]">حكم على</span>
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
            generateBtn.innerText = "إصدار الحكم ⚡️";
        }, 300);
    };

    document.getElementById('close-modal-btn').addEventListener('click', closePenaltyModal);

    // Initial Load
    fetchLinks();
    fetchCommits();
    fetchPenaltiesFromServer();

    // --- 📡 رادار المزاج والإشعارات اللحظية المطور ---
    const toastContainer = document.getElementById('toast-container');
    let lastPenaltyCount = 0;
    let lastCommitCount = 0; // متغير جديد لمراقبة الذكريات
    let initialLoad = true;

    // 1. نظام الإشعارات المنبثقة (Toast Notification System)
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

        // Animation in
        setTimeout(() => {
            toast.classList.remove('translate-y-[-20px]', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);

        // Animation out & remove
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-[-20px]', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    };

    // 2. تحديث وعرض المزاج (قائمة موسعة جداً)
    const moodsList = {
        'Happy': { icon: '✨', text: 'مزاج رايق / مبسوط' },
        'Study': { icon: '📚', text: 'وضع التركيز / دراسة' },
        'Coding': { icon: '👨🏻‍💻', text: 'بكتب كود / تركيز عالي' },
        'Relaxing': {icon: '😌', text: 'روائ / استخراء'},
        'Working': {icon: '😓', text: 'في الشغل / مشغول' },
        'Gym': { icon: '🏋️‍♂️', text: 'في الجيم / وحش الحديد' },
        'Coffee': { icon: '☕', text: 'وقت القهوة' },
        'Tired': { icon: '🔋', text: 'طاقتي خلصت / تعبان' },
        'MissYou': { icon: '🥺', text: 'مشتاق لك' },
        'Bored': { icon: '🥱', text: 'ملل / محتاجك' },
        'Excited': { icon: '🤩', text: 'متحمس / في خبر حلو' },
        'Overthinking': { icon: '🧠', text: 'تفكير مفرط' },
        'Sleeping': { icon: '😴', text: 'نايم / بوضع الطيران' },
        'SOS': { icon: '🚨', text: 'احتاجك فوراً' }
    };

    window.openMoodSelector = async (user) => {
        const moodKeys = Object.keys(moodsList).join('\n');
        const rawInput = prompt(`تحديث مزاج ${user}:\nاكتب أحد هذه الخيارات:\n\n${moodKeys}`);

        if (!rawInput) return; // إذا ضغطت إلغاء، يخرج بدون أخطاء

        // 🛠️ السر هنا: تنظيف الكلمة من المسافات التي يضيفها الآيفون، وتحويلها لحروف صغيرة
        const cleanInput = rawInput.trim().toLowerCase();

        // البحث عن الكلمة الصحيحة في القائمة بغض النظر عن طريقة كتابتها
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
                fetchSystemState(); // تحديث فوري
                showToast('رادار المزاج', `تم تحديث مزاج ${user} إلى: ${moodsList[matchedKey].text}`, moodsList[matchedKey].icon);
            } catch (error) {
                console.error("Failed to update mood", error);
            }
        } else {
            alert("Write it exactly as shown!");
        }
    };

    // 3. المراقب اللحظي (المضاد لعناد Safari)
    const fetchSystemState = async () => {
        try {
            // --- أ: مراقبة المزاج (مع Headers صريحة ومنع الكاش) ---
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

            // إزالة كلمة Loading في حال نجاح الاتصال حتى لو كانت القائمة فارغة
            document.getElementById('mohammad-mood-text').innerText = "لم يُحدد بعد";
            document.getElementById('zainab-mood-text').innerText = "لم يُحدد بعد";

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

            // --- ب: مراقبة الأحكام ---
            const penRes = await fetch(`${API_BASE_URL}/api/penalties`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });
            const penalties = await penRes.json();

            if (!initialLoad && penalties.length > lastPenaltyCount) {
                const newestPenalty = penalties[0];
                showToast('⚖️ المحكمة الالكترونيه', `تم إصدار حكم جديد على ${newestPenalty.punished}!`, '⚖️');
                if(typeof fetchPenaltiesFromServer === "function") fetchPenaltiesFromServer();
            }
            lastPenaltyCount = penalties.length;

            // --- ج: مراقبة الذكريات ---
            const commitRes = await fetch(`${API_BASE_URL}/api/commits`, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });
            const commits = await commitRes.json();

            if (!initialLoad && commits.length > lastCommitCount) {
                showToast('📸 ذكرى جديدة', `تمت إضافة لحظة جديدة إلى الخزنة!`, '✨');
                if(typeof fetchCommits === "function") fetchCommits();
            }
            lastCommitCount = commits.length;

            initialLoad = false;

        } catch (error) {
            console.error("System Watcher error:", error);
            // إذا فشل الاتصال، ستظهر هذه الرسالة بدلاً من Loading
            document.getElementById('mohammad-mood-text').innerText = "جاري الاتصال...";
            document.getElementById('zainab-mood-text').innerText = "جاري الاتصال...";
        }
    };

    // تشغيل المراقب فوراً، ثم كل 10 ثوانٍ ليعطي إحساس التفاعل اللحظي
    fetchSystemState();
    setInterval(fetchSystemState, 10000);

    // --- 🥘 زر المنسف السري (طلب زوزو) ---
    const addMansafBtn = document.getElementById('add-mansaf-btn');
    if (addMansafBtn) {
        addMansafBtn.addEventListener('click', async () => {
            // تعطيل الزر مؤقتاً لمنع الضغط المزدوج
            addMansafBtn.disabled = true;
            addMansafBtn.classList.add('opacity-50');

            try {
                // إرسال "ذكرى" تلقائية إلى السيرفر
                await fetch(`${API_BASE_URL}/api/commits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0], // تاريخ اليوم
                        message: "سجلت المحكمة أن محمد أكل منسف اليوم! 🥘 (بناءً على طلب زوزو)",
                        imageUrl: null,
                        audioUrl: null
                    })
                });

                // تأثير بصري للرقم
                const countEl = document.getElementById('mansaf-count');
                countEl.classList.add('text-emerald-400', 'scale-125');
                setTimeout(() => countEl.classList.remove('text-emerald-400', 'scale-125'), 500);

                // جلب الذكريات من جديد لتحديث العداد والخط الزمني
                fetchCommits();

            } catch (error) {
                console.error("خطأ في تسجيل المنسف:", error);
            } finally {
                // إعادة تفعيل الزر
                addMansafBtn.disabled = false;
                addMansafBtn.classList.remove('opacity-50');
            }
        });
    }
});;