// Utilidad para parsear y normalizar la lista de responsables en cualquier módulo de ReproPig

export const parsearIdsResponsables = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val.map(Number).filter((n) => !isNaN(n));
    }
    if (typeof val === "number") {
        return [val];
    }
    if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed.startsWith("[")) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !isNaN(n)) : [];
            } catch {
                return [];
            }
        }
        if (trimmed.includes(",")) {
            return trimmed
                .split(",")
                .map((x) => Number(x.trim()))
                .filter((n) => !isNaN(n));
        }
        const num = Number(trimmed);
        if (!isNaN(num) && trimmed.length > 0) {
            return [num];
        }
    }
    return [];
};

export const getListaResponsables = (val, catalogoResponsables = []) => {
    const ids = parsearIdsResponsables(val);
    if (!ids || ids.length === 0) return [];

    const lista = Array.isArray(catalogoResponsables) ? catalogoResponsables : [];

    return ids.map((id) => {
        const encontrado = lista.find(
            (r) => Number(r.Id_Responsable) === Number(id)
        );
        if (encontrado) {
            return encontrado;
        }
        return {
            Id_Responsable: id,
            Nombres: `Responsable #${id}`,
            Apellidos: "",
            Cargo: "Personal asignado",
            Documento: null,
            Telefono: null,
            Email: null
        };
    });
};

export const getNombresResponsablesTexto = (val, catalogoResponsables = []) => {
    const lista = getListaResponsables(val, catalogoResponsables);
    if (!lista || lista.length === 0) return "—";
    return lista.map((r) => `${r.Nombres || ""} ${r.Apellidos || ""}`.trim() || `#${r.Id_Responsable}`).join(", ");
};
