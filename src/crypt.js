const Crypto = require('crypto-js');
const uuidv1 = require('uuid/v1');

const KEY = 'geenum3Aijoh6iaShieyaeMaimeuya';

// uuid,

module.exports = {
  createId: () => {
    const uuid = uuidv1();
    return Crypto.AES.encrypt(uuid, KEY).toString();
  },
  decryptToId: text => {
    try {
      const derypt = Crypto.AES.decrypt(text, KEY);
      return derypt.toString(Crypto.enc.Utf8);
    } catch (error) {
      throw {
        message: error.message,
        status: 400
      };
    }
  }
};
