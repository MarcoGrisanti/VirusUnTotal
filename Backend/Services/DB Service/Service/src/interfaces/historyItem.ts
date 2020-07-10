export default interface IHistoryItem {
    id: string;
    filename: string;
    result: boolean;
    hash: string;
    date?: Date;
}