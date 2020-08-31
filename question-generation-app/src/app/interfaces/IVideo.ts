import { IQuizToken } from './iQuizToken';


export interface IVideo {
  _id: string;
  name: string;
  description: string;
  transcriptionUrl: string;
  videoUrl: string;
  questions: [{
    questionText: string,
    answerText: string,
  }]
}
