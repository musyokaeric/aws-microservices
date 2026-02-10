import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Product table dynamo db
    const productTable = new Table(this, 'product', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'product',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

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

    // Product API Gateway
    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productFunction,
      proxy: false
    });

    const product = apigw.root.addResource('product'); // /product
    product.addMethod('GET'); // GET /product
    product.addMethod('POST'); // POST /product

    const singleProduct = product.addResource('{id}'); // /product/{id}
    singleProduct.addMethod('GET'); // GET /product/{id}
    singleProduct.addMethod('PUT'); // PUT /product/{id}
    singleProduct.addMethod('DELETE'); // DELETE /product/{id}
  }
}
