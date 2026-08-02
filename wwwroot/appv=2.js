import * as api from './js/api/apiClient.js';
import * as ui from './js/ui/uiManager.js';

document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    // System Maintenance Status
    window.isSystemInMaintenance = false;

    // ==========================================
// ⚙️ SYSTEM MAINTENANCE & AUTHENTICATION
// ==========================================

// 1. Check Maintenance Status on Page Load
    const checkMaintenanceStatus = async () => {
        window.isSystemInMaintenance = await api.checkMaintenanceStatus();
        if (window.isSystemInMaintenance) {
            console.log("⚙️ System is currently under maintenance.");
        }
    };

// Execute immediately and handle potential promise rejections
    checkMaintenanceStatus().catch(console.error);

// 2. Developer Toggle Function
    window.toggleMaintenanceMode = async () => {
        if(confirm("Are you sure you want to toggle the system maintenance mode?")) {
            try {
                const isMaintenance = await api.toggleMaintenanceMode();
                alert(`Update Successful! Maintenance Mode is now: ${isMaintenance ? "🔴 ENABLED" : "🟢 DISABLED"}`);
                location.reload();
            } catch (error) {
                console.error("Failed to toggle maintenance mode", error);
            }
        }
    };


// 3. Authentication & Bypass Logic
    const handleLogin = async () => {
        const key = authKey.value;

        // Secret Door (Easter Egg)
        if (key === '2027') {
            ui.triggerTawjihiEasterEgg();
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
                if(document.getElementById('deep-talks-btn')) document.getElementById('deep-talks-btn').classList.remove('hidden');
                window.scrollTo(0, 0);
            }, 500);
            return;
        }

        // Standard Login (Validates via API for Zozo/Guests)
        try {
            const result = await api.login(key);

            if (result.success) {

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
                    if(document.getElementById('deep-talks-btn')) document.getElementById('deep-talks-btn').classList.remove('hidden');
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

    // --- 2. Uptime Counter ---
    ui.initUptimeCounter();

    // --- 3. Digital Keepsakes (Links) ---
    const fetchLinks = async () => {
        try {
            const links = await api.fetchLinks();
            ui.renderLinks(links);
        } catch (error) { console.error(error); }
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
                const linkDateVal = document.getElementById('link-unlock-date-only').value;
                const linkTimeVal = document.getElementById('link-unlock-time-only').value;

                let finalLinkUnlockDate = null;
                if (linkDateVal) {
                    const timeToUse = linkTimeVal || "00:00";
                    finalLinkUnlockDate = new Date(`${linkDateVal}T${timeToUse}:00`).toISOString();
                }

                await api.addLink(
                    document.getElementById('link-title').value,
                    document.getElementById('link-url').value,
                    finalLinkUnlockDate
                );

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
            await api.deleteLink(id);
            fetchLinks();
        }
    };

    // --- 4. The Timeline ---
    const fetchCommits = async () => {
        try {
            const commits = await api.fetchCommits();

            if (document.getElementById('commit-count')) {
                document.getElementById('commit-count').innerText = commits.length;
            }

            ui.renderCommits(commits);
        } catch (error) { console.error(error); }
    };

    // --- Media & Cloudinary ---
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
                const compressedBase64 = await ui.compressImage(originalFile, 1080, 0.8);
                const resBase64 = await fetch(compressedBase64);
                const blob = await resBase64.blob();
                const compressedFile = new File([blob], "compressed_image.jpg", { type: "image/jpeg" });

                const data = await api.uploadToCloudinary(compressedFile);
                finalImageUrl = data.secure_url;
            }

            // --- Audio Upload Logic ---
            if (typeof window.audioBlob !== 'undefined' && window.audioBlob) {
                const data = await api.uploadToCloudinary(window.audioBlob);
                finalAudioUrl = data.secure_url;
            }

            // --- Date Processing ---
            const memoryDateVal = document.getElementById('memory-date').value;
            const capsuleDateVal = document.getElementById('capsule-date-only').value;
            const capsuleTimeVal = document.getElementById('capsule-time-only').value;

            let finalDate;
            if (memoryDateVal) {
                finalDate = new Date(`${memoryDateVal}T00:00:00`).toISOString();
            } else {
                finalDate = new Date().toISOString();
            }

            let finalUnlockDate = null;
            if (capsuleDateVal) {
                const timeToUse = capsuleTimeVal || "00:00";
                finalUnlockDate = new Date(`${capsuleDateVal}T${timeToUse}:00`).toISOString();
            }

            // --- Store in Database ---
            await api.addCommit({
                date: finalDate,
                message: document.getElementById('commit-message').value,
                imageUrl: finalImageUrl,
                audioUrl: finalAudioUrl,
                unlockDate: finalUnlockDate
            });

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
            await api.deleteCommit(id);
            fetchCommits();
        }
    };

    // --- 🗓️ Shared Calendar ---
    const addEventForm = document.getElementById('add-event-form');

    const fetchEvents = async () => {
        try {
            const events = await api.fetchEvents();
            ui.renderEvents(events);
        } catch (error) { console.error("Failed to fetch events", error); }
    };

    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '...';

        try {
            await api.addEvent(
                document.getElementById('event-title').value,
                document.getElementById('event-date').value,
                document.getElementById('event-type').value
            );
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
            await api.deleteEvent(id);
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
            punished: punished,
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
            await api.addPenalty({
                date: currentPendingPenalty.date,
                punisher: currentPendingPenalty.punisher,
                punished: currentPendingPenalty.punished,
                penaltyText: currentPendingPenalty.penaltyText,
                isCompleted: false
            });
            fetchPenaltiesFromServer();
            ui.closePenaltyModal();
        } catch (error) { console.error("Save failed", error); }
    });

    window.togglePenalty = async (id, isChecked) => {
        const textElement = document.getElementById(`penalty-text-${id}`);

        if (isChecked) {
            textElement.classList.add('line-through', 'text-slate-500', 'opacity-70');
            textElement.classList.remove('text-slate-200');
        } else {
            textElement.classList.remove('line-through', 'text-slate-500', 'opacity-70');
            textElement.classList.add('text-slate-200');
        }

        try {
            await api.togglePenalty(id, isChecked);
        } catch (error) {
            console.error("Error updating penalty:", error);
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
            await api.deletePenalty(id);
            fetchPenaltiesFromServer();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const fetchPenaltiesFromServer = async () => {
        try {
            const penalties = await api.fetchPenalties();
            ui.renderPenalties(penalties);
        } catch (error) { console.error(error); }
    };

    document.getElementById('close-modal-btn').addEventListener('click', ui.closePenaltyModal);

    fetchLinks();
    fetchCommits();
    fetchPenaltiesFromServer();

    // --- 📡 Mood Radar & Live Notifications ---
    let lastPenaltyCount = 0;
    let lastCommitCount = 0;
    let initialLoad = true;

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
            try {
                await api.updateMood(user, matchedKey);
                fetchSystemState();
                ui.showToast('Mood Radar', `${displayName}'s mood updated to: ${moodsList[matchedKey].text}`, moodsList[matchedKey].icon);
            } catch (error) {
                console.error("Failed to update mood", error);
            }
        } else {
            alert("Write it exactly as shown!");
        }
    };

    let lastHeartbeatId = null;
    let systemWatcherTimer; // متغير للتحكم في الحلقة الذكية

    const fetchSystemState = async () => {
        try {
            // 1. تحديث المزاج
            const moods = await api.fetchMoods();
            ui.updateMoodDisplay(moods, moodsList);

            // 2. تحديث المحكمة (بدون طلب إضافي للسيرفر!)
            const penalties = await api.fetchPenalties();
            if (!initialLoad && penalties.length > lastPenaltyCount) {
                const newestPenalty = penalties[0];
                const displayPunished = newestPenalty.punished === 'Mohammad' ? '7amodee' : (newestPenalty.punished === 'Zainab' ? 'ZoZo' : newestPenalty.punished);
                ui.showToast('⚖️ Digital Court', `New verdict issued for ${displayPunished}!`, '⚖️');
                ui.renderPenalties(penalties); // تمرير البيانات مباشرة للواجهة لتوفير الموارد
            }
            lastPenaltyCount = penalties.length;

            // 3. تحديث الذكريات (بدون طلب إضافي!)
            const commits = await api.fetchCommits();
            if (!initialLoad && commits.length > lastCommitCount) {
                ui.showToast('📸 New Memory', `A new moment was added to the Vault!`, '✨');
                ui.renderCommits(commits); // تمرير البيانات مباشرة
            }
            lastCommitCount = commits.length;

            // 4. تحديث النبضات
            const latestHb = await api.fetchLatestHeartbeat();
            if (latestHb && !initialLoad && latestHb.id > lastHeartbeatId) {
                const displaySender = latestHb.sender === 'Mohammad' ? '7amodee' : (latestHb.sender === 'Zainab' ? 'ZoZo' : latestHb.sender);
                ui.showToast('✨ Incoming Spark!', `${displaySender} is thinking of you right now...`, '❤️');
            }
            if (latestHb) {
                lastHeartbeatId = latestHb.id;
            }

            initialLoad = false;

        } catch (error) {
            console.error("System Watcher error:", error);
            const moText = document.getElementById('mohammad-mood-text');
            const zaText = document.getElementById('zainab-mood-text');
            if(moText) moText.innerText = "Connecting...";
            if(zaText) zaText.innerText = "Connecting...";
        } finally {
            // 🔥 السحر هنا: نطلب من النظام الانتظار 25 ثانية *بعد انتهاء* الدورة الحالية قبل بدء دورة جديدة
            systemWatcherTimer = setTimeout(fetchSystemState, 25000);
        }
    };

    // تشغيل النظام الذكي للمراقبة للمرة الأولى
    fetchSystemState();

    // --- 🥘 INDEPENDENT MANSAF LOGIC ---
    const mansafCountEl = document.getElementById('mansaf-count');
    const addMansafBtn = document.getElementById('add-mansaf-btn');
    const minusMansafBtn = document.getElementById('minus-mansaf-btn');

    const fetchMansafCount = async () => {
        try {
            const data = await api.fetchMansafCount();
            if (mansafCountEl) mansafCountEl.innerText = data.count;
        } catch (e) { console.error("Error loading Mansaf count", e); }
    };

    const handleMansafAction = async (change) => {
        if (!mansafCountEl) return;
        const currentCount = parseInt(mansafCountEl.innerText) || 0;

        if (change === -1 && currentCount <= 0) return;

        mansafCountEl.innerText = currentCount + change;
        mansafCountEl.classList.add('text-emerald-400', 'scale-125');
        setTimeout(() => mansafCountEl.classList.remove('text-emerald-400', 'scale-125'), 300);

        try {
            await api.updateMansafCount(change);
        } catch (error) {
            console.error("Failed to sync Mansaf", error);
            alert("Server Error: Could not save the Mansaf count! Check the console.");
            mansafCountEl.innerText = currentCount;
        }
    };

    if (addMansafBtn) addMansafBtn.addEventListener('click', () => handleMansafAction(1));
    if (minusMansafBtn) minusMansafBtn.addEventListener('click', () => handleMansafAction(-1));

    fetchMansafCount();

    // --- 🗺️ THE BUCKET LIST ---
    const addBucketForm = document.getElementById('add-bucket-form');

    const fetchBucketList = async () => {
        try {
            const items = await api.fetchBucketList();
            ui.renderBucketList(items);
        } catch (error) { console.error("Failed to fetch bucket list", error); }
    };

    if (addBucketForm) {
        addBucketForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '...';

            try {
                await api.addBucketItem(document.getElementById('bucket-title').value);
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
            await api.toggleBucketItem(id);
            fetchBucketList();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteBucketItem = async (id) => {
        if(confirm('Delete this dream from the list?')) {
            await api.deleteBucketItem(id);
            fetchBucketList();
        }
    };

    fetchBucketList();

    // --- ✨ THE SPARK (Heartbeat) LOGIC ---
    window.sendHeartbeat = async (sender) => {
        try {
            const savedHb = await api.sendHeartbeat(sender);
            lastHeartbeatId = savedHb.id;

            const targetName = sender === 'Mohammad' ? 'ZoZo 👸🏻' : '7amodee 👨🏻‍💻';
            ui.showToast('Sent! ✨', `Your spark is flying to ${targetName}!`, '🕊️');

            fetchSystemState();
        } catch (error) {
            console.error("Failed to send spark", error);
            ui.showToast('Error', 'Could not send spark. Check your connection.', '❌');
        }
    };

    // --- ✈️ THE VISIT PLANNER LOGIC (GROUPED & LOCAL TIME) ---
    const addVisitTaskForm = document.getElementById('add-visit-task-form');
    const visitStartInput = document.getElementById('visit-start');
    const visitEndInput = document.getElementById('visit-end');

    let activeVisitDatesId = null;

    const fetchVisitData = async () => {
        try {
            const trips = await api.fetchVisitData();
            ui.renderGroupedTrips(trips);

            if (trips.length > 0) {
                activeVisitDatesId = trips[0].id;
                visitStartInput.value = trips[0].startDate;
                visitEndInput.value = trips[0].endDate;
            }
        } catch (error) { console.error("Failed to fetch visit data", error); }
    };

    window.saveVisitDates = async () => {
        if (!visitStartInput.value || !visitEndInput.value) {
            alert("Please pick both start and end dates!");
            return;
        }
        try {
            await api.saveVisitDates(visitStartInput.value, visitEndInput.value);
            ui.showToast('Trip Activated! ✈️', 'A fresh itinerary list has been opened!', '🗺️');
            fetchVisitData();
        } catch (error) { console.error("Failed to save dates", error); }
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
                await api.addVisitTask(document.getElementById('visit-task-title').value, activeVisitDatesId);
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
            await api.toggleVisitTask(id, localTimeString);
            fetchVisitData();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteVisitTask = async (id) => {
        if(confirm('Delete this trip plan?')) {
            await api.deleteVisitTask(id);
            fetchVisitData();
        }
    };

    window.deleteWholeTrip = async (id) => {
        if (confirm("⚠️ WARNING: Are you sure you want to delete this ENTIRE trip and all of its logged tasks? This cannot be undone!")) {
            try {
                await api.deleteWholeTrip(id);
                ui.showToast('Trip Wiped 🗑️', 'The entire itinerary has been deleted.', 'ℹ️');
                fetchVisitData();
            } catch (error) {
                console.error("Failed to delete entire trip", error);
                ui.showToast('Error', 'Could not delete trip.', '❌');
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
            standardUser = 'Mohammad';
        } else if (cleanWho === 'zozo' || cleanWho === 'zainab') {
            standardUser = 'Zainab';
        } else {
            alert("Invalid name. SOS Aborted.");
            return;
        }

        const targetName = standardUser === 'Mohammad' ? 'ZoZo 👸🏻' : '7amodee 👨🏻‍💻';
        if (!confirm(`⚠️ Send high-priority SOS alert to ${targetName} with your LIVE GPS location?`)) return;

        ui.showToast('Processing...', 'Acquiring GPS coordinates 🛰️', '⏳');

        const sendSosReq = async (lat, lng) => {
            try {
                await api.sendSOS(standardUser, lat, lng);
                ui.showToast('SOS SENT! 🚨', 'Emergency alert has been fired!', '🚨');
                fetchSystemState();
            } catch (e) {
                console.error("SOS failed", e);
                ui.showToast('Error', 'Failed to connect to server.', '❌');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    sendSosReq(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Location access denied or failed.", error);
                    ui.showToast('GPS Failed', 'Sending SOS without location data.', '⚠️');
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

// نجعل الـ ID متاحاً عالمياً لكي تقرأه الدالة الجديدة
    window.currentPromptId = null;

    const fetchBlindPrompt = async () => {
        try {
            const prompt = await api.fetchCurrentPrompt();
            if (!prompt) {
                window.currentPromptId = null;
                ui.renderEmptyPrompt();
            } else {
                window.currentPromptId = prompt.id; // حفظ الـ ID عالمياً
                ui.renderPrompt(prompt); // رسم الواجهة
            }
        } catch (error) { console.error(error); }
    };

// 🔥 الدالة النووية التي سيستدعيها الفورم مباشرة من الـ HTML 🔥
    window.lockMyAnswer = async () => {
        const btn = document.querySelector('#submit-prompt-form button');
        const userSelect = document.getElementById('prompt-user');
        const answerInput = document.getElementById('prompt-answer');

        if (!window.currentPromptId || !userSelect || !answerInput) return;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Encrypting... ⏳';
        }

        try {
            await api.answerPrompt(
                window.currentPromptId,
                userSelect.value,
                answerInput.value
            );

            // التحديث بصمت بعد النجاح
            fetchBlindPrompt();
            fetchPromptHistory();
        } catch (error) {
            console.error("Submission failed:", error);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Lock My Answer 🔒';
            }
        }
    };

    window.generatePrompt = async () => {
        promptContainer.innerHTML = `<p class="text-center text-slate-400 animate-pulse">Consulting the Vault... 🔮</p>`;
        await api.generatePrompt();
        fetchBlindPrompt();
    };

    window.cancelPrompt = async () => {
        if(confirm("Are you sure you want to cancel this prompt session?")) {
            promptContainer.innerHTML = `<p class="text-center text-slate-400 animate-pulse">Cancelling... 🚫</p>`;
            await api.cancelPrompt();
            fetchBlindPrompt();
        }
    };

// الاستدعاء الأول عند التحميل
    fetchBlindPrompt();

// --- 📜 PROMPTS HISTORY LOGIC ---
    const fetchPromptHistory = async () => {
        try {
            const history = await api.fetchPromptHistory();
            ui.renderPromptHistory(history);
        } catch(e) { console.error(e); }
    };

    fetchPromptHistory();

    // --- ⏳ TIME CAPSULE COUNTDOWN LOGIC ---
    const startCountdown = (unlockDateString, displayElementId) => {
        ui.startCountdown(unlockDateString, displayElementId);
    };

    // --- 🍿 THE WATCHLIST LOGIC ---
    const fetchMedia = async () => {
        try {
            const media = await api.fetchMedia();
            ui.renderWatchlist(media);
        } catch (e) {
            console.error("Media fetch error:", e);
        }
    };

    window.toggleMediaStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'watched' ? 'backlog' : 'watched';
        try {
            await api.toggleMediaStatus(id, newStatus);
            fetchMedia();
        } catch (e) {
            console.error("Toggle status error:", e);
        }
    };

    window.deleteMedia = async (id) => {
        if(!confirm("Remove this from the watchlist?")) return;
        try {
            await api.deleteMedia(id);
            fetchMedia();
        } catch (e) {
            console.error("Delete media error:", e);
        }
    };

    // ---------------------------------------------------------
// 🧠 نظام التبديل الذكي (Profile Switcher Logic)
// ---------------------------------------------------------
    window.switchUser = (username) => {
        ui.switchUser(username);
    };

    const currentUser = localStorage.getItem('vault_user') || 'Mohammad';
    window.switchUser(currentUser);

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
                await api.addMedia(title.trim(), currentUser, 'backlog');
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
// 🚀 V2.0.0 EASTER EGG & SECRET DOOR (ORIGINAL MAGIC EDITION)
// ==========================================

    const openEasterEgg = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        const audio = document.getElementById('easter-egg-audio');
        const textContent = document.getElementById('easter-egg-content');
        const gallery = document.getElementById('easter-egg-gallery');

        if (overlay) {
            if (textContent) textContent.classList.remove('hidden', 'opacity-0', 'scale-95');
            if (gallery) gallery.classList.add('hidden', 'opacity-0', 'translate-y-10');

            overlay.classList.remove('hidden');
            if (audio) {
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio play blocked", e));
            }
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
            }, 50);
        }
    };

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

// --- Event Delegation الشامل (لضمان عمل الزر دائماً) ---
    let easterEggClickCount = 0;
    let easterEggTimeout;

    document.addEventListener('click', (e) => {

        // 1. فتح الباب السري عبر النقر 3 مرات على رقم الإصدار
        const trigger = e.target.closest('#version-trigger');
        if (trigger) {
            easterEggClickCount++;
            clearTimeout(easterEggTimeout);

            if (easterEggClickCount >= 3) {
                easterEggClickCount = 0;
                openEasterEgg();
            } else {
                easterEggTimeout = setTimeout(() => {
                    easterEggClickCount = 0;
                }, 800);
            }
            return;
        }

        // 2. أزرار الإغلاق
        if (e.target.id === 'close-easter-egg' || e.target.id === 'close-gallery-btn') {
            closeFunctions();
            return;
        }

        // 3. الانتقال للألبوم وتفعيل سحر الصور الأصلي
        const proceedBtn = e.target.closest('#proceed-to-gallery-btn');
        if (proceedBtn) {
            const textContent = document.getElementById('easter-egg-content');
            const gallery = document.getElementById('easter-egg-gallery');

            if (textContent) textContent.classList.add('opacity-0', 'scale-95');

            setTimeout(() => {
                if (textContent) textContent.classList.add('hidden');
                if (gallery) {
                    const scrollContainer = gallery.closest('.overflow-y-auto');
                    if (scrollContainer) scrollContainer.scrollTop = 0;

                    gallery.classList.remove('hidden');

                    // الكود الأصلي الخاص بك لتحريك الصور
                    document.querySelectorAll('.polaroid').forEach((p, index) => {
                        p.style.animationDelay = `${index * 0.4}s`;
                        p.addEventListener('animationend', () => {
                            p.style.animation = 'none';
                            p.style.opacity = '1';
                            p.style.transform = 'rotate(var(--rot))';
                        }, { once: true });
                    });

                    setTimeout(() => gallery.classList.remove('opacity-0', 'translate-y-10'), 50);
                }
            }, 800);
            return;
        }
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
    const addGoalForm = document.getElementById('add-goal-form');

    const fetchGoals = async () => {
        try {
            const items = await api.fetchGoals();
            ui.renderGoals(items);
        } catch (error) { console.error("Failed to fetch goals", error); }
    };

    if (addGoalForm) {
        addGoalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '...';

            try {
                await api.addGoal(document.getElementById('goal-title').value);
                addGoalForm.reset();
                fetchGoals();
            } catch (error) { console.error("Save failed", error); }
            finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Add';
            }
        });
    }

    window.toggleGoal = async (id) => {
        try {
            await api.toggleGoal(id);
            fetchGoals();
        } catch (error) { console.error("Update failed", error); }
    };

    window.deleteGoal = async (id) => {
        if(confirm('Delete this goal?')) {
            await api.deleteGoal(id);
            fetchGoals();
        }
    };

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
            const data = await api.fetchDiaryContent(currentDiaryOwner);
            textarea.value = data.content || '';
            status.innerText = 'SYNCED ✅';
            status.classList.replace('text-indigo-400', 'text-emerald-400');
        } catch(e) {
            status.innerText = 'CONNECTION ERROR ❌';
            status.classList.replace('text-indigo-400', 'text-rose-500');
        }
    };

    window.closeDiaryCanvas = () => {
        window.saveDiary(true);
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
            await api.saveDiaryContent(currentDiaryOwner, content, isManual);
            status.innerText = isManual ? 'FORCE SAVED ✅' : 'AUTO-SAVED ✅';
            status.classList.replace('text-indigo-400', 'text-emerald-400');
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
            if(document.getElementById('deep-talks-btn')) document.getElementById('deep-talks-btn').classList.remove('hidden');

            window.scrollTo(0, 0);
        } else if (overrideKey !== null) {
            // If they type the wrong thing (or Zozo clicks it by accident)
            alert("Access Denied.");
        }
    };
    
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

    const subtitlesSequence = [
        { text: "زوزو...", time: 750 },
        { text: "أنا ما صممت هذا المكان بس عشان أحفظ ذكرياتنا...", time: 1500 },
        { text: "أنا صممته عشان يكون مراية، تشوفي فيها نفسك بعيوني.", time: 5500 },
        { text: "في كل مرة بشوف فيها ملامحك...", time: 10500 },
        { text: "بتأكد إنك أجمل وأصدق شي صار بحياتي.", time: 13700 }, // بكرناها بـ 300 ملي ثانية
        { text: "أنا بحب نسختك الأصلية... بكل تفاصيلها الطبيعية...", time: 18200 },
        { text: "وما بدي إشي يتغير.", time: 22500 },
        { text: "إنتِ المعيار اللي بقيس فيه كل شي حلو.", time: 25200 },
        { text: "خليكي دائماً واثقة إنك بعيوني...", time: 28500 },
        { text: "أجمل بنت شافتها عيني، وأغلى شي بملكه.", time: 30900 },
        { text: "و... بحبك ❤️", time: 34100 } // اللحظة الحاسمة المضبوطة
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
            if(secretVoice) {
                // إجبار المتصفح على رفع مستوى صوتك إلى 100% (الحد الأقصى)
                secretVoice.volume = 1.0;
                secretVoice.play().catch(e => console.log("Voice play blocked", e));
            }
        }, 1000);

        // 3. عرض الصور مع نظام الأورورا (Aura Ambilight) المحصن
        const auraPhotos = document.querySelectorAll('.aura-photo');
        cinematicPhotoIndex = 0;

        if(photos.length > 0) {
            // إيقاظ الصورة الأولى
            photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
            photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105', 'brightness-110');

            // الحماية الجذربة: التأكد من وجود وهج مطابق للصورة الحالية بالذات
            if(auraPhotos[cinematicPhotoIndex]) {
                auraPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                auraPhotos[cinematicPhotoIndex].classList.add('opacity-40');
            }

            cinematicPhotoInterval = setInterval(() => {
                // إخفاء الصورة الحالية
                photos[cinematicPhotoIndex].classList.remove('opacity-100', 'blur-0', 'scale-105', 'brightness-110');
                photos[cinematicPhotoIndex].classList.add('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');

                // إخفاء الوهج الحالي (إن وجد)
                if(auraPhotos[cinematicPhotoIndex]) {
                    auraPhotos[cinematicPhotoIndex].classList.remove('opacity-40');
                    auraPhotos[cinematicPhotoIndex].classList.add('opacity-0');
                }

                // الانتقال الدائري المستمر
                let nextIndex = (cinematicPhotoIndex + 1) % photos.length;

                setTimeout(() => {
                    cinematicPhotoIndex = nextIndex;

                    // إظهار الصورة التالية
                    photos[cinematicPhotoIndex].classList.remove('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
                    photos[cinematicPhotoIndex].classList.add('opacity-100', 'blur-0', 'scale-105', 'brightness-110');

                    // إظهار وهجها (إن وجد)
                    if(auraPhotos[cinematicPhotoIndex]) {
                        auraPhotos[cinematicPhotoIndex].classList.remove('opacity-0');
                        auraPhotos[cinematicPhotoIndex].classList.add('opacity-40');
                    }
                }, 100);

            }, 5500);
        }

        // 4. تشغيل الترجمة السينمائية (The Whispering Blur) + ❤️ النبض البصري
        const subtitleEl = document.getElementById('cinematic-subtitle');
        subtitlesSequence.forEach((item, index) => {
            const timeout = setTimeout(() => {
                // تبخير النص القديم
                subtitleEl.classList.replace('opacity-100', 'opacity-0');
                subtitleEl.classList.replace('blur-0', 'blur-md');
                subtitleEl.classList.replace('translate-y-0', 'translate-y-2');

                setTimeout(() => {
                    // التحقق: إذا كانت هذه الجملة الأخيرة، اجعل القلب ينبض!
                    if (index === subtitlesSequence.length - 1) {
                        subtitleEl.innerHTML = 'و... بحبك <span class="animate-heartbeat text-red-500 drop-shadow-md">❤️</span>';
                    } else {
                        subtitleEl.innerText = item.text;
                    }

                    // سحب النص الجديد للتركيز
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

// إنهاء التجربة (منطق التنظيف الجذري والصارم)
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

            // 3. التنظيف الشامل للصور الرئيسية (الذي كان مفقوداً)
            clearInterval(cinematicPhotoInterval);
            photos.forEach(p => {
                p.classList.remove('opacity-100', 'blur-0', 'scale-105', 'brightness-110');
                p.classList.add('opacity-0', 'blur-xl', 'scale-95', 'brightness-50');
            });

            // تطفئة وهج الأورورا عند الخروج
            const auraPhotosToClean = document.querySelectorAll('.aura-photo');
            auraPhotosToClean.forEach(bg => {
                bg.classList.remove('opacity-40');
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

    // --- 🌟 STARDUST PARTICLE SYSTEM (Enhanced) ---
    let animationFrameId;

    function startStardust() {
        const canvas = document.getElementById('stardust-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        const numberOfParticles = 150; // تمت المضاعفة لكثافة أعلى

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5; // حجم أكبر قليلاً للتفاوت
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.6 + 0.2; // لمعان أقوى
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
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

    // ==========================================
    // ☕ DEEP TALKS LOGIC
    // ==========================================
    const addTalkForm = document.getElementById('add-talk-form');
    const talkInput = document.getElementById('talk-input');

    // دالة لجلب البيانات وتحديث الشاشة
    const fetchDeepTalksData = async () => {
        try {
            const talks = await api.fetchDeepTalks();
            ui.renderDeepTalks(talks);
        } catch (error) {
            console.error("Failed to fetch deep talks", error);
        }
    };

    // 1. إضافة موضوع جديد
    if (addTalkForm) {
        addTalkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = talkInput.value.trim();
            if (!title) return;

            const submitBtn = addTalkForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '...';

            const currentUser = localStorage.getItem('vault_user') || 'Unknown';

            try {
                await api.addDeepTalk(title, currentUser);
                talkInput.value = '';
                fetchDeepTalksData();
            } catch (error) {
                console.error("Save failed", error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Add';
            }
        });
    }

    // 2. تحديث الحالة (تم النقاش / لم يتم)
    window.toggleDeepTalk = async (id, isDiscussed) => {
        try {
            await api.toggleDeepTalk(id, isDiscussed);
            fetchDeepTalksData();
        } catch (error) { console.error("Update failed", error); }
    };

    // 3. حذف الموضوع
    window.deleteDeepTalk = async (id) => {
        if(confirm('Delete this topic?')) {
            try {
                await api.deleteDeepTalk(id);
                fetchDeepTalksData();
            } catch (error) { console.error("Delete failed", error); }
        }
    };

    // 4. دوال فتح وإغلاق اللوحة الجانبية
    window.openDeepTalks = () => {
        const overlay = document.getElementById('deep-talks-overlay');
        const sidebar = document.getElementById('deep-talks-sidebar');
        if(!overlay || !sidebar) return;

        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            sidebar.classList.remove('translate-x-full');
        }, 10);

        // إخفاء الأزرار العائمة حتى لا تتداخل مع اللوحة المنزلقة
        document.getElementById('sos-btn')?.classList.add('hidden');
        document.getElementById('diary-btn')?.classList.add('hidden');
        document.getElementById('deep-talks-btn')?.classList.add('hidden');

        fetchDeepTalksData();
    };

    window.closeDeepTalks = () => {
        const overlay = document.getElementById('deep-talks-overlay');
        const sidebar = document.getElementById('deep-talks-sidebar');
        if(!overlay || !sidebar) return;

        overlay.classList.add('opacity-0');
        sidebar.classList.add('translate-x-full');

        // إظهار الأزرار العائمة مرة أخرى عند إغلاق اللوحة
        document.getElementById('sos-btn')?.classList.remove('hidden');
        document.getElementById('diary-btn')?.classList.remove('hidden');
        document.getElementById('deep-talks-btn')?.classList.remove('hidden');

        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    };

    // --- 📱 Bottom Navigation Logic (5 Tabs) ---
    window.switchTab = (tabName) => {
        ui.switchTab(tabName);
    };
});