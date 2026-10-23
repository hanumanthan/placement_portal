import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';

export default function DataTable({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  searchValue = '',
  sortable = true,
  pagination,
  onPageChange,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyIcon,
  emptyAction,
  onEmptyAction,
  className = '',
  onRowClick,
  mobileCardRender,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Client-side sort if no server-side pagination
  const sortedData = sortConfig.key
    ? [...data].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === 'string'
          ? aVal.localeCompare(bVal)
          : aVal - bVal;
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      })
    : data;

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-secondary-300" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-primary" />
      : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  };

  if (loading) return <SkeletonTable rows={5} cols={columns.length} />;

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          actionLabel={emptyAction}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary-50/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider
                        ${sortable && col.sortable !== false ? 'cursor-pointer select-none hover:text-secondary-700' : ''}
                        ${col.className || ''}`}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortable && col.sortable !== false && <SortIcon columnKey={col.key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className={`transition-colors duration-150 hover:bg-secondary-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-sm text-secondary-700 ${col.className || ''}`}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-border">
            {sortedData.map((row, rowIdx) => (
              <div
                key={row.id || rowIdx}
                className={`p-4 ${onRowClick ? 'cursor-pointer hover:bg-secondary-50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {mobileCardRender ? (
                  mobileCardRender(row)
                ) : (
                  <div className="space-y-2">
                    {columns.map((col) => (
                      <div key={col.key} className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-muted uppercase">{col.label}</span>
                        <span className="text-sm text-secondary-700 text-right">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-border">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
