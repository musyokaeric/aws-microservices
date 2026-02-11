import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface EcommerceApiGatewayProps {
    productMicroservice: IFunction;
    basketMicroservice: IFunction;
}

export class EcommerceApiGateway extends Construct {
    constructor(scope: Construct, id: string, { productMicroservice, basketMicroservice }: EcommerceApiGatewayProps) {
        super(scope, id);

        // Product API Gateway
        this.createProductApiGateway(productMicroservice);
        // Basket API Gateway
        this.createBasketApiGateway(basketMicroservice);
    }

    createProductApiGateway(productMicroservice: IFunction) : void {
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

    createBasketApiGateway(basketMicroservice: IFunction) : void {
        const apigw = new LambdaRestApi(this, 'basketApi', {
            restApiName: 'Basket Service',
            handler: basketMicroservice,
            proxy: false
        });

        const basket = apigw.root.addResource('basket'); // /basket
        basket.addMethod('GET'); // GET /basket
        basket.addMethod('POST'); // POST /basket

        const userBasket = basket.addResource('{userName}'); // /basket/{userName}
        userBasket.addMethod('GET'); // GET /basket/{userName}
        userBasket.addMethod('DELETE'); // DELETE /basket/{userName}

        const checkout = basket.addResource('checkout'); // /basket/checkout
        checkout.addMethod('POST'); // POST /basket/checkout
            // expected request payload: { userName: string }
    }
}
