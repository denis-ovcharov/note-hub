"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateNote } from "@/lib/api/clientApi";
import type { NoteData } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";
import css from "@/components/NoteForm/NoteForm.module.css";
import pageCss from "@/app/page.module.css";
import toast from "react-hot-toast";

export default function EditNoteClient({ note }: { note: Note }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NoteData) => updateNote(note.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      toast.success("Note updated");
      router.push("/notes/filter/all");
    },
    onError: () => {
      toast.error("Failed to update note");
    },
  });

  const handleSubmit = (formData: FormData) => {
    const values = Object.fromEntries(formData) as NoteData;
    mutate(values);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className={pageCss.main}>
      <div className={pageCss.container}>
        <h1 className={pageCss.title}>Edit note</h1>
        <form className={css.form} action={handleSubmit}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              className={css.input}
              minLength={3}
              maxLength={50}
              defaultValue={note.title}
              required
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              maxLength={500}
              className={css.textarea}
              defaultValue={note.content}
            />
            <span className={css.hint}>
              Supports Markdown: **bold**, *italic*, `code`, lists, headers etc.
            </span>
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <select
              id="tag"
              name="tag"
              className={css.select}
              defaultValue={note.tag}
            >
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>

          <div className={css.actions}>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
