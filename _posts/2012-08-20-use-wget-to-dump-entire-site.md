---
layout: post
title: "使用wget抓取整站资源的脚本"
description: "使用wget抓取整站资源的脚本"
category: tech
tags:
 - wget
 - bash
 - shell
 - Linux
 - Mac
 - shell script
keywords: wget,bash,脚本,抓取,整站
---
`wget`是一个命令行工具，用于批量下载文件，支持`HTTP`和`FTP`

`wget`十分强大，而且几乎所有的`*nux`的都支持这个工具（`mac`下如果安装了`homebrew`的话，可以通过`brew install wget`进行安装）

因此，我们可以利用`wget`去构建抓取整站资源的`bash`脚本：
{% highlight bash %}

#!/bin/sh
# 下载所有资源
# --recursive \
# 不获取example.com之外的链接资源
# --domains example.com \
# 不覆盖已有文件(使用场景是，断点续传)
# --no-clobber \
# --html-extension \
# 修改文件名，让其可以再windows系统下work
# --restrict-file-names=windows \
# --no-clobber \
# 将链接转换为相对地址，以让本地可用
# --convert-links \
# 获取页面所有的组成元素（image css等）
# --page-requisites \
# 不去创建带host前缀的文件夹
# --no-host-directories \
# 在当前目录下下载
# --no-directories \
# 不去下载robots.txt
# --execute robots=off \
# 获取整站资源
# --mirror \
# 不去获取这些目录，黑名单方式
# --exclude-directories /comment/reply/,/aggregator/,/user/ \
# --reject "aggregator*" \
# 不去获取stupig.com/backbone之外的链接资源，白名单方式
# --no-parent \
# stupig.me
ADDR=$1
SERVER="$(echo $ADDR | sed 's/\(.*:\/\/\)\([a-zA-Z0-9\.\-\_]*\)\(\/.*\)/\2/g')"
wget \
    --recursive \
    --domains=$SERVER \
    --no-clobber \
    --html-extension \
    --restrict-file-names=windows \
    --no-clobber \
    --convert-links \
    --page-requisites \
    --no-host-directories \
    --execute robots=off \
    --mirror \
    --exclude-directories /comment/reply/,/aggregator/,/user/ \
    --reject "aggregator*" \
    --no-parent \
    "$ADDR"
find $SERVER -type f -name "*.css" -exec cat {} \; |
grep -o 'url(/[^)]*)' |
sort |
uniq |
sed 's/^url(\(.*\))$/http:\/\/'$SERVER'\1/' |
wget --mirror --page-requisites -i -
for i in `find $SERVER -type f -name "*.css"`; do
    PREFIX="$(echo $i | sed 's/[^\/]*//g; s/\/$//; s/\//..\\\//g')"
    sed -i 's/url(\//url('$PREFIX'/g' $i
done

{% endhighlight %}
关于脚本中用到的`wget`的参数，我已经做了注释。

`line 47 - 52`:  `find $SERVER ....` 是找到`.css`的链接文件，并下载下来

`line 53 - 56`:  `for i ....`是为了修正`css`链接

---
### 参考资料
`wget`使用手册：<http://www.gnu.org/software/wget/manual/wget.html>
