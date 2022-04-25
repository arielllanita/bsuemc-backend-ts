import { hash } from 'bcrypt';
import { UserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import { LeanDocument } from 'mongoose';

class UserService {
  public async findAllUser(role?: string): Promise<User[]> {
    const users: LeanDocument<User[]> = await userModel.find(role && { role }).lean();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: LeanDocument<User> = await userModel.findOne({ _id: userId }).lean();
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserByRole(role: string): Promise<User[]> {
    if (isEmpty(role)) throw new HttpException(400, 'Invalid role');

    const users: LeanDocument<User[]> = await userModel.find({ role }).lean();
    return users;
  }

  public async createUser(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await userModel.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: string, userData: UserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    if (userData.email) {
      const findUser: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
      if (findUser && findUser._id != userId) throw new HttpException(409, `You're email ${userData.email} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById: LeanDocument<User> = await userModel.findByIdAndUpdate(userId, { userData }).lean();
    if (!updateUserById) throw new HttpException(409, "You're not user");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: LeanDocument<User> = await userModel.findByIdAndDelete(userId).lean();
    if (!deleteUserById) throw new HttpException(409, "You're not user");

    return deleteUserById;
  }
}

export default UserService;
