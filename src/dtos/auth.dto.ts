import { IsDate, IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  public email: string;

  // @MinLength(8)
  public password: string;
}

export class SignUpDTO {
  @IsString()
  public firstname: string;

  @IsString()
  public lastname: string;

  @IsEmail()
  public email: string;

  @MinLength(8)
  public password: string;

  @IsString()
  public role: 'member' | 'admin' | 'staff';

  public school_id?: string; // Include if role is member or staff

  @IsDate()
  public birthday: Date;

  @IsPhoneNumber('PH')
  public cellNumber: string;

  @IsString()
  public province: string;

  @IsString()
  public city: string;

  @IsString()
  public barangay: string;

  @IsString()
  public profile_photo: string;
}
