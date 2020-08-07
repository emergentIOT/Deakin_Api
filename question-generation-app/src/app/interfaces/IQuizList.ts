import { IQuiz } from './iQuiz';
export interface IQuizList {
  page: number;
  limit: number;
  totalCount: number;
  data: IQuiz[];
}
