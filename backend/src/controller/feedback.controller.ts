import { Request, Response } from 'express';
import FeedbackModel from '../models/feedback.model';
export async function createFeedback(req: Request, res: Response) {
  try {
    const { userId, comment, rating, enterpriseId, feedbackQuestions } = req.body;

    if (!userId || !comment || rating === undefined || !enterpriseId) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    const feedback = new FeedbackModel({ userId, comment, rating, enterpriseId, feedbackQuestions });
    await feedback.save();

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error al guardar el feedback:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}

export async function updateFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, comment, rating, enterpriseId, feedbackQuestions } = req.body;
    const feedback = await FeedbackModel.findByIdAndUpdate(
      id,
      { userId, comment, rating, enterpriseId, feedbackQuestions },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback no encontrado.' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error al actualizar el feedback:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}

export async function getFeedbackById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const feedback = await FeedbackModel.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback no encontrado.' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error al obtener el feedback:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}

export async function getFeedbackByUserId(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const feedback = await FeedbackModel.find({ userId: id });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback no encontrado.' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error al obtener el feedback:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}

export async function getFeedbackByEnterpriseId(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const feedback = await FeedbackModel.find({ enterpriseId: id });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback no encontrado.' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error al obtener el feedback:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}

export async function getAllFeedback(req: Request, res: Response) {
  try {
    const feedback = await FeedbackModel.find();
    res.json(feedback);
  } catch (error) {
    console.error('Error al obtener los feedbacks:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
}