
import { AppState, saveUserData } from '../utils/state.js';
import { navigateTo } from '../router.js';
// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Config
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

let cropper = null;
let pendingAvatarBlob = null;

// ==========================================
// RENDER PROFILE PAGE (View Mode)
// ==========================================
export function renderProfilePage() {
    const user = AppState.currentUser;
    // Mock counts
    const postsCount = AppState.feedPosts ? AppState.feedPosts.filter(p => p.author.username === user.username).length : 0;
    const followersCount = "0";
    const followingCount = "0";

    // Icons map for View Mode
    const sportIcons = {
        gym: 'fitness_center', running: 'directions_run', yoga: 'self_improvement',
        cycling: 'directions_bike', swimming: 'pool', boxing: 'sports_mma',
        crossfit: 'timer', pilates: 'accessibility_new'
    };
    const sportLabels = {
        gym: 'Gym', running: 'Correr', yoga: 'Yoga', cycling: 'Bici',
        swimming: 'Nadar', boxing: 'Box', crossfit: 'Crossfit', pilates: 'Pilates'
    };

    return `
        <!-- Header -->
        <div class="sticky top-0 bg-[#020617]/80 backdrop-blur-lg z-40 -mx-4 -mt-6 px-4 py-4 mb-6 border-b border-white/5 flex items-center justify-between lg:hidden transition-all duration-300">
            <div class="flex items-center gap-2">
                <span class="font-bold text-xl tracking-tight text-white">${user.username ? user.username.replace('@', '') : 'User'}</span>
                <span class="material-symbols-outlined text-[#00f5d4] text-lg" style="font-variation-settings: 'FILL' 1">verified</span>
            </div>
            <div class="flex items-center gap-4">
                 <span class="material-symbols-outlined cursor-pointer text-white hover:text-[#00f5d4] transition-colors" onclick="window.showCreatePostModal()">add_box</span>
                 <span class="material-symbols-outlined cursor-pointer text-white hover:text-[#00f5d4] transition-colors" onclick="window.navigateTo('settings')">settings</span>
            </div>
        </div>

        <section class="px-4 pb-24">
            <!-- Avatar -->
            <div class="flex flex-col items-center mb-4">
                <div class="size-32 rounded-full bg-gradient-to-tr from-[#00f5d4] to-[#00d2ff] p-[3px] mb-3 shadow-[0_0_30px_rgba(0,245,212,0.2)]">
                    <div class="bg-[#020617] rounded-full size-full overflow-hidden relative">
                         <div class="bg-center bg-no-repeat bg-cover size-full" style="background-image: url('${user.avatar || 'https://i.pravatar.cc/300?img=12'}');"></div>
                    </div>
                </div>
            </div>

            <!-- Name & Bio -->
            <h1 class="font-bold text-xl text-center mb-1 text-white">${user.name || 'Usuario'}</h1>
            <div class="mb-6 text-center max-w-sm mx-auto">
                <p class="text-sm text-white/80 leading-relaxed">${user.bio || 'Sin biografía'}</p>
                ${user.link ? `
                <div class="flex items-center justify-center gap-1 mt-2">
                    <span class="material-symbols-outlined text-[#00d2ff] text-xs rotate-[-45deg]">link</span>
                    <a href="${user.link}" target="_blank" class="text-xs text-[#00d2ff] hover:underline">${user.link.replace('https://', '').replace('http://', '')}</a>
                </div>
                ` : ''}
            </div>

            <!-- Stats -->
            <div class="flex justify-center gap-8 mb-8 border-y border-white/5 py-4 bg-white/[0.02]">
                <div class="text-center">
                    <p class="font-bold text-lg text-white">${postsCount}</p>
                    <p class="text-[10px] text-white/50 uppercase tracking-widest">Posts</p>
                </div>
                <div class="text-center">
                    <p class="font-bold text-lg text-white">${followersCount}</p>
                    <p class="text-[10px] text-white/50 uppercase tracking-widest">Fans</p>
                </div>
                <div class="text-center">
                    <p class="font-bold text-lg text-white">${followingCount}</p>
                    <p class="text-[10px] text-white/50 uppercase tracking-widest">Following</p>
                </div>
            </div>

            <!-- NEW: Interests / Activities Display (Moved Up) -->
            ${(user.interests && Array.isArray(user.interests) && user.interests.length > 0) ? `
            <div class="mb-6 text-center">
                <p class="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Deportes de interés</p>
                <div class="flex flex-wrap items-center justify-center gap-2 px-2">
                    ${user.interests.map(sport => `
                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00f5d4]/10 border border-[#00f5d4]/30">
                            <span class="material-symbols-outlined text-[#00f5d4] text-sm">${sportIcons[sport] || 'circle'}</span>
                            <span class="text-[#00f5d4] text-[10px] font-bold uppercase tracking-wider">${sportLabels[sport] || sport}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex gap-3 mb-8">
                <button onclick="window.showEditProfile()" class="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-bold hover:bg-white/10 transition-colors active:scale-[0.98]">
                    Editar Perfil
                </button>
                <button class="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-bold hover:bg-white/10 transition-colors active:scale-[0.98]">
                    Compartir
                </button>
                 <button onclick="window.navigateTo('settings')" class="px-4 bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-[0.98]">
                    <span class="material-symbols-outlined text-white">settings</span>
                </button>
            </div>

            <!-- Details Grid -->
             <div class="grid grid-cols-2 gap-3 mb-8">
                <div class="glass-card p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                    <span class="text-[10px] text-white/40 uppercase tracking-wider">Edad</span>
                    <span class="text-sm font-bold text-white">${calculateAge(user.birthdate)} años</span>
                </div>
                <div class="glass-card p-3 rounded-xl bg-white/5 flex flex-col gap-1">
                    <span class="text-[10px] text-white/40 uppercase tracking-wider">Cuerpo</span>
                    <span class="text-sm font-bold text-white">${user.height || '--'} ${user.heightUnit || 'cm'} • ${user.weight || '--'} ${user.weightUnit || 'kg'}</span>
                </div>
             </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-3 gap-1">
                ${renderUserPosts(user)}
            </div>
        </section>
    `;
}

// ... renderUserPosts & calculateAge remain same ...
function renderUserPosts(user) {
    if (!AppState.feedPosts || AppState.feedPosts.length === 0) {
        return `<div class="col-span-3 text-center py-10 text-white/30 text-xs">No hay publicaciones aún</div>`;
    }
    const myPosts = AppState.feedPosts.filter(p => p.author.username === user.username);
    if (myPosts.length === 0) return `<div class="col-span-3 text-center py-10 text-white/30 text-xs">No hay publicaciones aún</div>`;

    return myPosts.map(post => `
        <div class="aspect-square bg-white/5 relative group cursor-pointer overflow-hidden">
            <div class="bg-center bg-cover size-full transition-transform duration-500 group-hover:scale-110" style="background-image: url('${post.image}');"></div>
        </div>
    `).join('');
}

function calculateAge(birthdate) {
    if (!birthdate) return '--';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ==========================================
// EDIT PROFILE
// ==========================================
export function showEditProfile(isOnboarding = false) {
    const user = AppState.currentUser;
    // ... Sports data ...
    const sportsList = ['gym', 'running', 'yoga', 'cycling', 'swimming', 'boxing', 'crossfit', 'pilates'];
    const sportsIcons = { gym: 'fitness_center', running: 'directions_run', yoga: 'self_improvement', cycling: 'directions_bike', swimming: 'pool', boxing: 'sports_mma', crossfit: 'timer', pilates: 'accessibility_new' };
    const sportsLabels = { gym: 'Gym', running: 'Correr', yoga: 'Yoga', cycling: 'Bici', swimming: 'Nadar', boxing: 'Box', crossfit: 'Crossfit', pilates: 'Pilates' };

    const modal = `
    <div class="modal-overlay fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-fade-in" onclick="${isOnboarding ? '' : 'window.closeModal()'}">
        <div class="modal-content absolute bottom-0 w-full lg:w-[500px] lg:relative lg:mx-auto lg:my-auto lg:rounded-2xl bg-[#0f172a] flex flex-col h-[90vh] lg:h-[800px] rounded-t-3xl overflow-hidden shadow-2xl transition-transform duration-300 translate-y-0" onclick="event.stopPropagation()">
            
            <header class="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0f172a]/95 backdrop-blur z-40 border-b border-white/5">
                <button class="text-white text-base font-medium hover:text-white/80 transition-colors ${isOnboarding ? 'invisible' : ''}" onclick="window.closeModal()">Cancelar</button>
                <h1 class="font-bold text-lg tracking-tight text-white">${isOnboarding ? 'Crear Perfil' : 'Editar Perfil'}</h1>
                <button class="text-[#00f5d4] text-base font-bold hover:text-[#00d2ff] transition-colors" onclick="window.handleEditProfileSubmit(${isOnboarding})">Guardar</button>
            </header>
            
            <main class="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                <!-- Avatar -->
                <section class="flex flex-col items-center py-8">
                    <div class="relative group cursor-pointer" onclick="document.getElementById('editProfilePhotoInput').click()">
                        <div class="size-28 rounded-full bg-gradient-to-tr from-[#00f5d4] to-[#00d2ff] p-[3px] shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:shadow-[0_0_30px_rgba(0,245,212,0.5)] transition-all">
                            <div class="bg-[#020617] rounded-full size-full overflow-hidden">
                                <div class="avatar-preview bg-center bg-no-repeat aspect-square bg-cover size-full" style='background-image: url("${user.avatar || 'https://i.pravatar.cc/300?img=12'}");'></div>
                            </div>
                        </div>
                        <div class="absolute bottom-1 right-1 bg-[#00f5d4] text-[#020617] size-8 rounded-full flex items-center justify-center border-2 border-[#020617] shadow-lg">
                            <span class="material-symbols-outlined text-lg font-bold">photo_camera</span>
                        </div>
                    </div>
                    <input type="file" id="editProfilePhotoInput" class="hidden" accept="image/*" onchange="window.startCrop(this)">
                    <button class="text-[#00f5d4] text-sm font-semibold mt-3 hover:underline" onclick="document.getElementById('editProfilePhotoInput').click()">Cambiar Foto</button>
                </section>

                <section class="px-6 space-y-6">
                    <!-- Standard Fields -->
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Nombre</label>
                        <input id="editName" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all placeholder-white/20" type="text" value="${user.name || ''}" placeholder="Tu Nombre"/>
                    </div>
                    
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Usuario</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">@</span>
                            <input id="editUsername" class="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all placeholder-white/20" type="text" value="${user.username ? user.username.replace('@', '') : ''}" placeholder="username"/>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Biografía</label>
                        <textarea id="editBio" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all resize-none leading-relaxed placeholder-white/20" rows="3" placeholder="Cuéntanos sobre ti...">${user.bio || ''}</textarea>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Enlace</label>
                        <input id="editLink" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all placeholder-white/20" type="url" placeholder="https://website.com" value="${user.link || ''}"/>
                    </div>

                    <div class="h-px bg-white/5 my-2"></div>

                    <!-- Stats Fields -->
                    <div class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Fecha de Nacimiento</label>
                            <input id="editBirthdate" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all" type="date" value="${user.birthdate || ''}"/>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Peso</label>
                                <div class="relative">
                                    <input id="editWeight" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all placeholder-white/20" type="number" step="0.1" placeholder="0.0" value="${user.weight || ''}"/>
                                    <div class="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-[#020617] p-1 rounded-lg border border-white/5">
                                        <button id="btnKg" type="button" class="px-2 py-1 text-[10px] font-bold rounded transition-colors ${(!user.weightUnit || user.weightUnit === 'kg') ? 'bg-[#00f5d4] text-[#020617]' : 'text-white/40 hover:text-white'}" onclick="window.toggleWeightUnit('kg')">KG</button>
                                        <button id="btnLbs" type="button" class="px-2 py-1 text-[10px] font-bold rounded transition-colors ${user.weightUnit === 'lbs' ? 'bg-[#00f5d4] text-[#020617]' : 'text-white/40 hover:text-white'}" onclick="window.toggleWeightUnit('lbs')">KB</button>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Altura</label>
                                <div class="relative">
                                    <input id="editHeight" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white text-sm font-medium focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none transition-all placeholder-white/20" type="number" step="0.1" placeholder="0.0" value="${user.height || ''}"/>
                                    <div class="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-[#020617] p-1 rounded-lg border border-white/5">
                                        <button id="btnCm" type="button" class="px-2 py-1 text-[10px] font-bold rounded transition-colors ${(!user.heightUnit || user.heightUnit === 'cm') ? 'bg-[#00f5d4] text-[#020617]' : 'text-white/40 hover:text-white'}" onclick="window.toggleHeightUnit('cm')">CM</button>
                                        <button id="btnFt" type="button" class="px-2 py-1 text-[10px] font-bold rounded transition-colors ${user.heightUnit === 'ft' ? 'bg-[#00f5d4] text-[#020617]' : 'text-white/40 hover:text-white'}" onclick="window.toggleHeightUnit('ft')">FT</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Sexo Biológico</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button id="genderMale" class="py-3 rounded-xl text-sm font-bold border transition-all ${user.gender === 'male' ? 'border-[#00f5d4] bg-[#00f5d4]/10 text-[#00f5d4]' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}" onclick="window.selectGender('male')">Masculino</button>
                                <button id="genderFemale" class="py-3 rounded-xl text-sm font-bold border transition-all ${user.gender === 'female' ? 'border-[#00f5d4] bg-[#00f5d4]/10 text-[#00f5d4]' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}" onclick="window.selectGender('female')">Femenino</button>
                            </div>
                        </div>
                        
                        <!-- NEW: Sports Selector -->
                         <div class="space-y-4 pt-4 border-t border-white/5">
                            <label class="text-white/40 text-[10px] font-bold uppercase tracking-wider ml-1">Tipo de Actividad</label>
                            <div class="grid grid-cols-4 gap-2">
                                ${sportsList.map(sport => {
        const isSelected = user.interests && user.interests.includes(sport);
        return `
                                    <button id="sport-${sport}" onclick="window.toggleSportSelection('${sport}')" 
                                        class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${isSelected ? 'border-[#00f5d4] bg-[#00f5d4]/10 text-[#00f5d4]' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}">
                                        <span class="material-symbols-outlined text-xl">${sportsIcons[sport]}</span>
                                        <span class="text-[9px] font-bold uppercase tracking-wider">${sportsLabels[sport]}</span>
                                    </button>
                                    `;
    }).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="h-10"></div>
                </section>
            </main>
        </div>
    </div>
    `;

    const container = document.getElementById('modalsContainer');
    container.innerHTML = modal;
}

// ... Cropper & Helpers (startCrop, finishCrop, toggles) are same as before ...
window.startCrop = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const cropModal = document.createElement('div');
            cropModal.id = 'cropModal';
            cropModal.className = 'fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in';
            cropModal.innerHTML = `
                <div class="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-black/90">
                    <img id="imageToCrop" src="${e.target.result}" style="max-width: 100%; max-height: 80vh; display: block;">
                </div>
                <div class="bg-[#0f172a] border-t border-white/10 p-6 flex justify-between items-center safe-area-bottom pb-8 z-50">
                    <button class="text-white font-medium px-4" onclick="document.getElementById('cropModal').remove(); document.getElementById('editProfilePhotoInput').value = '';">Cancelar</button>
                    <p class="text-white/50 text-xs font-medium uppercase tracking-widest">Ajustar</p>
                    <button class="bg-[#00f5d4] text-[#020617] font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(0,245,212,0.4)]" onclick="window.finishCrop()">Recortar</button>
                </div>
             `;
            document.body.appendChild(cropModal);
            const image = document.getElementById('imageToCrop');
            cropper = new Cropper(image, { aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 0.9, guides: true, center: true, highlight: false, background: false, modal: true });
        }
        reader.readAsDataURL(input.files[0]);
    }
};

