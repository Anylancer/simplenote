import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNoteSchema, type Note } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type NoteEditorProps = {
  note?: Note | null;
  onSaved?: () => void;
};

export function NoteEditor({ note, onSaved }: NoteEditorProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
    },
  });

  // Reset form when note changes
  useEffect(() => {
    form.reset({
      title: note?.title ?? "",
      content: note?.content ?? "",
    });
  }, [form, note]);

  const mutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (note) {
        return apiRequest("PATCH", `/api/notes/${note.id}`, data);
      }
      return apiRequest("POST", "/api/notes", data);
    },
    onSuccess: () => {
      toast({
        description: `Note ${note ? "updated" : "created"} successfully`,
      });
      onSaved?.();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="h-full flex flex-col gap-4 border rounded-lg p-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Note title"
                  className="text-xl font-semibold border-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Write your note here..."
                  className="h-full resize-none border-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {note ? "Update" : "Create"} Note
        </Button>
      </form>
    </Form>
  );
}