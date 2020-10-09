import { iOption } from '../interfaces/iOption';


export interface IQuizToken {
  _id?: string;
  answerToken?: string;
  questionToken?: string;
  options?: iOption[];
  status?: "pending" | "processing" | "processed" | "error";
}
