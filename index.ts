import * as fs from 'fs';
import mkdirp from 'mkdirp';

export type DbResponse = {
    error: boolean;
    code?: string;
    message: string;
    data?: {
        key: string,
        value: any
    };
};

class Database {
    db: string;

    constructor(db: string) {
        this.db = db;
    }

    async getKey(key: string): Promise<DbResponse> {
        const dbDataString = fs.readFileSync(this.db, { encoding: 'utf8' });
        const data = dbDataString === '' ? {} : JSON.parse(dbDataString);
        return <DbResponse>{
            error: !data[key],
            code: !data[key] ? 'NoSuchKey' : undefined,
            message: !data[key] ? 'Key does not exist' : 'key exists and data successfully read',
            data: !data[key] ? undefined : {
                key: key,
                value: data[key]
            }
        };
    }

    async setKey(key: string, value: any): Promise<DbResponse | void> {
        const dbDataString = fs.readFileSync(this.db, { encoding: 'utf8' });
        let data = dbDataString === '' ? {} : JSON.parse(dbDataString);
        data[key] = value;
        try {
            fs.writeFileSync(this.db, JSON.stringify(data));
            return <DbResponse>{
                error: false,
                message: 'Data successfully written to db.',
                data: {
                    key: key,
                    value: value
                }
            };
        } catch (error) {
            throw <DbResponse>{
                error: true,
                code: 'unknown',
                message: JSON.stringify(error)
            };
        }
    }

    async loadDb(cb = function () {}) {
        const callback = cb || function () {};
        mkdirp(this.db.substring(0, this.db.lastIndexOf("/"))).then(() => {
            try {
                if(!fs.existsSync(this.db)) {
                    fs.writeFileSync(this.db, '{}');
                }
                callback();
            } catch (err) {
                console.error(err);
            }
        });
    }

}

export { Database };