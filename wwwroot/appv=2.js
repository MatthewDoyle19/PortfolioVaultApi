document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE_URL = "https://zainabvault-v2-0-0.onrender.com";

    // ==========================================
// ⚙️ SYSTEM MAINTENANCE & AUTHENTICATION
// ==========================================

// 1. Check Maintenance Status on Page Load
    window.isSystemInMaintenance = false;

    const checkMaintenanceStatus = async () => {
        try {
            const response = await fetch('https://zainabvault-v2-0-0.onrender.com/api/system/maintenance');
            if (response.ok) {
                const data = await response.json();
                window.isSystemInMaintenance = data.isMaintenance;

                if (window.isSystemInMaintenance) {
                    console.log("⚙️ System is currently under maintenance.");
                }
            }
        } catch (e) {
            console.error("Failed to fetch maintenance status", e);
        }
    };

// Execute immediately and handle potential promise rejections
    checkMaintenanceStatus().catch(console.error);

// 2. Developer Toggle Function (Add a hidden button for this in your dashboard later)
    window.toggleMaintenanceMode = async () => {
        if(confirm("Are you sure you want to toggle the system maintenance mode?")) {
            const response = await fetch('https://zainabvault-v2-0-0.onrender.com/api/system/maintenance/toggle', { method: 'POST' });
            if(response.ok) {

                /** @type {{ isMaintenance: boolean }} */
                const data = await response.json();

                alert(`Update Successful! Maintenance Mode is now: ${data.isMaintenance ? "🔴 ENABLED" : "🟢 DISABLED"}`);
                location.reload();
            }
        }
    };


// 3. Authentication & Bypass Logic
    const handleLogin = async () => {
        const key = authKey.value;

        // Secret Door (Easter Egg)
        if (key === '2027') {
            triggerTawjihiEasterEgg();
            return;
        }

        // 🚀 Developer Bypass (Overrides Maintenance Mode)
        if (key === 'm1') {
            console.log("🛠️ Developer Mode Activated: Bypassing Maintenance.");
            const maintenanceScreen = document.getElementById('maintenance-screen');
            if (maintenanceScreen) maintenanceScreen.classList.add('hidden');

            loginScreen.classList.add('fade-out');
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                dashboard.classList.remove('hidden');
                dashboard.classList.add('fade-in');

                // 🛡️ SECURITY: Reveal the Developer button ONLY for m1
                const devBtn = document.getElementById('dev-toggle-btn');
                if(devBtn) devBtn.classList.remove('hidden');

                // Update UI
                if(document.getElementById('bottom-nav')) document.getElementById('bottom-nav').classList.remove('hidden');
                if(document.getElementById('sos-btn')) document.getElementById('sos-btn').classList.remove('hidden');
                if(document.getElementById('diary-btn')) document.getElementById('diary-btn').classList.remove('hidden');
                window.scrollTo(0, 0);
            }, 500);
            return;
        }

        // Standard Login (Validates via API for Zozo/Guests)
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key })
            });

            const result = await response.json();

            if (response.ok && result.success) {

                // 🛡️ Maintenance Block
                if (window.isSystemInMaintenance) {
                    console.log("🔒 System is under maintenance. Access denied for standard user.");
                    const maintenanceScreen = document.getElementById('maintenance-screen');
                    if (maintenanceScreen) {
                        maintenanceScreen.classList.remove('hidden');
                    }
                    return; // Stop execution, show the maintenance screen
                }

                // Normal access granted
                loginScreen.classList.add('fade-out');
                setTimeout(() => {
                    loginScreen.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    dashboard.classList.add('fade-in');

                    // Update UI
                    if(document.getElementById('bottom-nav')) document.getElementById('bottom-nav').classList.remove('hidden');
                    if(document.getElementById('sos-btn')) document.getElementById('sos-btn').classList.remove('hidden');
                    if(document.getElementById('diary-btn')) document.getElementById('diary-btn').classList.remove('hidden');
                    window.scrollTo(0, 0);
                }, 500);
            } else {
                throw new Error(result.message || "Invalid Key");
            }
        } catch (error) {
            console.error("Login Failed:", error);
            errorMsg.style.opacity = '1';
            authKey.value = '';
            authKey.focus();
            setTimeout(() => errorMsg.style.opacity = '0', 2000);
        }
    };

