import { ICommonItem } from './basket';

export interface IWishListItem extends ICommonItem {}

export interface ICustomerWishList {
  id: string;
  items: IWishListItem[];
}
