// Password hashing and verification using bcryptjs
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (plaintextPassword) => {
  return await bcrypt.hash(plaintextPassword, SALT_ROUNDS);
};

const comparePassword = async (plaintextPassword, hashedPassword) => {
  return await bcrypt.compare(plaintextPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
