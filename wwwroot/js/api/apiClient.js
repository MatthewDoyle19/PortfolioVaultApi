const API_BASE_URL = "https://zainabvault-v2-0-0.onrender.com";

// ==========================================
// 🔥 THE UNIVERSAL SHIELD (الدرع الشامل لحماية البيانات)
// ==========================================
// هذه الدالة ستعالج أي استجابة من السيرفر بأمان مطلق. 
// إذا كان هناك 404، 204، أو نص غير صالح، ستمرره بصمت دون تحطيم الواجهة.
const safeJson = async (response) => {
    if (!response.ok || response.status === 204 || response.status === 404) {
        return null;
    }
    try {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.warn("API parsing ignored non-JSON response.");
        return null;
    }
};

// ==========================================
// SYSTEM MAINTENANCE & AUTHENTICATION
// ==========================================

export const checkMaintenanceStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/system/maintenance`);
        const data = await safeJson(response);
        return data ? data.isMaintenance : false;
    } catch (e) {
        return false;
    }
};

export const toggleMaintenanceMode = async () => {
    const response = await fetch(`${API_BASE_URL}/api/system/maintenance/toggle`, { method: 'POST' });
    const data = await safeJson(response);
    return data ? data.isMaintenance : false;
};

export const login = async (key) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
    });
    return safeJson(response);
};

// ==========================================
// DIGITAL KEEPSAKES (LINKS)
// ==========================================

export const fetchLinks = async () => {
    const response = await fetch(`${API_BASE_URL}/api/links`);
    return safeJson(response);
};

export const addLink = async (title, url, unlockDate) => {
    const response = await fetch(`${API_BASE_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, unlockDate })
    });
    return safeJson(response);
};

export const deleteLink = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// TIMELINE (COMMITS)
// ==========================================

export const fetchCommits = async () => {
    const response = await fetch(`${API_BASE_URL}/api/commits`);
    return safeJson(response);
};

export const addCommit = async (commitData) => {
    const response = await fetch(`${API_BASE_URL}/api/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitData)
    });
    return safeJson(response);
};

export const deleteCommit = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// SHARED CALENDAR (EVENTS)
// ==========================================

export const fetchEvents = async () => {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    return safeJson(response);
};

export const addEvent = async (title, date, type) => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, type })
    });
    return safeJson(response);
};

export const deleteEvent = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// DIGITAL COURT (PENALTIES)
// ==========================================

export const fetchPenalties = async () => {
    const response = await fetch(`${API_BASE_URL}/api/penalties`);
    return safeJson(response);
};

export const addPenalty = async (penaltyData) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(penaltyData)
    });
    return safeJson(response);
};

export const togglePenalty = async (id, isCompleted) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted })
    });
    return safeJson(response);
};

export const deletePenalty = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// MOOD RADAR
// ==========================================

export const fetchMoods = async () => {
    const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
    });
    return safeJson(response);
};

export const updateMood = async (user, status) => {
    const moodData = {
        user: user,
        status: status,
        updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData)
    });
    return safeJson(response);
};

// ==========================================
// HEARTBEATS (SPARKS)
// ==========================================

export const fetchLatestHeartbeat = async () => {
    const response = await fetch(`${API_BASE_URL}/api/heartbeats/latest`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
    });
    return safeJson(response);
};

export const sendHeartbeat = async (sender) => {
    const response = await fetch(`${API_BASE_URL}/api/heartbeats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: sender })
    });
    return safeJson(response);
};

// ==========================================
// MANSAF COUNTER
// ==========================================

export const fetchMansafCount = async () => {
    const response = await fetch(`${API_BASE_URL}/api/mansaf`);
    return safeJson(response);
};

export const updateMansafCount = async (change) => {
    const response = await fetch(`${API_BASE_URL}/api/mansaf/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change: change })
    });
    return safeJson(response);
};

// ==========================================
// BUCKET LIST
// ==========================================

export const fetchBucketList = async () => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist`);
    return safeJson(response);
};

export const addBucketItem = async (title) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false })
    });
    return safeJson(response);
};

export const toggleBucketItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'PUT' });
    return safeJson(response);
};

export const deleteBucketItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// VISIT PLANNER
// ==========================================

export const fetchVisitData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/visit/all`);
    return safeJson(response);
};

export const saveVisitDates = async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
    });
    return safeJson(response);
};

export const addVisitTask = async (title, visitDatesId) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false, visitDatesId })
    });
    return safeJson(response);
};

export const toggleVisitTask = async (id, localTime) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTime })
    });
    return safeJson(response);
};

export const deleteVisitTask = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

export const deleteWholeTrip = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/dates/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// SOS & GEOLOCATION
// ==========================================

export const sendSOS = async (user, lat, lng) => {
    const response = await fetch(`${API_BASE_URL}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, lat, lng })
    });
    return safeJson(response);
};

// ==========================================
// BLIND PROMPTS
// ==========================================

export const fetchCurrentPrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/current`);
    return safeJson(response);
};

export const generatePrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/generate`, { method: 'POST' });
    return safeJson(response);
};

export const cancelPrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/current`, { method: 'DELETE' });
    return safeJson(response);
};

export const answerPrompt = async (promptId, user, answer) => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, answer })
    });
    return safeJson(response);
};

export const fetchPromptHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/history`);
    return safeJson(response);
};

// ==========================================
// WATCHLIST (MEDIA)
// ==========================================

export const fetchMedia = async () => {
    const response = await fetch(`${API_BASE_URL}/api/media`);
    return safeJson(response);
};

export const addMedia = async (title, addedBy, status) => {
    const response = await fetch(`${API_BASE_URL}/api/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, addedBy, status })
    });
    return safeJson(response);
};

export const toggleMediaStatus = async (id, newStatus) => {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}/status?newStatus=${newStatus}`, {
        method: 'PUT'
    });
    return safeJson(response);
};

export const deleteMedia = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// GOALS
// ==========================================

export const fetchGoals = async () => {
    const response = await fetch(`${API_BASE_URL}/api/goals`);
    return safeJson(response);
};

export const addGoal = async (title) => {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false })
    });
    return safeJson(response);
};

export const toggleGoal = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'PUT' });
    return safeJson(response);
};

export const deleteGoal = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'DELETE' });
    return safeJson(response);
};

// ==========================================
// SECRET DIARY
// ==========================================

export const fetchDiaryContent = async (owner) => {
    const response = await fetch(`${API_BASE_URL}/api/diary/${owner}`);
    return safeJson(response);
};

export const saveDiaryContent = async (owner, content, isManual = false) => {
    const response = await fetch(`${API_BASE_URL}/api/diary?isManual=${isManual}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, content })
    });
    return safeJson(response);
};

// ==========================================
// CLOUDINARY UPLOAD
// ==========================================

export const uploadToCloudinary = async (file) => {
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhr6waydw/auto/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'i7dhiwzb';

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
    // Cloudinary دائماً يعيد JSON صالح، لكن نستخدم الدرع للضمان
    return safeJson(response);
};