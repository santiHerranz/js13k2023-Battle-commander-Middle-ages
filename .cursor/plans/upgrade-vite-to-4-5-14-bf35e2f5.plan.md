<!-- bf35e2f5-90b7-43f9-ac98-23f42bea08ce 3d69af26-efee-4965-a2d4-d39aeb25339d -->
# Actualizar Vite a 4.5.14

## Resumen

Actualizar la dependencia de Vite de `^4.1.3` a `4.5.14` en `package.json` y actualizar el lockfile.

## Cambios necesarios

### 1. Actualizar package.json

- Cambiar la versión de `vite` en `devDependencies` de `^4.1.3` a `4.5.14` en `package.json`

### 2. Actualizar dependencias

- Ejecutar `npm install` para actualizar `package-lock.json` y descargar la nueva versión

## Archivos a modificar

- `package.json` (línea 23): actualizar versión de vite

## Notas

- Esta es una actualización dentro de la misma versión mayor (4.x), por lo que no debería haber cambios incompatibles
- Los plugins personalizados en `vite.config.ts` deberían seguir funcionando sin cambios
- `@rollup/plugin-typescript` es compatible con Vite 4.5.14

### To-dos

- [ ] Actualizar la versión de Vite en package.json de '^4.1.3' a '4.5.14'
- [ ] Ejecutar npm install para actualizar package-lock.json y descargar la nueva versión de Vite