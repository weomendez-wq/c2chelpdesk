# Decision - Stack tecnico inicial

## Fecha

2026-05-15

## Decision

Usar TypeScript como lenguaje principal para backend y frontend.

## Backend

- Runtime: Node.js.
- Framework HTTP: Express.
- Validacion: Zod.
- Logger: Pino.
- Base de datos: PostgreSQL con `pg`.
- Configuracion: variables de entorno validadas al iniciar.
- Arquitectura: routes, validators, services, repositories, middlewares y shared.

## Frontend

- Framework: React.
- Build tool: Vite.
- Lenguaje: TypeScript.
- Estilos: Tailwind.
- Estado remoto/API: TanStack Query.
- Tablas: TanStack Table.
- Graficos: Recharts.
- Cliente HTTP: `fetch` encapsulado en services/adapters, evitando acoplar componentes a URLs directas.

## Motivo

TypeScript reduce errores en contratos entre backend, frontend y SQL. Express mantiene baja complejidad inicial. Zod permite validar entradas y configuracion. Pino entrega logs estructurados con buen rendimiento. `pg` es suficiente para controlar consultas SQL de forma explicita sin introducir una capa ORM antes de entender bien el modelo real.

## Restricciones

- No usar ORM en la primera etapa.
- No crear codigo de aplicacion antes de definir estructura y configuracion.
- No conectar a base productiva desde codigo sin reglas SQL documentadas.
- No registrar secretos en logs.

## Criterio de revision

Esta decision puede revisarse si el proyecto requiere migraciones complejas, modelos de dominio persistentes o una capa ORM justificada por volumen de entidades y mantenimiento.

