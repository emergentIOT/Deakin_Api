import { IQuizToken } from './iQuizToken';


export interface IQuiz {
  _id: string;
  name: string;
  plainText: string;
  richText: string;
  tokens: IQuizToken[];
}
