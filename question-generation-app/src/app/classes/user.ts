import { ICampus } from '../interfaces/iCampus';

export class User {
  accountType: string;
  username: string;

  title: string;

  givenNames: string;
  lastName: string;
  preferredName: string;
  image: string;

  homeCampus: ICampus;
  id: number;
}
