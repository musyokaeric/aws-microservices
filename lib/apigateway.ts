import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface EcommerceApiGatewayProps {
    productMicroservice: IFunction;
}

export class EcommerceApiGateway extends Construct {
    constructor(scope: Construct, id: string, { productMicroservice }: EcommerceApiGatewayProps) {
        super(scope, id);

        // Product API Gateway
        const apigw = new LambdaRestApi(this, 'productApi', {
            restApiName: 'Product Service',
            handler: productMicroservice,
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
