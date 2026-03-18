/**
 * Calculator类 - 基本数学运算实现
 * 使用TDD方法逐步构建功能
 */

class Calculator {
  /**
   * 验证输入是否为有效数字
   * @private
   * @param {*} value - 需要验证的值
   * @param {string} paramName - 参数名称（用于错误信息）
   * @throws {Error} 当输入不是有效数字时抛出错误
   */
  _validateNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('输入必须是数字');
    }
  }

  /**
   * 验证两个输入参数
   * @private
   * @param {*} a - 第一个参数
   * @param {*} b - 第二个参数
   */
  _validateInputs(a, b) {
    this._validateNumber(a, '第一个参数');
    this._validateNumber(b, '第二个参数');
  }

  /**
   * 加法运算
   * @param {number} a - 第一个数字
   * @param {number} b - 第二个数字
   * @returns {number} 两数之和
   */
  add(a, b) {
    this._validateInputs(a, b);
    return a + b;
  }

  /**
   * 减法运算
   * @param {number} a - 被减数
   * @param {number} b - 减数
   * @returns {number} 两数之差
   */
  subtract(a, b) {
    this._validateInputs(a, b);
    return a - b;
  }

  /**
   * 乘法运算
   * @param {number} a - 第一个数字
   * @param {number} b - 第二个数字
   * @returns {number} 两数之积
   */
  multiply(a, b) {
    this._validateInputs(a, b);
    return a * b;
  }

  /**
   * 除法运算
   * @param {number} a - 被除数
   * @param {number} b - 除数
   * @returns {number} 两数之商
   * @throws {Error} 当除数为零时抛出错误
   */
  divide(a, b) {
    this._validateInputs(a, b);
    if (b === 0) {
      throw new Error('不能除以零');
    }
    return a / b;
  }
}

module.exports = Calculator;