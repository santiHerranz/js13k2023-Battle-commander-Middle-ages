<!-- 09f242b7-ec2a-472d-bdd6-2937663752d6 686bbdba-f6ba-4519-bd32-2ce4f65e0cd6 -->
# Optimización de FPS para todos los navegadores

## Problemas identificados

1. **Filtros CSS costosos**: Se aplican blur, contrast y brightness en cada frame
2. **Sorting innecesario**: Se ordenan todos los objetos en cada frame
3. **Fog of War costoso**: Crea nuevo canvas y aplica blur cada frame
4. **Múltiples drawImage**: Capas de blood/death se dibujan cada frame
5. **Sin culling**: Se dibujan objetos fuera de pantalla
6. **Game loop**: Mejorable sincronización con requestAnimationFrame

## Optimizaciones a implementar

### 1. Optimizar game loop (src/index.ts)

- Mejorar sincronización con requestAnimationFrame
- Usar delta time más eficiente
- Evitar cálculos innecesarios cuando el juego está pausado

### 2. Eliminar/reducir filtros CSS (src/game/game-map.ts, src/core/draw-engine.ts)

- Pre-renderizar tilemap con blur aplicado una vez
- Reducir o eliminar blur del fog of war
- Usar técnicas de renderizado más eficientes

### 3. Optimizar sorting (src/core/draw-engine.ts)

- Solo ordenar cuando sea necesario (objetos agregados/removidos)
- Usar algoritmos más eficientes o evitar sorting completo

### 4. Optimizar Fog of War (src/core/draw-engine.ts)

- Cachear canvas de fog of war
- Actualizar solo cuando cambien las posiciones
- Reducir frecuencia de actualización

### 5. Optimizar capas de blood/death (src/game-states/game.state.ts)

- Solo actualizar cuando haya cambios
- Usar dirty flags para evitar redibujado innecesario

### 6. Implementar culling de objetos (src/core/draw-engine.ts, src/game-states/game.state.ts)

- Filtrar objetos fuera de pantalla antes de dibujar
- Reducir cantidad de draw calls

### 7. Optimizar loops y operaciones (varios archivos)

- Reducir forEach anidados
- Cachear cálculos repetitivos
- Usar arrays más eficientes

### To-dos

- [ ] Optimizar game loop en src/index.ts para mejor sincronización con requestAnimationFrame y manejo de delta time
- [ ] Pre-renderizar tilemap con blur aplicado una vez en src/game/game-map.ts en lugar de aplicar filtro cada frame
- [ ] Cachear y optimizar fog of war en src/core/draw-engine.ts para evitar crear canvas nuevo cada frame
- [ ] Optimizar sorting en drawItems de src/core/draw-engine.ts para solo ordenar cuando sea necesario
- [ ] Optimizar capas de blood y death en src/game-states/game.state.ts usando dirty flags
- [ ] Implementar culling de objetos fuera de pantalla en drawItems de src/core/draw-engine.ts
- [ ] Optimizar loops forEach y operaciones repetitivas en src/game/game-manager.ts y otros archivos