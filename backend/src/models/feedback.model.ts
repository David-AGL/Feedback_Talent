import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId: string;
  comment: string;
  rating: number;
  enterpriseId: string;
  feedbackQuestions?: string[];
}

const feedbackSchema = new Schema<IFeedback>({
  userId: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  enterpriseId: { type: String, required: true },
  feedbackQuestions: { type: [String], default: [] },
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema, 'feedback');