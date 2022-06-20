import { hash } from 'bcrypt';
import { UserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import { LeanDocument } from 'mongoose';

class UserService {
  public async findAllUser(): Promise<User[]> {
    const users: LeanDocument<User[]> = await userModel.find({}).lean();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: LeanDocument<User> = await userModel.findOne({ _id: userId, isDeactivated: false }).lean();
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserByRole(role: string): Promise<User[]> {
    if (isEmpty(role)) throw new HttpException(400, 'Invalid role');

    const users: LeanDocument<User[]> = await userModel.find({ role, isDeactivated: false }).populate('transact_by').lean();
    return users;
  }

  public async createUser(userData: User, profile_photo: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await userModel.create({ ...userData, password: hashedPassword, profile_photo });

    return createUserData;
  }

  public async updateUser(userId: string, userData: UserDto): Promise<User> {
    const data = { ...userData };

    // Remove empty values
    Object.keys(data).forEach(v => {
      if (isEmpty(data[v])) delete data[v];
    });

    if (data?.email) {
      const findUser: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
      if (findUser && findUser._id != userId) throw new HttpException(409, `Email ${userData.email} already exists`);
    }

    if (!isEmpty(data?.password)) {
      const hashedPassword = await hash(data.password, 10);
      data.password = hashedPassword;
    }

    const updateUserById: LeanDocument<User> = await userModel.findByIdAndUpdate(userId, { $set: { ...data } }).lean();
    if (!updateUserById) throw new HttpException(409, "You're not user");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: LeanDocument<User> = await userModel.findByIdAndUpdate(userId, { $set: { isDeactivated: true } }).lean();
    if (!deleteUserById) throw new HttpException(409, "You're not user");

    return deleteUserById;
  }

  public async reActivateUser(userId: string): Promise<User> {
    const activateUserById: LeanDocument<User> = await userModel.findByIdAndUpdate(userId, { $set: { isDeactivated: false } }).lean();
    if (!activateUserById) throw new HttpException(409, "You're not user");

    return activateUserById;
  }
}

export default UserService;
