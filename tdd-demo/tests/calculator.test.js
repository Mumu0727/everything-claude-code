/**
 * 计算器测试文件
 * 使用TDD方法实现基本的数学运算功能
 */

const Calculator = require('../src/calculator');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('加法运算', () => {
    test('应该能正确计算两个正数的和', () => {
      // 安排 (Arrange)
      const a = 5;
      const b = 3;
      const expected = 8;

      // 执行 (Act)
      const result = calculator.add(a, b);

      // 断言 (Assert)
      expect(result).toBe(expected);
    });

    test('应该能正确计算负数的加法', () => {
      const result = calculator.add(-5, 3);
      expect(result).toBe(-2);
    });

    test('应该能正确计算零的加法', () => {
      const result = calculator.add(0, 5);
      expect(result).toBe(5);
    });
  });

  describe('减法运算', () => {
    test('应该能正确计算两个正数的差', () => {
      const result = calculator.subtract(10, 3);
      expect(result).toBe(7);
    });

    test('应该能正确计算负数的减法', () => {
      const result = calculator.subtract(-5, 3);
      expect(result).toBe(-8);
    });

    test('应该能正确计算减去零', () => {
      const result = calculator.subtract(5, 0);
      expect(result).toBe(5);
    });

    test('应该能正确计算零减去其他数', () => {
      const result = calculator.subtract(0, 5);
      expect(result).toBe(-5);
    });
  });

  describe('乘法运算', () => {
    test('应该能正确计算两个正数的乘积', () => {
      const result = calculator.multiply(4, 5);
      expect(result).toBe(20);
    });

    test('应该能正确计算负数的乘法', () => {
      const result = calculator.multiply(-3, 4);
      expect(result).toBe(-12);
    });

    test('应该能正确计算两个负数的乘积', () => {
      const result = calculator.multiply(-3, -4);
      expect(result).toBe(12);
    });

    test('应该能正确处理零乘法', () => {
      const result = calculator.multiply(5, 0);
      expect(result).toBe(0);
    });

    test('应该能正确计算小数乘法', () => {
      const result = calculator.multiply(0.2, 0.5);
      expect(result).toBeCloseTo(0.1);
    });
  });

  describe('除法运算', () => {
    test('应该能正确计算两个正数的除法', () => {
      const result = calculator.divide(15, 3);
      expect(result).toBe(5);
    });

    test('应该能正确计算负数的除法', () => {
      const result = calculator.divide(-12, 3);
      expect(result).toBe(-4);
    });

    test('应该能正确计算两个负数的除法', () => {
      const result = calculator.divide(-12, -3);
      expect(result).toBe(4);
    });

    test('应该能正确计算小数除法', () => {
      const result = calculator.divide(0.6, 0.3);
      expect(result).toBeCloseTo(2);
    });

    test('应该能正确处理零作为被除数', () => {
      const result = calculator.divide(0, 5);
      expect(result).toBe(0);
    });

    test('除以零应该抛出错误', () => {
      expect(() => {
        calculator.divide(5, 0);
      }).toThrow('不能除以零');
    });

    test('零除以零应该抛出错误', () => {
      expect(() => {
        calculator.divide(0, 0);
      }).toThrow('不能除以零');
    });
  });

  describe('输入验证', () => {
    test('应该验证输入是否为数字 - 加法', () => {
      expect(() => {
        calculator.add('a', 5);
      }).toThrow('输入必须是数字');

      expect(() => {
        calculator.add(5, 'b');
      }).toThrow('输入必须是数字');
    });

    test('应该验证输入是否为数字 - 所有运算', () => {
      const operations = ['add', 'subtract', 'multiply', 'divide'];
      const invalidInputs = ['string', null, undefined, {}, []];

      operations.forEach(operation => {
        invalidInputs.forEach(input => {
          expect(() => {
            calculator[operation](input, 5);
          }).toThrow('输入必须是数字');

          expect(() => {
            calculator[operation](5, input);
          }).toThrow('输入必须是数字');
        });
      });
    });
  });
});