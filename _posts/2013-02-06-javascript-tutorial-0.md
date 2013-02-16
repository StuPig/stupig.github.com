---
layout: post
title: "“JS高程”读书笔记0"
description: "如何把mobile page打开时间控制在1s内，make your mobile pages render in under one second"
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
_结合ES5，重读《JavaScript高级程序设计》，希望把书读薄点儿。
刚开头，看了下数据类型，这里主要记录了Null、Boolean、Number_

##数据类型
6种数据类型：

- 5种简单数据类型（基本数据类型）：
  * Undefined Null Boolean String Number
- 1种复杂数据类型：
  * Object
  
typof的返回值有：
"undefined" "object" "boolean" "string" "number" "function"

ECMAScript关于typeof操作的定义[The typeof Operator](http://ecma-international.org/ecma-262/5.1/#sec-11.4.3)

###null
对比发现，少了null，因为null表示一个空对象的指针:

{%highlight javascript%}
typeof null;	// "object"
{%endhighlight%}
###undefined
{%highlight javascript%}
// 未定义的
// var age

// 未初始化的
var msg;

// 调用方法
console.log(age);		// 报错
console.log(msg);		// undefined
{%endhighlight%}
但是typeof方法返回的是同一个值：

{%highlight javascript%}
typeof age;		// undefined
typeof msg;		// undefined
{%endhighlight%}

###undefined & null
undefined是派生自null的，ECMA-262规定他俩的相等性检测，返回true

{%highlight javascript%}
undefined == null;		// true
{%endhighlight%}

这里处于比较的目的，是做了操作数转换的，因此，严格模式下并不相等：

{%highlight javascript%}
undefined === null;		// false
{%endhighlight%}

###number
采用IEEE754格式来表示整数和浮点数(_因此也拥有IEEE754对于浮点数处理的bug_)

Infinity无法参与数值计算，可用isFinite函数来检测：

{%highlight javascript%}
var a = Number.MAX_VALUE + Number.MIN_VALUE;
console.log(isFinite(a));	// true
{%endhighlight%}

NaN——非数值（Not a Number），同时无法转换成数值，与任何值都不想等，可用isNaN检测：

{%highlight javascript%}
NaN == NaN;			// false
isNaN(NaN);			// true
isNaN("10");		// false，可以被转换成数值
isNaN(false);		// false，可以被转换成数值
isNaN("number");	// true，非数值，同时，无法被转换成数值
{%endhighlight%}

isNaN同样可以用来检测对象，在基于对象调用isNaN函数时，会首先调用valueOf()方法，然后确定该方法的返回值是否可以转换为数值。**如果不能，则基于这个返回值再调用toString()方法，再测试返回值。**这个过程也是ECMAScript中内置函数和操作符的一般执行流程。

####valueOf() & toString()
valueOf()与toString()是[所有ECMAScript对象拥有的内置方法](http://ecma-international.org/ecma-262/5.1/#sec-15.2.4)。操作对象时，valueOf()和toString()会被隐式的调用。

valueOf()方法的目的是将对象转换成最有意义的原始值([[PrimitiveValue]])。即ECMAScript的5种基本类型中的三种，布尔值、数字、字符串。

{%highlight javascript%}
true.valueOf();			// true
1..valueOf();			// 1
'str'.valueOf();		// "str"
null.valueOf();			// TypeError
undefined.valueOf(); 	// TypeError
({k: 'v'}).valueOf();	// {k: 'v'}，对象本身
[1,2,3].valueOf();		// [1,2,3]，数组本身
{%endhighlight%}

ECMAScript-262中[这样描述valueOf()](http://ecma-international.org/ecma-262/5.1/#sec-15.2.4)方法：
> When the valueOf method is called, the following steps are taken:

>1. Let `O` be the result of calling [ToObject](http://ecma-international.org/ecma-262/5.1/#sec-9.9) passing the **this** value as the argument.
2. If `O` is the result of calling the Object constructor with a host object ([15.2.2.1](http://ecma-international.org/ecma-262/5.1/#sec-15.2.2.1)), then
   * Return either `O` or another value such as the host object originally passed to the constructor. The specific result that is returned is implementation-defined.
3. Return `O`.

当valueOf方法被调用时，会调用内置的ToObject，并将**this**作为参数传进去。ToObject检测会根据参数类型进行数值的转换：

- Undefined - 抛出**TypeError**异常
- Null      - 抛出**TypeError**异常
- Boolean   - 创建一个Boolean对象，调用[ToBoolean](http://ecma-international.org/ecma-262/5.1/#sec-9.2)生成[[PrimitiveValue]]
- Number	- 创建一个Number对象，调用[ToNumber](http://ecma-international.org/ecma-262/5.1/#sec-9.3)生成[[PrimitiveValue]]
- String	- 创建一个String对象，调用[ToString](http://ecma-international.org/ecma-262/5.1/#sec-9.8)生成[[PrimitiveValue]]
- Object	- 对象本身

toString()方法的目的是将对象转换成一个有意义的字符串。

{%highlight javascript%}
true.toString();								// "true"
1..toString();									// "1"
'str'.toString();								// "str"
null.toString();								// TypeError
Object.prototype.toString.call(null);			// "[object Null]"
undefined.toString();		 					// TypeError
Object.prototype.toString.call(undefined);		// "[object Undefined]"
({k: 'v'}).toString();							// "[object Object]"
[1,2,3].toString();								// "1,2,3"
{%endhighlight%}

ECMAScript对象的大多数操作的转换结果是字符串，这两个方法的结果是相同的。但是如果操作的对象为Number、Boolean或者Date，结果就不同了。

简单来说，在对像操作的隐式转换时，先根据前文线索(hint)，如果hint是String，即字符串操作，则先调用toString()方法，没有返回值，再调用valueOf()方法；如果hint是Number，则正好相反。如果没有hint，则默认hint为Number。参见[[[DefaultValue]] (hint)](http://ecma-international.org/ecma-262/5.1/#sec-8.12.8)。

{%highlight javascript%}
var obj = {
	toString: function() {
		return 'invoke toString';
	},
	valueOf: function() {
		return 123;
	}
};

obj + '!';		// "123!"
alert(obj);		// "invoke toString"
{%endhighlight%}

关于toString和valueOf的转换见此文[Conversion, toString and valueOf](http://javascript.info/tutorial/object-conversion)。有时间，再把他翻译了

关于对象的原始值（Object to PrimitiveValue）的转换，可以参考这篇文章[Object-to-Primitive Conversions in JavaScript](http://www.adequatelygood.com/2010/3/Object-to-Primitive-Conversions-in-JavaScript)

关于+操作，首先计算左边表达式，调用GetValue()取得左边表达式的值；再计算右边表达式，调用GetValue()取得右边的值；之后将左边value求原始值（primitiveValue），再求右边原始值；**如果左边或者右边原始值是string，则调用ToString拼接字符串；否则，调用ToNumber求和。**参见[The Addition operator ( + )](http://ecma-international.org/ecma-262/5.1/#sec-11.6.1)

####数值转换
有3个函数可以将非数值转换为数值：Number()、parseInt()和parseFloat()。

######Number
Number()可以将任何非数值，转换为数值。[Number ( [ value ] )](http://ecma-international.org/ecma-262/5.1/#sec-15.7)，将调用[ToNumber](http://ecma-international.org/ecma-262/5.1/#sec-9.3)来计算返回值：

- Undefined - NaN
- Null	- +0
- Boolean -  true -> 1，false -> 0
- Number - 原值，不做转换
- Object - 
  * 通过[ToPrimitive()](http://ecma-international.org/ecma-262/5.1/#sec-9.1)获得原始值
  * 再调用ToNumber()
  
对于字符串的操作比较复杂：

- 只包含数字 - 转换为**10进制**数值，前导的0会被忽略，
- 只包含有效浮点数 - 转为浮点数值，忽略前导0
- 只包含有效十六进制数 - 转为相同的十进制数值
- 空字符串 - 0
- 不符合上述条件的 - NaN

{%highlight javascript%}
Number("00123");		// 123
Number("01.1");			// 1.1
Number("0xf11");		// 3857
Number("");				// 0
Number("00xf11");		// NaN
{%endhighlight%}

#####parseInt()
parseInt(string, radix)方法，用于将字符串(string)转为响应进制(radix)的整形数字。

字符串(string)将忽略前导0、空格和其他制表符(\n、\t、\r)。

radix未定义或者是0，则默认以10进制计算。除非string是以`0x`或者`0X`开头的（将以16进制计算）。如果设置了radix为16进制，可以选择是否以`0x`或`0X`开头。

_ES3（ECMAScript-262 第三版）中会默认以0开头的，浏览器实现上可以按8进制计算，或者按10进制，但是ES5中已经去掉，即按10进制计算。类似的，《高程（第2版）》第3.4节Number类型（27页），关于`parseInt('070')`为默认以8进制计算的说法，目前是不适用的_

{%highlight javascript%}
parseInt('00000012.2');				// 0
parseInt('  0000 \t\n\r 12.2');		// 0
parseInt('  \t\r\n000012.2');		// 12
parseInt(' 0000012 ') * 2;			// 24
0000012 * 2;						// 10
{%endhighlight%}

parseInt被调用时：

- 去掉前导的空格和制表符
- 设置为正数
- 如果`-`开头，则为负数
- 设置位数radix
- 去掉`0x`或者`0X`前缀，如果剩余为空，返回NaN
- 遇到第一个数字，开始解析，直到遇到第一个非数字，停止解析，返回结果

参见[parseInt (string , radix)](http://ecma-international.org/ecma-262/5.1/#sec-15.1.2)

parseFloat()不再介绍，详情见[parseFloat (string)](http://ecma-international.org/ecma-262/5.1/#sec-15.1.2)

####测验
这里有一套题[Are You a JavaScript Guru? Try This Test（需翻墙）](http://asserttrue.blogspot.com/2013/02/are-you-javascript-guru-try-this-test.html)，其中至少有十道题都多多少少涉及这一部分相关的内容：

0. ++Math.PI
1. (0.1 + 0.2) + 0.3 == 0.1 + (0.2 + 0.3)
2. typeof NaN
3. typeof typeof undefined
4. a = {null:null}; typeof a.null;
5. a = "5"; b = "2"; c = a * b;
6. a = "5"; b = 2; c = a+++b;
7. isNaN(1/null)
8. (16).toString(16)
9. 016 * 2
10. ~null
11. "ab c".match(/\b\w\b/)

答案是（请自行翻译）：

{%highlight javascript%}
1100011011101000001101001011101100011101001100011101011110011100101101101101011100111101011110001110011101111110011100111000001000001000001000001100101011101000001100110110000111011001110011110010110000010000010000010000011001110111010000010001011011101110101110110111000101100101111001010001010000010000010000010000011010010111010000010001011100111110100111001011010011101110110011110001010000010000010000010000011010110111010000010001011011111100010110101011001011100011111010010001010000010000010000010000011011010111010000011000111000010000010000010000010000011011110111010000011011110000010000010000010000011100010111010000011001101100001110110011100111100101100000100000100000100000111001101110100000100010110001110000100010100000100000100000100000110001110000101110100000110010111000100000100000100000100000110001110001101110100000101101110001100000100000100000100000110001110010101110100000101101110000010001011000111000101000001011101 
{%endhighlight%}

这里还有一套题[Test – Are you a Javascript Guru?](http://blog.vjeux.com/2009/javascript/test-are-you-a-javascript-guru.html)（表打我，鲁迅先生《野草集》都有“我家门前有两棵树，一颗是枣树，另一颗还是枣树”的经典，我也用下……），其中至少五道题与这次内容相关。

计算result的指：

0.  var result = [10] + 1;
1.  var result = ['a', 'b', 'c'] + "";
2.  var result = 'a' + 5;
3.  var result = 3.75 | 0;
4.  var result = 65 / 'a';
5.  var ob = {"10": 1};
ob[10] = 2;
ob[[1, 0]] = 3;
var result = ob["10"] + ob[10] + ob[[1, 05.  ]];
6. var $ = {"": String};
var result = !!$[([])]();
7. var result = (' \t\r\n ' == 0);
8. var a = new String("123");
var b = "123";
var result = (a === b);
9. var a = {key: 1};
var b = {key: 1};
var result = (a == b);

答案是（请自行翻译）：

{%highlight javascript%}
11000110111010000010001011000111000011000110001010000010000010000010000011001010111010000010001011000011011001100010101100110001110001010000010000010000010000011001110111010000010001011000011101011000101000001000001000001000001101001011101000001100111000001000001000001000001101011011101000001001110110000110011101000001000001000001000001101101011101000001101111000001000001000001000001101111011101000001100110110000111011001110011110010110000010000010000010000011100010111010000011101001110010111010111001011000001000001000001000001110011011101000001100110110000111011001110011110010110000010000010000010000011000111000010111010000011001101100001110110011100111100101
{%endhighlight%}

这里还有一套专门针对数值转换的题目——[JavaScript Quiz [x + 0 == x - 0]](http://dt.zonu.me/lab/jsquiz.html)
