// Estilos globales Premium para todas las tablas DataTables del proyecto
export const customTableStyles = {
    table: {
        style: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
        },
    },
    tableWrapper: {
        style: {
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9',
            marginTop: '1rem',
            marginBottom: '1rem',
        },
    },
    headRow: {
        style: {
            backgroundColor: '#f8fafc',
            borderBottomWidth: '1px',
            borderBottomColor: '#e2e8f0',
            minHeight: '52px',
        },
    },
    headCells: {
        style: {
            fontSize: '13px',
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    rows: {
        style: {
            fontSize: '14px',
            color: '#334155',
            backgroundColor: '#ffffff',
            minHeight: '60px',
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
            },
            '&:hover': {
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s',
            },
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    pagination: {
        style: {
            borderTopStyle: 'solid',
            borderTopWidth: '1px',
            borderTopColor: '#f1f5f9',
            backgroundColor: '#ffffff',
            borderRadius: '0 0 16px 16px',
            padding: '12px',
            color: '#64748b',
        },
    },
};
