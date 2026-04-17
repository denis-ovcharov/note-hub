"use client";

import {
  fetchTrashedNotes,
  restoreNote,
  deleteNote,
} from "@/lib/api/clientApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import css from "./TrashList.module.css";
import { useState } from "react";
import type { Note } from "@/types/note";

export default function TrashList() {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const { data: trashedNotes = [] } = useQuery({
    queryKey: ["notes", "trash"],
    queryFn: fetchTrashedNotes,
  });

  const { mutate: restore, isPending } = useMutation({
    mutationFn: restoreNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note restored");
    },
    onError: () => toast.error("Failed to restore note"),
  });

  const { mutate: permanentDelete } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "trash"] });
      toast.success("Permanently deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handlePermanentDelete = (id: string) => {
    permanentDelete(id);
    setConfirmId(null);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const daysLeft = (deletedAt: string) => {
    const elapsed = now - new Date(deletedAt).getTime();
    const remaining = Math.ceil(
      (30 * 24 * 60 * 60 * 1000 - elapsed) / (24 * 60 * 60 * 1000),
    );
    return Math.max(0, remaining);
  };

  if (trashedNotes.length === 0) {
    return <p className={css.empty}>Trash is empty</p>;
  }

  return (
    <div className={css.wrapper}>
      <p className={css.info}>
        Notes in trash are automatically deleted after 30 days.
      </p>
      <ul className={css.list}>
        {trashedNotes.map((note: Note) => (
          <li className={css.listItem} key={note._id}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <span className={css.tag}>{note.tag}</span>
            <p className={css.meta}>
              Deleted: {formatDate(note.deletedAt!)} ·{" "}
              {daysLeft(note.deletedAt!)} days left
            </p>
            <div className={css.actions}>
              <button
                className={css.restoreBtn}
                onClick={() => restore(note._id)}
                disabled={isPending}
              >
                Restore
              </button>
              {confirmId === note._id ? (
                <div className={css.confirmGroup}>
                  <button
                    className={css.deleteBtn}
                    onClick={() => handlePermanentDelete(note._id)}
                  >
                    Confirm
                  </button>
                  <button
                    className={css.cancelBtn}
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className={css.deleteBtn}
                  onClick={() => setConfirmId(note._id)}
                >
                  Delete forever
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