// Event Listeners
    loginBtn.addEventListener('click', handleLogin);
    authKey.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // --- 🎓 1.5 Tawjihi Easter Egg Logic ---
    const triggerTawjihiEasterEgg = () => {
        const overlay = document.getElementById('tawjihi-overlay');
        const card = document.getElementById('tawjihi-card');
        const confettiContainer = document.getElementById('confetti-container');

        // 1. توليد القبعات
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
        
        // 🎵 إضافة السحر الصوتي هنا:
        const audio = document.getElementById('tawjihi-audio');
        audio.volume = 0.6; // نجعل الصوت 60% ليكون هادئاً ومريحاً
        audio.currentTime = 0; // لضمان بدء الأغنية من البداية دائماً
        audio.play().catch(e => console.log("Audio play blocked by browser:", e));

        // 2. إظهار الشاشة
        overlay.classList.remove('hidden');

        // 2. إظهار الشاشة
        overlay.classList.remove('hidden');

        // 🛠️ التعديل الأول: إزالة الشفافية لكي تظهر الشاشة والقبعات!
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }, 50);

        // 3. زر الإغلاق
        document.getElementById('close-tawjihi-btn').onclick = () => {
            const btn = document.getElementById('close-tawjihi-btn');
            btn.innerHTML = 'Opening The Vault... ⏳';
            btn.disabled = true;

            // تأثير الخروج (إعادة الشفافية للواجهة)
            overlay.classList.add('opacity-0');
            card.classList.remove('scale-100');
            card.classList.add('scale-95');

            // 🎵 السحر الصوتي: إيقاف الأغنية بنعومة تامة (Fade Out)
            const audio = document.getElementById('tawjihi-audio');
            if (audio) {
                let fadeAudio = setInterval(() => {
                    if (audio.volume > 0.1) {
                        audio.volume -= 0.1;
                    } else {
                        audio.pause();
                        clearInterval(fadeAudio);
                    }
                }, 80); // 80 ملي ثانية لتتلاشى بسرعة تتناسب مع حركة الشاشة
            }

            setTimeout(() => {
                overlay.classList.add('hidden');

                // 🛠️ استدعاء الدالة مباشرة للدخول الآمن والسريع
                authKey.value = '2503';
                handleLogin();

                // إعادة الزر لحالته
                btn.innerHTML = 'Start The Journey ✨';
                btn.disabled = false;
            }, 700);
        };
    };

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
                const unlockDateObj = new Date(link.unlockDate.replace('Z', ''));
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
                // 1. سحب قيم الكبسولة الخاصة بالروابط
                const linkDateVal = document.getElementById('link-unlock-date-only').value;
                const linkTimeVal = document.getElementById('link-unlock-time-only').value;

                // 2. معالجة وتجهيز تاريخ الفتح النهائي
                let finalLinkUnlockDate = null;
                if (linkDateVal) {
                    const timeToUse = linkTimeVal || "00:00";
                    // دمج التاريخ والوقت ليصبح صيغة ISO مقبولة
                    finalLinkUnlockDate = new Date(`${linkDateVal}T${timeToUse}:00`).toISOString();
                }

                // 3. إرسال البيانات (تم تصحيح اسم المتغير هنا)
                await fetch(`${API_BASE_URL}/api/links`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.getElementById('link-title').value,
                        url: document.getElementById('link-url').value,
                        unlockDate: finalLinkUnlockDate // التعديل هنا: استخدام المتغير الصحيح
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
        // رجعنا العرض لـ 1080 والجودة الذكية q_auto عشان تطلع الصور كريستال على شاشتها
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

    // --- 4. The Timeline ---
    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();

            if (document.getElementById('commit-count')) {
                document.getElementById('commit-count').innerText = commits.length;
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
            let finalUnlockDate = commit.unlockDate;

            if (finalUnlockDate) {
                // 1. If it's just a date string (length 10), add midnight
                if (finalUnlockDate.length === 10) {
                    finalUnlockDate += 'T00:00:00Z'; // Add Z to ensure UTC
                }

                // 2. Parse it directly as a UTC date
                const unlockDateObj = new Date(finalUnlockDate);

                // 3. Now compare UTC to UTC to avoid any "local time" shifts
                if (unlockDateObj.getTime() > new Date().getTime()) {
                    isLocked = true;
                }
            }

            if (isLocked) {
                const timerId = `timer-commit-${commit.id}`;
                item.innerHTML = `
    <!-- تمت إضافة text-center هنا -->
    <div class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-center z-10 rounded-xl border border-indigo-500/30">
        
        <button onclick="deleteCommit(${commit.id})" class="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all p-1 active:scale-90 z-20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>

        <span class="text-4xl mb-2 animate-bounce">⏳</span>
        <p class="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-3">Time Capsule</p>
        
        <!-- تمت إضافة كلاسات التوسيط flex justify-center items-center هنا لضمان تمركز رسالة الفتح -->
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
        <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
    
    ${safeMessage ? `<p dir="${dirAttr}" class="${textFormatClasses} whitespace-pre-wrap text-slate-200 font-medium tracking-wide ${commit.imageUrl ? 'mb-4' : 'mb-0'}">${displayMessage}</p>` : ''}
    
    ${commit.imageUrl ? `<img src="${optimizeOldImages(commit.imageUrl)}" alt="Memory" loading="lazy" decoding="async" style="width: calc(100% + 3rem); margin-left: -1.5rem; ${commit.audioUrl ? 'margin-bottom: 1.5rem;' : 'margin-bottom: -1.5rem;'}" class="max-w-none h-auto object-cover block">` : ''}
    
    ${commit.audioUrl ? `<audio controls preload="none" src="${commit.audioUrl}" class="w-full grayscale opacity-90 hover:opacity-100 transition-opacity duration-300 rounded-full"></audio>` : ''}
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

            // --- Image Upload Logic ---
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

            // --- Audio Upload Logic ---
            if (typeof window.audioBlob !== 'undefined' && window.audioBlob) {
                const fd = new FormData();
                fd.append('file', window.audioBlob, 'voice.mp4');
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
                const data = await res.json();
                finalAudioUrl = data.secure_url;
            }

            // --- THE FIX: Decoupled Dates & Match IDs with Midnight Default ---

// 1. سحب تاريخ الذاكرة العادية (تم إرجاع الـ ID القديم لحقل واحد)
            const memoryDateVal = document.getElementById('memory-date').value;

// 2. سحب قيم الكبسولة (تبقى كما هي بحقلين)
            const capsuleDateVal = document.getElementById('capsule-date-only').value;
            const capsuleTimeVal = document.getElementById('capsule-time-only').value;

// 3. معالجة تاريخ الذاكرة
            let finalDate;
            if (memoryDateVal) {
                // إذا اختار يوماً محدداً، نلصق به منتصف الليل
                finalDate = new Date(`${memoryDateVal}T00:00:00`).toISOString();
            } else {
                // إذا لم يختر شيئاً، نأخذ تاريخ ووقت اللحظة الحالية (Immediate Store)
                finalDate = new Date().toISOString();
            }

// 4. معالجة تاريخ الكبسولة الزمنية
            let finalUnlockDate = null;
            if (capsuleDateVal) {
                const timeToUse = capsuleTimeVal || "00:00";
                finalUnlockDate = new Date(`${capsuleDateVal}T${timeToUse}:00`).toISOString();
            }

            // --- Store in Database ---
            const response = await fetch(`${API_BASE_URL}/api/commits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: finalDate,
                    message: document.getElementById('commit-message').value,
                    imageUrl: finalImageUrl,
                    audioUrl: finalAudioUrl,
                    unlockDate: finalUnlockDate
                })
            });

            if (!response.ok) throw new Error("Failed to store in DB");

            // --- Reset UI ---
            e.target.reset();
            if (typeof window.audioBlob !== 'undefined') window.audioBlob = null;

            const recordBtn = document.getElementById('record-btn');
            if (recordBtn) recordBtn.innerHTML = '🎤 Record';

            const previewAudio = document.querySelector('#add-commit-form audio');
            if (previewAudio) previewAudio.remove();

            fetchCommits();

        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            submitBtn.innerHTML = 'Store Memory';
            submitBtn.disabled = false;
        }
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

    // مصفوفة عالمية لمسح العدادات ومنع بطء المتصفح
    window.eventTimers = window.eventTimers || [];

    const renderEvents = (events) => {
        // 🧹 تنظيف العدادات القديمة
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
                <div id="${timerId}" class="flex gap-2 mt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400">
                    </div>
            </div>
        </div>
        <button onclick="deleteEvent(${ev.id})" class="text-slate-600 hover:text-rose-400 p-2 transition-colors opacity-0 group-hover:opacity-100 active:scale-90">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        `;
            eventsGrid.appendChild(card);

            // ⚙️ محرك العداد (توقيت الأردن: UTC + 3)
            const updateTimer = () => {
                // الحصول على وقت الأردن الحالي
                const now = new Date();
                const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                const ammanTime = new Date(utc + (3600000 * 3));

                // تحويل تاريخ الحدث لـ Amman Time
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

    // --- 1. دوال التحكم بالـ Checkbox والـ Delete ---

    window.togglePenalty = async (id, isChecked) => {
        const textElement = document.getElementById(`penalty-text-${id}`);

        // 🎨 تحديث الواجهة فوراً (Optimistic UI Update) لسرعة الاستجابة
        if (isChecked) {
            textElement.classList.add('line-through', 'text-slate-500', 'opacity-70');
            textElement.classList.remove('text-slate-200');
        } else {
            textElement.classList.remove('line-through', 'text-slate-500', 'opacity-70');
            textElement.classList.add('text-slate-200');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/penalties/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: isChecked })
            });

            if (!response.ok) throw new Error("Failed to update status");
        } catch (error) {
            console.error("Error updating penalty:", error);
            // التراجع عن التأثير البصري إذا فشل الاتصال بالسيرفر
            if (!isChecked) {
                textElement.classList.add('line-through', 'text-slate-500', 'opacity-70');
                textElement.classList.remove('text-slate-200');
            } else {
                textElement.classList.remove('line-through', 'text-slate-500', 'opacity-70');
                textElement.classList.add('text-slate-200');
            }
        }
    };

    window.deletePenalty = async (id) => {
        if (!confirm("Are you sure you want to delete this verdict?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/penalties/${id}`, { method: 'DELETE' });
            fetchPenaltiesFromServer(); // إعادة رسم القائمة بعد الحذف
        } catch (error) {
            console.error("Delete failed", error);
        }
    };


