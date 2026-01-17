
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

    // Cargar datos de salud persistidos (Motor Universal)
    const savedHealthData = localStorage.getItem('wellnessfy_user_data');
    if (savedHealthData) {
        try {
            const healthData = JSON.parse(savedHealthData);

            // Cargar métricas de hoy
            if (healthData.todayStats) {
                AppState.todayStats = healthData.todayStats;
            }

            // Cargar actividades
            if (healthData.activities && Array.isArray(healthData.activities)) {
                AppState.activities = healthData.activities;
            }

            console.log('📦 Datos de salud cargados de memoria:',
                { stats: !!AppState.todayStats, activities: AppState.activities.length });

        } catch (e) {
            console.error('Error parsing saved health data:', e);
        }
    }

    // Load Challenges
    const savedChallenges = localStorage.getItem('my_challenges');
    if (savedChallenges) {
        try {
            AppState.challenges = JSON.parse(savedChallenges);
        } catch (e) {
            console.error('Error loading challenges:', e);
        }
    }

    // Load Circles (preparando para circles)
    const savedCircles = localStorage.getItem('my_circles');
    if (savedCircles) {
        try {
            AppState.circles = JSON.parse(savedCircles);
        } catch (e) {
            console.error('Error loading circles:', e);
        }
    }
    // Load Feed Posts
    const savedPosts = localStorage.getItem('my_posts');
    if (savedPosts) {
        try {
            AppState.feedPosts = JSON.parse(savedPosts);
        } catch (e) {
            console.error('Error loading posts:', e);
        }
    }
}

// Save user data to localStorage
export function saveUserData() {
    try {
        localStorage.setItem("wellnessfy_user", JSON.stringify(AppState.currentUser));
        localStorage.setItem("my_posts", JSON.stringify(AppState.feedPosts)); // Persist posts

        // Save health data (Fitbit/Google Fit metrics)
        const healthData = {
            todayStats: AppState.todayStats,
            activities: AppState.activities
        };
        localStorage.setItem("wellnessfy_user_data", JSON.stringify(healthData));

        console.log('💾 Datos guardados:', {
            user: true,
            todayStats: !!AppState.todayStats,
            activities: AppState.activities?.length || 0
        });
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}
