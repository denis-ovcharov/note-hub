import { fetchNoteById } from "@/lib/api/serverApi";
import EditNoteClient from "./EditNote.client";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await fetchNoteById(id);

  return <EditNoteClient note={note} />;
}
