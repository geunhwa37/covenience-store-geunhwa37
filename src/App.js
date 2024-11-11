import { Console, DateTimes } from '@woowacourse/mission-utils';

// Product 클래스: 상품의 이름, 가격, 재고, 프로모션을 관리
class Product {
  constructor(name, price, stock, promotion = null) {
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.promotion = promotion;
  }
  // 상품의 가격을 계산하는 메서드
  calculatePrice(quantity) {
    if (this.promotion) {
      return this.applyPromotion(quantity);
    }
    return this.price * quantity;
  }



class App {
  async run() {}
}

export default App;