// --- 2. دالة جلب ورسم العقوبات المحدثة (Premium UI) ---

    const fetchPenaltiesFromServer = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/penalties`);
            const penalties = await response.json();

            ledgerTimeline.innerHTML = penalties.map(p => {
                // UI Transform to protect DB integrity
                const displayPunisher = p.punisher === 'Mohammad' ? '7amodee' : (p.punisher === 'Zainab' ? 'ZoZo' : p.punisher);
                const displayPunished = p.punished === 'Mohammad' ? '7amodee' : (p.punished === 'Zainab' ? 'ZoZo' : p.punished);

                const isDone = p.isCompleted;
                const textStyleClasses = isDone ? 'line-through text-slate-500 opacity-70' : 'text-slate-200';

                // دعم النصوص العربية والإنجليزية
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
                        <button onclick="deletePenalty(${p.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90 p-1 z-10">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-start gap-4 mt-2">
                    <label class="relative flex items-start cursor-pointer mt-1 z-10">
                        <input type="checkbox" class="peer hidden" onchange="togglePenalty(${p.id}, this.checked)" ${isDone ? 'checked' : ''}>
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
        `}).join('');
        } catch (error) { console.error(error); }
    };

// --- 3. إغلاق الـ Modal وتحديث الـ Listeners ---
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

// استدعاء الدوال عند التحميل
    if (typeof fetchLinks === "function") fetchLinks();
    if (typeof fetchCommits === "function") fetchCommits();
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
        'Relaxing': { icon: '😌', text: 'Relaxing / Chilling'},
        'Sad': { icon: '😢', text: 'Feeling Sad' },
        'Grumpy': { icon: '😤', text: 'Upset / Moody'},
        'Angry': { icon: '🤬', text: 'Mad AF / Angry'},
        'Working': {icon: '😓', text: 'At Work / Busy' },
        'Gym': { icon: '🏋️‍♂️', text: 'At the Gym / Beast Mode' },
        'Tired': { icon: '🔋', text: 'Out of Energy / Tired' },
        'MissYou': { icon: '🥺', text: 'Missing You' },
        'Bored': { icon: '🥱', text: 'Bored / Need You' },
        'Excited': { icon: '🤩', text: 'Excited / Good News' },
        'Overthinking': { icon: '🧠', text: 'Overthinking' },
        'Sleeping': { icon: '😴', text: 'Sleeping / DND' },
        // '5ra': { icon : '💩', text: 'zgg / Stay away' },
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

    // --- 🥘 INDEPENDENT MANSAF LOGIC ---
    const mansafCountEl = document.getElementById('mansaf-count');
    const addMansafBtn = document.getElementById('add-mansaf-btn');
    const minusMansafBtn = document.getElementById('minus-mansaf-btn');

// 1. جلب الرقم الحالي من السيرفر المستقل
    const fetchMansafCount = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/mansaf`);
            if (res.ok) {
                const data = await res.json();
                if (mansafCountEl) mansafCountEl.innerText = data.count;
            }
        } catch (e) { console.error("Error loading Mansaf count", e); }
    };

// 2. معالجة الضغطات (زيادة أو تنقيص)
    const handleMansafAction = async (change) => {
        if (!mansafCountEl) return;
        const currentCount = parseInt(mansafCountEl.innerText) || 0;

        if (change === -1 && currentCount <= 0) return; // Prevent negative Mansaf

        // Optimistic UI Update
        mansafCountEl.innerText = currentCount + change;
        mansafCountEl.classList.add('text-emerald-400', 'scale-125');
        setTimeout(() => mansafCountEl.classList.remove('text-emerald-400', 'scale-125'), 300);

        try {
            const response = await fetch(`${API_BASE_URL}/api/mansaf/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ change: change })
            });

            if (!response.ok) {
                // If the server rejects it, throw an error to trigger the catch block
                throw new Error(`Server returned status: ${response.status}`);
            }

            // If it succeeds, the Telegram notification will have fired from the backend!

        } catch (error) {
            console.error("Failed to sync Mansaf", error);
            alert("Server Error: Could not save the Mansaf count! Check the console.");

            // Revert the visual number back to what it was since the save failed
            mansafCountEl.innerText = currentCount;
        }
    };

// 3. ربط الأزرار بالوظائف
    if (addMansafBtn) addMansafBtn.addEventListener('click', () => handleMansafAction(1));
    if (minusMansafBtn) minusMansafBtn.addEventListener('click', () => handleMansafAction(-1));

// تفعيل جلب الرقم عند فتح الصفحة
    fetchMansafCount();

    // --- 🗺️ THE BUCKET LIST ---
    const bucketGrid = document.getElementById('bucket-grid');
    const addBucketForm = document.getElementById('add-bucket-form');

