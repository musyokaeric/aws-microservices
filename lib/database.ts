import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { create } from "domain";

export class EcommerceDatabase extends Construct {

    public readonly productTable: ITable;
    public readonly basketTable: ITable;


    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Product table dynamoDb
        this.productTable = this.createProductTable();
        // Basket table dynamoDb
        this.basketTable = this.createBasketTable();
    }

    createProductTable() : ITable {
        const productTable = new Table(this, 'product', {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: 'product',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
        return productTable;
    }

    createBasketTable() : ITable {
        const basketTable = new Table(this, 'basket', {
            partitionKey: { name: 'userName', type: AttributeType.STRING },
            tableName: 'basket',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
        return basketTable;
    }
}