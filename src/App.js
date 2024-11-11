import { Console, DateTimes } from '@woowacourse/mission-utils';

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
      throw new Error('재고가 부족합니다.'); // 재고 부족 시 예외 처리
    }
    this.items.push({ product, quantity });
  }




class App {
  async run() {}
}

export default App;
