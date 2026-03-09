import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note } from "@/types/note";

export interface TrashedNote {
  note: Note;
  deletedAt: string;
}

type TrashStore = {
  trashedNotes: TrashedNote[];
  moveToTrash: (note: Note) => void;
  restoreNote: (id: string) => TrashedNote | undefined;
  permanentDelete: (id: string) => void;
  clearExpired: () => void;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useTrashStore = create<TrashStore>()(
  persist(
    (set, get) => ({
      trashedNotes: [],

      moveToTrash: (note) =>
        set((s) => ({
          trashedNotes: [
            { note, deletedAt: new Date().toISOString() },
            ...s.trashedNotes,
          ],
        })),

      restoreNote: (id) => {
        const item = get().trashedNotes.find((t) => t.note.id === id);
        set((s) => ({
          trashedNotes: s.trashedNotes.filter((t) => t.note.id !== id),
        }));
        return item;
      },

      permanentDelete: (id) =>
        set((s) => ({
          trashedNotes: s.trashedNotes.filter((t) => t.note.id !== id),
        })),

      clearExpired: () =>
        set((s) => ({
          trashedNotes: s.trashedNotes.filter(
            (t) =>
              Date.now() - new Date(t.deletedAt).getTime() < THIRTY_DAYS_MS,
          ),
        })),
    }),
    {
      name: "trash-store",
    },
  ),
);
