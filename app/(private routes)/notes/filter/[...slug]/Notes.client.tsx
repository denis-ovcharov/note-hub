"use client";
import NoteList from "../../../../../components/NoteList/NoteList";
import Pagination from "../../../../../components/Pagination/Pagination";
import css from "./page.module.css";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "../../../../../components/SearchBox/SearchBox";
import { fetchNotes } from "@/lib/api/clientApi";
import { keepPreviousData, useQuery, useQueries } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { NoteTag } from "@/types/note";
import Link from "next/link";
import { useFavStore } from "@/lib/store/pinFavStore";
import TrashList from "@/components/TrashList/TrashList";

type Props = {
  tag?: NoteTag;
};

function NotesClient({ tag: tagProp }: Props) {
  const params = useParams<{ slug?: string[] }>();
  const tag = (tagProp ?? params.slug?.[0] ?? "all") as NoteTag;
  const specialFilter = params.slug?.[0];

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 12;

  const { favoriteIds } = useFavStore();

  const isFavorites = specialFilter === "favorites";
  const isTrash = specialFilter === "trash";
  const isSpecial = isFavorites || isTrash;
  const effectiveTag = isSpecial ? ("all" as NoteTag) : tag;

  // Regular query for non-favorites
  const { data, isSuccess } = useQuery({
    queryKey: ["notes", query, page, perPage, effectiveTag],
    queryFn: () => fetchNotes(query, page, perPage, effectiveTag),
    placeholderData: keepPreviousData,
    enabled: !isTrash && !isFavorites,
  });

  // First query to get totalPages for favorites
  const { data: favFirstPage } = useQuery({
    queryKey: ["notes", query, 1, perPage, "all"],
    queryFn: () => fetchNotes(query, 1, perPage, "all" as NoteTag),
    enabled: isFavorites,
  });

  const favTotalPages = favFirstPage?.totalPages ?? 1;

  // Load remaining pages for favorites
  const remainingPages = useQueries({
    queries:
      isFavorites && favTotalPages > 1
        ? Array.from({ length: favTotalPages - 1 }, (_, i) => ({
            queryKey: ["notes", query, i + 2, perPage, "all"],
            queryFn: () => fetchNotes(query, i + 2, perPage, "all" as NoteTag),
          }))
        : [],
  });

  const updateQuery = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setPage(1);
    },
    1000,
  );

  let notes = data?.notes || [];
  let totalPages = data?.totalPages ?? 1;

  if (isFavorites) {
    const merged = [
      ...(favFirstPage?.notes || []),
      ...remainingPages.flatMap((r) => r.data?.notes || []),
    ];
    const seen = new Set<string>();
    const allNotes = merged.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    const allFavNotes = allNotes.filter((n) => favoriteIds.includes(n.id));
    totalPages = Math.ceil(allFavNotes.length / perPage) || 1;
    const start = (page - 1) * perPage;
    notes = allFavNotes.slice(start, start + perPage);
  }

  if (isTrash) {
    return (
      <div className={css.app}>
        <TrashList />
      </div>
    );
  }

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox onSearch={updateQuery} />
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
            />
          )}
          <Link href={"/notes/action/create"} className={css.button}>
            Create note +
          </Link>
        </header>
        {notes.length > 0 && (isSuccess || isFavorites) && (
          <NoteList notes={notes} />
        )}
        {notes.length === 0 && (isSuccess || isFavorites) && (
          <p className={css.empty}>No notes found</p>
        )}
      </div>
    </>
  );
}

export default NotesClient;
