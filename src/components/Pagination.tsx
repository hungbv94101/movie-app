import { Pagination as MantinePagination } from '@mantine/core';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <MantinePagination
      value={currentPage}
      onChange={onPageChange}
      total={totalPages}
      size="md"
      withEdges
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '2rem' 
      }}
    />
  );
}