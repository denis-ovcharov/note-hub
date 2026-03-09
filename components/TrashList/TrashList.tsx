"use client";

import { useTrashStore, TrashedNote } from "@/lib/store/trashStore";
import { createNote } from "@/lib/api/clientApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import css from "./TrashList.module.css";
import { useEffect, useState } from "react";

export default function TrashList() {
  const { trashedNotes, restoreNote, permanentDelete, clearExpired } =
    useTrashStore();
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    clearExpired();
  }, [clearExpired]);

  const { mutate: restoreMutate, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note restored");
    },
    onError: () => {
      toast.error("Failed to restore note");
    },
  });

  const handleRestore = (id: string) => {
    const item = restoreNote(id);
    if (item) {
      restoreMutate({
        title: item.note.title,
        content: item.note.content,
        tag: item.note.tag,
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    permanentDelete(id);
    setConfirmId(null);
    toast.success("Permanently deleted");
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("uk-UA", {
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
        {trashedNotes.map(({ note, deletedAt }: TrashedNote) => (
          <li className={css.listItem} key={note.id}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <span className={css.tag}>{note.tag}</span>
            <p className={css.meta}>
              Deleted: {formatDate(deletedAt)} · {daysLeft(deletedAt)} days left
            </p>
            <div className={css.actions}>
              <button
                className={css.restoreBtn}
                onClick={() => handleRestore(note.id)}
                disabled={isPending}
              >
                Restore
              </button>
              {confirmId === note.id ? (
                <div className={css.confirmGroup}>
                  <button
                    className={css.deleteBtn}
                    onClick={() => handlePermanentDelete(note.id)}
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
                  onClick={() => setConfirmId(note.id)}
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