// 🌟 دالة تحديث شريط التقدم (تعتمد على الأرقام الدقيقة)
    const updateBucketProgress = (total, completed) => {
        const progressText = document.getElementById('bucket-progress-text');
        const progressBar = document.getElementById('bucket-progress-bar');

        if (progressText && progressBar) {
            progressText.innerText = `${completed} / ${total}`;

            // حساب النسبة المئوية
            const percentage = total === 0 ? 0 : (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;

            // تحويل اللون للأخضر إذا اكتملت كل الأحلام
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

        let completedCount = 0;

        items.forEach((item, index) => {
            const isDone = item.isCompleted;
            if (isDone) completedCount++;

            // 🎨 تصميم العقدة (النقطة على الخط) والبطاقة
            const nodeStyle = isDone
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] scale-110"
                : "bg-black border-2 border-pink-500 hover:scale-125 hover:bg-pink-500/20";

            const cardBg = isDone
                ? "bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20 opacity-70"
                : "bg-white/5 border-white/10 hover:border-pink-500/30 hover:bg-white/10 shadow-sm";

            const textColor = isDone ? "text-slate-400 line-through decoration-emerald-500/50" : "text-white";

            // تأثير دخول متسلسل (Cascading Animation)
            const delay = index * 0.05;

            const card = document.createElement('div');
            // pl-8 تبعد البطاقة عن الخط العمودي لتعطي مساحة للنقطة
            card.className = `relative pl-8 md:pl-10 transition-all duration-500 ease-out group`;
            card.style.animation = `fadeInUp 0.5s ease-out ${delay}s both`;

            card.innerHTML = `
            <div class="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 z-10 cursor-pointer ${nodeStyle}" onclick="toggleBucketItem(${item.id})"></div>

            <div class="flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${cardBg}">
                <h4 class="${textColor} font-medium text-sm md:text-base leading-snug flex-grow cursor-pointer select-none" onclick="toggleBucketItem(${item.id})">${item.title}</h4>

                <button onclick="deleteBucketItem(${item.id})" class="text-slate-500 hover:text-rose-400 p-2 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90 flex-shrink-0 ml-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `;
            bucketGrid.appendChild(card);
        });

        updateBucketProgress(items.length, completedCount);
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
                submitBtn.innerHTML = 'Add Dream ✨';
            }
        });
    }

    window.toggleBucketItem = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'PUT' });
            fetchBucketList(); // 💡 التحديث سيشمل شريط التقدم تلقائياً
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteBucketItem = async (id) => {
        if(confirm('Delete this dream from the list?')) {
            await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'DELETE' });
            fetchBucketList(); // 💡 التحديث سيشمل شريط التقدم تلقائياً
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
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

            // 🎯 عندما ينتهي العداد
            if (distance < 0) {
                clearInterval(interval);

                // نعطيها رسالة تشويقية تومض
                displayElement.innerHTML = `<span class="text-emerald-400 font-bold tracking-widest animate-pulse">🔓 Unlocking The Memory...</span>`;

                // 🛠️ السحر الحقيقي: تحديث البيانات بصمت وبدون طرد المستخدم!
                setTimeout(() => {
                    // التعديل هنا: استدعاء الدالة الصحيحة الموجودة في نظامك
                    fetchCommits();
                }, 2000);

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
            <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${days}d</div>
            <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${hours}h</div>
            <div class="bg-black/30 px-2 py-1 rounded shadow-inner">${minutes}m</div>
            <div class="bg-black/30 px-2 py-1 rounded text-white shadow-inner">${seconds}s</div>
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

        if (mediaItems.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-slate-500 text-sm py-4 font-medium">The list is empty. Add something to watch!</div>`;
            return;
        }

        mediaItems.forEach(item => {
            const card = document.createElement('div');
            // 🚨 إصلاح محتمل لمشكلة الحذف: التأكد من جلب الـ ID سواء كان id أو Id
            const itemId = item.id || item.Id;
            const isWatched = item.status === 'watched';

            // تنسيقات ديناميكية بناءً على حالة الفيلم (تمت مشاهدته أم لا)
            const textStyle = isWatched ? 'line-through text-slate-500' : 'text-slate-200';
            const cardStyle = isWatched ? 'bg-black/20 border-white/5' : 'bg-black/40 border-white/10 hover:bg-black/60 hover:border-blue-500/30';

            // رسم أيقونة الصح (دائرة فارغة إذا لم يشاهد، وصح أخضر إذا شوهد)
            const checkIcon = isWatched
                ? `<svg class="w-5 h-5 text-emerald-500 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
                : `<div class="w-4 h-4 border-2 border-slate-500 rounded-full group-hover:border-blue-400 transition-colors"></div>`;

            card.className = `p-3 rounded-xl border flex justify-between items-center group transition-all duration-300 shadow-sm ${cardStyle} mb-2`;

            // 🎯 اللمسة الهندسية: دمجنا زر الصح، والنص، وزر الحذف
            card.innerHTML = `
        <div class="flex items-center gap-3">
            <button onclick="toggleMediaStatus(${itemId}, '${item.status}')" class="p-1 active:scale-75 transition-transform shrink-0 flex items-center justify-center">
                ${checkIcon}
            </button>
            <div class="flex flex-col">
                <span class="text-sm font-bold ${textStyle} leading-tight transition-all duration-300">${item.title}</span>
                <span class="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                    Added by <span class="${item.addedBy === 'Mohammad' ? 'text-blue-400' : (item.addedBy === 'Zainab' ? 'text-pink-400' : 'text-slate-400')}">${item.addedBy === 'Mohammad' ? '7amodee' : (item.addedBy === 'Zainab' ? 'ZoZo' : item.addedBy)}</span>
                </span>
            </div>
        </div>
        <button onclick="deleteMedia(${itemId})" class="text-rose-400/50 hover:text-rose-400 transition-colors p-2 font-bold active:scale-90 bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;
            listContainer.appendChild(card);
        });
    };

    window.toggleMediaStatus = async (id, currentStatus) => {
        // نعكس الحالة: إذا كان backlog يصبح watched والعكس
        const newStatus = currentStatus === 'watched' ? 'backlog' : 'watched';

        try {
            // 🎯 التعديل الهندسي هنا: 
            // 1. أضفنا /status للرابط ليطابق مسار الـ C#
            // 2. أرسلنا newStatus كـ Query Parameter ليقرأه السيرفر بنجاح
            await fetch(`${API_BASE_URL}/api/media/${id}/status?newStatus=${newStatus}`, {
                method: 'PUT'
                // لم نعد بحاجة لإرسال Body أو Headers لأن السيرفر يقرأ من الرابط مباشرة!
            });

            fetchMedia(); // إعادة رسم القائمة لتظهر علامة الصح
        } catch (e) {
            console.error("Toggle status error:", e);
        }
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

    // ---------------------------------------------------------
// 🧠 نظام التبديل الذكي (Profile Switcher Logic)
// ---------------------------------------------------------
    window.switchUser = (username) => {
        localStorage.setItem('vault_user', username);

        const btn7amodee = document.getElementById('btn-7amodee');
        const btnZozo = document.getElementById('btn-zozo');
        const submitBtn = document.querySelector('#add-media-form button[type="submit"]');

        if (!btn7amodee || !btnZozo) return;

        // كلاسات الزر المطفي (واضح، مقروء، بدون شفافية مفرطة)
        const inactiveClasses = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-slate-300 hover:bg-white/10 hover:text-white scale-95 cursor-pointer';

        if (username === 'Mohammad') {
            // --- تفعيل ستايل حمودي (أزرق متدرج وواضح) ---
            btn7amodee.className = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-400 border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-100 z-10 relative';
            btnZozo.className = inactiveClasses;

            // تلوين زر الفورم بالأزرق
            if (submitBtn) submitBtn.className = 'bg-blue-500/20 text-blue-300 border border-blue-500/50 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-lg';

        } else {
            // --- تفعيل ستايل زوزو (زهري متدرج وواضح) ---
            btnZozo.className = 'px-6 py-2 text-sm md:text-base rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-white bg-gradient-to-r from-pink-600 to-pink-400 border border-pink-400/50 shadow-[0_0_20px_rgba(244,114,182,0.4)] scale-100 z-10 relative';
            btn7amodee.className = inactiveClasses;

            // تلوين زر الفورم بالزهري
            if (submitBtn) submitBtn.className = 'bg-pink-500/20 text-pink-300 border border-pink-500/50 font-bold py-3.5 px-6 rounded-xl transition-all hover:bg-pink-500 hover:text-white active:scale-95 shadow-lg';
        }
    };

// 3. تهيئة النظام عند فتح الصفحة (Initialization)
    document.addEventListener('DOMContentLoaded', () => {
        // جلب المستخدم الحالي، وإذا لم يكن موجوداً نجعله "Mohammad" افتراضياً
        const currentUser = localStorage.getItem('vault_user') || 'Mohammad';
        switchUser(currentUser);
    });

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

    /* ==========================================
   📦 THE TIME CAPSULE (LEGACY CODE - DO NOT UNCOMMENT)
   هذا هو الكود التاريخي الذي تم استخدامه ليلة 23/6/2026 لتفجير المفاجأة.
   متروك هنا للذكرى والتوثيق، لكي لا ننسى كيف تمت هندسة اللحظة.
   ==========================================
    const checkMilestone = () => {
        const targetDate = new Date('2026-06-23T00:00:00+03:00').getTime();
        const now = new Date().getTime();
        const distance = targetDate - now; 
        const triggerNow = () => {
            if (localStorage.getItem('v2_unlocked') !== 'true') {
                const loginCheckInterval = setInterval(() => {
                    const loginScreen = document.getElementById('login-screen');
                    if (loginScreen && loginScreen.classList.contains('hidden')) {
                        clearInterval(loginCheckInterval);
                        setTimeout(() => { openEasterEgg(); }, 3000);
                    }
                }, 500);
            }
        };
        if (distance <= 0) { triggerNow(); } 
        else { setTimeout(() => { triggerNow(); }, distance); }
    };
    checkMilestone();

    if (v2PromptForm) {
        v2PromptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = v2PromptForm.querySelector('button');
            const answerInput = document.getElementById('v2-answer').value;
            const questionText = "لو رجعنا بالزمن ليوم 25/3...";
            
            btn.disabled = true;
            btn.innerHTML = 'Encrypting & Saving to Vault... ⏳';

            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await fetch(`${API_BASE_URL}/api/commits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        message: `[V2.0.0 SYSTEM UPGRADE UNLOCKED] ✨\n\n💭 السؤال:\n"${questionText}"\n\n❤️ إجابة زوزو:\n"${answerInput}"`,
                        imageUrl: null, audioUrl: null
                    })
                });
                localStorage.setItem('v2_unlocked', 'true');
                btn.innerHTML = 'System Upgraded & Saved ✨';
                setTimeout(() => {
                    // Animation logic...
                }, 2500);
            } catch (error) { console.error("Failed to execute V2 save:", error); }
        });
    }
========================================== */

// ==========================================
// 🚀 V2.0.0 EASTER EGG & SECRET DOOR (STABLE EDITION - ACTIVE CODE)
// ==========================================
    const easterEggOverlay = document.getElementById('easter-egg-overlay');
    const easterEggAudio = document.getElementById('easter-egg-audio');
    const versionTrigger = document.getElementById('version-trigger');

// --- [1] دالة فتح الباب السري ---
    const openEasterEgg = () => {
        if (easterEggOverlay) {
            const textContent = document.getElementById('easter-egg-content');
            const gallery = document.getElementById('easter-egg-gallery');

            // دائماً أظهر الصفحة الأولى (النصب التذكاري) وأخفِ الألبوم عند أول دخول
            if (textContent) textContent.classList.remove('hidden', 'opacity-0', 'scale-95');
            if (gallery) gallery.classList.add('hidden', 'opacity-0', 'translate-y-10');

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

// --- [2] الباب السري: النقر 3 مرات بسرعة على رقم الإصدار ---
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

// --- [3] إغلاق الواجهة وإيقاف الصوت بنعومة ---
    const closeFunctions = () => {
        if (easterEggOverlay) easterEggOverlay.classList.add('opacity-0');
        if (easterEggAudio) {
            let vol = easterEggAudio.volume;
            let fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    easterEggAudio.volume = vol;
                } else {
                    clearInterval(fadeOut);
                    easterEggAudio.pause();
                    easterEggAudio.currentTime = 0;
                }
            }, 100);
        }
        setTimeout(() => { if (easterEggOverlay) easterEggOverlay.classList.add('hidden'); }, 1000);
    };

