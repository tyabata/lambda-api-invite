const dynamo = require('./dynamo');
const crypt = require('./crypt');

exports.handler = (event, context, callback) => {
  console.log(event, context);

  try {
    apiHandler(event, context, callback);
  } catch (error) {
    errorDone(error.message || error.stack || 'unknown error.', error.status || 500, callback);
    return;
  }
};

/**
 * APIの制御
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 */
function apiHandler(event, context, callback) {
  const { method, path } = event;

  switch (method) {
    case 'GET': {
      if (path === '/invitees/user') {
        // userid生成
        const id = crypt.createId();
        done(
          {
            user_id: id
          },
          200,
          callback
        );
        return;
      }
    }
    case 'PUT': {
      if (path === '/invitees') {
        const data = event.body;

        if (!data.userId) {
          // ない場合はエラー
          throw {
            message: 'request error : 0',
            status: 400
          };
        }

        // uidを復号する
        const decryptUID = crypt.decryptToId(data.userId);

        // データ登録
        dynamo
          .put(event.body)
          .then((result) => {
            done(`success!!`, 201, callback);
          })
          .catch((error) => {
            errorDone(error, error.status || 500, callback);
          });
        return;
      }
    }
  }

  throw {
    message: 'unsupport method or path',
    status: 405
  };
}

// 正常終了
function done(response, statusCode, callback) {
  callback(null, {
    statusCode,
    body: response
  });
}
// エラー
function errorDone(error, statusCode, callback) {
  callback({
    statusCode,
    body: JSON.stringify(error)
  });
}
