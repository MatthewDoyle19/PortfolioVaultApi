const API_BASE_URL = "https://zainabvault-v2-0-0.onrender.com";

// ==========================================
// SYSTEM MAINTENANCE & AUTHENTICATION
// ==========================================

export const checkMaintenanceStatus = async () => {
    try {
        const response = await fetch('https://zainabvault-v2-0-0.onrender.com/api/system/maintenance');
        if (response.ok) {
            const data = await response.json();
            return data.isMaintenance;
        }
    } catch (e) {
        console.error("Failed to fetch maintenance status", e);
    }
    return false;
};

export const toggleMaintenanceMode = async () => {
    const response = await fetch('https://zainabvault-v2-0-0.onrender.com/api/system/maintenance/toggle', { method: 'POST' });
    if (response.ok) {
        const data = await response.json();
        return data.isMaintenance;
    }
    throw new Error("Failed to toggle maintenance mode");
};

export const login = async (key) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
    });
    return response.json();
};

// ==========================================
// DIGITAL KEEPSAKES (LINKS)
// ==========================================

export const fetchLinks = async () => {
    const response = await fetch(`${API_BASE_URL}/api/links`);
    return response.json();
};

export const addLink = async (title, url, unlockDate) => {
    const response = await fetch(`${API_BASE_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, unlockDate })
    });
    return response.json();
};

export const deleteLink = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// TIMELINE (COMMITS)
// ==========================================

export const fetchCommits = async () => {
    const response = await fetch(`${API_BASE_URL}/api/commits`);
    return response.json();
};

export const addCommit = async (commitData) => {
    const response = await fetch(`${API_BASE_URL}/api/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commitData)
    });
    return response.json();
};

export const deleteCommit = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// SHARED CALENDAR (EVENTS)
// ==========================================

export const fetchEvents = async () => {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    return response.json();
};

export const addEvent = async (title, date, type) => {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, type })
    });
    return response.json();
};

export const deleteEvent = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// DIGITAL COURT (PENALTIES)
// ==========================================

export const fetchPenalties = async () => {
    const response = await fetch(`${API_BASE_URL}/api/penalties`);
    return response.json();
};

export const addPenalty = async (penaltyData) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(penaltyData)
    });
    return response.json();
};

export const togglePenalty = async (id, isCompleted) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted })
    });
    return response.json();
};

export const deletePenalty = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/penalties/${id}`, { method: 'DELETE' });
    return response.json();
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
    return response.json();
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
    return response.json();
};

// ==========================================
// HEARTBEATS (SPARKS)
// ==========================================

export const fetchLatestHeartbeat = async () => {
    const response = await fetch(`${API_BASE_URL}/api/heartbeats/latest`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
    });
    if (response.ok) {
        return response.json();
    }
    return null;
};

export const sendHeartbeat = async (sender) => {
    const response = await fetch(`${API_BASE_URL}/api/heartbeats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: sender })
    });
    return response.json();
};

// ==========================================
// MANSAF COUNTER
// ==========================================

export const fetchMansafCount = async () => {
    const response = await fetch(`${API_BASE_URL}/api/mansaf`);
    if (response.ok) {
        return response.json();
    }
    throw new Error("Failed to fetch mansaf count");
};

export const updateMansafCount = async (change) => {
    const response = await fetch(`${API_BASE_URL}/api/mansaf/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change: change })
    });
    return response.json();
};

// ==========================================
// BUCKET LIST
// ==========================================

export const fetchBucketList = async () => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist`);
    return response.json();
};

export const addBucketItem = async (title) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false })
    });
    return response.json();
};

export const toggleBucketItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'PUT' });
    return response.json();
};

export const deleteBucketItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/bucketlist/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// VISIT PLANNER
// ==========================================

export const fetchVisitData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/visit/all`);
    if (response.ok) {
        return response.json();
    }
    throw new Error("Failed to fetch visit data");
};

export const saveVisitDates = async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
    });
    return response.json();
};

export const addVisitTask = async (title, visitDatesId) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false, visitDatesId })
    });
    return response.json();
};

export const toggleVisitTask = async (id, localTime) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localTime })
    });
    return response.json();
};

export const deleteVisitTask = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/tasks/${id}`, { method: 'DELETE' });
    return response.json();
};

export const deleteWholeTrip = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/visit/dates/${id}`, { method: 'DELETE' });
    return response.json();
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
    return response.json();
};

// ==========================================
// BLIND PROMPTS
// ==========================================

export const fetchCurrentPrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/current`);
    if (response.status === 204 || !response.ok) {
        return null;
    }
    return response.json();
};

export const generatePrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/generate`, { method: 'POST' });
    return response.json();
};

export const cancelPrompt = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/current`, { method: 'DELETE' });
    return response.json();
};

export const answerPrompt = async (promptId, user, answer) => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, answer })
    });
    return response.json();
};

export const fetchPromptHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/api/prompts/history`);
    return response.json();
};

// ==========================================
// WATCHLIST (MEDIA)
// ==========================================

export const fetchMedia = async () => {
    const response = await fetch(`${API_BASE_URL}/api/media`);
    return response.json();
};

export const addMedia = async (title, addedBy, status) => {
    const response = await fetch(`${API_BASE_URL}/api/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, addedBy, status })
    });
    return response.json();
};

export const toggleMediaStatus = async (id, newStatus) => {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}/status?newStatus=${newStatus}`, {
        method: 'PUT'
    });
    return response.json();
};

export const deleteMedia = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/media/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// GOALS
// ==========================================

export const fetchGoals = async () => {
    const response = await fetch(`${API_BASE_URL}/api/goals`);
    return response.json();
};

export const addGoal = async (title) => {
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, isCompleted: false })
    });
    return response.json();
};

export const toggleGoal = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'PUT' });
    return response.json();
};

export const deleteGoal = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, { method: 'DELETE' });
    return response.json();
};

// ==========================================
// SECRET DIARY
// ==========================================

export const fetchDiaryContent = async (owner) => {
    const response = await fetch(`https://zainabvault-v2-0-0.onrender.com/api/diary/${owner}`);
    if (response.ok) {
        return response.json();
    }
    throw new Error("Failed to fetch diary content");
};

export const saveDiaryContent = async (owner, content, isManual = false) => {
    const response = await fetch(`https://zainabvault-v2-0-0.onrender.com/api/diary?isManual=${isManual}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, content })
    });
    return response.json();
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
    return response.json();
};