// Event Delegation للأزرار
    document.addEventListener('click', (e) => {
        if (e.target.id === 'close-easter-egg' || e.target.id === 'close-gallery-btn') {
            closeFunctions();
        }
    });

// --- [4] الانتقال من صفحة النصب التذكاري إلى الألبوم السري ---
    const proceedBtn = document.getElementById('proceed-to-gallery-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            const textContent = document.getElementById('easter-egg-content');
            const gallery = document.getElementById('easter-egg-gallery');

            if (textContent) textContent.classList.add('opacity-0', 'scale-95');

            setTimeout(() => {
                if (textContent) textContent.classList.add('hidden');
                if (gallery) {
                    const scrollContainer = gallery.closest('.overflow-y-auto');
                    if (scrollContainer) scrollContainer.scrollTop = 0;

                    gallery.classList.remove('hidden');
                    setTimeout(() => gallery.classList.remove('opacity-0', 'translate-y-10'), 50);
                }
            }, 800);
        });
    }

// --- [5] سحر الظهور المتتابع للصور في الألبوم ---
    document.querySelectorAll('.polaroid').forEach((p, index) => {
        p.style.animationDelay = `${index * 0.4}s`;
        p.addEventListener('animationend', () => {
            p.style.animation = 'none';
            p.style.opacity = '1';
            p.style.transform = 'rotate(var(--rot))';
        });
    });

