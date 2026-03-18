// 测试Hooks系统的示例代码 - 已编辑
function testFunction() {
  console.log("This is a test for console.log warning hook");
  console.log("Another console.log to test the hook");
  return 42;
}

// 新增函数
function anotherFunction() {
  return "testing hooks system";
}

export { testFunction, anotherFunction };