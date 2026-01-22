export interface RegisterDto {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  addressStreet: string;
  addressZipCode: string;
  addressCity: string;
  cguAccepted: boolean;
  sanitaryCharterAccepted: boolean;
  description?: string;
  culinaryStyle?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}
