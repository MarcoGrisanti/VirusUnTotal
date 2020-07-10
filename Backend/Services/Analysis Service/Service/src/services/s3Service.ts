import * as AWS from "aws-sdk";
import { UploadedFile } from "express-fileupload";

const bucketPath = "com.cloud-systems.project/analyzed_files";

export default class S3Service {

    private s3: AWS.S3;

    constructor() {
        const credentials = new AWS.SharedIniFileCredentials({ profile: 'educate' });
        this.s3 = new AWS.S3({ credentials, region: 'us-east-1' });
    }

    public uploadFile(file: UploadedFile) {
        const params = {
            Bucket: bucketPath,
            Key: file.name,
            Body: file.data
        };

        this.s3.upload(params, function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
            if (err) {
                console.log("Error While Uploading");
                throw err;
            }
            console.log(`Successfully File Uploaded To ${data.Location}`);
        });
    }

}