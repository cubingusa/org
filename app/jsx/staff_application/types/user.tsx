export interface UserProperty {
  key: number;
  value: number;
}

export interface User {
  id: number;
  name: string;
  wcaId: string;
  email: string;
  isAdmin: boolean;
  birthdate: string;
  delegateStatus: string;
  properties: UserProperty[];
}
