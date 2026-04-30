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
                    loginScreen.style.display = 'none';
                    dashboard.style.display = 'block';
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

    // --- 4. ذكريات الخط الزمني ---
    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();
            if (document.getElementById('commit-count')) document.getElementById('commit-count').innerText = commits.length;
            renderCommits(commits);
        } catch (error) { console.error(error); }
    };

    const renderCommits = (commits) => {
        const commitTimeline = document.getElementById('commit-timeline');
        if (!commitTimeline) return;
        commitTimeline.innerHTML = '';
        commits.forEach((commit) => {
            const item = document.createElement('div');
            item.className = 'polaroid-card group fade-in';
            const dateObj = new Date(commit.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            item.innerHTML = `
                <div class="flex justify-between items-start mb-4 mt-1">
                    <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 shadow-inner shadow-accent/10">${formattedDate}</span>
                    <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <p class="text-sm text-slate-200 mb-2 font-medium leading-relaxed tracking-wide">${commit.message}</p>
                ${commit.imageUrl ? `<img src="${commit.imageUrl}" alt="Memory" class="polaroid-image">` : ''}
                ${commit.audioUrl ? `<audio controls src="${commit.audioUrl}"></audio>` : ''}
            `;
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
                    preview.className = 'w-full mt-4 mb-2 filter drop-shadow-lg';
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
                    audioUrl: finalAudioUrl
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

    // --- ⚖️ نظام محكمة القلوب المطور v2.0 (أحكام المسافات واللقاء الأول) ---
    const penaltyVault = {
        Mohammad: [
            { title: "لياقة اللقاء الأول 💪", desc: "عليك القيام بـ 20 تمرين ضغط (Push-ups) الآن لضمان لياقتك عند استقبالها." },
            { title: "دليل سياحي 🗺️", desc: "أرسل لزينب صورة لمكان في إربد أو الأردن تنوي أخذها إليه في زيارتها القادمة." },
            { title: "تحدي الصبر ⏳", desc: "ممنوع لمس هاتفك لمدة 30 دقيقة (إلا للدراسة) لتدريب نفسك على التركيز قبل لقائكما." },
            { title: "كرم أردني 🇯🇴", desc: "عليك إرسال صورة لأفضل أكلة شعبية أكلتها اليوم لتعرفها على المطبخ الأردني." },
            { title: "اعتراف تقني 💻", desc: "أرسل لزينب سكرين شوت لكود برمجته اليوم واشرح لها وظيفة سطر واحد فيه بذكاء." },
            { title: "وضعية الـ Plank 🧘‍♂️", desc: "عليك الثبات في وضعية البلانك لمدة دقيقة كاملة الآن.. القوة والتحمل مطلوبان!" },
            { title: "وعد إربداوي 🤝", desc: "اكتب على ورقة 'وعد بضيافة ملكية' وصورها لزينب لتكون ديناً عليك عند اللقاء." }
        ],
        Zainab: [
            { title: "رسالة من الجليل 🌸", desc: "التقطي صورة لجمال الطبيعة في كفر كنا الآن وأرسليها لمحمد كتحية صباحية أو مسائية." },
            { title: "صوت فلسطين 🎤", desc: "سجلي رسالة صوتية قصيرة تدندن بكلمات من أغنية تراثية فلسطينية تحبينها." },
            { title: "تحدي القراءة 📖", desc: "عليكِ قراءة 5 صفحات من كتابك الحالي وإرسال ملخص صوتي بسيط لمحمد." },
            { title: "تحضيرات السفر ✈️", desc: "اذكري لمحمد أول شيء تنوين فعله فور وصولك للأراضي الأردنية." },
            { title: "خط عربي أصيل ✍️", desc: "اكتبي اسم 'محمد' بخط يدكِ بشكل جميل على ورقة وصوريه له." },
            { title: "تحدي الذاكرة 🧠", desc: "اذكري لمحمد أول جملة قالها لكِ في أول محادثة بينكما وجعلتكِ تبتسمين." },
            { title: "فيديو الابتسامة 😊", desc: "أرسلي فيديو مدته 3 ثوانٍ فقط وأنتِ تبتسمين للكاميرا (بدون كلام) لرفع معنوياته." }
        ],
        Shared: [
            { title: "ضريبة الابتسامة 😊", desc: "على المُعاقب إرسال صورة سيلفي 'عفوية' ومبتسمة للطرف الآخر فوراً." },
            { title: "ساعة تركيز 📵", desc: "ممنوع استخدام أي تطبيق تواصل اجتماعي لمدة ساعة كاملة من الآن (ركز في دراستك!)." },
            { title: "اعتذار رقيق 🤍", desc: "سجل رسالة صوتية تعتذر فيها عن آخر لحظة 'عناد' صدرت منك بأسلوب فكاهي ولطيف." },
            { title: "شرب الماء 💧", desc: "اشرب كوبين كبيرين من الماء الآن.. الصحة أولاً لكي تكون في أفضل حال عند اللقاء!" },
            { title: "قائمة الامتنان ✨", desc: "اذكر 3 صفات تجعل الطرف الآخر مميزاً جداً بالنسبة لك في هذه اللحظة." },
            { title: "تخطيط المستقبل 📅", desc: "اقترح تاريخاً (يوم وشهر) تراه مناسباً كهدف أولي للقاء الأول في الأردن." },
            { title: "تحدي الخلفية 📱", desc: "عليك وضع صورة يختارها الطرف الآخر كخلفية لهاتفك لمدة 24 ساعة." },
            { title: "رسالة ورقية ✉️", desc: "اكتب رسالة من سطر واحد على ورقة، احتفظ بها في محفظتك، وصورها للآخر." },
            { title: "ذكاء عاطفي 🧠", desc: "اذكر موقفاً واحداً تصرف فيه الطرف الآخر بذكاء وهدوء مؤخراً وأثار إعجابك." },
            { title: "أمنية اللقاء 🌠", desc: "ما هو الشيء الذي تتمنى أن تراه في ملامح الطرف الآخر أول ثانية تلتقيان فيها؟" }
        ]
    };

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
    generateBtn.addEventListener('click', () => {
        const punisher = document.getElementById('punisher').value;
        const punished = document.getElementById('punished').value;

        if (punisher === punished) {
            alert("لا يمكنك معاقبة نفسك! اختر الطرف الآخر ⚖️");
            return;
        }

        // دمج الأحكام الخاصة مع المشتركة لزيادة التنوع
        const specificPool = penaltyVault[punished];
        const sharedPool = penaltyVault.Shared;
        const finalPool = specificPool.concat(sharedPool);

        const randomPenalty = finalPool[Math.floor(Math.random() * finalPool.length)];

        currentPendingPenalty = {
            punisher: punisher,
            punished: punished,
            penaltyText: randomPenalty.title + ": " + randomPenalty.desc,
            date: new Date().toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
        };

        penaltyText.innerHTML = `
            <span class="text-white block text-xs mb-1">قررت محكمة القلوب على ${punished}:</span>
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
});