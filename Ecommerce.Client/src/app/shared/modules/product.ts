export interface IProductResponse {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  price: number;
  quantity: number;
  boughtQuantity: number;
  numberOfReviews: number;
  averageRating: number;
  productBrandId: number;
  productTypeId: number;
  productBrandName: string;
  productTypeName: string;
}

export type IProduct = IProductResponse;

export interface IProductQueryParams {
  pageIndex?: number;
  pageSize?: number;
  brandId?: number;
  typeId?: number;
  sort?: string;
  search?: string;
  minAverageRating?: number;
}

export interface IProductCommon {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productTypeId: number;
  productBrandId: number;
}

export interface IProductCreate extends IProductCommon {
  imageFile: File;
}

export interface IProductUpdate extends IProductCommon {
  productId: number;
  image?: File | null;
  removeImage?: boolean;
}
