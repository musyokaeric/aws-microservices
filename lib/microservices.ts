import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface EcommerceMicroservicesProps {
    productTable: ITable;
    basketTable: ITable;
}

export class EcommerceMicroservices extends Construct {
    
    public readonly productMicroservice: NodejsFunction;
    public readonly basketMicroservice: NodejsFunction;


    constructor(scope: Construct, id: string, { productTable, basketTable }: EcommerceMicroservicesProps) {
        super(scope, id);

        // Product lambda function
        this.productMicroservice = this.createProductFunction(productTable);
        // Basket lambda function
        this.basketMicroservice = this.createBasketFunction(basketTable);
    }

    createProductFunction(productTable: ITable) : NodejsFunction {
        const productFunctionProps : NodejsFunctionProps = {
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
            ...productFunctionProps,
            entry: join(__dirname, '../src/product/index.js')
        });
        productTable.grantReadWriteData(productFunction);
        return productFunction;
    }

    createBasketFunction(basketTable: ITable) : NodejsFunction {
        const basketFunctionProps : NodejsFunctionProps = {
            runtime: Runtime.NODEJS_24_X,
            bundling: {
                externalModules: [
                    'aws-sdk', // Exclude AWS SDK since it's available in the Lambda runtime
                ],
            },
            environment: {
                PRIMARY_KEY: 'userName',
                DYNAMO_TABLE_NAME: basketTable.tableName
            }
        };
        
        const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
            ...basketFunctionProps,
            entry: join(__dirname, '../src/basket/index.js')
        });
        basketTable.grantReadWriteData(basketFunction);
        return basketFunction;
    }
}