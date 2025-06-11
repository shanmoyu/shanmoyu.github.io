---
## 基本信息
title: kratos环境准备和工具安装
date: 2025/6/4 13:00:01
tags: [golang,kratos]
categories: [golang,kratos]

banner: 
repo: go-kratos/kratos
---





## go 安装

到[官网](https://golang.org/dl/)去下载系统对应的版本，Windows 推荐下载 MSI 文件，可以自行安装

下载完成后，在命令窗口中输入

```sh
go version
```

安装成功会能正常打印已安装的 Go 版本信息。

<br/>

## protoc 安装

在 github 中[下载](https://github.com/protocolbuffers/protobuf/releases)系统对应的版本

下好之后解压，然后把 bin 目录加入到环境变量即可

<br/>

<br/>

<br/>

## protoc-gen-go 安装

到 github 上[下载](https://github.com/protocolbuffers/protobuf-go/releases)

将 protoc-gen-go.exe 文件解压到 protoc 的 bin 目录下

<br/>

<br/>

<br/>

## kratos 命令工具安装

如果拉取依赖遇到网络问题，建议 [配置GOPROXY](https://goproxy.cn/)

**配置GOPROXY：**（Go 1.13 及以上）

```sh
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

**安装：**

```sh
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```