---
layout: post
title: "JS对象字面量、构造函数包装对象之间的区别和使用"
description: "JS对象字面量、构造函数包装对象的区别和使用"
category: tech
tags:
 - javascript
 - ECMA
 - primitive wrapper
 - value
 - literal variable
 - literal value
keywords: javascript, JS对象字面量, 构造函数对象, 字面量值
---
原谅我`JavaScrip`t理论书读书实在太少，加之英语也挺烂，所以就取了个这么奇葩的标题。

理解下文的前提是建立在对于这三种类型的准确理解基础上的，而代码更懂我:
{% highlight javascript %}
// 对象字面量
var str0 = 'this is str0';
// 构造函数包装对象
var str1 = new String('this is str1');
{% endhighlight %}

并且本文主要围绕`string`、`number`和`boolean`三种基本数据类型讨论。

-----

有了这个前提，就看一个例子，原生数字字面量和数字构造函数对象的区别:
{% highlight javascript %}
// 数字字面量
var n = 1.0;
console.log(typeof n); // "number"

// 数字构造函数包装对象
var nobj = new Number(1.0);
console.log(typeof nobj); // "object"
{% endhighlight %}

**问题:**
{% highlight javascript %}
var n = 1.0;
console.log(typeof n); // ?

var nobj = Number(1.0);
console.log(typeof nobj); // ?

nobj === n; // true or false ?
{% endhighlight %}
结果是什么，为什么?

------

字面量对象的类型就是`number`，而构造函数对象的类型就是一个`object`：
{% highlight javascript %}
var n = 1.0;
console.log(n === 1); // true

var nobj = new Number(1.0)
console.log(nobj === 1); // false

// 为其添加属性，并不会报错
n.sing = function () { console.log(this) };
nobj.sing = function () { console.log(this) };

n.sing(); // TypeError: Object 1 has no method 'say'
nobj.sing(); // Number, if use alert instead of console.log, the result will be 1, why?
{% endhighlight %}
上面的例子也可以看到，构造函数对象——做为构造函数的实例，其本身就是一个对象。而字面量则是简单类型，无法为其添加属性。

------

再看[元彦](http://madscript.com/)blog中[JavaScript浮点运算问题分析与解决](http://madscript.com/javascript/javscript-float-number-compute-problem/)一文结尾，作者给出了一个很好的解决JavaScript浮点运算问题的方法。但是，代码实际执行结果却出错了:
{% highlight javascript %}
(1.0-0.9).toFixed(digits)       // toFixed() 精度参数须在 0 与20 之间
(1.0-0.9).toFixed(10) === 0.1.toFixed(10)   // 结果为True
{% endhighlight %}

既然字面量是简单类型，为什么还能调用`number`的`toFixed`方法呢？
因为字面量在执行到`.toFixed()`时，会临时悄悄（XD）转换成一个对象，并表现处对象所具有的行为。而这种转换，仅当你调用对应类型的实例方法时执行。

所以既然字面量可以仅在需要的时候才转成对象，那为什么不使用字面量呢，又何必花费更大的开销来用`construtor`去进行冗余的包裹操作？！这也是向`Douglas Crockford`建议使用字面量的原因。

但构造函数包装对象果真是一无是处吗？这里只有一条使用的理由，相信从上面的例子中也能看出来，即当有需求要对基本数据类型，增加方法属性时，才有必要使用构造函数包裹。

### 参考资料
[《JavaScript Patterns》第3章Primitive Wrappers](http://www.amazon.cn/mn/detailApp/ref=asc_df_0596806752409002/)

[ JavaScript浮点运算问题分析与解决](http://madscript.com/javascript/javscript-float-number-compute-problem/)

[ 12种不宜使用的Javascript语法](http://www.ruanyifeng.com/blog/2010/01/12_javascript_syntax_structures_you_should_not_use.html)

