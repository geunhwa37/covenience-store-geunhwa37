const { Console, DateTimes } = require('@woowacourse/mission-utils');
const fs = require('fs');

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
  // App 클래스: 프로그램의 실행 제어
  class App {
    constructor() {
      this.cart = new Cart();
      this.products = this.loadProducts();
    }

    loadProducts() {
      const productData = fs.readFileSync('../public/products.md', 'utf-8').split('\n');
      const promotionData = fs.readFileSync('../public/promotions.md', 'utf-8').split('\n');
      return productData.map(line => {
        const [name, price, stock] = line.split(',');
        const promotion = promotionData.find(promo => promo.includes(name));
        const promoDetails = promotion ? { type: 'N+1', requiredQuantity: Number(promotion.split('-')[1]) } : null;
        return new Product(name, Number(price), Number(stock), promoDetails);
      });
    }

  async run() {
    OutputView.printProducts(this.products.map(product => ({
      product,
      stockStatus: product.stock > 0 ? `${product.stock}개 ${product.promotion ? '프로모션' : ''}` : '재고 없음',
    })));

    const itemsToBuy = await InputView.readProduct();

    itemsToBuy.forEach(({ name, quantity }) => {
      const product = this.products.find(prod => prod.name === name);
      if (!product) {
        throw new Error('[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.');
      }

      // 프로모션 혜택 확인
      if (product.promotion && quantity < product.promotion.requiredQuantity) {
        const addPromotion = await InputView.readYesNo(`현재 ${name}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까?`);
        if (addPromotion) quantity += 1;
      }

      // 장바구니에 추가
      this.cart.addItem(product, quantity);
    });

    const applyMembershipDiscount = await InputView.readYesNo('멤버십 할인을 받으시겠습니까?');

    const discounts = {
      promotion: 1000,
      membership: applyMembershipDiscount ? 3000 : 0
    };

    const receipt = Receipt.generate(this.cart, discounts);
    OutputView.printReceipt(receipt);

    const additionalPurchase = await InputView.readYesNo('감사합니다. 구매하고 싶은 다른 상품이 있나요?');
    if (additionalPurchase) this.run();
    else Console.print("구매가 종료되었습니다. 감사합니다.");
  }

}






export default App;
