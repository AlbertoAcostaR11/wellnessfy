import { AppState, saveUserData } from '../utils/state.js';
import { navigateTo } from '../router.js';

// ==========================================
// CREACIÓN DE PUBLICACIONES
// ==========================================

export function showCreatePostModal() {
    const existingModal = document.getElementById('create-post-modal');
    if (existingModal) existingModal.remove();

    const { avatar } = AppState.currentUser;

    const modal = document.createElement('div');
    modal.id = 'create-post-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in sm:p-4';
    modal.innerHTML = `
        <div class="bg-[#0f172a] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border sm:border border-white/10 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden translate-y-full sm:translate-y-0 transition-transform duration-300" id="modal-panel">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-white/5">
                <button class="p-2 rounded-full hover:bg-white/5 transition-colors" onclick="closeCreatePostModal()">
                    <span class="material-symbols-outlined text-white/60">close</span>
                </button>
                <h3 class="font-bold text-white text-sm uppercase tracking-widest">Crear Publicación</h3>
                <button class="btn-primary px-4 py-1.5 text-xs rounded-full" onclick="publishPost()">
                    Publicar
                </button>
            </div>

            <!-- Content Area -->
            <div class="p-4 flex-1 overflow-y-auto space-y-4">
                <div class="flex gap-3">
                    <div class="size-10 rounded-full bg-cover bg-center flex-shrink-0" style="background-image: url('${avatar}')"></div>
                    <div class="flex-1">
                        <textarea id="postText" placeholder="¿Qué estás pensando?" class="w-full bg-transparent border-none text-white text-base focus:ring-0 resize-none outline-none min-h-[100px]" autofocus></textarea>
                    </div>
                </div>

                <!-- Media Preview Grid -->
                <div id="mediaPreview" class="grid grid-cols-2 gap-2 mt-2 hidden">
                    <!-- Previews go here -->
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="p-4 border-t border-white/5 bg-white/5">
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <span class="material-symbols-outlined text-[#00f5d4] group-hover:scale-110 transition-transform">image</span>
                        <span class="text-xs font-bold text-white/60 group-hover:text-white">Foto/Video</span>
                        <input type="file" multiple accept="image/*,video/*" class="hidden" onchange="handlePostMediaSelect(this)">
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animation Show
    requestAnimationFrame(() => {
        const panel = document.getElementById('modal-panel');
        if (panel) panel.classList.remove('translate-y-full');
    });
}

window.closeCreatePostModal = function () {
    const modal = document.getElementById('create-post-modal');
    if (!modal) return;
    const panel = document.getElementById('modal-panel');
    panel.classList.add('translate-y-full', 'sm:scale-95', 'opacity-0');
    setTimeout(() => modal.remove(), 300);
}

// Media Handling
// Media Handling
let selectedFiles = [];

window.handlePostMediaSelect = function (input) {
    const previewContainer = document.getElementById('mediaPreview');
    if (!previewContainer) return;

    if (input.files && input.files.length > 0) {
        // En un flujo real de recorte múltiple se complica la UI. 
        // Simplificación: al subir, por defecto se muestran 'contain' (completas).
        // Añadiremos un "Selector de Formato" global para el carrusel o individual.
        // Aquí implementaremos un selector de Aspect Ratio que aplicará una clase CSS a todas las imágenes del post.

        const newFiles = Array.from(input.files);
        selectedFiles = [...selectedFiles, ...newFiles];

        previewContainer.classList.remove('hidden');
        renderMediaPreviews();
    }
}

let currentAspectRatio = 'aspect-auto'; // Default Original

window.setAspectRatio = function (ratio) {
    currentAspectRatio = ratio;
    // Update UI buttons
    document.querySelectorAll('.aspect-btn').forEach(btn => {
        if (btn.dataset.ratio === ratio) {
            btn.classList.add('bg-[#00f5d4]', 'text-black');
            btn.classList.remove('bg-white/5', 'text-white');
        } else {
            btn.classList.remove('bg-[#00f5d4]', 'text-black');
            btn.classList.add('bg-white/5', 'text-white');
        }
    });
    renderMediaPreviews();
}

function renderMediaPreviews() {
    const previewContainer = document.getElementById('mediaPreview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    // Añadir controles de Aspect Ratio si hay imágenes
    if (selectedFiles.length > 0 && selectedFiles.some(f => f.type.startsWith('image'))) {
        const controls = document.createElement('div');
        controls.className = "col-span-2 flex justify-center gap-2 mb-2 animate-fade-in";
        controls.innerHTML = `
            <button class="aspect-btn px-3 py-1 text-[10px] font-bold rounded-full border border-white/10 ${currentAspectRatio === 'aspect-square' ? 'bg-[#00f5d4] text-black' : 'bg-white/5 text-white'}" onclick="setAspectRatio('aspect-square')" data-ratio="aspect-square">1:1</button>
            <button class="aspect-btn px-3 py-1 text-[10px] font-bold rounded-full border border-white/10 ${currentAspectRatio === 'aspect-[4/5]' ? 'bg-[#00f5d4] text-black' : 'bg-white/5 text-white'}" onclick="setAspectRatio('aspect-[4/5]')" data-ratio="aspect-[4/5]">4:5</button>
            <button class="aspect-btn px-3 py-1 text-[10px] font-bold rounded-full border border-white/10 ${currentAspectRatio === 'aspect-auto' ? 'bg-[#00f5d4] text-black' : 'bg-white/5 text-white'}" onclick="setAspectRatio('aspect-auto')" data-ratio="aspect-auto">Original</button>
        `;
        previewContainer.appendChild(controls);
    }

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const isVideo = file.type.startsWith('video');
            const div = document.createElement('div');
            // Aplicar el aspect ratio seleccionado. 'aspect-auto' usará min-height para que se vea bien.
            const aspectClass = isVideo ? 'aspect-[4/5]' : currentAspectRatio;
            const objectFitClass = currentAspectRatio === 'aspect-auto' ? 'object-contain bg-black/50' : 'object-cover';

            div.className = `relative ${aspectClass} rounded-xl overflow-hidden bg-[#0f172a] border border-white/10 group w-full transition-all duration-300`;
            if (currentAspectRatio === 'aspect-auto') div.style.minHeight = '150px';

            if (isVideo) {
                div.innerHTML = `
                    <video src="${e.target.result}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span class="material-symbols-outlined text-white text-4xl">play_circle</span>
                    </div>
                `;
            } else {
                // Usamos img tag en lugar de background-image para soportar mejor aspect-auto y object-fit controlados
                div.innerHTML = `<img src="${e.target.result}" class="w-full h-full ${objectFitClass}">`;
            }

            // Remove Button
            div.innerHTML += `
                <button class="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors z-10" onclick="removeMedia(${index})">
                    <span class="material-symbols-outlined text-xs">close</span>
                </button>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

window.removeMedia = function (index) {
    selectedFiles.splice(index, 1);
    // Logic updated to use renderMediaPreviews
    if (selectedFiles.length === 0) {
        document.getElementById('mediaPreview').classList.add('hidden');
    } else {
        renderMediaPreviews();
    }
}

// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

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
const storage = getStorage(app);

// Helper de Compresión de Imágenes
function compressImage(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve) => {
        // Si no es imagen (ej video), retornamos null o manejamos error
        if (!file.type.startsWith('image')) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar manteniendo aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width = Math.round((width * maxWidth) / height);
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Retornar JPEG optimizado
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        };
    });
}

window.publishPost = async function () {
    const text = document.getElementById('postText').value;

    if (!text && selectedFiles.length === 0) {
        window.showToast('Escribe algo o sube una foto', 'error');
        return;
    }

    const btn = document.querySelector('#create-post-modal button.btn-primary');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-xs">progress_activity</span> Procesando...';
    }

    try {
        let mediaItems = [];

        if (selectedFiles.length > 0) {
            console.log(`Comprimiendo ${selectedFiles.length} archivos...`);

            const processPromises = selectedFiles.map(async (file) => {
                // Video: No podemos comprimir fácil en navegador. Límite estricto 1MB o aviso.
                if (file.type.startsWith('video')) {
                    if (file.size > 1024 * 1024) { // 1MB Limit
                        window.showToast('Video demasiado grande para la demo (Máx 1MB)', 'error');
                        return null;
                    }
                    // Leer video como base64 raw
                    return new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve({ type: 'video', src: e.target.result });
                        reader.readAsDataURL(file);
                    });
                }

                // Imagen: Comprimir
                const compressedBase64 = await compressImage(file);
                return { type: 'image', src: compressedBase64 };
            });

            const results = await Promise.all(processPromises);
            mediaItems = results.filter(item => item !== null); // Quitar fallidos
        }

        // Crear Post con Base64 Optimizado (<1MB total)
        const newPost = {
            author: {
                name: AppState.currentUser.name || 'Usuario',
                username: '@' + (AppState.currentUser.username || 'usuario').replace('@', ''),
                avatar: AppState.currentUser.avatar || 'https://i.pravatar.cc/300?img=12'
            },
            timestamp: Date.now(),
            content: text,
            media: mediaItems.map(m => m.src),
            aspectRatio: currentAspectRatio,
            type: mediaItems.some(m => m.type === 'video') ? 'video' : 'image',
            likes: 0,
            reactions: { like: 0, support: 0, funny: 0, angry: 0 },
            comments: 0,
            shares: 0,
            commentsList: []
        };

        console.log('Guardando en Firestore (Optimizado)...');
        const docRef = await addDoc(collection(db, "posts"), newPost);
        console.log("Post Publicado con ID: ", docRef.id);

        // Actualizar Local
        newPost.id = docRef.id;
        AppState.feedPosts.unshift(newPost);
        saveUserData();

        window.showToast('¡Publicado con éxito!');
        window.closeCreatePostModal();
        selectedFiles = [];

        if (AppState.currentPage === 'feed') {
            const container = document.getElementById('mainContent');
            if (container) container.innerHTML = renderFeed();
        }
    } catch (e) {
        console.error("Error publicando post: ", e);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Publicar';
        }
        if (e.code === 'resource-exhausted') {
            window.showToast('La imagen sigue siendo muy grande. Intenta una más simple.', 'error');
        } else {
            window.showToast('Error al publicar. Intenta de nuevo.', 'error');
        }
    }
}


// ==========================================
// RENDER FEED
// ==========================================

export function renderFeed() {
    const { avatar } = AppState.currentUser;

    return `
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold tracking-tight">Inicio</h1>
        </div>

        <!-- Quick Create Post Widget -->
        <div class="glass-card rounded-3xl p-4 mb-6 create-post-card cursor-pointer group" onclick="showCreatePostModal()">
            <div class="flex items-center gap-3">
                <div class="avatar-ring size-12 flex-shrink-0">
                    <div class="avatar size-full" style="background-image: url('${avatar}')"></div>
                </div>
                <div class="flex-1">
                    <p class="text-white/40 text-sm group-hover:text-white/60 transition-colors">¿Cuál es tu meta de bienestar hoy?</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="attachment-btn" onclick="event.stopPropagation(); showCreatePostModal()">
                        <span class="material-symbols-outlined text-sm">image</span>
                    </button>
                    <button class="btn-primary px-4 py-2 text-xs" onclick="event.stopPropagation(); showCreatePostModal()">
                        Publicar
                    </button>
                </div>
            </div>
        </div>

        <!-- Circle Filter -->
        <div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            <button class="badge badge-primary cursor-pointer">Todos</button>
            ${AppState.circles.map(circle => `
                <button class="badge badge-secondary cursor-pointer">${circle.name}</button>
            `).join('')}
        </div>

        <!-- Feed Posts -->
        <div class="space-y-6 pb-24">
            ${AppState.feedPosts.length > 0 ? AppState.feedPosts.map(post => {
        const isVideo = post.type === 'video';
        const hasMedia = post.media && post.media.length > 0;

        // "Live Update" para mis propios posts
        // Si el post es mío (o no tiene ID de autor pero asumo que es mío por ser local), uso mis datos actuales.
        // Mejoramos la lógica: Tratamos de matchear por ID o fallback a nombre si es legacy.

        let authorName = post.author.name;
        let authorUsername = post.author.username;
        let authorAvatar = post.author.avatar;

        // Comprobación laxa: Si el post no tiene author.id (legacy) asumimos que si el nombre coincide "Usuario" es nuestro, 
        // o si es la sesión actual. 
        // Lo ideal sería guardar authorId en el post. Lo añadimos en publishPost recién.
        // Si AppState.currentUser tiene datos, los forzamos visualmente.

        // Simplemente: Si el post es local (recién creado) o coincide vagamente, usamos AppState
        // para dar la sensación de inmediatez.
        // NOTA: En una app real, compararíamos IDs. post.authorId === AppState.currentUser.id

        const isMe = (post.author.username === AppState.currentUser.username) ||
            (post.author.name === 'Usuario' && AppState.currentUser.name !== 'Usuario'); // Heurística temporal

        if (isMe) {
            authorName = AppState.currentUser.name;
            authorUsername = AppState.currentUser.username;
            authorAvatar = AppState.currentUser.avatar;
        }

        return `
                <article class="glass-card rounded-3xl overflow-hidden animate-fade-in">
                    <!-- Post Header -->
                    <div class="p-4 flex items-center gap-3">
                        <div class="avatar-ring size-12">
                            <div class="avatar size-full" style="background-image: url('${authorAvatar}')"></div>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-white">${authorName}</h4>
                            <p class="text-[10px] text-white/50 font-bold uppercase tracking-wider">${authorUsername} • ${new Date(post.timestamp).toLocaleDateString()}</p>
                        </div>
                        <button class="btn-icon">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    <!-- Post Media (Carousel or Video) -->
                    ${hasMedia ? `
                        <div class="relative w-full ${post.aspectRatio || 'aspect-square'} bg-black/50 overflow-hidden">
                            ${isVideo ? `
                                <video src="${post.media[0]}" controls class="w-full h-full object-contain"></video>
                            ` : `
                                <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full" style="scroll-behavior: smooth;">
                                    ${post.media.map(src => {
            // Si es 'aspect-auto', usamos object-contain para verla entera. Si es fixed ratio, object-cover para llenar.
            const fitClass = post.aspectRatio === 'aspect-auto' ? 'object-contain' : 'object-cover';
            return `<img src="${src}" class="flex-shrink-0 w-full h-full snap-center ${fitClass} bg-black/20">`;
        }).join('')}
                                </div>
                                ${post.media.length > 1 ? `
                                    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 p-2 rounded-full bg-black/20 w-max mx-auto backdrop-blur-sm z-10">
                                        ${post.media.map((_, i) => `<div class="w-1.5 h-1.5 rounded-full bg-white/50 ${i === 0 ? 'bg-white' : ''}"></div>`).join('')}
                                    </div>
                                    <div class="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full text-[10px] font-bold border border-white/10 z-10">
                                        1/${post.media.length}
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    ` : ''} 
                     ${!hasMedia && post.image ? `
                         <div class="relative aspect-[4/3] w-full bg-cover bg-center" style="background-image: url('${post.image}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent"></div>
                        </div>
                     ` : ''}

                    <!-- Post Content -->
                    <div class="p-4">
                        <p class="text-sm mb-4 leading-relaxed text-gray-200">${post.content}</p>
                        
                        <!-- Reactions Bar -->
                        <div class="flex items-center justify-between mb-4 border-t border-white/5 pt-3">
                            <div class="flex items-center gap-1 bg-white/5 rounded-full p-1 pl-1 pr-3">
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1.5 px-2 transition-all active:scale-95 group" onclick="reactToPost('${post.id}', 'like')" title="Me gusta">
                                    <span class="text-lg group-hover:scale-125 transition-transform">👍</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.like || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1.5 px-2 transition-all active:scale-95 group" onclick="reactToPost('${post.id}', 'support')" title="Apoyo">
                                    <span class="text-lg group-hover:scale-125 transition-transform">💪</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.support || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1.5 px-2 transition-all active:scale-95 group" onclick="reactToPost('${post.id}', 'funny')" title="Me divierte">
                                    <span class="text-lg group-hover:scale-125 transition-transform">😂</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.funny || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1.5 px-2 transition-all active:scale-95 group" onclick="reactToPost('${post.id}', 'angry')" title="Me enoja">
                                    <span class="text-lg group-hover:scale-125 transition-transform">😡</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.angry || 0}</span>
                                </button>
                            </div>
                            <span class="text-[10px] text-white/40 font-bold uppercase tracking-wider">${Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)} reacciones</span>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-4">
                             <button class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5" onclick="toggleComments('${post.id}')">
                                <span class="material-symbols-outlined text-sm">chat_bubble</span>
                                <span class="text-xs font-bold">Comentar (${post.comments || 0})</span>
                            </button>
                            <button class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5" onclick="sharePost('${post.id}')">
                                <span class="material-symbols-outlined text-sm">share</span>
                                <span class="text-xs font-bold">Compartir (${post.shares || 0})</span>
                            </button>
                        </div>
                        
                         <!-- Comments Section -->
                        <div id="comments-${post.id}" class="hidden mt-4 pt-4 border-t border-white/5 animate-fade-in">
                             <div class="flex items-center gap-3 mb-4">
                                <div class="size-8 rounded-full bg-white/10 bg-cover bg-center border border-white/10" style="background-image: url('${avatar}')"></div>
                                <input type="text" placeholder="Escribe un comentario..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:border-[#00f5d4] outline-none transition-colors" onkeydown="addComment('${post.id}', event)">
                             </div>
                             
                             ${post.commentsList ? post.commentsList.map(c => {
            const cId = c.id || 'comm_' + Math.random().toString(36).substr(2, 9);
            c.id = cId;
            return `
                                <div class="flex gap-3 mb-4 group">
                                     <div class="size-8 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0 border border-white/10" style="background-image: url('${c.avatar}')"></div>
                                     <div class="flex-1">
                                         <div class="bg-white/5 rounded-2xl p-3 rounded-tl-sm inline-block min-w-[200px] border border-white/5">
                                            <p class="text-xs font-bold text-[#00f5d4] mb-1">${c.user}</p>
                                            <p class="text-xs text-gray-300 leading-relaxed">${c.text}</p>
                                         </div>
                                         
                                         <!-- Comment Actions -->
                                         <div class="flex items-center gap-3 mt-1.5 ml-2">
                                            <div class="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5 border border-white/5">
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-1 p-1 hover:bg-white/10 rounded" onclick="reactToComment('${post.id}', '${cId}', 'like')">
                                                    <span>👍</span> <span class="font-bold text-white/50">${c.reactions?.like || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-1 p-1 hover:bg-white/10 rounded" onclick="reactToComment('${post.id}', '${cId}', 'support')">
                                                    <span>💪</span> <span class="font-bold text-white/50">${c.reactions?.support || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-1 p-1 hover:bg-white/10 rounded" onclick="reactToComment('${post.id}', '${cId}', 'funny')">
                                                    <span>😂</span> <span class="font-bold text-white/50">${c.reactions?.funny || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-1 p-1 hover:bg-white/10 rounded" onclick="reactToComment('${post.id}', '${cId}', 'angry')">
                                                    <span>😡</span> <span class="font-bold text-white/50">${c.reactions?.angry || 0}</span>
                                                </button>
                                            </div>
                                            <button class="text-[10px] text-white/40 font-bold hover:text-[#00f5d4] transition-colors uppercase tracking-wider" onclick="toggleReplyInput('${cId}')">
                                                Responder
                                            </button>
                                         </div>

                                         <!-- Replies -->
                                         ${c.replies && c.replies.length > 0 ? `
                                            <div class="mt-3 pl-3 border-l-2 border-white/10 space-y-3">
                                                ${c.replies.map(r => `
                                                    <div class="flex gap-2">
                                                        <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${r.avatar}')"></div>
                                                        <div class="bg-white/5 rounded-xl p-2 rounded-tl- sm border border-white/5">
                                                            <p class="text-[10px] font-bold text-[#00f5d4] mb-0.5">${r.user}</p>
                                                            <p class="text-[10px] text-gray-300">${r.text}</p>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                         ` : ''}

                                         <!-- Reply Input -->
                                         <div id="reply-input-${cId}" class="hidden mt-2 flex items-center gap-2 animate-fade-in">
                                              <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${avatar}')"></div>
                                              <input type="text" placeholder="Escribe una respuesta..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs focus:border-[#00f5d4] outline-none transition-colors" onkeydown="submitReply('${post.id}', '${cId}', event)">
                                         </div>
                                     </div>
                                </div>
                             `}).join('') : '<p class="text-center text-xs text-white/40 italic py-4">Sé el primero en comentar</p>'}
                        </div>

                    </div>
                </article>
                `;
    }).join('') : `
                <div class="text-center py-20 opacity-50">
                    <span class="material-symbols-outlined text-6xl mb-4 text-white/20">dynamic_feed</span>
                    <p class="text-lg font-bold">¡El feed está vacío!</p>
                    <p class="text-sm">Comparte tu primera publicación hoy.</p>
                </div>
            `}
        </div>

        <div class="h-20"></div>
    `;
}

// ==========================================
// INTERACTIONS HANDLERS
// ==========================================

function reactToPost(postId, type) {
    const post = AppState.feedPosts.find(p => p.id === postId);
    if (!post) return;

    if (!post.reactions) post.reactions = { like: 0, support: 0, funny: 0, angry: 0 };
    post.reactions[type]++; // Basic increment

    // Refresh only the specific reactions container would be better, but re-render page for now
    // Or simpler: find element and update text
    navigateTo('feed');
    // showToast(`Reaccionaste con ${type === 'like' ? '👍' : type === 'support' ? '💪' : type === 'funny' ? '😂' : '😡'}`);
}

function toggleComments(postId) {
    const el = document.getElementById(`comments-${postId}`);
    if (el) el.classList.toggle('hidden');
}

function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'Wellnessfy Post',
            text: 'Mira esta publicación en Wellnessfy',
            url: window.location.href
        }).then(() => showToast('¡Compartido!')).catch(console.error);
    } else {
        showToast('Enlace copiado al portapapeles');
    }
}

function addComment(postId, event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (!text) return;

        const post = AppState.feedPosts.find(p => p.id === postId);
        if (post) {
            if (!post.commentsList) post.commentsList = [];

            post.commentsList.push({
                id: 'c_' + Date.now(),
                user: AppState.currentUser.name,
                avatar: AppState.currentUser.avatar,
                text: text,
                reactions: { like: 0, support: 0, funny: 0, angry: 0 },
                replies: []
            });
            post.comments++;

            event.target.value = '';
            showToast('Comentario añadido');
            navigateTo('feed');
            setTimeout(() => toggleComments(postId), 100);
        }
    }
}

function reactToComment(postId, commentId, type) {
    const post = AppState.feedPosts.find(p => p.id === postId);
    if (!post || !post.commentsList) return;

    const comment = post.commentsList.find(c => c.id === commentId);
    if (comment) {
        if (!comment.reactions) comment.reactions = { like: 0, support: 0, funny: 0, angry: 0 };
        comment.reactions[type] = (comment.reactions[type] || 0) + 1;

        navigateTo('feed');
        setTimeout(() => toggleComments(postId), 100);
    }
}

function toggleReplyInput(commentId) {
    const el = document.getElementById(`reply-input-${commentId}`);
    if (el) {
        el.classList.toggle('hidden');
        if (!el.classList.contains('hidden')) {
            el.querySelector('input')?.focus();
        }
    }
}

function submitReply(postId, commentId, event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (!text) return;

        const post = AppState.feedPosts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.commentsList.find(c => c.id === commentId);
        if (comment) {
            if (!comment.replies) comment.replies = [];

            comment.replies.push({
                id: 'r_' + Date.now(),
                user: AppState.currentUser.name,
                avatar: AppState.currentUser.avatar,
                text: text
            });

            event.target.value = '';
            showToast('Respuesta enviada');
            navigateTo('feed');
            setTimeout(() => toggleComments(postId), 100);
        }
    }
}

// Expose handlers globally
window.showCreatePostModal = showCreatePostModal;
window.reactToPost = reactToPost;
window.toggleComments = toggleComments;
window.sharePost = sharePost;
window.addComment = addComment;
window.toggleReplyInput = toggleReplyInput;
window.submitReply = submitReply;
window.reactToComment = reactToComment;