// ==========================================
// 🌀 THE QUANTUM TELEPORTER (JORDAN ↔ PALESTINE ROUTE)
// ==========================================
//     const teleportBtn = document.getElementById('teleport-btn');
//     const teleportWho = document.getElementById('teleport-who');
//     const teleportWhere = document.getElementById('teleport-where');
//     const teleportOverlay = document.getElementById('teleport-overlay');
//     const flightPath = document.getElementById('flight-path');
//     const flightLine = document.getElementById('flight-line');
//     const flightSpark = document.getElementById('flight-spark');
//     const passportStamp = document.getElementById('passport-stamp');
//     const stampLocation = document.getElementById('stamp-location');
//     const stampNote = document.getElementById('stamp-note');
//
//     const routeStartFlag = document.getElementById('route-start-flag');
//     const routeStartText = document.getElementById('route-start-text');
//     const routeEndFlag = document.getElementById('route-end-flag');
//     const routeEndText = document.getElementById('route-end-text');
//     const gradStart = document.getElementById('grad-start');
//     const gradEnd = document.getElementById('grad-end');
//
//     const warpAudio = document.getElementById('warp-audio');
//     const stampAudio = document.getElementById('stamp-audio');
//
//     if (teleportBtn) {
//         teleportBtn.addEventListener('click', async () => {
//             const who = teleportWho.value;
//             const where = teleportWhere.value;
//
//             teleportBtn.disabled = true;
//             teleportBtn.innerHTML = '<span class="text-sm font-bold text-white tracking-widest">Routing Flight... ✈️</span>';
//
//             // 1. إعداد مسار الرحلة الديناميكي (الأعلام والأسماء)
//             if (where === 'KafrKanna') {
//                 // الانطلاق من الأردن إلى فلسطين
//                 routeStartFlag.innerText = '🇯🇴';
//                 routeStartText.innerText = 'Jordan';
//                 routeEndFlag.innerText = '🇵🇸';
//                 routeEndText.innerText = 'Palestine';
//                 gradStart.setAttribute('stop-color', '#34d399'); // أخضر للأردن
//                 gradEnd.setAttribute('stop-color', '#f472b6');   // زهري لفلسطين
//             } else {
//                 // الانطلاق من فلسطين إلى الأردن
//                 routeStartFlag.innerText = '🇵🇸';
//                 routeStartText.innerText = 'Palestine';
//                 routeEndFlag.innerText = '🇯🇴';
//                 routeEndText.innerText = 'Jordan';
//                 gradStart.setAttribute('stop-color', '#f472b6'); // زهري لفلسطين
//                 gradEnd.setAttribute('stop-color', '#34d399');   // أخضر للأردن
//             }
//
//             // 2. فك قفل الصوت وتجهيز الشاشة
//             if (stampAudio) { stampAudio.volume = 0; stampAudio.play().then(() => { stampAudio.pause(); stampAudio.currentTime = 0; stampAudio.volume = 1; }).catch(e => {}); }
//
//             teleportOverlay.classList.remove('hidden');
//             setTimeout(() => teleportOverlay.classList.remove('opacity-0'), 50);
//
//             try {
//                 await fetch(`${API_BASE_URL}/api/teleport`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: who, destination: where }) });
//             } catch (e) { console.error(e); }
//
//             // 3. تشغيل صوت الرحلة الهادئ
//             if (warpAudio) { warpAudio.currentTime = 0; warpAudio.volume = 0.5; warpAudio.play().catch(e => {}); }
//
//             // 4. رسم الخط الطائر بين البلدين
//             setTimeout(() => {
//                 flightPath.classList.add('animate-map-reveal');
//                 flightLine.classList.add('animate-draw-line');
//                 flightSpark.classList.add('animate-spark-fly');
//             }, 800);
//
//             await new Promise(resolve => setTimeout(resolve, 3000));
//
//             // 5. إخفاء المسار
//             flightPath.classList.remove('animate-map-reveal');
//             setTimeout(() => {
//                 flightLine.classList.remove('animate-draw-line');
//                 flightSpark.classList.remove('animate-spark-fly');
//             }, 700);
//
//             // 6. تجهيز بطاقة الوصول (Boarding Pass)
//             stampLocation.innerText = where === 'Jordan' ? 'JORDAN 🇯🇴' : 'KAFR KANNA 🇵🇸';
//             let themeColor = where === 'Jordan' ? 'text-emerald-400' : 'text-pink-400';
//             stampLocation.className = `text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md ${themeColor}`;
//
//             if (who === 'Mohammad' && where === 'KafrKanna') {
//                 stampNote.innerHTML = 'Traveler: <span class="text-white font-bold">7amodee 👨🏻‍💻</span><br><span class="text-[10px] text-slate-500 uppercase mt-1 block">To: ZoZo 👸🏻</span>';
//             } else if (who === 'Zainab' && where === 'Jordan') {
//                 stampNote.innerHTML = 'Traveler: <span class="text-white font-bold">ZoZo 👸🏻</span><br><span class="text-[10px] text-slate-500 uppercase mt-1 block">To: 7amodee 👨🏻‍💻</span>';
//             } else if (who === 'Mohammad' && where === 'Jordan') {
//                 stampNote.innerHTML = 'Returning Base: <span class="text-white font-bold">7amodee 👨🏻‍💻</span>';
//             } else if (who === 'Zainab' && where === 'KafrKanna') {
//                 stampNote.innerHTML = 'Returning Base: <span class="text-white font-bold">ZoZo 👸🏻</span>';
//             }
//
//             // 7. إظهار بطاقة الوصول بصوت هادئ
//             setTimeout(() => {
//                 passportStamp.classList.add('stamp-elegant');
//                 if (stampAudio) { stampAudio.currentTime = 0; stampAudio.volume = 0.6; stampAudio.play().catch(e => {}); }
//             }, 500);
//
//             await new Promise(resolve => setTimeout(resolve, 3500));
//
//             // 8. إغلاق البوابة
//             teleportOverlay.classList.add('opacity-0');
//             setTimeout(() => {
//                 teleportOverlay.classList.add('hidden');
//                 passportStamp.classList.remove('stamp-elegant');
//                 teleportBtn.disabled = false;
//                 teleportBtn.innerHTML = '<span class="text-sm font-bold text-white tracking-wide">Initiate Flight</span><span class="text-lg">✈️</span>';
//             }, 1000);
//         });
//     }

    // --- 🚀 OUR GOALS LOGIC ---
    const goalsList = document.getElementById('goals-list');
    const addGoalForm = document.getElementById('add-goal-form');

// 1. جلب الأهداف من السيرفر
    const fetchGoals = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/goals`); // تأكد من إنشاء هذا الـ API في الـ C#
            const items = await response.json();
            renderGoals(items);
        } catch (error) { console.error("Failed to fetch goals", error); }
    };

// 2. رسم الأهداف على الشاشة
    // 🌟 دالة تحديث شريط تقدم الأهداف
    const updateGoalsProgress = (total, completed) => {
        const progressText = document.getElementById('goals-progress-text');
        const progressBar = document.getElementById('goals-progress-bar');

        if (progressText && progressBar) {
            progressText.innerText = `${completed} / ${total}`;

            // حساب النسبة المئوية
            const percentage = total === 0 ? 0 : (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;

            // تحويل اللون للأخضر إذا اكتملت كل الأهداف
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

// 2. رسم الأهداف على الشاشة (محدثة)
    const renderGoals = (items) => {
        if (!goalsList) return;
        goalsList.innerHTML = '';

        let completedCount = 0; // 🎯 عداد الإنجاز

        items.forEach((item) => {
            const isDone = item.isCompleted;
            if (isDone) completedCount++; // زيادة العداد إذا كان الهدف مكتملاً

            // ستايل أنحف وأكثر أناقة ليتناسب مع الحاوية الجديدة
            const bgClass = isDone
                ? "bg-indigo-500/10 border-indigo-500/30 opacity-60"
                : "bg-white/5 border-transparent hover:border-indigo-500/30 hover:bg-white/10";

            const textClass = isDone ? "text-slate-400 line-through decoration-indigo-500/50" : "text-white";
            const icon = isDone ? "✅" : "🎯";

            const card = document.createElement('div');
            // قللنا الـ padding وجعلنا الحواف مدورة بشكل أصغر (rounded-xl)
            card.className = `flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300 group ${bgClass}`;

            card.innerHTML = `
            <div class="flex items-center gap-4 flex-grow cursor-pointer" onclick="toggleGoal(${item.id})">
                <div class="text-xl flex-shrink-0 transition-transform active:scale-75 select-none">${icon}</div>
                <h4 class="${textClass} font-medium text-sm md:text-base leading-snug flex-grow transition-all select-none">${item.title}</h4>
            </div>
            
            <button onclick="deleteGoal(${item.id})" class="text-slate-500 hover:text-rose-400 p-2 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90 flex-shrink-0 ml-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
            goalsList.appendChild(card);
        });

        // 🎯 استدعاء دالة تحديث الشريط بعد الانتهاء من رسم كل العناصر وحساب المجموع
        updateGoalsProgress(items.length, completedCount);
    };

