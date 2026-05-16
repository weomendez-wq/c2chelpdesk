import { useMemo, useState } from "react";
import type { CompanyControl } from "../services/supportApi";

type TenantSelectorProps = {
  companies: CompanyControl[];
  loading: boolean;
  selectedCompany: CompanyControl | null;
  onSelect: (company: CompanyControl | null) => void;
};

export const TenantSelector = ({
  companies,
  loading,
  selectedCompany,
  onSelect
}: TenantSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return companies;
    }

    return companies.filter((company) => {
      const name = company.empresa_name?.toLowerCase() ?? "";
      const tenant = company.tenant_id.toLowerCase();
      const rut = String(company.rut ?? "");

      return name.includes(term) || tenant.includes(term) || rut.includes(term);
    });
  }, [companies, search]);

  return (
    <div className="tenant-selector">
      <button
        className={`tenant-trigger ${selectedCompany ? "is-selected" : ""}`}
        type="button"
        disabled={loading}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="tenant-icon" aria-hidden="true">
          {selectedCompany ? "E" : "G"}
        </span>
        <span className="tenant-copy">
          <small>Empresa en gestion</small>
          <strong>{loading ? "Cargando..." : selectedCompany?.empresa_name ?? "Vista global"}</strong>
        </span>
        {selectedCompany ? (
          <span className="tenant-meta">
            RUT {selectedCompany.rut ?? "-"}
            <br />
            {selectedCompany.tenant_id.slice(0, 8)}
          </span>
        ) : null}
        <span className="tenant-caret" aria-hidden="true">
          {open ? "^" : "v"}
        </span>
      </button>

      {open ? (
        <div className="tenant-menu">
          <div className="tenant-search">
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar empresa, RUT o tenant"
            />
          </div>
          <p className="tenant-counter">
            {filteredCompanies.length.toLocaleString("es-CL")} empresas disponibles
          </p>
          <div className="tenant-options">
            {filteredCompanies.map((company) => (
              <button
                className={
                  selectedCompany?.tenant_id === company.tenant_id && selectedCompany.rut === company.rut
                    ? "tenant-option is-active"
                    : "tenant-option"
                }
                key={`${company.tenant_id}-${company.rut}`}
                type="button"
                onClick={() => {
                  onSelect(company);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <strong>{company.empresa_name ?? "Sin nombre"}</strong>
                <span>RUT {company.rut ?? "-"} | {company.tenant_id}</span>
              </button>
            ))}
          </div>
          <button
            className="tenant-reset"
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
              setSearch("");
            }}
          >
            Volver a vista global
          </button>
        </div>
      ) : null}
    </div>
  );
};
