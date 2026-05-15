# Frontend C2C Soporte

Frontend inicial para la vista operativa de soporte.

## Stack

- React
- Vite
- TypeScript
- CSS inicial en `src/styles.css`

## Comandos

```powershell
npm install
npm run typecheck
npm run build
npm run dev
```

## Integracion local

Durante desarrollo, Vite redirige `/api` hacia:

```txt
http://localhost:3000
```

Por eso el backend debe estar levantado en el puerto `3000` para probar la pantalla contra datos reales.

## Pantalla inicial

La primera vista consume:

```txt
GET /api/support/company-devices
```

El objetivo es revisar empresas y dispositivos desde una vista densa para soporte, con busqueda, filtro por estado y conteos basicos.
