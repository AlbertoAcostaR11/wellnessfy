
import { AppState } from '../utils/state.js';
import { db, doc, collection, addDoc, updateDoc } from '../config/firebaseInit.js';
import { navigateTo } from '../router.js';

export function renderCreateCompanyPage() {
    return `
        <div class="glass-header sticky top-0 z-50 mb-6 bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 py-4 border-b border-white/5 flex items-center gap-4">
            <button onclick="window.history.back()" class="size-10 rounded-full glass-card flex items-center justify-center active:scale-95 transition-all text-white/70 hover:text-white">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-white tracking-tight text-gradient">Crear Empresa</h2>
        </div>

        <div class="animate-fade-in pb-24 px-1">
            <div class="glass-card rounded-3xl p-8 border border-[#00f5d4]/20 relative overflow-hidden mb-8">
                <!-- Decorative background -->
                <div class="absolute -top-24 -right-24 size-48 bg-[#00f5d4]/10 blur-3xl rounded-full"></div>
                
                <h3 class="text-lg font-black text-white uppercase tracking-tighter mb-2">Bienvenido a Wellnessfy Business</h3>
                <p class="text-xs text-white/50 leading-relaxed mb-8">
                    Completa los datos básicos para registrar tu marca. Podrás configurar el logo y resto de detalles desde el Panel de Administración una vez creada.
                </p>

                <form id="createCompanyForm" class="space-y-6" onsubmit="handleCreateCompany(event)">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-[#00f5d4] uppercase tracking-widest ml-1">Nombre de la Empresa / Marca</label>
                        <input type="text" id="companyName" required placeholder="Ej: Wellness Center Pro" 
                               class="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/20 focus:border-[#00f5d4]/50 focus:bg-white/10 outline-none transition-all">
                    </div>



                    <div class="pt-4">
                        <label class="flex items-start gap-4 mb-8 group cursor-pointer">
                            <div class="relative flex items-center h-5 flex-shrink-0">
                                <input type="checkbox" id="termsCheck" required 
                                       class="peer size-6 rounded-lg border-2 border-white/20 bg-white/5 checked:bg-[#00f5d4] checked:border-[#00f5d4] appearance-none transition-all cursor-pointer !bg-none"
                                       style="background-image: none !important;">
                                <span class="material-symbols-outlined absolute text-[#020617] text-[16px] font-black opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity">check</span>
                            </div>
                            <p class="text-[10px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors select-none pt-0.5">
                                Acepto los términos y condiciones de <span class="text-[#00f5d4] font-bold">Wellnessfy Business</span> y entiendo que mi perfil de usuario se vinculará como Administrador de esta marca.
                            </p>
                        </label>

                        <button type="submit" id="submitBtn" class="w-full h-14 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-2xl text-[#020617] font-black uppercase tracking-widest text-xs shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>Confirmar Registro</span>
                            <span class="material-symbols-outlined">rocket_launch</span>
                        </button>
                    </div>
                </form>
            </div>

            <div class="flex items-center gap-2 justify-center text-white/20">
                <span class="material-symbols-outlined text-sm">verified_user</span>
                <span class="text-[9px] font-black uppercase tracking-widest">Seguro y Encriptado via Google Cloud</span>
            </div>
        </div>
    `;
}

window.handleCreateCompany = async function (event) {
    event.preventDefault();
    const user = AppState.currentUser;
    if (!user || (!user.uid && !user.id)) {
        window.showToast('Debes estar autenticado', 'error');
        return;
    }

    const name = document.getElementById('companyName').value;
    const submitBtn = document.getElementById('submitBtn');

    if (!name) return;

    try {
        // Bloquear botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';

        // 1. Crear documento en 'companies'
        const companyData = {
            name: name,
            ownerId: user.uid || user.id,
            plan: 'free',
            status: 'active',
            createdAt: Date.now(),
            logoURL: null,
            verificationStatus: 'pending'
        };

        const docRef = await addDoc(collection(db, "companies"), companyData);
        const companyId = docRef.id;

        // 2. Actualizar perfil de usuario
        const userRef = doc(db, 'users', user.uid || user.id);
        await updateDoc(userRef, {
            role: 'business',
            companyId: companyId,
            hasBusiness: true
        });

        // 3. Actualizar AppState
        AppState.userCompany = { id: companyId, ...companyData };
        AppState.currentUser.role = 'business';
        AppState.currentUser.companyId = companyId;
        AppState.currentUser.hasBusiness = true;

        if (window.saveUserData) window.saveUserData();

        window.showToast('¡Empresa de Bienestar creada con éxito!', 'success');

        // Redirigir de vuelta a configuración (ahora mostrará el dashboard)
        setTimeout(() => navigateTo('settings'), 1500);

    } catch (error) {
        console.error('Error al crear empresa:', error);
        window.showToast('No se pudo crear la empresa', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirmar Registro <span class="material-symbols-outlined">rocket_launch</span>';
    }
};
