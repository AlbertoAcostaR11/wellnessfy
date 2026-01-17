
// State Management

export const AppState = {
    currentUser: {
        id: '',
        name: '',
        username: '',
        avatar: 'https://i.pravatar.cc/300?img=12',
        bio: '',
        isPublic: true,
        interests: [],
        stats: { steps: 0, activeMinutes: 0, sleepHours: 0, calories: 0, heartRate: 0 },
        goals: { steps: 10000, activeMinutes: 60, sleepHours: 8 },
        averages: { steps: 0, activeMinutes: 0, sleepHours: 0 },
        badges: []
    },
    currentPage: 'feed', // Default changed to feed
    challenges: [],
    circles: [],
    feedPosts: [],
    activeChallengeId: null,
    wellnessApps: [],
    notifications: []
};

// Load user data from localStorage
export function loadUserData() {
    const savedUser = localStorage.getItem('wellnessfy_user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            // Merge saved data with default data
            AppState.currentUser = { ...AppState.currentUser, ...userData };
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// Save user data to localStorage
export function saveUserData() {
    try {
        localStorage.setItem("wellnessfy_user", JSON.stringify(AppState.currentUser));
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}