window.finishCrop = function () {
    if (!cropper) return;
    // Export as JPEG 0.7 quality to keep Base64 string small for Firestore (Target < 100KB)
    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {
        pendingAvatarBlob = blob;
        const url = URL.createObjectURL(blob);
        const previews = document.querySelectorAll('.avatar-preview');
        previews.forEach(div => div.style.backgroundImage = `url("${url}")`);
        document.getElementById('cropModal').remove();
    }, 'image/jpeg', 0.7);
};

window.toggleWeightUnit = function (unit) {
    AppState.currentUser.weightUnit = unit;
    const btnKg = document.getElementById('btnKg');
    const btnLbs = document.getElementById('btnLbs');
    if (btnKg && btnLbs) {
        if (unit === 'kg') {
            btnKg.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors bg-[#00f5d4] text-[#020617]';
            btnLbs.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors text-white/40 hover:text-white cursor-pointer';
        } else {
            btnLbs.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors bg-[#00f5d4] text-[#020617]';
            btnKg.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors text-white/40 hover:text-white cursor-pointer';
        }
    }
};

window.toggleHeightUnit = function (unit) {
    AppState.currentUser.heightUnit = unit;
    const btnCm = document.getElementById('btnCm');
    const btnFt = document.getElementById('btnFt');
    if (btnCm && btnFt) {
        if (unit === 'cm') {
            btnCm.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors bg-[#00f5d4] text-[#020617]';
            btnFt.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors text-white/40 hover:text-white cursor-pointer';
        } else {
            btnFt.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors bg-[#00f5d4] text-[#020617]';
            btnCm.className = 'px-2 py-1 text-[10px] font-bold rounded transition-colors text-white/40 hover:text-white cursor-pointer';
        }
    }
};

window.selectGender = function (gender) {
    AppState.currentUser.gender = gender;
    const btnMale = document.getElementById('genderMale');
    const btnFemale = document.getElementById('genderFemale');
    const inactiveClass = 'py-3 rounded-xl text-sm font-bold border transition-all border-white/10 bg-white/5 text-white/40 hover:bg-white/10';
    const activeClass = 'py-3 rounded-xl text-sm font-bold border transition-all border-[#00f5d4] bg-[#00f5d4]/10 text-[#00f5d4]';
    if (btnMale && btnFemale) {
        if (gender === 'male') {
            btnMale.className = activeClass;
            btnFemale.className = inactiveClass;
        } else {
            btnFemale.className = activeClass;
            btnMale.className = inactiveClass;
        }
    }
};

window.toggleSportSelection = function (sport) {
    const user = AppState.currentUser;
    if (!user.interests) user.interests = [];
    const index = user.interests.indexOf(sport);
    const btn = document.getElementById(`sport-${sport}`);
    if (index > -1) {
        user.interests.splice(index, 1); // remove
        if (btn) btn.className = 'flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all border-white/10 bg-white/5 text-white/40 hover:bg-white/10';
    } else {
        user.interests.push(sport); // add
        if (btn) btn.className = 'flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all border-[#00f5d4] bg-[#00f5d4]/10 text-[#00f5d4]';
    }
};

window.closeModal = function () {
    const m = document.getElementById('modalsContainer');
    if (m) m.innerHTML = '';
    pendingAvatarBlob = null;
    cropper = null;
};

// ==========================================
// SUBMIT LOGIC (Robust Config)
// ==========================================
window.handleEditProfileSubmit = async function (isOnboarding) {
    const btn = event.target;
    if (btn.disabled) return;

    const originalText = btn.innerText;
    btn.innerText = "Guardando...";
    btn.disabled = true;

    try {
        const user = AppState.currentUser;

        // 1. Identify User ID
        if (!user.id) user.id = localStorage.getItem('wellnessfy_user_id');
        if (!user.id && auth.currentUser) user.id = auth.currentUser.uid;

        if (!user.id) throw new Error("ID de usuario no encontrado. Tu sesión parece inválida.");

        // 2. Gather Data from DOM
        user.name = document.getElementById('editName').value;
        user.username = '@' + document.getElementById('editUsername').value.replace('@', '');
        user.bio = document.getElementById('editBio').value;
        user.link = document.getElementById('editLink').value;

        const bday = document.getElementById('editBirthdate');
        if (bday) user.birthdate = bday.value;

        const weight = document.getElementById('editWeight');
        if (weight) user.weight = weight.value;

        const height = document.getElementById('editHeight');
        if (height) user.height = height.value;

        // 3. Process Avatar (BASE64 STRATEGY to bypass CORS)
        if (pendingAvatarBlob) {
            console.log('Converting avatar to Base64...');
            try {
                // Convert Blob to Base64 string
                const base64Entry = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(pendingAvatarBlob);
                });

                // Save directly to user profile
                user.avatar = base64Entry;
                console.log('Avatar converted successfully.');
            } catch (err) {
                console.error("Error processing image:", err);
                alert("No se pudo procesar la imagen.");
            }
        } else {
            // Keep existing avatar if not changed
            if (!user.avatar) user.avatar = 'https://i.pravatar.cc/300?img=12';
        }

        // 4. Save to Firestore (Cloud)
        console.log('Syncing to Cloud...', user.id);
        const userRef = doc(db, "users", user.id);

        const cleanUser = JSON.parse(JSON.stringify(user));

        await setDoc(userRef, cleanUser, { merge: true });

        // 5. Update Local State
        AppState.currentUser = user;
        saveUserData();

        console.log('Profile saved successfully.');
        window.location.reload();

    } catch (error) {
        console.error("Profile Save Error:", error);
        alert(`Error al guardar: ${error.message}`);
        btn.innerText = originalText;
        btn.disabled = false;
    }
};
