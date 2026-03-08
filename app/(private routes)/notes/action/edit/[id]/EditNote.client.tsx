"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchNoteById, updateNote } from "@/lib/api/clientApi";
import type { NoteData } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";
import css from "@/components/NoteForm/NoteForm.module.css";
import pageCss from "@/app/page.module.css";
import toast from "react-hot-toast";

export default function EditNoteClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NoteData) => updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
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

  if (isLoading) return <p>Loading...</p>;
  if (error || !note) return <p>Failed to load note</p>;

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
