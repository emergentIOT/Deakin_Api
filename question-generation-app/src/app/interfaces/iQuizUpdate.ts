import { IQuizToken } from './iQuizToken';


export interface IQuizUpdate {
  _id?: string;
  name: string;
  plainText: string;
  richText: string;
  tokens?: IQuizToken[];
}
