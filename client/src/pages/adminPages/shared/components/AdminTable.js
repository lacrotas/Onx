import React from 'react';
import { FiInbox } from 'react-icons/fi';
import './AdminTable.scss';

export function AdminTable({
    columns = [],
    data = [],
    sortConfig,
    onSort,
    getSortIndicator,
    renderRow,
    isLoading = false,
    emptyMessage = "Нет данных для отображения",
    className = ""
}) {
    return (
        <div className={`admin-table-container ${className}`}>
            <div className="table-responsive">
                <table className="admin-modern-table">
                    <thead>
                        <tr>
                            {columns.map((col, index) => {
                                const isSortable = !!col.sortKey && !!onSort;
                                const sortIndicator = isSortable && getSortIndicator ? getSortIndicator(col.sortKey) : null;
                                
                                return (
                                    <th
                                        key={col.key || index}
                                        style={col.width ? { width: col.width } : undefined}
                                        className={`${isSortable ? 'sortable-th' : ''} ${col.align ? `text-${col.align}` : ''}`}
                                        onClick={isSortable ? () => onSort(col.sortKey) : undefined}
                                    >
                                        <div className="th-content">
                                            <span>{col.label}</span>
                                            {sortIndicator && <span className="sort-arrow">{sortIndicator}</span>}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => renderRow(item, index))
                        ) : (
                            !isLoading && (
                                <tr className="empty-row">
                                    <td colSpan={columns.length}>
                                        <div className="empty-state">
                                            <FiInbox className="empty-icon" />
                                            <p className="empty-text">{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {isLoading && (
                <div className="table-loading-overlay">
                    <div className="loading-spinner" />
                    <span>Загрузка...</span>
                </div>
            )}
        </div>
    );
}
