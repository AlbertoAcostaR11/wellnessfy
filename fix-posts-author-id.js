/**
 * Script para agregar author.id a posts existentes
 * Ejecutar en consola del navegador
 */

(async function fixPostsAuthorId() {
    console.log('🔧 Actualizando posts sin author.id...\n');

    const { getFirestore, collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();

    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);

    let updated = 0;
    let skipped = 0;

    for (const postDoc of snapshot.docs) {
        const data = postDoc.data();

        // Si ya tiene author.id, skip
        if (data.author?.id) {
            skipped++;
            continue;
        }

        // Buscar el usuario por username
        const username = data.author?.username?.replace('@', '');
        if (!username) {
            console.warn(`⚠️ Post ${postDoc.id} no tiene username, skip`);
            continue;
        }

        // Buscar usuario en Firestore
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        let foundUserId = null;

        for (const userDoc of usersSnap.docs) {
            const userData = userDoc.data();
            if (userData.username === username || userData.username === `@${username}`) {
                foundUserId = userDoc.id;
                break;
            }
        }

        if (foundUserId) {
            await updateDoc(doc(db, 'posts', postDoc.id), {
                'author.id': foundUserId
            });
            console.log(`✅ Post ${postDoc.id} → author.id = ${foundUserId}`);
            updated++;
        } else {
            console.warn(`⚠️ No se encontró usuario para @${username}`);
        }
    }

    console.log(`\n✅ Actualización completa: ${updated} posts actualizados, ${skipped} ya tenían ID`);
    console.log('🔄 Recarga la página para ver los cambios');
})();