// 3. إضافة هدف جديد
    if (addGoalForm) {
        addGoalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '...';

            try {
                await fetch(`${API_BASE_URL}/api/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: document.getElementById('goal-title').value,
                        isCompleted: false
                    })
                });
                addGoalForm.reset();
                fetchGoals();
            } catch (error) { console.error("Save failed", error); }
            finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Add';
            }
        });
    }

// 4. تغيير حالة الهدف (إنجاز / تراجع)
    window.toggleGoal = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'PUT' });
            fetchGoals();
        } catch (error) { console.error("Update failed", error); }
    };

// 5. حذف هدف
    window.deleteGoal = async (id) => {
        if(confirm('Delete this goal?')) {
            await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'DELETE' });
            fetchGoals();
        }
    };

// تشغيل جلب الأهداف عند تحميل الصفحة
    fetchGoals();

    // ==========================================
// 📖 THE VAULT SECRET DIARY MODULE (COMPLETE)
// ==========================================

    const MOHAMMAD_DIARY_PWD = "m1";
    const ZOZO_DIARY_PWD = "9863";

    let currentDiaryOwner = null;
    let diaryAutoSaveTimer;
    let isSavingDiary = false;

// --- 1. GATEWAY LOGIC (البوابة) ---
    window.openDiaryGateway = () => {
        const gateway = document.getElementById('diary-gateway');
        if(gateway) {
            gateway.classList.remove('opacity-0', 'pointer-events-none');
            document.getElementById('diary-password-input').value = '';
            setTimeout(() => document.getElementById('diary-password-input').focus(), 100);
        }
    };

    window.closeDiaryGateway = () => {
        const gateway = document.getElementById('diary-gateway');
        if(gateway) {
            gateway.classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('diary-error-msg').classList.add('opacity-0');
        }
    };

    window.handleDiaryKeyPress = (event) => {
        if (event.key === 'Enter') window.unlockDiary();
    };

    window.unlockDiary = () => {
        const input = document.getElementById('diary-password-input').value;
        const errorMsg = document.getElementById('diary-error-msg');

        if (input === MOHAMMAD_DIARY_PWD) {
            currentDiaryOwner = "Mohammad";
            window.launchDiaryMode();
        } else if (input === ZOZO_DIARY_PWD) {
            currentDiaryOwner = "Zainab";
            window.launchDiaryMode();
        } else {
            errorMsg.classList.remove('opacity-0');
            setTimeout(() => errorMsg.classList.add('opacity-0'), 3000);
        }
    };

    window.launchDiaryMode = () => {
        window.closeDiaryGateway();
        window.openDiaryCanvas();
    };

// --- 2. CANVAS LOGIC (شاشة الدفتر والحفظ) ---
    window.openDiaryCanvas = async () => {
        const canvas = document.getElementById('diary-canvas');
        const textarea = document.getElementById('diary-textarea');
        const status = document.getElementById('diary-status');

        if(!canvas) return;

        canvas.classList.remove('opacity-0', 'pointer-events-none');
        textarea.value = '';
        status.innerText = 'LOADING...';
        status.classList.remove('text-rose-500', 'text-emerald-400');
        status.classList.add('text-indigo-400');

        try {
            const response = await fetch(`https://zainabvault-v2-0-0.onrender.com/api/diary/${currentDiaryOwner}`);
            if(response.ok) {
                const data = await response.json();
                textarea.value = data.content || '';
                status.innerText = 'SYNCED ✅';
                status.classList.replace('text-indigo-400', 'text-emerald-400');
            }
        } catch(e) {
            status.innerText = 'CONNECTION ERROR ❌';
            status.classList.replace('text-indigo-400', 'text-rose-500');
        }
    };

    window.closeDiaryCanvas = () => {
        window.saveDiary(true); // حفظ إجباري عند الإغلاق
        const canvas = document.getElementById('diary-canvas');
        if(canvas) canvas.classList.add('opacity-0', 'pointer-events-none');
    };

    window.saveDiary = async (isManual = false) => {
        if(isSavingDiary) return;

        const textarea = document.getElementById('diary-textarea');
        const status = document.getElementById('diary-status');
        const content = textarea.value;

        status.innerText = 'SAVING...';
        status.classList.remove('text-emerald-400', 'text-rose-500', 'text-slate-400');
        status.classList.add('text-indigo-400');
        isSavingDiary = true;

        try {
            // أضفنا ?isManual=${isManual} في نهاية الرابط
            const response = await fetch(`https://zainabvault-v2-0-0.onrender.com/api/diary?isManual=${isManual}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: currentDiaryOwner,
                    content: content
                })
            });

            if(response.ok) {
                status.innerText = isManual ? 'FORCE SAVED ✅' : 'AUTO-SAVED ✅';
                status.classList.replace('text-indigo-400', 'text-emerald-400');
            } else {
                throw new Error("Failed to save");
            }
        } catch(e) {
            status.innerText = 'SAVE FAILED ❌';
            status.classList.replace('text-indigo-400', 'text-rose-500');
        } finally {
            isSavingDiary = false;
        }
    };

    window.handleDiaryInput = () => {
        const status = document.getElementById('diary-status');

        status.innerText = 'TYPING...';
        status.classList.remove('text-emerald-400', 'text-rose-500', 'text-indigo-400');
        status.classList.add('text-slate-400');

        clearTimeout(diaryAutoSaveTimer);

        diaryAutoSaveTimer = setTimeout(() => {
            window.saveDiary(false);
        }, 2000);
    };

    // 🚨 Emergency Developer Override (Secret Knock)
    window.emergencyBypass = () => {
        const overrideKey = prompt("System Core Locked. Enter Override Key:");

        if (overrideKey === "m1") {
            console.log("🛠️ Emergency Bypass Activated.");

            // 1. Hide the Maintenance Screen
            const maintenanceScreen = document.getElementById('maintenance-screen');
            if (maintenanceScreen) maintenanceScreen.classList.add('hidden');

            // 2. Hide Login Screen (just in case it's in the background)
            const loginScreen = document.getElementById('login-screen'); // Ensure this ID matches your login wrapper
            if (loginScreen) loginScreen.classList.add('hidden');

            // 3. Show Dashboard
            const dashboard = document.getElementById('dashboard'); // Ensure this ID matches your dashboard wrapper
            if (dashboard) {
                dashboard.classList.remove('hidden');
                dashboard.classList.add('fade-in');
            }

            // 4. Reveal the Developer Toggle Button
            const devBtn = document.getElementById('dev-toggle-btn');
            if(devBtn) devBtn.classList.remove('hidden');

            // 5. Update UI Nav Elements
            if(document.getElementById('bottom-nav')) document.getElementById('bottom-nav').classList.remove('hidden');
            if(document.getElementById('sos-btn')) document.getElementById('sos-btn').classList.remove('hidden');
            if(document.getElementById('diary-btn')) document.getElementById('diary-btn').classList.remove('hidden');

            window.scrollTo(0, 0);
        } else if (overrideKey !== null) {
            // If they type the wrong thing (or Zozo clicks it by accident)
            alert("Access Denied.");
        }
    };

    const bgPhotos = document.querySelectorAll('.secret-bg-photo');

    // --- 🎭 THE SECRET CINEMATIC TRIGGER ---

    const secretTrigger = document.getElementById('secret-trigger');
    const secretExperience = document.getElementById('secret-experience');
    const closeSecretBtn = document.getElementById('close-secret');
    const secretVoice = document.getElementById('secret-voice');
    const secretBgm = document.getElementById('secret-bgm');
    const photos = document.querySelectorAll('.secret-photo');

// استخدام أسماء فريدة لتجنب التضارب مع الأكواد القديمة
    let cinematicClickCount = 0;
    let cinematicClickTimeout;
    let cinematicPhotoInterval;
    let cinematicPhotoIndex = 0;

    if (secretTrigger) {
        secretTrigger.addEventListener('click', () => {
            cinematicClickCount++;

            clearTimeout(cinematicClickTimeout);
            cinematicClickTimeout = setTimeout(() => { cinematicClickCount = 0; }, 1500);

            if (cinematicClickCount === 3) {
                cinematicClickCount = 0;
                startSecretExperience();
            }
        });
    }

    // مصفوفة النصوص وتوقيت ظهورها (بالملي ثانية) لتتطابق مع التسجيل الفعلي
    const subtitlesSequence = [
        { text: "زوزو...", time: 0 },
        { text: "أنا ما صممت هذا المكان بس عشان أحفظ ذكرياتنا...", time: 1500 },
        { text: "أنا صممته عشان يكون مراية، تشوفي فيها نفسك بعيوني.", time: 5500 },
        { text: "في كل مرة بشوف فيها ملامحك...", time: 10500 },
        { text: "بتأكد إنك أجمل وأصدق شي صار بحياتي.", time: 14000 },
        { text: "أنا بحب نسختك الأصلية... بكل تفاصيلها الطبيعية...", time: 18500 },
        { text: "وما بدي إشي يتغير.", time: 22800 },
        { text: "إنتِ المعيار اللي بقيس فيه كل شي حلو.", time: 25500 },
        { text: "خليكي دائماً واثقة إنك بعيوني...", time: 28800 },
        { text: "أجمل بنت شافتها عيني، وأغلى شي بملكه.", time: 31200 },
        { text: "و... بحبك ❤️", time: 34400 } // اللحظة الحاسمة بدقة
    ];

    let subtitleTimeouts = [];

    function startSecretExperience() {
        // 1. إظهار الشاشة وبدء الغبار النجمي
        secretExperience.classList.remove('pointer-events-none');
        secretExperience.classList.replace('opacity-0', 'opacity-100');
        startStardust(); // تشغيل السحر البصري

        // 2. تشغيل الصوتيات
        if(secretBgm) {
            secretBgm.volume = 0.04;
            secretBgm.play().catch(e => console.log("BGM play blocked", e));
        }
        setTimeout(() => {
            if(secretVoice) secretVoice.play().catch(e => console.log("Voice play blocked", e));
        }, 1000);

        // 3. عرض الصور (الصور مكتملة بحواف ناعمة + خلفية ساطعة)
        cinematicPhotoIndex = 0;
        if(photos.length > 0) {
            photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95');
            photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105');

            if(bgPhotos.length > 0) {
                bgPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                // رفعنا قوة الخلفية لتشع بقوة
                bgPhotos[cinematicPhotoIndex].classList.add('opacity-80');
            }

            cinematicPhotoInterval = setInterval(() => {
                photos[cinematicPhotoIndex].classList.remove('opacity-100', 'blur-0', 'scale-105');
                photos[cinematicPhotoIndex].classList.add('opacity-0', 'blur-xl', 'scale-95');

                if(bgPhotos.length > 0) {
                    bgPhotos[cinematicPhotoIndex].classList.remove('opacity-80');
                    bgPhotos[cinematicPhotoIndex].classList.add('opacity-0');
                }

                let nextIndex = (cinematicPhotoIndex + 1) % photos.length;

                setTimeout(() => {
                    cinematicPhotoIndex = nextIndex;
                    photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95');
                    photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105');

                    if(bgPhotos.length > 0) {
                        bgPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                        bgPhotos[cinematicPhotoIndex].classList.add('opacity-80');
                    }
                }, 100);

            }, 5500);
        }

        // 4. تشغيل الترجمة السينمائية (The Whispering Blur)
        const subtitleEl = document.getElementById('cinematic-subtitle');
        subtitlesSequence.forEach(item => {
            const timeout = setTimeout(() => {
                // تبخير النص القديم في الضباب
                subtitleEl.classList.replace('opacity-100', 'opacity-0');
                subtitleEl.classList.replace('blur-0', 'blur-md');
                subtitleEl.classList.replace('translate-y-0', 'translate-y-2');

                setTimeout(() => {
                    subtitleEl.innerText = item.text;
                    // سحب النص الجديد من العدم إلى التركيز التام
                    subtitleEl.classList.replace('opacity-0', 'opacity-100');
                    subtitleEl.classList.replace('blur-md', 'blur-0');
                    subtitleEl.classList.replace('translate-y-2', 'translate-y-0');
                }, 1000);

            }, item.time);
            subtitleTimeouts.push(timeout);
        });

        // 5. إظهار زر الإغلاق بذكاء وحماية
        setTimeout(() => {
            if(closeSecretBtn) {
                closeSecretBtn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
                closeSecretBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }, 39000); // يظهر بعد انتهاء التسجيل الصوتي
    }

// إنهاء التجربة (منطق التنظيف الجذري)
    if (closeSecretBtn) {
        closeSecretBtn.addEventListener('click', () => {
            // 1. إخفاء الشاشة الرئيسية
            secretExperience.classList.remove('opacity-100');
            secretExperience.classList.add('opacity-0');
            setTimeout(() => {
                secretExperience.classList.add('pointer-events-none');
            }, 1000);

            // 2. إيقاف وتصفير الصوتيات
            if(secretVoice) {
                secretVoice.pause();
                secretVoice.currentTime = 0;
            }
            if(secretBgm) {
                secretBgm.pause();
                secretBgm.currentTime = 0;
            }

            // إعادة الصور والخلفيات لوضع الاستعداد
            clearInterval(cinematicPhotoInterval);
            photos.forEach(p => {
                p.classList.remove('opacity-100', 'blur-0', 'scale-105');
                p.classList.add('opacity-0', 'blur-xl', 'scale-95');
            });
            bgPhotos.forEach(bg => {
                bg.classList.remove('opacity-80');
                bg.classList.add('opacity-0');
            });

            // 4. إخفاء الزر السري وتعطيل الضغط عليه تماماً
            closeSecretBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            closeSecretBtn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');

            // 5. إيقاف الغبار النجمي وتصفير الترجمة
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

    // --- 🌟 STARDUST PARTICLE SYSTEM ---
    let animationFrameId;

    function startStardust() {
        const canvas = document.getElementById('stardust-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        const numberOfParticles = 70; // عدد الجزيئات

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2; // حجم صغير جداً
                this.speedX = Math.random() * 0.5 - 0.25; // حركة بطيئة يميناً ويساراً
                this.speedY = Math.random() * 0.5 - 0.25; // حركة بطيئة للأعلى والأسفل
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; // لون ذهبي خافت
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

    // --- 📱 Bottom Navigation Logic (5 Tabs) ---
    window.switchTab = (tabName) => {
        // 1. إخفاء جميع الصفحات
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-memories').classList.add('hidden');
        document.getElementById('view-calendar').classList.add('hidden');
        document.getElementById('view-court').classList.add('hidden');
        document.getElementById('view-goals').classList.add('hidden'); // 👈 السطر الجديد

        // 2. إعادة جميع الأزرار للحالة الباهتة (Inactive)
        const inactiveClass = "flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all";
        document.getElementById('tab-home').className = inactiveClass;
        document.getElementById('tab-memories').className = inactiveClass;
        document.getElementById('tab-calendar').className = inactiveClass;
        document.getElementById('tab-court').className = inactiveClass;
        document.getElementById('tab-goals').className = inactiveClass; // 👈 السطر الجديد

        // 3. إظهار الصفحة المستهدفة
        document.getElementById(`view-${tabName}`).classList.remove('hidden');

        // 4. إضاءة وتكبير الزر المستهدف (Active)
        const activeClass = "flex flex-col items-center gap-1 text-accent transition-all scale-110 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]";
        document.getElementById(`tab-${tabName}`).className = activeClass;

        // 5. رفع الصفحة للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});