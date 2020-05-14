import { User } from './user';

export class Student extends User {
  accountType: 'Student';
  cohort: string;
}
