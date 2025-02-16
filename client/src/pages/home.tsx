import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Note } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { NoteEditor } from "@/components/note-editor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setSelectedNote(null);
      toast({
        description: "Note deleted successfully",
      });
    },
  });

  const handleNewNote = () => {
    setSelectedNote(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen p-4 gap-4">
        <div className="w-64 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[calc(100vh-4rem)] w-full" />
        </div>
        <Skeleton className="flex-1 h-[calc(100vh-2rem)]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen p-4 gap-4">
      <div className="w-64 flex flex-col gap-2">
        <Button onClick={handleNewNote} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
        <ScrollArea className="flex-1 border rounded-lg">
          <div className="space-y-2 p-2">
            {notes?.map((note) => (
              <div
                key={note.id}
                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group ${
                  selectedNote?.id === note.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="truncate flex-1">{note.title}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{note.title}"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(note.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1">
        <NoteEditor
          key={selectedNote?.id}
          note={selectedNote}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
          }}
        />
      </div>
    </div>
  );
}
