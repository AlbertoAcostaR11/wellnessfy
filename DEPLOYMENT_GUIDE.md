# 🚀 Guía de Despliegue - Wellnessfy

**Última actualización:** 27 de Enero, 2026

---

## 📋 Arquitectura de Firebase Hosting

Este proyecto tiene **múltiples sitios** en Firebase Hosting:

| Sitio Firebase | Dominio | Propósito |
|----------------|---------|-----------|
| `wellnessfy-app` | `app.wellnessfy.io` | **App principal (PRODUCCIÓN)** |
| `wellnessfy-cbc1b` | `wellnessfy-cbc1b.web.app` | Sitio por defecto (desarrollo) |
| `wellnessfy-web` | `wellnessfy-web.web.app` | Web pública |
| `business-wellnessfy` | `business-wellnessfy.web.app` | Portal empresarial |
| `wellnessfy-breathe` | `wellnessfy-breathe.web.app` | App de respiración |

---

## ✅ Comando Correcto para Desplegar a Producción

```bash
npx -y firebase-tools deploy --only hosting:app
```

**⚠️ IMPORTANTE:** Este comando despliega específicamente a `wellnessfy-app`, que es donde apunta `app.wellnessfy.io`.

---

## ❌ Errores Comunes

### Error 1: Desplegar sin especificar target
```bash
# ❌ INCORRECTO - Despliega al sitio por defecto (wellnessfy-cbc1b)
npx -y firebase-tools deploy --only hosting
```

**Consecuencia:** Los cambios NO aparecen en `app.wellnessfy.io`.

### Error 2: Asumir que el caché es el problema
Si `localhost:8000` funciona pero `app.wellnessfy.io` no:
1. ✅ Verifica primero en Firebase Console la fecha del último deploy
2. ✅ Prueba `wellnessfy-app.web.app` directamente
3. ✅ Confirma que estás desplegando al sitio correcto

**El 90% de las veces NO es caché, es configuración de sitio.**

---

## 🔍 Verificación Post-Deploy

Después de desplegar, verifica:

1. **Firebase Console:**
   - Ve a `Hosting` → `wellnessfy-app`
   - Confirma que la "Versión más reciente" tiene la fecha/hora actual

2. **Navegador (modo incógnito):**
   - Abre `app.wellnessfy.io`
   - Revisa la consola para el mensaje de versión:
     ```
     🚀 Iniciando Wellnessfy (vX.X.X - Despliegue DD MMM HH:MM)
     ```

3. **Funcionalidad:**
   - Prueba el Historial (Actividad → Historial)
   - Verifica que no haya errores en consola

---

## 📁 Configuración de Archivos

### `.firebaserc`
Define los targets de hosting:
```json
{
  "targets": {
    "wellnessfy-cbc1b": {
      "hosting": {
        "app": ["wellnessfy-app"],
        "web": ["wellnessfy-web"],
        "business": ["business-wellnessfy"]
      }
    }
  }
}
```

### `firebase.json`
Configuración de hosting con target:
```json
{
  "hosting": [
    {
      "target": "app",
      "public": ".",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "Backups/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    }
  ]
}
```

---

## 🐛 Debugging: Problema de Código Viejo en Producción

### Síntomas:
- ✅ Localhost funciona perfectamente
- ❌ Producción tiene errores o código viejo
- ❌ Hard refresh no soluciona nada

### Diagnóstico:

1. **Verifica qué archivo se descarga:**
   - Abre DevTools → Network
   - Filtra por el archivo problemático (ej: `healthSync.js`)
   - Revisa la fecha en `Last-Modified`

2. **Compara fechas de deploy:**
   ```bash
   # Ver historial de deploys
   npx -y firebase-tools hosting:channel:list
   ```

3. **Verifica el sitio correcto:**
   - Firebase Console → Hosting
   - Confirma que `app.wellnessfy.io` apunta a `wellnessfy-app`
   - Verifica la fecha del último deploy de ese sitio específico

### Solución:
```bash
# Desplegar al sitio correcto
npx -y firebase-tools deploy --only hosting:app

# Esperar 2-3 minutos para propagación CDN
# Probar en modo incógnito
```

---

## 🎯 Checklist de Deploy

Antes de cada deploy a producción:

- [ ] Código probado en `localhost:8000`
- [ ] Sin errores en consola del navegador
- [ ] Funcionalidad crítica verificada (Auth, Sync, Historial)
- [ ] Actualizar mensaje de versión en `main.js`
- [ ] Ejecutar: `npx -y firebase-tools deploy --only hosting:app`
- [ ] Esperar 2-3 minutos
- [ ] Verificar en Firebase Console (fecha de deploy)
- [ ] Probar en modo incógnito: `app.wellnessfy.io`
- [ ] Confirmar mensaje de versión en consola

---

## 📞 Troubleshooting Rápido

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Cambios no aparecen en producción | Deploy al sitio equivocado | `deploy --only hosting:app` |
| Error en prod, funciona en local | Código viejo en servidor | Verificar fecha en Firebase Console |
| "File not found" en producción | Archivo no incluido en deploy | Revisar `.firebaseignore` |
| Múltiples versiones activas | Deploy sin target específico | Usar `--only hosting:app` |

---

## 🔗 Enlaces Útiles

- **Firebase Console:** https://console.firebase.google.com/project/wellnessfy-cbc1b
- **App Producción:** https://app.wellnessfy.io
- **Sitio por defecto:** https://wellnessfy-cbc1b.web.app
- **Documentación Firebase Hosting:** https://firebase.google.com/docs/hosting

---

## 📝 Notas Importantes

1. **Firebase Hosting NO elimina archivos automáticamente**
   - Si renombras un archivo, el viejo seguirá en el servidor
   - Solución: Crear un archivo "redirect" con el nombre viejo

2. **El CDN puede tardar hasta 5 minutos**
   - Siempre espera 2-3 minutos después de deploy
   - Usa modo incógnito para probar

3. **Múltiples sitios = Múltiples deploys**
   - Cada sitio (`app`, `web`, `business`) se despliega independientemente
   - Usa targets específicos para cada uno

---

**Última lección aprendida (27 Enero 2026):**
> "Si localhost funciona pero producción no, el problema NO es el código. 
> Es configuración de infraestructura. Verifica primero Firebase Console."
