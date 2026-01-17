import { AppState } from '../utils/state.js';
import { navigateTo } from '../router.js';
// Mock global needed inside feed code
export function showCreatePostModal() { console.log('Create Post Modal Mock'); }

export function renderFeed() {
    const { avatar } = AppState.currentUser;

    return `
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold tracking-tight">Inicio</h1>
            <button class="btn-icon" onclick="showCreatePostModal()">
                <span class="material-symbols-outlined">add_photo_alternate</span>
            </button>
        </div>

        <!-- Quick Create Post Widget -->
        <div class="glass-card rounded-3xl p-4 mb-6 create-post-card" onclick="showCreatePostModal()">
            <div class="flex items-center gap-3">
                <div class="avatar-ring size-12 flex-shrink-0">
                    <div class="avatar size-full" style="background-image: url('${avatar}')"></div>
                </div>
                <div class="flex-1">
                    <p class="text-white/60 text-sm">¿Cuál es tu meta de bienestar hoy?</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="attachment-btn" onclick="event.stopPropagation(); showCreatePostModal()">
                        <span class="material-symbols-outlined text-sm">image</span>
                    </button>
                    <button class="btn-primary px-4 py-2 text-xs">
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
        <div class="space-y-6">
            ${AppState.feedPosts.map(post => {
        const isVideo = post.type === 'video';
        const hasMedia = post.media && post.media.length > 0;

        return `
                <article class="glass-card rounded-3xl overflow-hidden">
                    <!-- Post Header -->
                    <div class="p-4 flex items-center gap-3">
                        <div class="avatar-ring size-12">
                            <div class="avatar size-full" style="background-image: url('${post.author.avatar}')"></div>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-sm">${post.author.name}</h4>
                            <p class="text-xs text-white/60">${post.author.username} • ${post.timestamp}</p>
                        </div>
                        <button class="btn-icon">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    <!-- Post Media (Carousel or Video) -->
                    ${hasMedia ? `
                        <div class="relative w-full bg-black/50">
                            ${isVideo ? `
                                <video src="${post.media[0]}" controls class="w-full max-h-[500px] object-contain"></video>
                            ` : `
                                <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar" style="scroll-behavior: smooth;">
                                    ${post.media.map(src => `
                                        <div class="flex-shrink-0 w-full snap-center aspect-[4/3] bg-cover bg-center" style="background-image: url('${src}')"></div>
                                    `).join('')}
                                </div>
                                ${post.media.length > 1 ? `
                                    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                        ${post.media.map((_, i) => `<div class="w-1.5 h-1.5 rounded-full bg-white/50 ${i === 0 ? 'bg-white' : ''}"></div>`).join('')}
                                    </div>
                                    <div class="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full text-[10px] font-bold">
                                        1/${post.media.length}
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    ` : ''} 
                     ${!hasMedia && post.image ? `
                         <div class="relative aspect-[4/3] bg-cover bg-center" style="background-image: url('${post.image}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"></div>
                        </div>
                     ` : ''}

                    <!-- Post Content -->
                    <div class="p-4">
                        <p class="text-sm mb-4 leading-relaxed">${post.content}</p>
                        
                        <!-- Reactions Bar -->
                        <div class="flex items-center justify-between mb-4 border-t border-white/5 pt-3">
                            <div class="flex items-center gap-1 bg-white/5 rounded-full p-1 pl-1 pr-3">
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'like')" title="Me gusta">
                                    <span class="text-lg">👍</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.like || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'support')" title="Apoyo">
                                    <span class="text-lg">💪</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.support || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'funny')" title="Me divierte">
                                    <span class="text-lg">😂</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.funny || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'angry')" title="Me enoja">
                                    <span class="text-lg">😡</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.angry || 0}</span>
                                </button>
                            </div>
                            <span class="text-xs text-white/40 font-bold">${post.likes || 0} total</span>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-4">
                             <button class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors" onclick="toggleComments('${post.id}')">
                                <span class="material-symbols-outlined text-sm">chat_bubble</span>
                                <span class="text-xs font-bold">Comentar (${post.comments || 0})</span>
                            </button>
                            <button class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors" onclick="sharePost('${post.id}')">
                                <span class="material-symbols-outlined text-sm">share</span>
                                <span class="text-xs font-bold">Compartir (${post.shares || 0})</span>
                            </button>
                        </div>
                        
                         <!-- Comments Section (Placeholder) -->
                        <div id="comments-${post.id}" class="hidden mt-4 pt-4 border-t border-white/5">
                             <div class="flex items-center gap-3 mb-4">
                                <div class="size-8 rounded-full bg-white/10 bg-cover bg-center" style="background-image: url('${avatar}')"></div>
                                <input type="text" placeholder="Escribe un comentario..." class="flex-1 bg-white/5 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" onkeydown="addComment('${post.id}', event)">
                             </div>
                             ${post.commentsList ? post.commentsList.map(c => {
            const cId = c.id || 'comm_' + Math.random().toString(36).substr(2, 9);
            c.id = cId; // Ensure ID exists for interaction
            return `
                                <div class="flex gap-3 mb-3 group">
                                     <div class="size-8 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${c.avatar}')"></div>
                                     <div class="flex-1">
                                         <div class="bg-white/5 rounded-2xl p-3 rounded-tl-sm inline-block min-w-[200px]">
                                            <p class="text-xs font-bold text-white/80 mb-0.5">${c.user}</p>
                                            <p class="text-xs text-white/60">${c.text}</p>
                                         </div>
                                         
                                         <!-- Comment Actions -->
                                         <div class="flex items-center gap-3 mt-1 ml-2">
                                            <div class="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'like')" title="Me gusta">
                                                    <span>👍</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.like || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'support')" title="Apoyo">
                                                    <span>💪</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.support || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'funny')" title="Me divierte">
                                                    <span>😂</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.funny || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'angry')" title="Me enoja">
                                                    <span>😡</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.angry || 0}</span>
                                                </button>
                                            </div>
                                            <button class="text-[10px] text-white/40 font-bold hover:text-white transition-colors" onclick="toggleReplyInput('${cId}')">
                                                Responder
                                            </button>
                                         </div>

                                         <!-- Replies -->
                                         ${c.replies && c.replies.length > 0 ? `
                                            <div class="mt-2 pl-2 border-l border-white/10 space-y-2">
                                                ${c.replies.map(r => `
                                                    <div class="flex gap-2">
                                                        <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${r.avatar}')"></div>
                                                        <div class="bg-white/5 rounded-xl p-2 rounded-tl-sm">
                                                            <p class="text-[10px] font-bold text-white/80 mb-0.5">${r.user}</p>
                                                            <p class="text-[10px] text-white/60">${r.text}</p>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                         ` : ''}

                                         <!-- Reply Input -->
                                         <div id="reply-input-${cId}" class="hidden mt-2 flex items-center gap-2">
                                              <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${avatar}')"></div>
                                              <input type="text" placeholder="Responder..." class="flex-1 bg-white/5 border-none rounded-full px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none" onkeydown="submitReply('${post.id}', '${cId}', event)">
                                         </div>
                                     </div>
                                </div>
                             `}).join('') : '<p class="text-center text-xs text-white/20 py-2">Sé el primero en comentar</p>'}
                        </div>

                    </div>
                </article>
            `;
    }).join('')}
        </div>

        <!-- Load More -->
        <div class="mt-6 text-center">
            <button class="btn-secondary">
                Cargar Más Publicaciones
            </button>
        </div>
    `;
}

function reactToPost(postId, type) {
    // Visual feedback only for now
    showToast(`Reaccionaste con ${type === 'like' ? '👍' : type === 'support' ? '💪' : type === 'funny' ? '😂' : '😡'}`);
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

        // Simple increment for demo. In real app, toggle user specific reaction.
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

// Expose handlers
window.reactToPost = reactToPost;
window.toggleComments = toggleComments;
window.sharePost = sharePost;
window.addComment = addComment;
window.toggleReplyInput = toggleReplyInput;
window.submitReply = submitReply;
window.reactToComment = reactToComment;
