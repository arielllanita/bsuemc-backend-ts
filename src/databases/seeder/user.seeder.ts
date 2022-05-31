// import { DB_HOST, DB_PORT, DB_DATABASE } from '@config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import userModel from '../../models/users.model';

mongoose
  .connect(`mongodb://localhost:27017/bsu_emc`)
  .then(() => console.log('ESTABLISHED CONNECTION TO DB...'))
  .catch(err => console.log('DB CONNECTION FAILED', err));

const roles = ['admin', 'staff', 'member'];

const userDummyData = [...new Array(3)].map((_, i) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const data = {
    firstname: firstName,
    lastname: lastName,
    email: faker.internet.email(firstName, lastName, 'gmail.com'),
    password: '$2b$10$Lpn/eACuyddtK5Uc3wx54uQ25VglIUiLWma/YDc6W50AqYe3QrNri', // password (in normal text)
    role: roles[i],
    school_id: faker.random.numeric(10),
    birthday: faker.date.recent(),
    cellNumber: faker.phone.phoneNumber('09#########'),
    province: 'Misamis Oriental',
    city: 'Cagayan de Oro',
    barangay: 'Puntod',
    profile_photo: faker.internet.avatar(),
  };

  return data;
});

const seedUser = async () => {
  await userModel.insertMany(userDummyData);
  // await userModel.deleteMany({});
};

seedUser()
  .then(() => {
    console.log('SEEDER SUCCESSFUL...');
    mongoose.connection.close();
  })
  .catch(err => console.log('SEEDER ERROR', err));
