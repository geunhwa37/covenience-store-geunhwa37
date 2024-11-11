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

// Receipt 클래스: 장바구니 정보를 바탕으로 영수증 생성
class Receipt {
  static generate(cart, discounts) {
    const receiptLines = cart.getItems().map(({ product, quantity }) => {
      return `${product.name}\t${quantity}\t${product.calculatePrice(quantity)}원`;
    });
    receiptLines.push(`총구매액\t${cart.getTotal()}원`);
    receiptLines.push(`행사할인\t-${discounts.promotion}원`);
    receiptLines.push(`멤버십할인\t-${discounts.membership}원`);
    receiptLines.push(`내실돈\t${cart.getTotal() - discounts.promotion - discounts.membership}원`);
    return receiptLines;
  }
}

// InputView 클래스: 사용자의 입력을 처리
class InputView {
  static async readProduct() {
    const input = await Console.readLineAsync("구매할 상품명과 수량을 입력해주세요 (예: [사이다-2],[감자칩-1]): ");
    return input.match(/\[(\w+)-(\d+)\]/g).map(item => {
      const [name, quantity] = item.slice(1, -1).split('-');
      return { name, quantity: Number(quantity) };
    });
  }

  static async readYesNo(message) {
    const response = await Console.readLineAsync(message + " (Y/N): ");
    return response.toUpperCase() === 'Y';
  }
}

// OutputView 클래스: 출력 담당
class OutputView {
  static printProducts(products) {
    Console.print("안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.");
    products.forEach(({ product, stockStatus }) => {
      Console.print(`- ${product.name} ${product.price}원 ${stockStatus}`);
    });
  }

  static printReceipt(receipt) {
    receipt.forEach(line => Console.print(line));
  }
}


class App {
  async run() {}
}

export default App;
