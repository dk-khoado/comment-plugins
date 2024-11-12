import apiClient from "@/api";
import useAuthorStore from "@/hooks/useAuthor";
import useSearchParams from "@/hooks/useSearchParams";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Comment, ReplyCommentFormData } from "./types";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const ReplyForm: React.FC<{
  parentId: string;
  onSuccess?: (data: Comment) => void;
}> = ({ parentId, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const { email, name } = useAuthorStore();
  const { register, handleSubmit, reset } = useForm<ReplyCommentFormData>({
    defaultValues: { content: "" },
  });

  const mutation = useMutation({
    mutationFn: async (formData: ReplyCommentFormData) => {
      const postId = searchParams.get("postId");

      const newComment = {
        author: {
          name: name,
          email: email,
        },
        comment: {
          content: formData.content,
          postId: postId || "default",
          postType: "post",
          parentId: parentId,
        },
      };

      const response = await apiClient(`/api/comments-and-authors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: newComment,
      });
      return response.data;
    },
    onSuccess: (data) => {
      reset({ content: "" });
      onSuccess && onSuccess(data);
    },
  });

  const handleReplySubmit = (formData: ReplyCommentFormData) => {
    mutation.mutate(formData);
  };

  return (
    <form
      className="mt-4 space-y-2 w-full"
      onSubmit={handleSubmit(handleReplySubmit)}
    >
      <Textarea
        {...register("content", {
          required: { value: true, message: "Reply is required" },
        })}
        placeholder="Your reply"
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      <div className="flex justify-end">
        <Button type="submit">Reply</Button>
      </div>
    </form>
  );
};

export default ReplyForm;
