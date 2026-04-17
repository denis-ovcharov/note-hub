"use client";
import NoteList from "../../../../../components/NoteList/NoteList";
import Pagination from "../../../../../components/Pagination/Pagination";
import css from "./page.module.css";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "../../../../../components/SearchBox/SearchBox";
import { fetchNotes } from "@/lib/api/clientApi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { NoteTag } from "@/types/note";
import Link from "next/link";
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

  const isFavorites = specialFilter === "favorites";
  const isTrash = specialFilter === "trash";
  const effectiveTag = isFavorites || isTrash ? ("all" as NoteTag) : tag;

  const { data, isSuccess } = useQuery({
    queryKey: ["notes", query, page, perPage, effectiveTag, isFavorites],
    queryFn: () => fetchNotes(query, page, perPage, effectiveTag, isFavorites),
    placeholderData: keepPreviousData,
    enabled: !isTrash,
  });

  const updateQuery = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setPage(1);
    },
    1000,
  );

  const notes = data?.notes || [];
  const totalPages = data?.totalPages ?? 1;

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
        {notes.length > 0 && isSuccess && <NoteList notes={notes} />}
        {notes.length === 0 && isSuccess && (
          <p className={css.empty}>No notes found</p>
        )}
      </div>
    </>
  );
}

export default NotesClient;
