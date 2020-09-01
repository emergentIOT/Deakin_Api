import { IQuestionAnswer } from './IQuestionAnswer';


export interface IVideo {
  _id: string;
  name: string;
  description: string;
  quizId: string;
  transcriptionUrl: string;
  videoUrl: string;
  questions: IQuestionAnswer[]
}
