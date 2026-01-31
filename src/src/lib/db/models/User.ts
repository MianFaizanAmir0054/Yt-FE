import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image?: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    perplexity?: string;
    pexels?: string;
    segmind?: string;
    elevenLabs?: string;
  };
  preferences: {
    defaultLLM: "openai" | "anthropic";
    defaultImageProvider: "segmind" | "pexels" | "prodia";
    subtitleStyle: "word-by-word" | "sentence";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    image: {
      type: String,
      default: null,
    },
    apiKeys: {
      openai: { type: String, default: null },
      anthropic: { type: String, default: null },
      perplexity: { type: String, default: null },
      pexels: { type: String, default: null },
      segmind: { type: String, default: null },
      elevenLabs: { type: String, default: null },
    },
    preferences: {
      defaultLLM: {
        type: String,
        enum: ["openai", "anthropic"],
        default: "openai",
      },
      defaultImageProvider: {
        type: String,
        enum: ["segmind", "pexels", "prodia"],
        default: "pexels",
      },
      subtitleStyle: {
        type: String,
        enum: ["word-by-word", "sentence"],
        default: "sentence",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompiling model in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
