import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "../../types/note";
import css from "./NoteList.module.css";
import { trashNote, toggleFavourite } from "../../lib/api/clientApi";
import toast from "react-hot-toast";
import Link from "next/link";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const { mutate: trash } = useMutation({
    mutationFn: trashNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Moved to trash");
    },
    onError: () => toast.error("There was an error"),
  });

  const { mutate: favourite } = useMutation({
    mutationFn: toggleFavourite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => toast.error("There was an error"),
  });

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li className={css.listItem} key={note._id}>
          <div className={css.topActions}>
            <button
              className={`${css.iconBtn} ${note.isFavourite ? css.favActive : ""}`}
              onClick={() => favourite(note._id)}
              aria-label={
                note.isFavourite ? "Remove from favorites" : "Add to favorites"
              }
              title={note.isFavourite ? "Unfavorite" : "Favorite"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={note.isFavourite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <span className={css.tag}>{note.tag}</span>
          <div className={css.footer}>
            <div className={css.actions}>
              <Link href={`/notes/${note._id}`} className={css.link}>
                View details
              </Link>
              <Link
                href={`/notes/action/edit/${note._id}`}
                className={css.edit}
              >
                Edit
              </Link>
              <button className={css.button} onClick={() => trash(note._id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
