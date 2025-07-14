export interface Item {
  name: string;
  quantity: string;
  buyLocation: string;
  costInFrance: string;
  itemType: string;
  storeType: string;
}

export interface Category {
  categoryName: string;
  items: Item[];
}
