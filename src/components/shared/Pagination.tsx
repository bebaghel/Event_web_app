import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

// Reusable Pagination Component
// Usage:
// <Pagination
//    page={page}
//    totalPages={totalPages}
//    limit={filters.limit}
//    onLimitChange={(val) => setFilters(f => ({...f, limit: val}))}
//    onPageChange={(val) => setPage(val)}
// />

type PaginationProps = {
  page: number;
  totalPages: number;
  limit: number | string;
  onLimitChange: (val: string) => void;
  onPageChange: (val: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  limit,
  onLimitChange,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <Select value={String(limit)} onValueChange={onLimitChange}>
        <SelectTrigger>
          <SelectValue placeholder="Limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>

      {/* Pagination Arrows */}
      <div className="flex items-center gap-3">
        <Button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          variant="outline"
        >
          <ChevronLeft className="mt-0.5" />
          <span className="hidden md:block">Prev</span>
        </Button>

        <span className="font-medium">
          Page {page} of {totalPages}
        </span>

        <Button
          disabled={page === totalPages || totalPages == 0}
          onClick={() => onPageChange(page + 1)}
          variant="outline"
        >
          <span className="hidden md:block">Next</span>
          <ChevronRight className="mt-0.5" />
        </Button>
      </div>
    </div>
  );
}
