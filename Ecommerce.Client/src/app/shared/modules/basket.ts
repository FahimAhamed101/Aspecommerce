export interface ICommonItem {
  id: number;
  productName: string;
  brand: string;
  type: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface IBasketItem extends ICommonItem {}

export interface ICustomerBasket {
  id: string;
  items: IBasketItem[];
  deliveryMethodId?: number | null;
  clientSecret?: string;
  paymentIntentId?: string;
  shippingPrice?: number;
}
