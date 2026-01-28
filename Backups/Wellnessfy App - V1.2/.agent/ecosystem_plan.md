# Wellnessfy Ecosystem Roadmap & Context

## 1. Vision
Wellnessfy is evolving from a single health dashboard into a **Wellness Operating System** composed of specialized micro-apps that sync to a central profile.

## 2. Upcoming Micro-Apps
- **Wellnessfy Breathing:** Guided breathing techniques.
- **Wellnessfy Meditate:** Categorized meditations (relax, sleep, etc.).
- **Wellnessfy Reading:** Focused reading with relax music and book stats.
- **Wellnessfy Nutri:** Recipes and nutritional tracking.
- **Wellnessfy Body Gain:** Muscle measurements and body composition (InBody).
- **Wellnessfy Fitness:** Routine creation/management.

## 3. Technical Architecture (Agreed)
- **Unified Infrastructure:** Single Google Cloud / Firebase Project for all apps.
- **Identity:** Shared Firebase Auth (Single Sign-On). The same `UID` tracks the user across all apps.
- **Database (Firestore):** Hub & Spoke Model.
    - `users/` (Hub): Central profile, daily aggregated totals (Steps, Cal, Dist), and global badges.
    - `app_specific_collections/` (Spokes): Detailed logs for each specialized app.
- **Data Flow:** Cloud Functions will trigger "aggregators" to update the Hub whenever a specialized activity is completed in a micro-app.
- **Design System:** Shared CSS tokens (colors, typography) to ensure brand consistency.

## 4. Current State (Activity App)
- **Universal Provider Engine:** Robust normalization for Fitbit and Google Fit.
- **Accuracy:** Weekly stats now use Daily Totals from providers (authoritative source).
- **Mindfulness Logic:** Detection improved for 'Relax', 'Breath', and 'Yoga' sessions.

*Last updated: 2026-01-17*
