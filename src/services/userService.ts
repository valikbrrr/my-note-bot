import { User } from "../database/models/User";

export class UserService {
  async findOrCreate(telegramId: number, userInfo?: { 
    username?: string; 
    firstName?: string; 
    lastName?: string;
  }) {
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = new User({
        telegramId,
        username: userInfo?.username,
        firstName: userInfo?.firstName,
        lastName: userInfo?.lastName
      });
      await user.save();
    }
    
    return user;
  }
}