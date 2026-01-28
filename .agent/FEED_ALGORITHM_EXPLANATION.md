# 📊 Algoritmo del Feed de Wellnessfy

## 🎯 Resumen Ejecutivo

El feed de Wellnessfy actualmente utiliza un **algoritmo cronológico simple** (reverse chronological) donde las publicaciones más recientes aparecen primero. No hay ranking algorítmico, filtrado por relevancia o personalización basada en ML.

---

## 🔍 Arquitectura Actual

### **1. Fuente de Datos**
```javascript
// Línea 397 en feed.js
AppState.feedPosts.length > 0 ? AppState.feedPosts.map(post => {
```

**Fuente**: `AppState.feedPosts` (array en memoria)
- **Origen**: Cargado desde Firestore en `main.js`
- **Colección**: `posts` en Firebase
- **Sincronización**: Al iniciar la app y al crear nuevos posts

---

### **2. Orden de Publicaciones**

#### **Algoritmo Actual: Cronológico Inverso**
```javascript
// En publishPost() - Línea 310
newPost.id = docRef.id;
AppState.feedPosts.unshift(newPost);  // ← Agrega al INICIO del array
```

**Características**:
- ✅ **Simple y predecible**
- ✅ **Tiempo real** (nuevos posts aparecen inmediatamente)
- ❌ **No personalizado** (todos ven el mismo orden)
- ❌ **No considera relevancia** (engagement, intereses, círculos)

---

### **3. Filtrado Actual**

#### **Filtros Disponibles (UI)**
```javascript
// Líneas 387-393
<div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
    <button class="badge badge-primary cursor-pointer">Todos</button>
    ${AppState.circles.map(circle => `
        <button class="badge badge-secondary cursor-pointer">${circle.name}</button>
    `).join('')}
</div>
```

**Estado Actual**:
- ⚠️ **Botones NO funcionales** (solo UI)
- Los filtros por círculo están implementados visualmente pero no tienen lógica

---

## 📈 Datos Almacenados por Post

### **Estructura de Post en Firestore**
```javascript
{
    author: {
        name: "Usuario",
        username: "@usuario",
        avatar: "url_avatar"
    },
    timestamp: 1737501234567,        // Unix timestamp
    content: "Texto del post",
    media: ["base64_image_1", ...],  // Array de imágenes/videos
    aspectRatio: "aspect-square",    // Formato de imagen
    type: "image" | "video",
    likes: 0,                         // DEPRECATED (usar reactions)
    reactions: {
        like: 0,
        support: 0,
        funny: 0,
        angry: 0
    },
    comments: 0,                      // Contador
    shares: 0,
    commentsList: [...]               // Array de comentarios
}
```

---

## 🎨 Posibles Mejoras Algorítmicas

### **Opción 1: Ranking por Engagement**
```javascript
function rankByEngagement(posts) {
    return posts.sort((a, b) => {
        const scoreA = calculateEngagementScore(a);
        const scoreB = calculateEngagementScore(b);
        return scoreB - scoreA;
    });
}

function calculateEngagementScore(post) {
    const reactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
    const comments = post.comments || 0;
    const shares = post.shares || 0;
    
    // Ponderación
    const score = (reactions * 1) + (comments * 3) + (shares * 5);
    
    // Factor de decaimiento temporal (posts recientes tienen boost)
    const hoursSincePost = (Date.now() - post.timestamp) / (1000 * 60 * 60);
    const timeFactor = Math.exp(-hoursSincePost / 24); // Decae exponencialmente
    
    return score * timeFactor;
}
```

### **Opción 2: Filtrado por Círculos**
```javascript
function filterByCircle(posts, circleId) {
    if (circleId === 'all') return posts;
    
    // Obtener miembros del círculo
    const circle = AppState.circles.find(c => c.id === circleId);
    if (!circle) return posts;
    
    const memberIds = circle.members || [];
    
    // Filtrar posts de miembros del círculo
    return posts.filter(post => {
        const authorId = post.author.id || post.authorId;
        return memberIds.includes(authorId);
    });
}
```

### **Opción 3: Personalización por Intereses**
```javascript
function personalizeByInterests(posts, userInterests) {
    return posts.map(post => {
        // Calcular relevancia basada en contenido
        let relevanceScore = 0;
        
        // Análisis de keywords
        const content = post.content.toLowerCase();
        userInterests.forEach(interest => {
            if (content.includes(interest.toLowerCase())) {
                relevanceScore += 10;
            }
        });
        
        // Engagement histórico con el autor
        const authorEngagement = getUserEngagementWithAuthor(post.author.id);
        relevanceScore += authorEngagement;
        
        return { ...post, relevanceScore };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

### **Opción 4: Algoritmo Híbrido (Recomendado)**
```javascript
function hybridFeedAlgorithm(posts, userId) {
    const now = Date.now();
    
    return posts.map(post => {
        let score = 0;
        
        // 1. Factor Temporal (40%)
        const hoursSincePost = (now - post.timestamp) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 100 - hoursSincePost);
        score += recencyScore * 0.4;
        
        // 2. Factor de Engagement (30%)
        const reactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
        const engagementScore = (reactions * 1) + (post.comments * 3) + (post.shares * 5);
        score += Math.min(engagementScore, 100) * 0.3;
        
        // 3. Factor de Círculos (20%)
        const isInMyCircles = checkIfAuthorInMyCircles(post.author.id, userId);
        score += isInMyCircles ? 20 : 0;
        
        // 4. Factor de Interacción Previa (10%)
        const hasInteracted = checkIfUserInteractedWithPost(post.id, userId);
        score += hasInteracted ? 10 : 0;
        
        return { ...post, algorithmScore: score };
    }).sort((a, b) => b.algorithmScore - a.algorithmScore);
}
```

---

## 🚀 Implementación Recomendada

### **Fase 1: Activar Filtros por Círculo** (Corto Plazo)
1. Agregar estado para círculo seleccionado
2. Filtrar `AppState.feedPosts` por autor en círculo
3. Re-renderizar feed al cambiar filtro

### **Fase 2: Ranking Básico** (Mediano Plazo)
1. Implementar `calculateEngagementScore()`
2. Agregar toggle "Más recientes" vs "Más populares"
3. Guardar preferencia del usuario

### **Fase 3: Personalización Avanzada** (Largo Plazo)
1. Tracking de interacciones del usuario
2. Análisis de contenido con keywords
3. Machine Learning para recomendaciones

---

## 📊 Métricas a Trackear

Para mejorar el algoritmo, necesitamos trackear:

```javascript
{
    userId: "user123",
    postId: "post456",
    action: "view" | "like" | "comment" | "share" | "click",
    timestamp: 1737501234567,
    timeSpent: 15000,  // ms viendo el post
    scrollDepth: 0.8    // % del post visible
}
```

---

## 🎯 Conclusión

**Estado Actual**: Algoritmo cronológico simple
**Recomendación**: Implementar filtros por círculo primero, luego ranking híbrido
**Objetivo**: Maximizar engagement manteniendo simplicidad

---

## 📝 Notas Técnicas

- **Performance**: Con >1000 posts, considerar paginación
- **Caché**: Implementar caché de posts recientes
- **Real-time**: Considerar Firestore listeners para actualizaciones en vivo
- **Analytics**: Integrar Firebase Analytics para medir engagement
