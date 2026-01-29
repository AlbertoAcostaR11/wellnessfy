import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc, increment, onSnapshot, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC9K_nqcTRPGtTpUfWDvkFhnAESaJ3I7Vs",
    authDomain: "wellnessfy-cbc1b.firebaseapp.com",
    projectId: "wellnessfy-cbc1b",
    storageBucket: "wellnessfy-cbc1b.firebasestorage.app",
    messagingSenderId: "232789372708",
    appId: "1:232789372708:web:e7d5fcffa0ba39cf6e0db1",
    measurementId: "G-0V7MV5E1CF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function runTest() {
    console.log('🧪 Iniciando prueba de persistencia social...');

    try {
        // 1. Auth
        console.log('🔑 Intentando autenticar...');
        let user;
        try {
            const email = `test.auto.${Date.now()}@example.com`;
            const cred = await createUserWithEmailAndPassword(auth, email, 'test1234');
            user = cred.user;
            console.log('✅ Usuario temporal creado:', user.uid);
        } catch (e) {
            console.log('⚠️ Creación falló, intentando demo account...', e.message);
            const cred = await signInWithEmailAndPassword(auth, 'demo@test.com', '123456');
            user = cred.user;
            console.log('✅ Login demo exitoso:', user.uid);
        }

        // 2. Create Post
        console.log('📝 Creando post de prueba...');
        const newPostRef = await addDoc(collection(db, 'posts'), {
            content: "Automated Persistence Test",
            author: { id: user.uid, name: "Test Bot" },
            timestamp: Date.now(),
            reactions: { like: 0 },
            comments: 0
        });
        console.log('✅ Post creado ID:', newPostRef.id);

        // 3. Listener
        console.log('👂 Escuchando cambios en Firestore...');
        onSnapshot(doc(db, 'posts', newPostRef.id), (docSnap) => {
            const data = docSnap.data();
            if (!data) return;
            console.log(`🔄 [Realtime] Likes: ${data.reactions?.like || 0}, Comments: ${data.comments || 0}`);
        });

        // 4. Update Like
        console.log('👍 Simulando LIKE...');
        await updateDoc(doc(db, 'posts', newPostRef.id), {
            [`reactions.like`]: increment(1)
        });
        console.log('✅ LIKE escrito en DB');

        await new Promise(r => setTimeout(r, 2000));

        // 5. Update Comment
        console.log('💬 Simulando COMENTARIO...');
        await updateDoc(doc(db, 'posts', newPostRef.id), {
            comments: increment(1)
            // commentsList omitted for brevity in minimal test
        });
        console.log('✅ COMENTARIO escrito en DB');

        await new Promise(r => setTimeout(r, 2000));
        console.log('🏁 Prueba completada. Si viste logs "Realtime" con valores incrementados, FUNCIONA.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

runTest();
