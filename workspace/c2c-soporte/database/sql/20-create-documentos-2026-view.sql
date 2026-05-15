-- C2C Soporte - vista local documentos 2026
-- Ejecutar conectado a la base local soporte.
-- No ejecutar en produccion.

CREATE OR REPLACE VIEW rr_gestion_soporte.documentos_2026 AS
SELECT '2026-01'::text AS periodo, d.*
FROM staging_public.documentos_2026_01 d
UNION ALL
SELECT '2026-02'::text AS periodo, d.*
FROM staging_public.documentos_2026_02 d
UNION ALL
SELECT '2026-03'::text AS periodo, d.*
FROM staging_public.documentos_2026_03 d
UNION ALL
SELECT '2026-04'::text AS periodo, d.*
FROM staging_public.documentos_2026_04 d
UNION ALL
SELECT '2026-05'::text AS periodo, d.*
FROM staging_public.documentos_2026_05 d;

COMMENT ON VIEW rr_gestion_soporte.documentos_2026 IS
  'Union local de ventanas staging de documentos 2026. No representa una copia completa de public.documentos.';
