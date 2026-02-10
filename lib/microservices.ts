import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface EcommerceMicroservicesProps {
    productTable: ITable;
}

export class EcommerceMicroservices extends Construct {
    
    public readonly productMicroservice: NodejsFunction;


    constructor(scope: Construct, id: string, { productTable }: EcommerceMicroservicesProps) {
        super(scope, id);

        // Product lambda function
        const nodeJsFunctionProps : NodejsFunctionProps = {
            runtime: Runtime.NODEJS_24_X,
            bundling: {
                externalModules: [
                    'aws-sdk', // Exclude AWS SDK since it's available in the Lambda runtime
                ],
            },
            environment: {
                PRIMARY_KEY: 'id',
                DYNAMO_TABLE_NAME: productTable.tableName
            }
        };
        
        const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
            ...nodeJsFunctionProps,
            entry: join(__dirname, '../src/product/index.js')
        });
        productTable.grantReadWriteData(productFunction);
        this.productMicroservice = productFunction;
    }
}