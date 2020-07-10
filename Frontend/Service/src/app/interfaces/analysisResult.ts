export interface IAnalysisResult {
    id: string;
    filename: string;
    result: boolean;
    hash: string;
    date?: Date;
}