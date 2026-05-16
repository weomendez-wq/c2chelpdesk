type PaginationBarProps = {
  itemCount: number;
  limit: number;
  offset: number;
  total?: number;
  onLimitChange: (limit: number) => void;
  onOffsetChange: (offset: number) => void;
};

const pageSizes = [10, 25, 50, 100];

export const PaginationBar = ({
  itemCount,
  limit,
  offset,
  total,
  onLimitChange,
  onOffsetChange
}: PaginationBarProps) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = total === undefined ? undefined : Math.max(1, Math.ceil(total / limit));
  const from = itemCount === 0 ? 0 : offset + 1;
  const to = offset + itemCount;
  const canPrevious = offset > 0;
  const canNext = total === undefined ? itemCount === limit : to < total;

  return (
    <div className="pagination-bar">
      <div className="pagination-meta">
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          aria-label="Registros por pagina"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size} por pagina
            </option>
          ))}
        </select>
        <span>
          {total === undefined
            ? `Mostrando ${from}-${to}`
            : `Mostrando ${from}-${to} de ${total.toLocaleString("es-CL")}`}
        </span>
      </div>

      <div className="pagination-actions">
        <button type="button" disabled={!canPrevious} onClick={() => onOffsetChange(0)}>
          Primero
        </button>
        <button
          type="button"
          disabled={!canPrevious}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          Anterior
        </button>
        <span>
          Pagina {currentPage}
          {totalPages ? ` de ${totalPages}` : ""}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Siguiente
        </button>
        <button
          type="button"
          disabled={!canNext || totalPages === undefined}
          onClick={() => {
            if (totalPages) {
              onOffsetChange((totalPages - 1) * limit);
            }
          }}
        >
          Ultimo
        </button>
      </div>
    </div>
  );
};
