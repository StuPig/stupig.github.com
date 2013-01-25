---
layout: post
title: "Web App或者Hybrid App静态资源管理"
description: "Web App或者Hybrid App静态资源管理的技术选型"
category: tech
tags:
 - html5
 - application cache
 - web storage
 - Web SQL Database
 - Indexed DB
 - resources manager
keywords: Web App, Hybrid App, static resources
---
准备开始与移动端的童鞋们一起搞Hybrid App，由于之前大家也都没有什么经验，所以将本来的技术选型讨论，搞的跑题了，搞成了Web App或者说Hybrid App的静态资源管理的讨论。不过，索性就这个细节问题挖一下了：

同事的建议，是利用`local storage`自主研发一个静态资源管理器（`Resources Manager`），提供`create`、`read`、`update`、`delete`接口，模块化加载静态资源（`js`、`css`、`template`）。好处是，接口明确，保证核心能控制所有的资源，保证资源完全控制权（原因是在`Hybrid App`开发过程中，不要被`native developer`牵制）。

个人认为：

1. 针对今天提到的资源管理器（`Resources Manager`），究竟是要自己实现一个模块化加载（类似`seaJS`等，不知道小明是不是这个意思）和管理，还是使用HTML5所支持的新的API去应用

   我建议还是使用`HTML5`的`application cache`:

     - 首先，我们的需求很明确：

          * 尽可能的缓存静态资源，减少http请求，快速响应用户。
          * 在资源更新的情况下，能及时更新，而且只更新需要更新的资源档。
          * 某些相互依赖的资源（比方说js），一旦某一个更新失败：要么回滚；要么重新更新，保证依赖资源都得到更新。

     - 其次，根据我们的需求，看`application cache`的支持情况：

          *  `application cache`的初衷就是为了满足`offline`情况下，用户对于静态资源诉求，可以有效缓存静态资源（具体缓存的大小，有待研究，但是常用静态资源肯定不是问题）。
          * `application cache`在`manifest`更新的情况下，可以按需更新。
          * 使用`application cache`缓存资源，更符合设计思路，就像HTML中注意标签的语义性一样。
          * `application cache`在资源下载失败时，会自动回滚，使用老的资源。
          * `application cache`是基于事件响应式的，资源更新成功失败等的事件å，我们是可以捕捉到的，进而手动更新相关资源的。(`application cache`的具体事件各浏览器下的支持情况，还需要再测试)
          * `application cache`稳定，有丰富的应用实例（离线gmail等）

     - 再者，

          * 不建议重复造轮子，即使是做资源管理器个人认为，应该拆分为至少两部分，资源模块化加载和资源的管理（CRUD接口），而模块化加载，是现有很多库可供使用的（`seaJS`、`requireJS`等）
          * 不建议将静态资源存储在`local storage`里。原因:
               > `web storage`（这里泛泛来讲，可以包括`cookie`、`local storage`、`session storage`、`User data(IE6/7)`），目的很明确，它的初衷就是用来存储数据（或者准确说`structure data`）的。这就好像HTML标签的语义性。当然，细分下来`web storage`的每种的分工也是不同的，这里不赘述。
               > `local storage`空间尽管不小（前同事测的`iOS4`是2M，也不算太大），但是还是很宝贵
               > 很多时候影响问题的原因不是能和不能，而是适合和不适合

2. 关于`IndexedDB`，如小明所言，确实支持不好。不过，我们还有`Web SQL Database`，尽管已经`W3 Web`工作组已经声明不再维护更新，但是各个浏览器厂商对它的支持还是非常好：

    - `API`支持异步
    - 支持事务
    - 用来存储大段的`html fragment`（比方说商家详情信息等）很赞
    - `SQL`语言为`SQL lite`
    - 稳定，有丰富的案例可供参考（`FT`等）

以上，我的建议：
    1. 采用`application cache`来做静态资源管理（可以结合一个种子js文件解决某些情况下更新失败的问题），主要用来存放不经常变的`js css image`和前端模板文件。
    2 .`local storage`用来存放结构化的数据
    3. `Web SQL Database`用来存放，可能经常会变的`html fragment`

另外，有时候，做正确的事情，比正确的做事情更重要。

再思考要做什么事情之前，先考虑如何才能更快的体现处自己的价值。

