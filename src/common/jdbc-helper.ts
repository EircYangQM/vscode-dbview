const JDBC = require('jdbc');
const jinst = require('jdbc/lib/jinst');
// import {JDBC} from 'jdbc';
// import {jinst} from 'jdbc/lib/jinst';
import { IConnection } from '../model/connection';
import { SqlResultWebView } from './sqlResultWebView';

export class JDBCHelper {
  public static createConnection(connectionOptions: IConnection): any {
    if (!jinst.isJvmCreated()) {
      jinst.addOption("-Xrs");
      // jinst.setupClasspath(['./drivers/hsqldb.jar',
      //                       './drivers/derby.jar',
      //                       './drivers/derbyclient.jar',
      //                       './drivers/derbytools.jar']);
      jinst.setupClasspath([
        'C:\\Users\\Douglas\\AppData\\Roaming\\JetBrains\\IntelliJIdea2020.1\\jdbc-drivers\\Apache Derby\\10.14.1.0\\derby-10.14.1.0.jar'
      ]);
    }

    // connection string
    var config = {
      // Required
      url: 'jdbc:derby:C:\\Dev\\RSSBus\\v20\\ProviderBase\\tests\\realdb\\files\\Derby_Db;create=true;',

      // Optional
      drivername: 'org.apache.derby.jdbc.EmbeddedDriver',
      minpoolsize: 10,
      maxpoolsize: 100,

      // Note that if you sepecify the user and password as below, they get
      // converted to properties and submitted to getConnection that way.  That
      // means that if your driver doesn't support the 'user' and 'password'
      // properties this will not work.  You will have to supply the appropriate
      // values in the properties object instead.
      user: 'SA',
      password: '',
      properties: {}
    };

    let connectionHandle = new JDBC(config);
    connectionHandle.initialize(function (err: any) {
      if (err) {
        console.log(err);
      }
    });

    return connectionHandle;
    // const newConnectionOptions: any = Object.assign({}, connectionOptions);
    // if (connectionOptions.certPath && fs.existsSync(connectionOptions.certPath)) {
    //     newConnectionOptions.ssl = {
    //         ca: fs.readFileSync(connectionOptions.certPath),
    //     };
    // }
    // return mysql.createConnection(newConnectionOptions);
  }

  public static getColumns<T>(connection: any, catalog: string, schema: string, table: string): Promise<T> {
    return new Promise((resolve, reject) => {
      connection.reserve(function (err: any, connobj: any) {
        if (err) {
          return reject(err);
        } else {
          connobj.conn.getMetaData((err: any, metadata: any) => {
            if (err) {
              return reject(err);
            } else {
              metadata.getColumns(catalog, schema, table, null, (err: any, resultSet: any) => {
                if (err) {
                  return reject(err);
                } else {
                  return resultSet.toObjArray(function (err, results) {
                    resolve(results);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  public static getTables<T>(connection: any, catalog: string, schema: string): Promise<T> {
    return new Promise((resolve, reject) => {
      connection.reserve(function (err: any, connobj: any) {
        if (err) {
          return reject(err);
        } else {
          connobj.conn.getMetaData((err: any, metadata: any) => {
            if (err) {
              return reject(err);
            } else {
              metadata.getTables(catalog, schema, null, null, (err: any, resultSet: any) => {
                if (err) {
                  return reject(err);
                } else {
                  return resultSet.toObjArray(function (err, results) {
                    resolve(results);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  public static getCatalogs<T>(connection: any): Promise<T> {
    return new Promise((resolve, reject) => {
      connection.reserve(function (err: any, connobj: any) {
        if (err) {
          return reject(err);
        } else {
          connobj.conn.getMetaData((err: any, metadata: any) => {
            if (err) {
              return reject(err);
            } else {
              metadata.getCatalogs((err: any, resultSet: any) => {
                if (err) {
                  return reject(err);
                } else {
                  resultSet.toObjArray(function (err, results) {
                    resolve(results);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  public static getSchemas<T>(connection: any, catalog: string): Promise<T> {
    return new Promise((resolve, reject) => {
      connection.reserve(function (err: any, connobj: any) {
        if (err) {
          return reject(err);
        } else {
          connobj.conn.getMetaData((err: any, metadata: any) => {
            if (err) {
              return reject(err);
            } else {
              metadata.getSchemas(catalog, null, (err: any, resultSet: any) => {
                if (err) {
                  return reject(err);
                } else {
                  resultSet.toObjArray(function (err, results) {
                    resolve(results);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  public static queryPromise<T>(connection: any, sql: string): Promise<T> {
    return new Promise((resolve, reject) => {
      connection.reserve(function (err: any, connobj: any) {
        if (err) {
          return reject(err);
        } else {
          connobj.conn.createStatement(1, 2, 3, (err: any, statement: any) => {
            if (err) {
              return reject(err);
            } else {
              statement.executeQuery(sql, (err: any, resultSet: any) => {
                if (err) {
                  return reject(err);
                } else {
                  return resultSet.toObjArray(function (err, results) {
                    resolve(results);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  public static showQueryResult(data, title: string) {
    // vscode.commands.executeCommand(
    //     "vscode.previewHtml",
    //     Utility.getPreviewUri(JSON.stringify(data)),
    //     vscode.ViewColumn.Two,
    //     title).then(() => { }, (e) => {
    //         OutputChannel.appendLine(e);
    //     });
    SqlResultWebView.show(data, title);
  }
}