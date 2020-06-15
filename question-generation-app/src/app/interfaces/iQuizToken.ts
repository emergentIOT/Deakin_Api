

export interface IQuizToken {
  _id: string;
  answerToken: string;
  questionToken: string;
  status: "pending" | "processing" | "processed" | "error";
}
