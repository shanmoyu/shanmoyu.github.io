---
## 基本信息
title: kratos 小笔记
date: 2025/6/4 13:00:02
tags: [golang,kratos]
categories: [golang,kratos]

banner: 
repo: go-kratos/kratos
---





## google/api/annotations.proto 标红

[原文文章](https://blog.csdn.net/brazor/article/details/124455504)

### 方法一：

问题描述: kratos新项目出现import标红, 但是文件其实是在third_party文件夹里面已经存在

![截图](/images/kratos小笔记/ae7cd6df82687add7e841edd891f99c7.png)

1. 看自己是否安装了 Protocol Buffers 插件, 没有的话需要先安装
   
   ![截图](/images/kratos小笔记/074c12ed1292fb1056fef807abae4c74.png)

2. 到“语言和框架”下面 Protocol Buffers 设置中添勾选 “在索引中搜索导入的文件” ，或者点击”+“手动添加项目的 third_party 路径
   
   ![截图](/images/kratos小笔记/302777981ca10cca59f17a18bcdc0578.png)

3. 再次返回就看不到标红了
   
   ![截图](/images/kratos小笔记/bab42a5083915fabedf678e6d8a365c0.png)
   
   

<br>

### 方法二：

在问题中右键点击 ”显示快速修复“ 添加路径

![截图](/images/kratos小笔记/ea6e056a3d821ef6d5d4a377e0f173eb.png)

![截图](/images/kratos小笔记/0cbe5d1132be55af2f0a713760b03305.png)







<br>