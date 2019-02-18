const crypto = require('crypto');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const TABLE_NAME = 'invites';
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  put: (data) => {
    const uid = crypto.createHash('md5').update(data.name, 'binary').digest('hex');

    // あとでチェック
    const { name, bridegroom, address, email, allow, demand } = data;

    //
    const item = {
      uid,
      name,
      bridegroom,
      address,
      email,
      isAllowed: allow === 'allow',
      demand,
      update: new Date().toISOString()
    };

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
  },
  // uidに該当するデータを取得する
  // 存在しなければnull
  isExist: (uid) => {
    return new Promise((resolve, reject) => {
      docClient.get(
        {
          TableName: TABLE_NAME,
          key: {
            uid
          }
        },
        function(error, data) {
          // データがなければfalseを返す
          resolve(!error);
        }
      );
    });
  }
};
