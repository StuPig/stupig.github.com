---
layout: post
title: "“JS高程”读书笔记1"
description: "ECMAScript,“JS”高程读书笔记,JavaScript基础学习"
category: tech
tags:
 - JavaScript
 - js
 - ECMAScript
 - ES5
keywords:
 - JavaScript
 - js
 - JavaScript高级程序设计
 - ECMAScript
---
##String
用String()来确定某一变量是null或undefined

{%highlight javascript%}
var vUndef, vNull = null;

String(vUndef);     // "undefined"
String(vNull);      // "null"

String(vUndeclare); // ReferenceError: vUndeclare is not defined
{%endhighlight%}
[ES5](http://ecma-international.org/ecma-262/5.1/#sec-15.5.1)中这样描述：
>**The String Constructor Called as a Function**

>When String is called as a function rather than as a constructor, it performs a type conversion.

>**String ( [ value ] )**

>Returns a String value (not a String object) computed by ToString(value). If value is not supplied, the empty String "" is returned.

直接调用String()作为方法时，将会执行类型转换，返回经过_ToString(value)_得到的字符串字面量（与new String()不同），或者空字符串（''）.

###ToString转换

**非Number类型调用时:**

- Undefined -- "undefined"
- Null -- "null"
- Boolean
  * true -> "true"
  * false -> "false"    
- String -- 原样返回，不进行转换
- Object
  1. 调用_ToPrimitive(input argument, hint String)_得到字符串类型的primValue
  2. 返回_ToString(primValue)_
  
**Number调用时：**

这里假如有数字m:

1. NaN -- "NaN"
2. m为+0或-0 -- "0"
3. m<0 -- 拼接的"-"与_ToString(m)_
4. m为无穷大或小 -- 返回"Infinity"
5. 否则会有一坨关于计算数字字符串表现形势下小数点和前导0等等相关的算法和规则[ToString Applied to the Number Type](http://ecma-international.org/ecma-262/5.1/#sec-9.8.1)

##Object
Object的实例拥有以下方法：

- constructor -- 创建当前对象的构造函数
- hasOwnProperty(propertyName) -- 检查给定的属性在当前实例中（而不是在实例的原型中）是否存在，其中属性名（propertyName）必须为字符串
- isPrototypeOf(object) -- 判断要检查其原型链的对象是否存在于指定对象实例中，是则返回true，否则返回false(A.prototype.isPrototypeOf(a))
- propertyIsEnumerable(propertyName) -- 检查指定的属性名是否是自身的可枚举属性，只有同时满足以下三点才返回true，参考[MDN讲解](https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable)
  * property是该实例的属性
  * property非继承来的属性
  * 可以通过for...in语句循环枚举
- toLocaleString() -- 返回根据所在地的语言习惯得到的字符串
- toString() -- 返回对象的字符串表示
- valueOf() -- 返回对象最有意义的原始值，以字符串、数字、或布尔值表示

##操作符
###一元操作符
使用前置递增或递减操作符，更改被操作对象的值

{%highlight javascript%}
var a0 = 29;
var b0 = --a0 + 2;

a0;     // 28
b0;     // 30


var a1 = 29;
var b1 = a1-- + 2;

a1;     // 28
b1;     // 31
{%endhighlight%}
###位操作符
将字符转为32位2进制显示，第32位为符号位

[按位与（&）](http://ecma-international.org/ecma-262/5.1/#sec-11.10)：

{%highlight javascript%}
var a = 9;  // 1001
var b = 5;  // 0101

a & b;      // 0001 即 1
{%endhighlight%}
[按位或(|)](http://ecma-international.org/ecma-262/5.1/#sec-11.10)：

{%highlight javascript%}
var a = 9;  // 1001
var b = 5;  // 0101

a | b;      // 1101 即 13
{%endhighlight%}
[按位非(~)](http://ecma-international.org/ecma-262/5.1/#sec-11.4.8)：

{%highlight javascript%}
var a = 9;  // 1001

~a;         // 0110 即 6
{%endhighlight%}
[按位异或( ^ )](http://ecma-international.org/ecma-262/5.1/#sec-11.10)：

{%highlight javascript%}
var a = 9;  // 1001
var b = 5;  // 0101

a ^ b;      // 1100 即 12
{%endhighlight%}

[左移(<<)](http://ecma-international.org/ecma-262/5.1/#sec-11.7.1)：

{%highlight javascript%}
var a = 9;  // 1001
var b = 5;

a << b;     // 100100000 即 288
{%endhighlight%}

[有符号的右移(>>)](http://ecma-international.org/ecma-262/5.1/#sec-11.7.2)：

{%highlight javascript%}
var a = 9;  // 1001
var b = -3; // -0101

a >> 3;     // 1
b >> 3;     // -1
{%endhighlight%}

[无符号的右移(>>>)](http://ecma-international.org/ecma-262/5.1/#sec-11.7.3)：

{%highlight javascript%}
var oldValue = -64; //equal to binary 111111111111111111111111110 00000
var newValue = oldValue >>> 5; //equal to decimal 134217726

{%endhighlight%}

####[乘性操作符(Multiplicative Operators)](http://ecma-international.org/ecma-262/5.1/#sec-11.5)

- 一个Infinity数与0相乘，结果是NaN
- Infinity被Infinity除，结果是NaN
- 零被零除，结果是NaN
- 非零有限数被零除，结果是Infinity或-Infinity
- 被除数是无限大数，除数为有限大数，取模，结果是NaN

####[关系操作符(Relational Operators)](http://ecma-international.org/ecma-262/5.1/#sec-11.8)
字符串比较的是想通位置每个字符的字符编码的值：

{%highlight javascript%}
'Back' < 'at';  // true 大写B的编码小于a
'23' < '3';     // true <两边都是字符，而'2'小于'3'
{%endhighlight%}

任何操作数与NaN进行比较，结果都是false

{%highlight javascript%}
'a' > 3;    // false
NaN > 3;    // false
NaN <= 3;   // false
{%endhighlight%}

####[相等操作符(Equality Operators)](http://ecma-international.org/ecma-262/5.1/#sec-11.9)

#####[非全等比较算法(The Abstract Equality Comparison Algorithm)](http://ecma-international.org/ecma-262/5.1/#sec-11.9.3)

假使有`x == y`：

1. Type(x)与Type(y)一致 
    * Type(x)为undefined，true
    * Type(x)为null，true
    * Type(x)为Number
      - x是NaN，false
      - y是NaN，false
      - x与y的数字类型的值相同，true
      - x为-0，y为+0，true
      - x为+0，y为-0，true
      - false
    * Type(x)为String, 如果x与y是等长等字符的字符序列，true，否则, false
    * Type(x)为Boolean，x与y同为真或假时，true，否则，false
    * x与y引用的同一个对象，true，否则，false
2. x为undefined，y为null，true
3. x为null，y为undefined，true
4. x为Number，y为String或Boolean，返回 x == ToNumber(y)
5. x为String或Boolean，y为Number，返回 ToNumber(x) == y
6. x为String或Number，y为Object，返回 x == ToPrimitive(y)
7. x为Object，y为String或Number，返回 ToPrimitive(x) == y
8. 返回false

######注意
等号是不可传递的：

{%highlight javascript%}
new String('a') == 'a'；    // true
'a' == new String('a');     // true

new String('a') == new String('a');     // false
{%endhighlight%}
####[label语句](http://ecma-international.org/ecma-262/5.1/#sec-12.12)
ECMAScript没有goto语句，但是有label语句来满足循环嵌套中的跳转问题：

{%highlight javascript%}
var num = 0;

outer:
for (var i = 0; i < 10; ++ i) {
    inner:
    for (var j = 0; j < 10; ++ j) {
        if ( i == 5 && j == 5 ) {
            break outer;
        } else if (j == 3) {
            continue inner;
        }
        
        ++ num;
    }
}

alert(num);     // 49
{%endhighlight%}

`break outer`会中断outer的执行，也就是整个循环嵌套，`continue inner`则会跳过inner当前的执行，到下一次循环

####严格模式下arguments对象的限制
1. 严格模式下，不允许访问arguments.callee和arguments.caller属性，主要体现在arguments.[[Get]]内部方法
2. 严格模式下，arguments的索引器对应的那些属性，仅仅是传递的参数值的拷贝，并不存在与形参的相互关联性
3. 严格模式下，arguments的callee和caller的特性被设置为[[Configurable:false]]。所以，使用Object.defineProperty等接口去设置或修改，都将抛出异常。
4. 严格模式下，arguments，arguments.callee，arguments.caller，arguments.callee.caller也不允许再被赋值

{%highlight javascript%}
'use strict';

void function fn(a) {
    alert(arguments[0]);
    a = 2;
    alert(arguments[0]);
}(1)

// 两次都是1
{%endhighlight%}

严格模式下，函数的参数不能有相同名称的变量：

{%highlight javascript%}
function test(a, a) {'use strict';}
{%endhighlight%}

