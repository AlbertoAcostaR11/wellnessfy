/**
 * Migration Script: Convert legacy circles to new structure
 * Run this once to update existing circles in Firestore
 * 
 * Changes:
 * - members (number) → members (array)
 * - membersList (array) → members (array)
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyC9K_nqcTRPGtTpUfWDvkFhnAESaJ3I7Vs",
    authDomain: "wellnessfy-cbc1b.firebaseapp.com",
    projectId: "wellnessfy-cbc1b",
    storageBucket: "wellnessfy-cbc1b.firebasestorage.app",
    messagingSenderId: "232789372708",
    appId: "1:232789372708:web:e7d5fcffa0ba39cf6e0db1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateCircles() {
    console.log('🔄 Starting circles migration...');

    try {
        const circlesSnapshot = await getDocs(collection(db, 'circles'));
        let migratedCount = 0;
        let skippedCount = 0;

        for (const circleDoc of circlesSnapshot.docs) {
            const circleData = circleDoc.data();
            const circleId = circleDoc.id;

            // Check if migration is needed
            const needsMigration = !Array.isArray(circleData.members);

            if (needsMigration) {
                console.log(`📝 Migrating circle: ${circleData.name} (${circleId})`);

                // Determine the correct members array
                let membersArray;

                if (circleData.membersList && Array.isArray(circleData.membersList)) {
                    // Use existing membersList
                    membersArray = circleData.membersList;
                } else if (circleData.createdBy) {
                    // Fallback: use creator as only member
                    membersArray = [circleData.createdBy];
                } else {
                    // Last resort: empty array
                    membersArray = [];
                }

                // Update the document
                await updateDoc(doc(db, 'circles', circleId), {
                    members: membersArray
                });

                console.log(`✅ Migrated: ${circleData.name} - ${membersArray.length} members`);
                migratedCount++;
            } else {
                console.log(`⏭️  Skipped: ${circleData.name} (already migrated)`);
                skippedCount++;
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log(`✅ Migrated: ${migratedCount} circles`);
        console.log(`⏭️  Skipped: ${skippedCount} circles`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Auto-run migration
migrateCircles();

// Make function available globally for manual execution
window.migrateCircles = migrateCircles;

console.log('💡 Migration script loaded. Run window.migrateCircles() to execute.');
