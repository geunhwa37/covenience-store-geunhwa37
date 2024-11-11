import { Console, DateTimes } from '@woowacourse/mission-utils';
import fs from 'fs';

// Product 클래스: 상품의 이름, 가격, 재고, 프로모션을 관리
class Product {
  constructor(name, price, stock, promotion = null) {
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.promotion = promotion;
  }

  // 상품의 가격을 계산하는 메서드: 프로모션이 있을 경우, 프로모션에 맞는 가격 계산
  calculatePrice(quantity) {
    if (this.promotion) {
      return this.applyPromotion(quantity);
    }
    return this.price * quantity;
  }

  // 프로모션 적용 메서드: N+1 프로모션의 경우 적절히 가격을 계산
  applyPromotion(quantity) {
    const { type, requiredQuantity } = this.promotion;
    if (type === "N+1" && quantity >= requiredQuantity) {
      return Math.floor(quantity / requiredQuantity) * this.price + (quantity % requiredQuantity) * this.price;
    }
    return this.price * quantity;
  }

  // 재고 확인 메서드
  hasSufficientStock(quantity) {
    return this.stock >= quantity;
  }
}

// Cart 클래스: 장바구니에 항목을 추가하고 총합을 계산
class Cart {
  constructor() {
    this.items = [];
  }

  // 장바구니에 상품 추가 메서드
  addItem(product, quantity) {
    if (!product.hasSufficientStock(quantity)) {
      throw new Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다.'); //재고 부족 시 예외 처리
    }
    this.items.push({ product, quantity });
  }

  // 장바구니 총합 계산 메서드
  getTotal() {
    return this.items.reduce((total, { product, quantity }) => total + product.calculatePrice(quantity), 0);
  }

  // 장바구니에 담긴 아이템 반환 메서드
  getItems() {
    return this.items;
  }
}

// InputView 클래스: 사용자의 입력을 처리
class InputView {
  static async readProduct() {
    const input = await Console.readLineAsync("구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1]");
    const [name, quantity] = input.split('-');
    return { name, quantity: Number(quantity) };
  }
}


class App {
  async run() {}
}

export default App;
