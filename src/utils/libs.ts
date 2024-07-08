import * as bcrypt from 'bcrypt';

export const hashUtils = {
  async hash(data: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(data, salt);
  },

  async compare(ref: string, hash: string) {
    return await bcrypt.compare(ref, hash);
  },
};
