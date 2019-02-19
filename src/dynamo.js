const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const TABLE_NAME = 'invites';
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  put: (userId, data) => {
    const { name, email, relation, useImage, request } = data;

    // 登録データ
    const item = {
      uid: userId,
      name,
      email,
      relation,
      useImage: Boolean(useImage),
      request,
      update: new Date().toISOString()
    };

    // チェック
    validate(item);

    // データ登録
    return new Promise((resolve, reject) => {
      docClient.put(
        {
          TableName: TABLE_NAME,
          Item: item
        },
        (error, data) => {
          if (error) {
            reject({
              error,
              status: 500
            });
          } else {
            resolve(data);
          }
        }
      );
    });
  }
};

const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * データチェック
 * @param  item 
 */
function validate(item) {
  const { name, email, relation } = item;
  const checkList = [];

  if (!name) {
    // nameがない
    checkList.push('1');
  }

  if (!email || !emailRegex.test(email)) {
    // 2: email形式がおかしい
    // 3: emailがない
    checkList.push(email ? '2' : '3');
  }

  if (!relation) {
    // 4: 関係性が入力されてない
    checkList.push('4');
  }

  if (checkList.length > 0) {
    throw {
      status: 400,
      message: `request error : ${checkList.join(',')}`
    };
  }
}
