import { useMemo, useState } from "react";

type PaginationProps<T> = {
  perpage?: number;
  total: number;
  data: T[];
};
export function useTablePagination<T>(props: PaginationProps<T>) {
  const { perpage = 4, total, data } = props;
  const [page, setPage] = useState<number>(1);
  const dataTorender = useMemo(() => {
    const start = (page - 1) * perpage;
    let end = start + perpage;
    end = end > total ? total : end;
    return data.slice(start, end);
  }, [page, data, perpage, total]);
  const pages = useMemo(() => {
    const val = Math.floor(total / perpage);
    return val || 1;
  }, [total, perpage]);

  const prev = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };
  const next = () => {
    if (page >= pages) return;
    setPage(page + 1);
  };
  return { page, pages, dataTorender, prev, next };
}
