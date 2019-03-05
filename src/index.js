const dynamo = require('./dynamo');
const crypt = require('./crypt');

exports.handler = (event, context, callback) => {
  console.log(event, context);

  try {
    console.info('api handler');
    apiHandler(event, context, callback);
  } catch (error) {
    errorDone(error.toString() || 'unknown error.', error.status || 500, callback);
  }
};

/**
 * APIの制御
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 */
function apiHandler(event, context, callback) {
  const { method, path, body } = event;

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
      if (path.startsWith('/invitees')) {
        if (!body || !body.userId) {
          // ない場合はエラー
          throw {
            message: 'request error : 0',
            status: 400
          };
        }
        // uidを復号する
        const decryptUID = crypt.decryptToId(body.userId);

        // データ登録
        dynamo
          .put(decryptUID, body)
          .then(result => {
            console.info(`dynamo complete : ${decryptUID}`);
            done(`success!!`, 201, callback);
          })
          .catch(error => {
            console.warn(`dynamo put error ${decryptUID} : ${error.message}`);
            errorDone(
              error.message || error.stack || 'unknown put error.',
              error.status || 500,
              callback
            );
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
  callback(
    JSON.stringify({
      status: statusCode,
      message: error
    })
  );
}
