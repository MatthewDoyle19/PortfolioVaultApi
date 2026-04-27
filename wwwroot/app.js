document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE_URL = '';

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

    const linkGrid = document.getElementById('link-grid');
    const addLinkForm = document.getElementById('add-link-form');

    const fetchLinks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/links`);
            const links = await response.json();
            renderLinks(links);
        } catch (error) { console.error(error); }
    };

    const renderLinks = (links) => {
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

    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        await fetch(`${API_BASE_URL}/api/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url })
        });
        addLinkForm.reset();
        fetchLinks();
    });

    window.deleteLink = async (id) => {
        await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
        fetchLinks();
    };

    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();
            const countElement = document.getElementById('commit-count');
            if (countElement) countElement.innerText = commits.length;
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

            const imageHtml = commit.imageUrl ? `<img src="${commit.imageUrl}" alt="Memory" class="polaroid-image">` : '';
            const audioHtml = commit.audioUrl ? `<audio controls src="${commit.audioUrl}"></audio>` : '';

            item.innerHTML = `
            <div class="flex justify-between items-start mb-4 mt-1">
                <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 shadow-inner shadow-accent/10">
                    ${formattedDate}
                </span>
                <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <p class="text-sm text-slate-200 mb-2 font-medium leading-relaxed tracking-wide">${commit.message}</p>
            ${imageHtml}
            ${audioHtml}
        `;
            commitTimeline.appendChild(item);
        });
    };

    // سنستخدم الرابط الشامل (auto) لكي يقبل Cloudinary الصور والصوتيات من أبل بدون مشاكل
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/i7dhiwzb/auto/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'i7dhiwzb';

    let audioBlob = null;
    let mediaRecorder = null;
    let audioChunks = [];

    const recordBtn = document.getElementById('record-btn');
    const recordStatus = document.getElementById('record-status');

    recordBtn.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                audioChunks = [];

                let preview = document.getElementById('audio-preview');
                if (preview) preview.classList.add('hidden');

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    // تم التعديل إلى صيغة متوافقة مع جميع الأجهزة (mp4)
                    audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });
                    recordBtn.innerHTML = '✅ Saved';
                    recordBtn.classList.replace('text-rose-400', 'text-emerald-400');
                    recordBtn.classList.replace('bg-rose-500/20', 'bg-emerald-500/20');
                    recordBtn.classList.replace('border-rose-500/30', 'border-emerald-500/30');

                    if (!preview) {
                        preview = document.createElement('audio');
                        preview.id = 'audio-preview';
                        preview.controls = true;
                        preview.className = 'w-full mt-4 mb-2 filter drop-shadow-lg';

                        // الإصلاح: تحديد الفورم والزر الخاص به حصراً
                        const commitForm = document.getElementById('add-commit-form');
                        const specificSubmitBtn = commitForm.querySelector('button[type="submit"]');
                        commitForm.insertBefore(preview, specificSubmitBtn);
                    }
                    preview.src = URL.createObjectURL(audioBlob);
                    preview.classList.remove('hidden');
                });

                recordBtn.innerHTML = '🛑 Stop';
                recordStatus.classList.remove('hidden');
            } catch (err) {
                console.error("Mic access denied", err);
                alert("Please allow microphone access to record memories.");
            }
        }
        else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            recordStatus.classList.add('hidden');
        }
    });

    const addCommitForm = document.getElementById('add-commit-form');

    addCommitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('commit-date').value;
        const message = document.getElementById('commit-message').value;
        const imageFile = document.getElementById('commit-image').files[0];

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Encrypting & Storing... ⏳';
        submitBtn.disabled = true;

        try {
            let finalImageUrl = null;
            let finalAudioUrl = null;

            if (imageFile) {
                const cloudFormData = new FormData();
                cloudFormData.append('file', imageFile);
                cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const cloudinaryRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: cloudFormData });
                const cloudData = await cloudinaryRes.json();
                finalImageUrl = cloudData.secure_url;
            }

            if (audioBlob) {
                const cloudAudioData = new FormData();
                // تم إعطاء اسم وهمي بصيغة أبل لكي لا يرفضه السيرفر
                cloudAudioData.append('file', audioBlob, 'voice.mp4');
                cloudAudioData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const cloudinaryAudioRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: cloudAudioData });
                const cloudAudio = await cloudinaryAudioRes.json();
                finalAudioUrl = cloudAudio.secure_url;
                console.log("Audio Uploaded Successfully! URL:", finalAudioUrl); // للمراقبة
            }

            const newCommit = {
                date: date,
                message: message,
                imageUrl: finalImageUrl,
                audioUrl: finalAudioUrl
            };

            const response = await fetch(`${API_BASE_URL}/api/commits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCommit)
            });

            if (response.ok) {
                addCommitForm.reset();
                audioBlob = null;
                recordBtn.innerHTML = '🎤 Record';
                recordBtn.classList.replace('text-emerald-400', 'text-rose-400');
                recordBtn.classList.replace('bg-emerald-500/20', 'bg-rose-500/20');
                recordBtn.classList.replace('border-emerald-500/30', 'border-rose-500/30');

                let preview = document.getElementById('audio-preview');
                if(preview) preview.classList.add('hidden');

                fetchCommits();
            } else {
                console.error("Backend rejected the memory.");
                alert("Database Error! Did you update Program.cs?");
            }
        } catch (error) {
            console.error('Error during upload:', error);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    window.deleteCommit = async (id) => {
        if(confirm('Are you sure you want to delete this memory?')) {
            await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
            fetchCommits();
        }
    };

    const penaltyBtn = document.getElementById('penalty-btn');
    const modal = document.getElementById('penalty-modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('close-modal-btn');

    const openModal = () => {
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    };

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    };

    penaltyBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    fetchLinks();
    fetchCommits();
});