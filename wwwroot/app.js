document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Security Gate Logic ---
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    // The API URL is empty because the C# backend is now hosting these files
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
            console.error("Auth failed:", error.message);
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    authKey.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // --- 2. Uptime Counter Logic ---
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

    // --- 3. Link Vault API Integration ---
    const linkGrid = document.getElementById('link-grid');
    const addLinkForm = document.getElementById('add-link-form');

    const fetchLinks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/links`);
            const links = await response.json();
            renderLinks(links);
        } catch (error) {
            console.error("Database connection failed:", error);
        }
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
                <button onclick="deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors" title="Delete Link">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            linkGrid.appendChild(card);
        });
    };

    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // STOPS THE PAGE RELOAD
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

    // --- 4. System Log (Commits) API Integration ---
    const commitTimeline = document.getElementById('commit-timeline');
    const addCommitForm = document.getElementById('add-commit-form');

    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();

            // 1. Update the counter with the actual data from the API
            const countElement = document.getElementById('commit-count');
            if (countElement) {
                countElement.innerText = commits.length;
            }

            // 2. Render the actual cards on the timeline
            renderCommits(commits);
        } catch (error) {
            console.error("Failed to fetch commits:", error);
        }
    };

    const renderCommits = (commits) => {
        commitTimeline.innerHTML = '';
        commits.forEach((commit) => {
            const item = document.createElement('div');
            item.className = 'polaroid-card group';

            // THE FIX: If there is no imageUrl, we return an empty string 
            // instead of a placeholder div.
            const imageHtml = commit.imageUrl
                ? `<img src="${commit.imageUrl}" alt="Memory" class="polaroid-image">`
                : '';

            item.innerHTML = `
            <div class="flex justify-between items-start mb-2 mt-1">
                <span class="text-xs text-accent font-bold tracking-wider">${commit.date}</span>
                <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <p class="text-sm text-slate-300 mb-3">${commit.message}</p>
            ${imageHtml}
        `;
            commitTimeline.appendChild(item);
        });
    };

    addCommitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('commit-date').value;
        const message = document.getElementById('commit-message').value;
        const imageFile = document.getElementById('commit-image').files[0]; // Grab the actual file

        // We use FormData instead of JSON to send physical files
        const formData = new FormData();
        formData.append('date', date);
        formData.append('message', message);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        await fetch(`${API_BASE_URL}/api/commits`, {
            method: 'POST',
            // Notice: We DO NOT set 'Content-Type' here. 
            // The browser sets it automatically when it sees FormData!
            body: formData
        });

        addCommitForm.reset();
        fetchCommits();
    });
    

    window.deleteCommit = async (id) => {
        await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
        fetchCommits();
    };

    // --- 5. Penalty Modal Logic ---
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

    // --- Boot Sequence ---
    fetchLinks();
    fetchCommits();
});