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



class App {
  async run() {}
}

export default App;
