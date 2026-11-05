// Estilos globales Premium para todas las tablas DataTables del proyecto
export const customTableStyles = {
    table: {
        style: {
            backgroundColor: '#ffffff',
            borderCollapse: 'separate',
            borderSpacing: '0',
            width: '100%',
        },
    },
    tableWrapper: {
        style: {
            borderRadius: '16px',
            boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04), 0 2px 6px -2px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9',
            marginTop: '0.85rem',
            marginBottom: '0.85rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
        },
    },
    headRow: {
        style: {
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            minHeight: '48px',
        },
    },
    headCells: {
        style: {
            fontSize: '11px',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            paddingLeft: '10px',
            paddingRight: '10px',
            whiteSpace: 'nowrap',
        },
    },
    rows: {
        style: {
            fontSize: '13px',
            fontWeight: '500',
            color: '#334155',
            backgroundColor: '#ffffff',
            minHeight: '56px',
            borderBottom: '1px solid #f1f5f9',
            '&:last-of-type': {
                borderBottom: 'none',
            },
            '&:hover': {
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transform: 'scale(1)',
                transition: 'all 0.15s ease',
            },
        },
    },
    cells: {
        style: {
            paddingLeft: '10px',
            paddingRight: '10px',
        },
    },
    pagination: {
        style: {
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            borderRadius: '0 0 16px 16px',
            padding: '12px 14px',
            color: '#475569',
            fontSize: '12px',
            fontWeight: '600',
            flexWrap: 'wrap',
            gap: '8px',
        },
    },
};
