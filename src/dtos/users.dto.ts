import { IsEmail, IsIn, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsString()
  public firstname: string;

  @IsString()
  public lastname: string;

  @IsEmail()
  public email: string;

  @MinLength(8)
  public password: string;

  @IsIn(['member', 'admin', 'staff'])
  public role: 'member' | 'admin' | 'staff';

  @IsString()
  public school_id: string;

  @IsString()
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
