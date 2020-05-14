# Welcome panel API

## Inputs

| name       | type   | notes |
| ---------- | ------ | ----- |
| salutation | string |       |
| person     | Person |       |

## Outputs

none

## Types

| name   | construction       | notes                                       |
| ------ | ------------------ | ------------------------------------------- |
| Person | IStaff \| IStudent | This is a discriminated union of interfaces |

See https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions

## Interfaces

### IStaff

| property  | type    | notes                                   |
| --------- | ------- | --------------------------------------- |
| firstName | string  |                                         |
| lastname  | string  |                                         |
| jobTitle  | string  |                                         |
| cohort    | 'staff' | This string literal is the discriminant |
| id        | number  |                                         |

### IStudent

| property  | type      | notes                                   |
| --------- | --------- | --------------------------------------- |
| firstName | string    |                                         |
| lastname  | string    |                                         |
| course    | string    |                                         |
| cohort    | 'student' | This string literal is the discriminant |
| id        | number    |                                         |
