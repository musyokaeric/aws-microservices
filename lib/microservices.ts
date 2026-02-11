import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface EcommerceMicroservicesProps {
    productTable: ITable;
    basketTable: ITable;
    orderTable: ITable;
}

export class EcommerceMicroservices extends Construct {
    
    public readonly productMicroservice: NodejsFunction;
    public readonly basketMicroservice: NodejsFunction;
    public readonly orderingMicroservice: NodejsFunction;


    constructor(scope: Construct, id: string, { productTable, basketTable, orderTable }: EcommerceMicroservicesProps) {
        super(scope, id);

        // Product lambda function
        this.productMicroservice = this.createProductFunction(productTable);
        // Basket lambda function
        this.basketMicroservice = this.createBasketFunction(basketTable);
        // Ordering lambda function
        this.orderingMicroservice = this.createOrderingFunction(orderTable);
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
                DYNAMO_TABLE_NAME: basketTable.tableName,
                EVENT_BUSNAME: 'EcommerceEventBus',
                EVENT_SOURCE: 'com.ecommerce.basket.checkout',
                EVENT_DETAILTYPE: 'CheckoutBasket'
            }
        };
        
        const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
            ...basketFunctionProps,
            entry: join(__dirname, '../src/basket/index.js')
        });
        basketTable.grantReadWriteData(basketFunction);
        return basketFunction;
    }

    createOrderingFunction(orderTable: ITable) : NodejsFunction {
        const orderingFunctionProps : NodejsFunctionProps = {
            runtime: Runtime.NODEJS_24_X,
            bundling: {
                externalModules: [
                    'aws-sdk', // Exclude AWS SDK since it's available in the Lambda runtime
                ],
            },
            environment: {
                PRIMARY_KEY: 'userName',
                SORT_KEY: 'orderDate',
                DYNAMO_TABLE_NAME: orderTable.tableName
            }
        };
        const orderingFunction = new NodejsFunction(this, 'orderingLambdaFunction', {
            ...orderingFunctionProps,
            entry: join(__dirname, '../src/ordering/index.js')
        });
        orderTable.grantReadWriteData(orderingFunction);
        return orderingFunction;
    }
}