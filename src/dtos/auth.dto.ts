import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  public email: string;

  @MinLength(8)
  public password: string;
}
