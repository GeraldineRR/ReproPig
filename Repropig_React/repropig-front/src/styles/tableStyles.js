// Estilos globales Premium para todas las tablas DataTables del proyecto
export const customTableStyles = {
    table: {
        style: {
            backgroundColor: '#ffffff',
            borderCollapse: 'separate',
            borderSpacing: '0',
        },
    },
    tableWrapper: {
        style: {
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            border: '1px solid #f1f5f9',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            overflowX: 'auto',
        },
    },
    headRow: {
        style: {
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            minHeight: '52px',
        },
    },
    headCells: {
        style: {
            fontSize: '11.5px',
            fontWeight: '700',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '12px',
            paddingRight: '12px',
        },
    },
    rows: {
        style: {
            fontSize: '13.5px',
            fontWeight: '500',
            color: '#334155',
            backgroundColor: '#ffffff',
            minHeight: '62px',
            borderBottom: '1px solid #f1f5f9',
            '&:last-of-type': {
                borderBottom: 'none',
            },
            '&:hover': {
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transform: 'scale(1)',
                transition: 'all 0.2s ease',
            },
        },
    },
    cells: {
        style: {
            paddingLeft: '12px',
            paddingRight: '12px',
            overflow: 'hidden',
        },
    },
    pagination: {
        style: {
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            borderRadius: '0 0 20px 20px',
            padding: '16px',
            color: '#475569',
            fontSize: '13px',
            fontWeight: '600',
        },
    },
};
