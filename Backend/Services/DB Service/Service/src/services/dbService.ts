import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk/clients/all";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { ZeroArgumentsConstructor } from "@aws/dynamodb-data-marshaller";
import { IGenericTypeCanHaveId } from "../interfaces/genericTypeCanHaveId";

export class DbService {

    private mapper: DataMapper;

    constructor() {
        const credentials = new AWS.SharedIniFileCredentials({ profile: 'educate' });
        const dynamoDbClient = new DynamoDB({ region: 'us-east-1', credentials });
        this.mapper = new DataMapper({ client: dynamoDbClient });
    }

    protected async listAll<M>(modelClass: ZeroArgumentsConstructor<M>): Promise<M[]> {
        const scanIterator = this.mapper.scan(modelClass);
        const scanItems = [];
        for await (const item of scanIterator) {
            scanItems.push(item);
        }
        return scanItems;
    }

    protected async createElements<M>(modelClass: ZeroArgumentsConstructor<M>, elements: M[]): Promise<M[]> {
        const resultsPromises = Array<Promise<M | undefined>>();
        for (const element of elements) {
            resultsPromises.push(this.createDocument(element, modelClass));
        }
        return (await Promise.all(resultsPromises)).filter(this.notEmpty);
    }


    protected readonly createDocument = async<M>(m: M, modelClass: ZeroArgumentsConstructor<M>) => {
        return this.mapper.put(Object.assign(new modelClass(), m));
    }

    protected readonly getDocument = async<M>(u: M, fields?: string[]): Promise<M | undefined> => {
        try {
            const projectionArg = fields && fields.length > 0 ? { projection: fields } : {};
            return this.mapper.get(u, projectionArg);
        } catch (err) {
            return undefined;
        }
    }

    protected readonly deleteDocument = async<M>(m: M) => {
        return this.mapper.delete(m);
    }

    protected readonly putDocument = async<M>(m: M): Promise<M> => {
        return this.mapper.put(m);
    }

    protected async getDocumentsByIds<M extends IGenericTypeCanHaveId>(modelClass: ZeroArgumentsConstructor<M>, ids: string[], fields?: string[]): Promise<M[]> {
        const resultsPromises = Array<Promise<M | undefined>>();
        const scanIterator = this.mapper.scan(modelClass, { projection: ["id"] });
        for await (const item of scanIterator) {
            if (item.id && ids.includes(item.id)) {
                resultsPromises.push(this.getDocument(item, fields));
            }
        }
        return (await Promise.all(resultsPromises)).filter(this.notEmpty);
    }

    private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

}