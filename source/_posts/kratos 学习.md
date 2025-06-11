---
## 基本信息
title: kratos 学习
date: 2025/6/4 13:00:00
tags: [golang,kratos]
categories: [golang,kratos]

banner: 
repo: go-kratos/kratos
---





## 安装

### 前置简单了解

GORM 的 CRUD 接口操作：https://gorm.io/zh_CN/docs/query.html
Ent 的 CRUD 接口操作：https://entgo.io/zh/docs/crud
Go 语言变量：https://zhuanlan.zhihu.com/p/623547784

有 js 和 c 基础可以跳过：

Go 语言指针：https://www.runoob.com/go/go-pointers.html
Go 语言结构体：https://www.runoob.com/go/go-structures.html

<br>

### 环境准备

首先需要安装好对应的依赖环境，以及工具：

- [go](https://golang.org/dl/)：Go（又称Golang）是由Google开发的一种静态强类型、编译型编程语言，于2009年正式发布。它以高效、简洁和并发支持为核心设计目标，兼具高性能和开发效率。
- [protoc](https://github.com/protocolbuffers/protobuf)：protoc 是一个用于生成代码的工具，它可以根据 proto 文件生成C++、Java、Python、Go、PHP 等多重语言的代码，而 gRPC 的代码生成还依赖 protoc-gen-go，protoc-gen-go-grpc 插件来配合生成 Go 语言的 gRPC 代码。
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)：protoc-gen-go 是protoc的Go语言插件，用于将proto定义转换为Go代码。
- [kratos 命令工具](https://go-kratos.dev/docs/getting-started/start)：kratos 是与 Kratos 框架配套的脚手架工具，帮助开发者快速创建、管理和维护 Kratos 项目，提升开发效率。

<br/>

<br/>





### 创建项目

{% copy   kratos new <project-name>   %}

国内拉取失败可使用gitee源:

{% copy   kratos new <project-name> -r https://gitee.com/go-kratos/kratos-layout.git   %}

<br>

使用 `-b` 指定分支:

{% copy  kratos new <project-name> -b main   %}

> 拉取项目依赖：go mod download

<br>

<br>

### 运行项目

{% copy  kratos run   %}

![截图](/images/kratos/383916c041b492a3b7ee3a6a13ed2b42.png)

默认HTTP端口：`8000`
默认gRPC端口：`9000`

kratos 已经默认写了 hellword 接口

![截图](/images/kratos/f1140c5b4a3a6ce84cb1740a5dbc6be2.png)

通过 http://127.0.0.1:8000/helloworld/{name} 可以直接访问

![截图](/images/kratos/799746104a14b27a0e9964212160f45b.png)

<br/>

<br/>



### Kratos 目录结构

```sh
-
  ├── api     # 下面维护了微服务使用的proto文件以及根据它们所生成的go文件
│   └── helloworld
│       └── v1    # api版本号
│           ├── error_reason.pb.go    # 通过go generate生成的pb.go文件
│           ├── error_reason.proto
│           ├── error_reason.swagger.json
│           ├── greeter.pb.go
│           ├── greeter.proto     ## 定义接口文件
│           ├── greeter.swagger.json
│           ├── greeter_grpc.pb.go
│           └── greeter_http.pb.go
│
├── cmd  # 整个项目启动的入口文件
│   └── server
│       ├── main.go   # 入口
│       ├── wire.go  # 使用wire来维护依赖注入（通过自动生成代码的方式在编译期完成依赖注入，完成初始化）
│       └── wire_gen.go
│
├── configs   # 这里通常维护一些本地调试用的样例配置文件
│   └── config.yaml         # 项目的配置文件
│   ├── db.toml             # db相关配置
│   ├── grpc.toml           # grpc相关配置
│   ├── http.toml           # http相关配置
│   ├── memcache.toml       # memcache相关配置
│   └── redis.toml          # redis相关配置

├── internal  # 该服务所有不对外暴露的代码，通常的业务逻辑都在这下面，使用internal避免错误引用
│   ├── biz   # 业务逻辑的组装层，类似 DDD 的 domain 层，data 类似 DDD 的 repo，而 repo 接口在这里定义，使用依赖倒置的原则。
│   │   ├── README.md
│   │   ├── biz.go
│   │   └── greeter.go
│   ├── conf  # 内部使用的config的结构定义，使用proto格式生成
│   │   ├── conf.pb.go
│   │   └── conf.proto
│   ├── data  # 业务数据访问，包含 cache、db 等封装，实现了 biz 的 repo 接口。我们可能会把 data 与 dao 混淆在一起，data 偏重业务的含义，它所要做的是将领域对象重新拿出来，我们去掉了 DDD 的 infra层。
│   │   ├── README.md
│   │   ├── data.go
│   │   └── greeter.go
│   ├── server  # http和grpc实例的创建和配置
│   │   ├── grpc.go
│   │   ├── http.go
│   │   └── server.go
│   └── service  # 实现了 api 定义的服务层，类似 DDD 的 application 层，处理 DTO 到 biz 领域实体的转换(DTO -> DO)，同时协同各类 biz 交互，但是不应处理复杂逻辑
│       ├── README.md
│       ├── greeter.go
│       └── service.go
│
└── internal                # internal为项目内部包，包括以下目录：
│   ├── dao                 # dao层，用于数据库、cache、MQ、依赖某业务grpc|http等资源访问
│   │   ├── dao.bts.go
│   │   ├── dao.go
│   │   ├── db.go
│   │   ├── mc.cache.go
│   │   ├── mc.go
│   │   └── redis.go
│   ├── di                  # 依赖注入层 采用wire静态分析依赖
│   │   ├── app.go
│   │   ├── wire.go         # wire 声明
│   │   └── wire_gen.go     # go generate 生成的代码
│   ├── model               # model层，用于声明业务结构体
│   │   └── model.go
│   ├── server              # server层，用于初始化grpc和http server
│   │   ├── grpc            # grpc层，用于初始化grpc server和定义method
│   │   │   └── server.go
│   │   └── http            # http层，用于初始化http server和声明handler
│   │       └── server.go
│   └── service             # service层，用于业务逻辑处理，且为方便http和grpc共用方法，建议入参和出参保持grpc风格，且使用pb文件生成代码
│       └── service.go
│
└── third_party  ## api 依赖的第三方proto
│
└── test                    # 测试资源层 用于存放测试相关资源数据 如docker-compose配置 数据库初始化语句等
│    └── docker-compose.yaml
├── .gitignore    ## 提交git仓库需要忽略的文件
├── Dockerfile    ## 项目容器部署的配置
├── go.mod    ## 项目依赖
├── go.sum
├── Makefile    ## 定义项目的编译和构建规则（用make <xxx>去使用定义的命令），make 只能在linux和Mac上能用, win系统需要安装
├── openapi.yaml    ## 接口的描述文档
└── README.md   ## 项目介绍  

```

<br/>

<br/>

<br/>

<br/>

## API 定义

API 与用户的通信协议，通常是 REST API 和 RPC API 作为传输层协议，而 Kratos 主要参考 Google API 指南，实现了对应通信协议支持，并且遵守了 gRPC API 使用 HTTP 映射功能进行 JSON/HTTP 的支持。

### 定义接口



#### 生成 proto 模板

{% copy  kratos proto add api/helloworld/v1/demo.proto   %}



<br/>

#### 接口编写

通过 Protobuf IDL 定义对应的 REST API 和 gRPC API：

```golang api/helloworld/v1/demo.proto
syntax = "proto3";

package api.helloworld.v1;
import "google/api/annotations.proto";		// 用于支持 gRPC 到 HTTP 的转换

// Go 代码生成选项：
// - 指定生成代码的 Go 导入路径
// - 分号后的 v1 表示生成的 Go 包名
option go_package = "helloworld/api/helloworld/v1;v1";

// 服务定义 - 表示 API 接口
service Demo {
	// 定义远程过程调用（RPC）方法，Demo 接收 DemoRequest 返回 DemoReply
	rpc TestDemo (DemoRequest) returns (DemoReply)  {
		option (google.api.http) = {
			get: "/demo/{id}",		// 定义一个 GET 接口，并且把请求中的 name 路由参数映射到 DemoRequest
			body: "*",		// 使用post请求接收，可以不用声明，get请求不添加会报错 WARN: GET /demo/{id} body should not be declared. 但是也可以正常生成
		};
	}

	rpc Test (TestRequest) returns (TestReply)  {
		option (google.api.http) = {
			get: "/test",
			// 添加附加接口
			additional_bindings {
				get: "/v1/greeter/say_hello",
			}
		};
	}


}

// 定义输入输出的数据结构
message DemoRequest {
	uint32 id = 1;		// 字段编号 1：类型为 uint32，字段编号用于在二进制格式中标识该字段
}
message DemoReply {
	uint32 code = 1;
	string msg = 2;
	message Data {		// 写外面和里面都可以
		string name = 1;
		string conn = 2;
	}
	Data data = 3;
}


message TestRequest {
	uint32 id = 1;
	string name = 2;
}
message TestReply {
	uint32 code = 1;
	string msg = 2;
	TestData data = 3;
}
message TestData {
	uint32 id = 1;
	string name = 2;
	string conn = 3;
}

```

<br/>

<br/>

<br/>

### 生成接口



#### 生成 Proto 代码

使用 kratos cli 进行生成:

{% copy  kratos proto client api/helloworld/v1/demo.proto   %}

或者通过 make 命令生成， make 只能在linux和Mac上能用, win系统需要安装:

{% copy  make api   %}

执行后会在 proto 文件同目录下生成（可以把 greeter 前缀的文件删除）:

1. api/helloworld/v1/demo.pb.go
2. api/helloworld/v1/demo_grpc.pb.go
3. api/helloworld/v1/demo_http.pb.go （只会在 proto 文件中声明了 http 时才会生成）

![截图](/images/kratos/6af38abb9c82a6ca2efd09a49a175c2f.png)

<br/>

#### 生成 server 源码

{% copy     kratos proto server api/helloworld/v1/demo.proto -t internal/service     %}

![截图](/images/kratos/c07740c66c6a0a5b5ca86fcae6ea0361.png)

<br/>

随便写一个返回的数据

```golang internal/service/demo.go
package service

import (
	"context"

	pb "helloworld/api/helloworld/v1"
)

type DemoService struct {
	pb.UnimplementedDemoServer
}

func NewDemoService() *DemoService {
	return &DemoService{}
}

func (s *DemoService) TestDemo(ctx context.Context, req *pb.DemoRequest) (*pb.DemoReply, error) {
	return &pb.DemoReply{}, nil
}
func (s *DemoService) Test(ctx context.Context, req *pb.TestRequest) (*pb.TestReply, error) {
	return &pb.TestReply{
		Code: 200,
		Msg:  "success",
		Data: nil,
	}, nil
}

```

<br/>

<br/>

### 注册接口

虽然生成了 demo 的 grpc 和 http 接口，但是接口服务还没有被添加到 grpc、http 服务中，项目启动后是不可访问的。

#### 添加服务

在 internal/service/demo.go 中，可以看到一个 `NewDemoService` 函数

![截图](/images/kratos/f28f0577ceccb5226cc640ee370f1c3c.png)

打开 internal/service/service.go 使用 wire 注册 DemoService 服务提供器

```golang internal/service/service.go
package service

import "github.com/google/wire"

// ProviderSet is service providers.
// var ProviderSet = wire.NewSet(NewGreeterService)
var ProviderSet = wire.NewSet(NewGreeterService, NewDemoService)

```

<br/>

<br/>

#### 添加到 grpc、http 服务

在 internal/server 的 http.go 和 grpc.go 中注册 DemoService 的 grpc 服务和 http 服务，提供远程访问服务接口，添加到函数参数中：

**grpc.go:**

![截图](/images/kratos/5f38ffce8019c6bde7917bf4dcf85b5d.png)

<br/>

**http.go:**

![截图](/images/kratos/fa565589bc54c43b9dd078a20bcfbce1.png)

<br/>

<br/>

最后使用命令自动分析依赖，并生成注入代码

{% copy    go generate ./...   %}

或者

{% copy    make generate    %}

<br>

`kratos run` 运行项目后就可以通过 http://127.0.0.1:8000/test 访问

![截图](/images/kratos/240228719a698ca913e9ae918923cbc3.png)

<br/>

<br/>

<br/>

## 数据库操作

Kratos框架不限制任何第三方库来进行项目开发，可以根据喜好来选择库进行集成。

<br/>



### GORM 框架

[GORM](https://gorm.io/zh_CN/docs/index.html) 是 Go 语言中最受欢迎的 ORM 库之一，它提供了强大的功能和简洁的 API，让数据库操作变得更加简单和易维



#### 安装

{% copy   go get -u gorm.io/gorm  %}

{% note color:yellow   如果已经安装了就不用再安了。 %}

<br/>

<br/>

#### 数据库连接

步骤：

1. 展开type Date struct，把db设置成变量
2. 改写newData方法
3. 创建一个方法，编写初始化数据库连接
4. 使用wire自动注入

在 internal/data/data.go 文件内修改 NewData 函数或者添加一个新的函数然后在 NewData 方法里面添加一个db的传参变量，然后把这个变量赋值给Data对象，最后使用wire自动注入

```golang internal/data/data.go
package data

import (
	"helloworld/internal/conf"

	"github.com/go-kratos/kratos/v2/log"
	"github.com/google/wire"

	"gorm.io/driver/mysql" // GORM的MySQL驱动
	"gorm.io/gorm"         // GORM ORM库
)

// ProviderSet is data providers.
var ProviderSet = wire.NewSet(NewData, NewGreeterRepo, NewDB)

// Data .		 Data 结构体封装数据访问层
type Data struct {
	// TODO wrapped database client
	// TODO: 可以在这里添加其他数据源如redis等
	db *gorm.DB
}

// NewData .
func NewData(c *conf.Data, logger log.Logger, db *gorm.DB) (*Data, func(), error) {
	cleanup := func() {
		log.NewHelper(logger).Info("closing the data resources")
	}
	return &Data{db: db}, cleanup, nil
}

// GORM数据库连接的构造函数
func NewDB(c *conf.Data) *gorm.DB {
	// 格式: "用户名:密码@tcp(主机:端口)/数据库名?参数"
	dsn := "root:2025_dy_2.25@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local"
	// 使用GORM打开MySQL连接
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// 连接失败时
	if err != nil {
		panic("failed to connect database")
	}
	return db
}

```

<br/>

可以在同级目录中创建 data_test.go 

```golang internal/data/data_test.go
package data

import "testing"

func TestNewDB(t *testing.T) {
	NewDB(nil)
}

```

进入 internal/data 目录执行 `go test` 测试连接是否成功

![截图](/images/kratos/1ee3177629ae65ce1bac43fa092d6ae4.png)

<br/>

<br/>

<br/>

##### tps: 修改配置文件,并连接数据库(不使用make命令会有问题，暂时不知道什么问题)

配置文件在 configs/config.yaml ，如果要添加或修改配置的结构，则需要修改 internal/conf/conf.proto 文件，并生成新的 conf.pb.go 文件。

这里演示使用新的配置的结构

```yaml configs/config.yaml
server:
  http:
    addr: 0.0.0.0:8000
    timeout: 1s
  grpc:
    addr: 0.0.0.0:9000
    timeout: 1s
data:
  database:
    dsn: root:2025_dy_2.25@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local
  redis:
    addr: 127.0.0.1:6379
    read_timeout: 0.2s
    write_timeout: 0.2s

```

```golang internal/conf/conf.proto
syntax = "proto3";
package kratos.api;

option go_package = "helloworld/internal/conf;conf";

import "google/protobuf/duration.proto";

message Bootstrap {
  Server server = 1;
  Data data = 2;
}

message Server {
  message HTTP {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  message GRPC {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  HTTP http = 1;
  GRPC grpc = 2;
}

message Data {
  message Database {
    string dsn = 1;
  }
  message Redis {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration read_timeout = 3;
    google.protobuf.Duration write_timeout = 4;
  }
  Database database = 1;
  Redis redis = 2;
}

```

命令生成：

{% copy    protoc --proto_path=./internal --proto_path=./third_party --go_out=paths=source_relative:./internal internal/conf/conf.proto   %}



或者

{% copy    make config   %}

<br/>

数据库连接用 c.Database.Dsn 代替

```golang
	db, err := gorm.Open(mysql.Open(c.Database.Dsn), &gorm.Config{})
```

<br/>

<br/>

<br/>

#### 数据库操作

需要在 internal/biz 目录中定义业务操作代码，然后提供给 internal/demo/DemoService 中使用，过程比较麻烦，并且不能直接使用，需要代理一层。

这里要使用依赖倒置原则，也就是 `internal/biz` 需要{% mark 定义数据持久化接口 color:orange %}，然后通过接口实现对数据的增删查改操作，然后在 `internal/data` {% mark  实现具体的细节  color:orange %}，internal/biz 不直接调用 internal/data 的服务，这两者是解耦的，由 wire 注入服务。

![截图](https://i-blog.csdnimg.cn/direct/428bf3cd71c14c558c0576fc8722c6e5.png)

<br/>

##### biz 定义接口

在 internal/biz 下创建 user.go 文件，用来定义操作数据库的接口。

```golang internal/biz/user.go
package biz

import (
	"context"
	v1 "helloworld/api/helloworld/v1"
)

// User 用户数据模型
type User struct {
	Id       int
	Username string
	Password string
	Conn     string
}

// 编写关于user操作dao查询的方法，看作是java的repository层
type UserRepo interface {
	FindByIdAndUsername(ctx context.Context, testRequest *v1.TestRequest) (us *User, err error)
}

// 定义user使用实例，用于自动注入user实例
type UserUseCase struct {
	us UserRepo
}

// 实例化UserUseCase+
func NewUserUseCase(us UserRepo) *UserUseCase {
	return &UserUseCase{us: us}
}

/**
这个方法*可以看作是service层编写方法去调用dao层的过渡方法
通过id和用户名查找用户信息
*/

func (uc *UserUseCase) GetUserInfoByIdAndUsername(ctx context.Context, testRequest *v1.TestRequest) (us *User, err error) {
	res, err := uc.us.FindByIdAndUsername(ctx, testRequest)
	return res, err
}

```

然后去把 NewUserUseCase 在 internal/biz/biz.go 中注册

```golang internal/biz/biz.go
package biz

import "github.com/google/wire"

// ProviderSet is biz providers.
var ProviderSet = wire.NewSet(NewGreeterUsecase, NewUserUseCase)

```

<br/>

<br/>

##### data 实现方法

在 internal/data下面创建一个 user.go 文件，用来实现对数据增删查改操作的具体实现。

```golang internal/data/user.go
package data

import (
	"context"
	"fmt"
	v1 "helloworld/api/helloworld/v1"
	"helloworld/internal/biz"
)

type userRepo struct {
	data *Data
}

func NewUserRepo(data *Data) biz.UserRepo {
	return &userRepo{
		data: data,
	}
}

// 具体实现 FindByIdAndUsername 方法
func (us userRepo) FindByIdAndUsername(ctx context.Context, testRequest *v1.TestRequest) (res *biz.User, err error) {
	user := &biz.User{}
	us.data.db.Where("id = ? and username = ?", testRequest.Id, testRequest.Name).First(&user)
	fmt.Println("准备查找用户", user)
	return user, nil
}

```

将 NewUserRepo 在 internal/data/data.go 中注册：

```golang  internal/data/data.go
var ProviderSet = wire.NewSet(NewData, NewGreeterRepo, NewDB, NewUserRepo)
```

<br/>

<br/>

<br/>

##### 编写service逻辑

1. service 层的 Test 调用  biz 层的查找用户方法
2. biz 层的查找用户方法   调用  data 层的数据库操作方法
3. 原路返回查找结果并且处理

回到 internal/service/demo.go 文件编写

```golang internal/service/demo.go
package service

import (
	"context"
	"fmt"
	"helloworld/internal/biz"

	pb "helloworld/api/helloworld/v1"
)

type DemoService struct {
	pb.UnimplementedDemoServer
	uc *biz.UserUseCase
}

func NewDemoService() *DemoService {
	return &DemoService{}
}

func (s *DemoService) TestDemo(ctx context.Context, req *pb.DemoRequest) (*pb.DemoReply, error) {
	return &pb.DemoReply{}, nil
}
func (s *DemoService) Test(ctx context.Context, req *pb.TestRequest) (*pb.TestReply, error) {
	us, err := s.uc.GetUserInfoByIdAndUsername(ctx, req)
	fmt.Println("查询用户是：", us)
	fmt.Println("err：", us)
	msg := "success"
	// 查询失败
	if err != nil {
		msg = "用户不存在"
	}

	data := &pb.TestData{
		Id:   uint32(us.Id),
		Name: us.Username,
		Conn: us.Conn,
	}
	return &pb.TestReply{
		Code: 200,
		Msg:  msg,
		Data: data,
	}, nil
}

```

<br/>

<br/>

修改 internal/service/demo.go 代码

```golang internal/service/demo.go
func NewDemoService(uc *biz.UserUseCase) *DemoService {
	return &DemoService{uc: uc}
}
```

<br/>

<br/>

最后使用命令自动分析依赖，并生成注入代码

{% copy    go generate ./...   %}

或者在 cmd/helloworld/wire_gen.go 手动添加

```golang cmd/helloworld/wire_gen.go
func wireApp(confServer *conf.Server, confData *conf.Data, logger log.Logger) (*kratos.App, func(), error) {
	//...
    userRepo := data.NewUserRepo(dataData)
	userUseCase := biz.NewUserUseCase(userRepo)
	demoService := service.NewDemoService(userUseCase)
    //...
}

```

`kratos run` 运行项目后就可以通过 http://127.0.0.1:8000/test 访问

![截图](/images/kratos/fd7210e87df3042d3f349f6f146a0601.png)

![截图](/images/kratos/e639d57e024aa0a666bc23d4d9a0aeae.png)

<br>

<br>

<br>

<br>

### Ent 框架

ent 是一款 facebook 开源的go语言ORM框架，类似于 gorm 等用于实现数据库对象映射和操作的框架。ent 的不同之处在于他可以使用图模式来表达对象之间的关系，在需要进行复杂关系型查询时比较方便，此外 ent 提供了更加详细的数据类型，适合中大型项目。

#### 安装

{% copy   go install entgo.io/ent/cmd/ent@latest   %}





#### 创建实体 Schema

{% copy   ent new Users   %}



将会在 ent/schema 目录下生成一个 users.go 文件:



为 Users 添加 id、 name、conn 三个数据库字段:

```golang ent/schema/users.go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// Users holds the schema definition for the Users entity.
type Users struct {
    ent.Schema
}

// Fields of the Users.
func (Users) Fields() []ent.Field {
    return []ent.Field{
        field.Int("id").
            Positive(),
        field.String("name").
            Default("unknown"),
        field.String("conn").
            Default("unknown"),
    }
}

// Edges of the Users.
func (Users) Edges() []ent.Edge {
    return nil
}
```



##### tps: 在线工具将SQL转换成schema代码

可以访问 https://old.printlove.cn/tools/sql2ent 在线工具将SQL转换成schema代码（将创建表的SQL语句转换生成Schema代码）

![截图](/images/kratos/5aeb238115b29e8f55e2d0fba0b1fd6f.png)



*Navicat 打开数据库在 ”对象“ 标签页中 右侧点击 ”DDL“ 可以查看创建表的sql语句

![截图](/images/kratos/0aef481c6dcd59ce03363d60978ef43f.png)







从项目的 ent 目录运行go generate，如下所示:

{% copy   go generate ./ent   %}



运行后会在 ent 目录 生成以下文件：

![截图](/images/kratos/80df8cdecd1f7d827ad1ca3de3ce84bb.png)

> 这里是用了在线工具的自动生成

<br>

<br>

#### 数据库连接

在 internal/data/data.go 中，定义与数据库的连接

修改添加上面 GORM 案例中 internal/data/data.go 的代码

```golang  internal/data/data.go
package data

import (
    "helloworld/ent"
    "helloworld/internal/conf"

    "github.com/go-kratos/kratos/v2/log"
    "github.com/google/wire"

    "entgo.io/ent/dialect/sql" // Ent ORM库
    "gorm.io/driver/mysql"     // GORM的MySQL驱动
    "gorm.io/gorm"             // GORM ORM库
)

// ProviderSet is data providers.		依赖注入
var ProviderSet = wire.NewSet(NewData, NewGreeterRepo, NewDB, NewUserRepo, NewDB2)

// Data .		 Data 结构体封装数据访问层
type Data struct {
    // TODO wrapped database client
    // TODO: 可以在这里添加其他数据源如redis等
    db  *gorm.DB
    db2 *ent.Client
}

// NewData .
func NewData(c *conf.Data, logger log.Logger, db *gorm.DB, db2 *ent.Client) (*Data, func(), error) {
    cleanup := func() {
        log.NewHelper(logger).Info("closing the data resources")
    }
    return &Data{db2: db2}, cleanup, nil
}

// GORM数据库连接的构造函数
func NewDB(c *conf.Data) *gorm.DB {
    dsn := "root:2025_dy_2.25@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local"
    // 使用GORM打开MySQL连接
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    // 连接失败时
    if err != nil {
        panic("failed to connect database")
    }
    return db
}

// Ent数据库连接的构造函数
func NewDB2(conf *conf.Data) *ent.Client {
    drv, err := sql.Open(
        "mysql",
        "root:2025_dy_2.25@tcp(127.0.0.1:3306)/test?charset=utf8mb4&parseTime=True&loc=Local",
    )
    if err != nil {
        panic("failed to connect database")
    }
    // 创建 ent.Client 并设置驱动
    client := ent.NewClient(ent.Driver(drv))

    defer client.Close()  // defer用于延迟函数的执行，直到包含它的函数返回,通常用于资源释放、文件关闭、解锁等操作。
    return client
}
```

和上面一样 新建 data_test.php 用 `go test` 测试连接

<br>

<br>

#### 数据库操作

修改上面 GORM 案例中  internal/data/user.go 的 FindByIdAndUsername 方法代码

```golang internal/data/user.go
package data

import (
    "context"
    "fmt"
    v1 "helloworld/api/helloworld/v1"
    "helloworld/ent"
    "helloworld/ent/users"
    "helloworld/internal/biz"
)

type userRepo struct {
    data *Data
}

func NewUserRepo(data *Data) biz.UserRepo {
    return &userRepo{
        data: data,
    }
}

// 具体实现 FindByIdAndUsername 方法
func (us userRepo) FindByIdAndUsername(ctx context.Context, testRequest *v1.TestRequest) (res *ent.Users, err error) {
    //user := &biz.User{}
    //us.data.db.Where("id = ? and username = ?", testRequest.Id, testRequest.Name).First(&user)
    //all, err := us.data.db2.Users.Query().All(ctx)
    all, err := us.data.db2.Users.Query().Where(users.Username("bbbb"), users.ID(26)).First(ctx)
    if err != nil {
        return nil, err
    }
    fmt.Println("准备查找用户", all)
    return all, nil
}
```

> 注意将 biz  层的接口和方法的返回值 `us *User` 改为 `us *ent.Users` 

<br>

启动服务访问 `kratos run` :

```golang
package service

import (
    "context"
    "fmt"
    "helloworld/internal/biz"

    pb "helloworld/api/helloworld/v1"
)

type DemoService struct {
    pb.UnimplementedDemoServer
    uc *biz.UserUseCase
}

func NewDemoService(uc *biz.UserUseCase) *DemoService {
    return &DemoService{uc: uc}
}

func (s *DemoService) TestDemo(ctx context.Context, req *pb.DemoRequest) (*pb.DemoReply, error) {
    return &pb.DemoReply{}, nil
}
func (s *DemoService) Test(ctx context.Context, req *pb.TestRequest) (*pb.TestReply, error) {
    us, err := s.uc.GetUserInfoByIdAndUsername(ctx, req)
    fmt.Println("查询用户是：", us)
    msg := "success"
    // 查询失败
    if err != nil {
        msg = "用户不存在"
    }

    data := &pb.TestData{
        Id:   uint32(us.ID),
        Name: us.Username,
        Conn: us.Conn,
    }
    return &pb.TestReply{
        Code: 200,
        Msg:  msg,
        Data: data,
    }, nil
}
```

![截图](/images/kratos/c53a501582393600ce428197457ed339.png)

![截图](/images/kratos/fcf7a9911b1df20ca8247c35798cc5da.png)

<br>

<br>

##### tps: Ent 框架的 CRUD 接口

https://entgo.io/zh/docs/crud

**增 Create**

```
pedro := client.Pet.
    Create().
    SetName("pedro").
    SaveX(ctx)
```

**删 Delete**

```
err := client.User.
    DeleteOneID(id).
    Exec(ctx)
```

**改 Update**

```
pedro, err := client.Pet.
    UpdateOneID(id).
    SetName("pedro").
    SetOwnerID(owner).
    Save(ctx)
```

**查 Read**

```
names, err := client.Pet.
    Query().
    Select(pet.FieldName).
    Strings(ctx)
```

























<br>