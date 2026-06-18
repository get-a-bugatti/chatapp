import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["global", "private"],
      required: true,
    },
    from: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    // attatchments: [
    //   {
    //     type: String,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  createdAt: -1,
});

export const Message = mongoose.model("Message", messageSchema);
