"use client";

// models
import { Comment } from "../../../model/CommentModel";

export default function CommentView({
  comment,
  isOwner,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-2 ">
      <ul className="text-sm ">
        <li key={comment.comment_id} className="mb-[5px]">
          {comment.body} -{" "}
          <span className="text-blue-500 cursor-pointer">
            {comment.first_name} {comment.last_name}
          </span>
          <span className="text-slate-500"> {comment.created_at}</span>
          {/*{isOwner ? (*/}
          <div className="flex flex-row gap-2">
            <button onClick={onEdit} className="text-slate-500 cursor-pointer">
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-slate-500 cursor-pointer"
            >
              Delete
            </button>
          </div>
          {/*) : null}*/}
        </li>
      </ul>
    </div>
  );
}
