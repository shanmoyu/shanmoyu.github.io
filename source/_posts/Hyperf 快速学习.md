---
## 基本信息
title: Hyperf 快速学习
date: 2025/5/26 13:00:01
tags: [php,hyperf,BabbitMQ]
categories: [php,hyperf]

banner: https://i0.hdslb.com/bfs/openplatform/bd94766e9017f28374eb60f130be6d423b889111.png
repo: hyperf/hyperf
---





## 安装

可以通过docker快速的运行开发Hyperf项目

{% box %}



{% tabs align:conent %}

<!-- tab 安装 -->

**启动容器**

 1. 拉取镜像，挂载宿主机目录到容器，开放端口 `9501`

    {% copy docker run --name hyperf -v D:/Docker/Hyperf:/data/project -w /data/project -p 9501:9501 -it --privileged -u root --entrypoint /bin/sh hyperf/hyperf:8.1-alpine-v3.18-swoole %}

**创建项目**

 2. 进入容器后创建项目

    {% copy composer create-project hyperf/hyperf-skeleton <项目名> %}

**启动项目**

 3. 进入项目文件夹并启动

    {% copy php bin/hyperf.php start %}



<!-- tab 提示 -->

`docker stop hyperf` 停止容器
`docker start hyperf` 启动容器

`docker exec -it hyperf /bin/bash` 进入容器
`cd Test`
`php bin/hyperf.php start` 启动服务

{% endtabs %}



{% endbox %}

接下来，就可以在宿主机 ` D:/Docker/Hyperf/<项目名>` 中看到安装好的代码了。 由于 Hyperf 是持久化的 CLI 框架，当修改完代码后，通过 `CTRL + C` 终止当前启动的进程实例，并重新执行 `php bin/hyperf.php start` 启动命令即可。

启动项目后通过 http://127.0.0.1:9501 去访问

![截图](/images/hyperf/e5b77e9eb2f5af655a60df3ce289648f.png)

<br>



<br/>

<br/>

### Hyperf目录结构

框架目录

```markdown
<!--框架目录-->

hyperf
|—app
|  |—Controller //控制器目录
|  |—Exception // 异常处理相关
|  |—Listener //事件监听
|  |—Middleware //中间件目录
|  |—Model // 相关数据库 model 模型目录
|
|—bin //启动目录
|  |—hyperf.php //启动文件
|
|—config //配置文件目录
|
|—public //公共目录
|
|—runtime //运行缓存目录
|  |—view //缓存目录
|
|—test //单元测试目录
|
|—vendor //composer 插件目录
|
|—view //视图模板目录
|
|—.env //环境变量文件
|
|—composer.json //composer 插件依赖文件

```

<br/>

配置文件目录结构

```markdown
<!--配置文件目录结构-->

config
├── autoload   // 此文件夹内的配置文件会被配置组件自己加载，并以文件夹内的文件名作为第一个键值
│   ├── amqp.php    // 用于管理 AMQP 组件
│   ├── annotations.php   // 用于管理注解
│   ├── aspects.php   // 用于管理 AOP 切面
│   ├── async_queue.php   // 用于管理基于 Redis 实现的简易队列服务
│   ├── cache.php   // 用于管理缓存组件
│   ├── commands.php   // 用于管理自定义命令
│   ├── crontab.php   // 定时任务
│   ├── consul.php   // 用于管理 Consul 客户端
│   ├── databases.php   // 用于管理数据库客户端
│   ├── dependencies.php   // 用于管理 DI 的依赖关系和类对应关系
│   ├── devtool.php   // 用于管理开发者工具
│   ├── exceptions.php   // 用于管理异常处理器
│   ├── file.php   // 文件系统管理文件
│   ├── listeners.php   // 用于管理事件监听者
│   ├── logger.php   // 用于管理日志
│   ├── middlewares.php   // 用于管理中间件
│   ├── opentracing.php   // 用于管理调用链追踪
│   ├── processes.php   // 用于管理自定义进程
│   ├── redis.php   // 用于管理 Redis 客户端
│   ├── server.php   // 用于管理 Server 服务
│   └── translation.php   // 多语言版本
├── config.php   // 用于管理用户或框架的配置，如配置相对独立亦可放于 autoload 文件夹内
├── container.php   // 负责容器的初始化，作为一个配置文件运行并最终返回一个 PsrContainerContainerInterface 对象
└── routes.php   // 用于管理路


```

<br/>

<br/>

## 路由

在Web开发中，路由是指根据用户请求的URL地址，将请求分发到相应的处理器。通过定义路由规则，可以实现不同URL地址对应不同的处理逻辑，实现灵活的页面跳转和数据处理。



### 普通路由

在 config/routes.php 文件内完成所有的路由定义，目录中可以进行一些参数定义，通过 `{}` 来声明参数，对参数添加正则表达式去匹配

```php config/routes.php
<?php

// 设置一个允许 GET 请求的路由，绑定访问地址 '/php/index' 到 App\Controller\TestController 的 index 方法
Router::addRoute(
    ['GET'],
    '/php/index',  
    'App\Controller\TestController@index');
    
// 设置一个允许 GET、POST 和 HEAD 请求的路由，绑定访问地址 '/php/test{str}' 到 App\Controller\TestController 的 info 方法
Router::addRoute(
    ['GET', 'POST', 'HEAD'],
    '/php/test{str:[a-z]+}',   // str的值必须匹配a~z的字母一次，例如testa、testb可以访问本页面而test不行
    'App\Controller\TestController@info');

```

**必填参数**
可以对 $uri 进行一些参数定义，通过 {} 来声明参数，如 `/user/{id}` 则声明了 id 值为一个必填参数。

**可选参数**
可以通过 [] 来声明中括号内的参数为一个可选参数，如 `/user/[{id}]`。

**校验参数**
可以使用正则表达式对参数进行校验

<br/>

在 app/Controller 中添加 TestController.php 控制器 ，添加 index、info函数

```php app/Controller/TestController.php
<?php
declare(strict_types=1);
namespace App\Controller;


use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;


class TestController
{
    // Request对象是客户端向服务器发送的HTTP请求。例如：获取请求的URL、查询参数、表单数据、请求头信息等
    // Response对象是服务器对客户端请求的响应。通过Response对象可以向客户端返回处理结果，包括HTML页面、JSON数据、文件下载等内容
    public function index(RequestInterface $request,ResponseInterface $response)
    {
        $data = 
        [
            "dir" => 'index',
            "code" => '200',
            "msg" => '访问成功'
        ];
        return $response->json($data);
    }


    public function info(RequestInterface $request,ResponseInterface $response)
    {
        $data = [
            "dir" => 'test',
            "code" => '200',
            "msg" => '访问成功'
        ];
        return $response->json($data);
    }


}
```

<br/>

index：

![截图](/images/hyperf/681e4a973a87d6c894802ee7bed32ae8.png)

<br/>

test：

![截图](/images/hyperf/e975d49bb7f88d3e4832b1a7c362b809.png)

![截图](/images/hyperf/8117204851f0f2f562e7b5b497cac9a7.png)

<br/>

<br/>

<br/>

<br/>

### 注释定义路由

`#[Controller]` 为满足更细致的路由定义需求而存在，使用 `#[Controller]` 注解用于表明当前类为一个 Controller 类，同时需配合 `#[RequestMapping]` 注解来对请求方法和请求路径进行更详细的定义。
在 Controller 目录下创建文件

```php app/Controller/NewController.php
<?php
declare(strict_types=1);
namespace App\Controller;


use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

#[Controller]
class NewController
{

    #[RequestMapping(path: "/login{id:[0-9]+}",methods: "get,post")]
    public function login(RequestInterface $request,ResponseInterface $response)
    {
        $data = 
        [
            "id" => $request->route("id"),
            "name" => $request->input("name","空"),
            "age" => $request->query("age"),
            "token" => $request->getHeader("token"),
        ];
        
        return $response->json([
            "code" => 200,
            "data" => $data,
            "msg" => "访问成功"
        ]);
    }
}

```

<br/>

访问 `http://127.0.0.1:9501/login5?name=aaa&age=3`：

![截图](/images/hyperf/893b2a6a7be37eb197a9efcada624739.png)

![截图](/images/hyperf/63d495b4951c87bcc613b74b3a670b9d.png)

<br/>

<br/>

<br/>

<br/>

### 控制器

通过控制器来处理 HTTP 请求，需要通过 配置文件 或 注解 的形式将路由与控制器方法进行绑定。
对于 请求(Request) 与 响应(Response)，Hyperf 提供了 Hyperf\HttpServer\Contract\RequestInterface 和 Hyperf\HttpServer\Contract\ResponseInterface 便于获取入参和返回数据。



#### 编写控制器

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

class IndexController
{
    // 在参数上通过定义 RequestInterface 和 ResponseInterface 来获取相关对象，对象会被依赖注入容器自动注入
    public function index(RequestInterface $request, ResponseInterface $response)
    {
        $target = $request->input('target', 'World');
        return 'Hello ' . $target;
    }
}

```

> 假设该 Controller 已经通过了配置文件的形式定义了路由为 /，当然也可以使用注解路由

控制器可以通过命令生成：

{% copy php bin/hyperf.php gen:controller NewController %}



<br/>

#### 请求

##### 各类方法

1. `$request->route("id")`
   作用: 从路由参数中获取数据。
   使用场景: 当你定义了一个带有参数的路由时，例如 /user/{id}，你可以通过 route 方法获取 id 参数的值。
   示例:
   
   ```php
   <?php 
   // 路由定义
   Router::get('/user/{id}', 'UserController@show');
   
   // 控制器中获取路由参数
   $id = $request->route('id');
   ```

<br/>

2. `$request->input("name", "空")`
   作用: 从请求的 body 中获取数据，通常用于获取 POST、PUT、PATCH 等请求中的表单数据或 JSON 数据。
   默认值: 如果请求中没有 name 字段，则返回默认值 "空"。
   使用场景: 当你需要获取通过表单提交的数据或 JSON 请求体中的数据时。
   示例:
   
   ```php
   <?php
   // 请求体中的 JSON 数据
   {
       "name": "John",
       "age": 30
   }
   
   // 控制器中获取请求体数据
   $name = $request->input('name', '空'); // 如果 name 不存在，返回 "空"
   ```

<br/>

3. `$request->query("age")`
   作用: 从 URL 的查询字符串中获取数据。
   使用场景: 当你需要获取 URL 中的查询参数时，例如 /user?age=25。
   示例:
   
   ```php
   <?php
   // URL: /user?age=25
   
   // 控制器中获取查询参数
   $age = $request->query('age'); // 返回 25
   ```
   
   <br/>
4. `$request->getHeader()`
   
   获取 HTTP 请求头（Headers）中的数据。
5. `$request->cookie()`
获取 HTTP 请求中的 Cookie 数据。

```php
<?php
// 获取 Authorization 请求头
$authorization = $request->getHeader('Authorization');

// 获取名为 "token" 的 Cookie
$token = $request->cookie('token', 'default-token');

// 获取所有请求头
$headers = $request->getHeaders();

// 获取所有 Cookie
$cookies = $request->getCookieParams();
```

<br/>

##### 获得请求对象

https://hyperf.wiki/3.1/#/zh-cn/request?id=请求路径-amp-方法

<br/>

##### 输入预处理 & 规范化

https://hyperf.wiki/3.1/#/zh-cn/request?id=获取输入

<br/>

##### Cookies

https://hyperf.wiki/3.1/#/zh-cn/request?id=cookies

<br/>

##### 文件上传 & 检查/验证

https://hyperf.wiki/3.1/#/zh-cn/request?id=文件

<br/>

<br/>

<br/>

#### 响应

在 Hyperf 里可通过 Hyperf\HttpServer\Contract\ResponseInterface 接口类来注入 Response 代理对象对响应进行处理，默认返回 Hyperf\HttpServer\Response 对象，该对象可直接调用所有 Psr\Http\Message\ResponseInterface 的方法。



##### 返回 Json 格式

Hyperf\HttpServer\Contract\ResponseInterface 提供了 `json($data)` 方法用于快速返回 Json 格式，并设置 Content-Type 为 application/json，$data 接受一个数组或为一个实现了 Hyperf\Contract\Arrayable 接口的对象。

```php
<?php
namespace App\Controller;

use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Http\Message\ResponseInterface as Psr7ResponseInterface;

class IndexController
{
    public function json(ResponseInterface $response): Psr7ResponseInterface
    {
        $data = [
            'key' => 'value'
        ];
        return $response->json($data);
    }
}

```

<br/>

<br/>

##### 返回 Xml 格式

https://hyperf.wiki/3.1/#/zh-cn/response?id=返回-xml-格式

<br/>

##### 返回 Raw 格式

https://hyperf.wiki/3.1/#/zh-cn/response?id=返回-raw-格式

<br/>

##### 重定向

https://hyperf.wiki/3.1/#/zh-cn/response?id=重定向

<br/>

##### Cookie 设置

https://hyperf.wiki/3.1/#/zh-cn/response?id=cookie-设置

<br/>

##### 分块传输编码 Chunk

<br/>

##### 文件下载

<br/>

<br/>

<br/>

<br/>

## 中间件



### 定义全局中间件

中间件主要用于从 请求(Request) 到 响应(Response) 中间流程的验证或者检测（例：验证登录）

<br/>

#### 创建中间件文件

在 app/Middleware 下创建 AuthMiddleware.php 中间件文件

```php app/Middleware/AuthMiddleware.php
<?php

declare(strict_types=1);

namespace App\Middleware;


use Hyperf\HttpServer\Contract\RequestInterface;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthMiddleware implements MiddlewareInterface
{
    private $request;
    private $response;
    public function __construct(protected ContainerInterface $container,RequestInterface $request,\Hyperf\HttpServer\Contract\ResponseInterface $response)
    {
        $this->request = $request;
        $this->response = $response;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // 请求头中如果不带token参数将要返回的数据
        if (!$this->request->getHeader("token")) 
        {
            $data = [
                "code" => 301,
                "msg" => "需要重新授权"
            ];
            return $this->response->json($data);
        }

        return $handler->handle($request);
    }
}


```

可用命令生成中间件文件: 

{% copy php bin/hyperf.php gen:Middleware AuthMiddleware %}



<br/>

<br/>

#### 配置文件中定义中间件的使用

全局中间件只可通过配置文件的方式来配置，配置文件位于 config/autoload/middlewares.php ，配置如下：

```php config/autoload/middlewares.php
<?php

return [
    'http' => [
        \App\Middleware\AuthMiddleware::class,
        // YourMiddlewareB::class => 3,   // 改变全局中间件的优先级
    ],
];

```

<br/>

<br/>

#### 效果浏览

请求头中不带token：

![截图](/images/hyperf/d8de3ef45dad03b5e4830b40701a0fae.png)

<br/>

请求头中带token：

![截图](/images/hyperf/c88da109725f75219a9c66b93ea92ca0.png)

<br/>

<br/>

<br/>

<br/>

<br/>

### 定义局部中间件

当我们有些中间件仅仅面向某些请求或控制器时，即可将其定义为局部中间件，可通过配置文件的方式定义或注解的方式。

<br/>

#### 通过配置文件定义

https://hyperf.wiki/3.1/#/zh-cn/middleware/middleware?id=通过配置文件定义

<br/>

<br/>

<br/>

#### 通过注解定义

在通过注解定义路由时，您仅可通过注解的方式来定义中间件，对中间件的定义有两个注解，分别为：

- `#[Middleware]` 注解为定义单个中间件时使用，在一个地方仅可定义一个该注解，不可重复定义
- `#[Middlewares]` 注解为定义多个中间件时使用，在一个地方仅可定义一个该注解，然后通过在该注解内定义多个 #[Middleware] 注解实现多个中间件的定义

中间件文件

```php app/Middleware/TokenMiddleware.php
<?php

declare(strict_types=1);

namespace App\Middleware;

use Hyperf\HttpServer\Contract\RequestInterface;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class TokenMiddleware implements MiddlewareInterface
{
    private $request;
    private $response;
    public function __construct(protected ContainerInterface $container,RequestInterface $request,\Hyperf\HttpServer\Contract\ResponseInterface $response)
    {
        $this->request = $request;
        $this->response = $response;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $data = [
            "code" => 301,
            "token" => $this->request->getHeader("token"),
        ];
        return $this->response->json($data);
        return $handler->handle($request);
    }
}

```

<br/>

控制器文件

```php app/Controller/NewController.php
<?php
declare(strict_types=1);
namespace App\Controller;


use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\Middleware;
use Hyperf\HttpServer\Annotation\RequestMapping;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

#[Controller]
#[Middleware(\app\middleware\TokenMiddleware::class)]
class NewController
{


    #[RequestMapping(path: "/login{id:[0-9]+}",methods: "get,post")]
    public function login(RequestInterface $request,ResponseInterface $response)
    {
        $data = [
            "id" => $request->route("id"),
            "name" => $request->input("name","空"),
            "age" => $request->query("age"),
            "token" => $request->getHeader("token"),
        ];
        return $response->json([
            "code" => 200,
            "data" => $data,
            "msg" => "访问成功"
        ]);
    }
}

```

<br/>

<br/>

访问

![截图](/images/hyperf/a576f5ec4a7195c7ec940b66efa656bd.png)

<br/>

<br/>

<br/>

<br/>

## 异常处理

在 Hyperf 里，业务代码都运行在 Worker 进程 上，也就意味着一旦任意一个请求的业务存在没有捕获处理的异常的话，都会导致对应的 Worker 进程 被中断退出，这对服务而言也是不能接受的，捕获异常并输出合理的报错内容给客户端也是更加友好的。
我们可以通过对各个 server 定义不同的 异常处理器(ExceptionHandler)，一旦业务流程存在没有捕获的异常，都会被传递到已注册的 异常处理器(ExceptionHandler) 去处理。

<br/>

### 通过配置文件注册异常处理器

<br/>

#### 定义异常类

- 在复杂的业务逻辑中，可能会遇到多种不同类型的异常（如参数校验失败、资源未找到、权限不足等）。

- 通过定义自定义异常类，可以明确区分这些异常类型，便于在代码中针对性地处理。

这里只是继承了ServerException类

```php app/Exception/ErrException.php
<?php

namespace App\Exception;

use Hyperf\Server\Exception\ServerException;

class ErrException extends  ServerException
{

}

```

<br/>

<br/>

<br/>

#### 创建异常处理器

在 app/Exception/Handler 下创建 ErrExceptionHandler.php 

```php app/Exception/Handler/ErrExceptionHandler.php
<?php

namespace App\Exception\Handler;

use App\Exception\ErrException;
use Psr\Http\Message\ResponseInterface;

// ErrExceptionHandler 继承自 Hyperf\ExceptionHandler\ExceptionHandler，表示这是一个自定义的异常处理器。
class ErrExceptionHandler extends \Hyperf\ExceptionHandler\ExceptionHandler
{


// 作用: 处理捕获到的异常。
// 逻辑:
// 判断异常是否是 ErrException 的实例。
// 如果是，构造一个包含错误码（code）和错误信息（msg）的数组 $data。
// 将 $data 转换为 JSON 格式，并通过 SwooleStream 设置为响应体。
// 返回一个 HTTP 响应，状态码为 200，内容类型为 application/json;charset=utf-8。
    public function handle(\Throwable $throwable,ResponseInterface $response)
    {
        if($throwable instanceof ErrException)
        {
            $data = [
                "code"=>$throwable->getCode(),
                "msg"=>$throwable->getMessage(),
            ];
            return $response->withStatus(200)->withAddedHeader('Content-Type','application/json;charset=utf-8')->write(json_encode($data));
        }
    }


// 作用: 判断当前异常处理器是否适用于捕获到的异常。
// 逻辑:
// 返回 true，表示该处理器适用于所有异常。
// 如果希望仅处理特定异常，可以在此方法中添加判断逻辑。
    public function isValid(\Throwable $throwable): bool
    {
        return true;
    }
}

```

这段代码的主要作用是：

1. **捕获 `ErrException` 异常**：
   - 当应用程序中抛出 ErrException 异常时，该处理器会捕获并处理它。
2. **返回自定义的 JSON 响应**：
   - 响应体中包含异常的错误码（code）和错误信息（msg）。
   - 响应状态码为 200，内容类型为 application/json;charset=utf-8。
3. **统一错误处理**：
   - 通过自定义异常处理器，可以将 ErrException 的处理逻辑集中到一个地方，避免在代码中重复处理

<br/>

<br/>

#### 配置文件注册异常处理器

在 config/autoload/exceptions.php 下添加

```php config/autoload/exceptions.php
<?php

return [
    'handler' => [
        'http' => [
            App\Exception\Handler\ErrExceptionHandler::class,
        ],
    ],
];

```

<br/>

<br/>

#### 控制器中添加触发异常

```php app/Controller/IndexController.php
<?php

declare(strict_types=1);
/**
 * This file is part of Hyperf.
 *
 * @link     https://www.hyperf.io
 * @document https://hyperf.wiki
 * @contact  group@hyperf.io
 * @license  https://github.com/hyperf/hyperf/blob/master/LICENSE
 */

namespace App\Controller;

use App\Exception\ErrException;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\View\RenderInterface;


class IndexController extends AbstractController
{
    public function index(RequestInterface $request)
    {
        // id参数校验
        if (!$request->query("id"))
        {
            throw new ErrException("url没带参数id",300);
        }
        $user = $this->request->input('user', 'Hyperf');
        $method = $this->request->getMethod();

        return [
            'method' => $method,
            'message' => "Hello {$user}.",
        ];
    }


}

```

<br/>

为带id参数访问：

![截图](/images/hyperf/1a7a0868761278ab54ce5ec00b44b126.png)

<br/>

带id参数访问：

![截图](/images/hyperf/da740fb6bb732d702e7ec2f70d6e7918.png)

<br/>

<br/>

<br/>

### 通过注解注册异常处理器

https://hyperf.wiki/3.1/#/zh-cn/exception-handler?id=通过注解注册异常处理器

<br/>

<br/>

<br/>

<br/>

#### 异常处理与中间件



##### 1\. **`throw new ErrException()` 的作用**

- **作用**: 在业务逻辑中主动抛出异常，用于中断当前操作并通知调用者发生了错误。
- **使用场景**:
  - 参数校验失败。
  - 资源未找到。
  - 权限不足。
  - 业务规则校验失败。
  - 外部服务调用失败。
  - 数据状态异常。
  - 系统内部错误。
- **特点**:
  - 与具体的业务逻辑紧密相关。
  - 通常用于处理 **业务层面的异常**。
  - 异常会被全局异常处理器捕获，并返回统一的错误响应。

- - *

##### 2\. **中间件的作用**

- **作用**: 在请求进入控制器之前或响应返回客户端之前，对请求和响应进行预处理或后处理。
- **使用场景**:
  - 身份验证（如 JWT 校验）。
  - 权限校验。
  - 请求日志记录。
  - 跨域处理（CORS）。
  - 请求频率限制（限流）。
  - 数据格式化（如统一响应格式）。
- **特点**:
  - 与具体的业务逻辑无关，通常用于处理 **跨切面（Cross-Cutting）** 的通用逻辑。
  - 可以在请求的生命周期中拦截请求或修改响应。
  - 通过中间件链（Middleware Pipeline）依次执行。

##### 3\. 区别总结

- **作用范围**：异常处理是全局的，用于捕获和处理整个应用程序中的异常；中间件则是在请求生命周期中执行，可以针对特定的路由或全局应用。
- **执行时机**：异常处理在异常发生时触发；中间件在请求到达控制器之前或响应返回客户端之前执行。
- **用途**：异常处理主要用于处理错误和异常情况；中间件主要用于请求处理、身份验证、日志记录等。

<br/>

<br/>

<br/>

## 事件机制

用通俗易懂的例子来说明就是，假设我们存在一个 UserService::register() 方法用于注册一个账号，在账号注册成功后我们可以通过事件调度器触发 UserRegistered 事件，由监听器监听该事件的发生，在触发时进行某些操作，比如发送用户注册成功短信，在业务发展的同时我们可能会希望在用户注册成功之后做更多的事情，比如发送用户注册成功的邮件等等，此时我们就可以通过再增加一个监听器监听 UserRegistered 事件即可，无需在 UserService::register() 方法内部增加与之无关的代码。

<br/>

<br/>

<br/>

### 通过配置文件注册监听器



#### 引入组件

{% copy composer require hyperf/event %}



<br/>



#### 定义事件类

个事件其实就是一个用于管理状态数据的普通类，触发时将应用数据传递到事件里，然后监听器对事件类进行操作，一个事件可被多个监听器监听。

在 App\Event 创建一个事件类

```php app/Event/UserRegistered.php
<?php
namespace App\Event;

class UserRegistered
{
    // 建议这里定义成 public 属性，以便监听器对该属性的直接使用，或者你提供该属性的 Getter
    public $user;
    
    public function __construct($user)
    {
        $this->user = $user;    
    }
}

```

<br/>

<br/>

<br/>

#### 定义监听器

命令创建监听器

{% copy php bin/hyperf.php gen:listener UserRegisteredListener %}



在 App\Listener 目录下生成：

```php app/Listener/UserRegisteredListener.php
<?php

declare(strict_types=1);

namespace App\Listener;

use App\Event\UserRegistered;
use Psr\Container\ContainerInterface;
use Hyperf\Event\Contract\ListenerInterface;

class UserRegisteredListener implements ListenerInterface
{
    public function __construct(protected ContainerInterface $container)
    {
    }

    public function listen(): array
    {
        // 返回一个该监听器要监听的事件数组，可以同时监听多个事件
        return [
            UserRegistered::class,
        ];
    }

    public function process(object $event): void
    {
        // 事件触发后该监听器要执行的代码写在这里，比如该示例下的发送用户注册成功短信等
        // 直接访问 $event 的 user 属性获得事件触发时传递的参数值
        // $event->user;
        var_dump($event->user);
        var_dump("执行监听器");
    }
}

```

<br/>

<br/>

#### 配置文件注册监听器

在 config/autoload/listeners.php 配置文件 

```php config/autoload/listeners.php
<?php
return [
    \App\Listener\UserRegisteredListener::class,
];

```

<br/>

<br/>

#### 触发事件

事件需要通过 事件调度器(EventDispatcher) 调度才能让 监听器(Listener) 监听到，我们通过一段代码来演示如何触发事件：

```php app/Controller/EventController.php
<?php
declare(strict_types=1);
namespace App\Controller;

use App\Event\UserRegistered;
use App\Model\User;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\EventDispatcher\EventDispatcherInterface;


#[Controller]
class EventController
{
    #[Inject]
    private EventDispatcherInterface $eventDispatcher;

    #[RequestMapping(path: "/event",methods: "get,post")]
    public function event(RequestInterface $request,ResponseInterface $response)
    {
        // 插入模型
        $db = new User();
        $db -> name = "abc";
        $db -> save();
        // 触发插入模型事件
        $this->eventDispatcher->dispatch(new UserRegistered($db));

        return $response->json(['code' => 200]);
    }
}

```

<br/>

访问 http://127.0.0.1:9501/event

![截图](/images/hyperf/19548505feb93956fade305b611dd499.png)

![截图](/images/hyperf/75e2debcc5a7fcaaec0c6a0df529c386.png)

<br/>

<br/>

<br/>

### 通过配置文件注册监听器

Hyperf 还提供了一种更加简便的监听器注册方式，就是通过 #[Listener] 注解注册，只要将该注解定义在监听器类上，且监听器类处于 Hyperf 注解扫描域 内即可自动完成注册，代码示例如下：

```php app/Listener/UserRegisteredListener.php
<?php
namespace App\Listener;

use App\Event\UserRegistered;
use Hyperf\Event\Annotation\Listener;
use Hyperf\Event\Contract\ListenerInterface;
use Hyperf\Event\Annotation\Listener;

#[Listener]
class UserRegisteredListener implements ListenerInterface
{
  ......
}

```

<br/>

<br/>

<br/>

<br/>

<br/>

## AOP切片 X

在 Hyperf 中，AOP（Aspect-Oriented Programming，面向切面编程）是一种编程范式，AOP 是 OOP 的延续，用于将横切关注点（如日志记录、事务管理、权限校验等）从业务逻辑中分离出来，从而提高代码的模块化和可维护性。Hyperf 基于 PHP 的 DI 容器和注解机制，提供了强大的 AOP 支持。

用通俗的话来讲，就是在 Hyperf 里可以通过 切面(Aspect) 介入到任意类的任意方法的执行流程中去，从而改变或加强原方法的功能，这就是 AOP。
**例如：**日志记录：在方法执行前后记录日志，而不需要修改业务逻辑代码；事务管理：在方法执行前后开启或提交事务；权限校验：在方法执行前检查用户权限；性能监控：在方法执行前后记录执行时间，用于性能分析。缓存处理：在方法执行前检查缓存，执行后更新缓存。

<br/>

<br/>

### 定义切面(Aspect)

每个 切面(Aspect) 必须实现 Hyperf\Di\Aop\AroundInterface 接口，并提供 public 的 $classes 和 $annotations 属性，为了方便使用，我们可以通过继承 Hyperf\Di\Aop\AbstractAspect 来简化定义过程，我们通过代码来描述一下。

创建 App\Aspect 目录

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 日志 *

已经默认安装了

### 安装

{% copy composer require hyperf/logger %}



<br/>

### 配置

在项目内默认提供了一些日志配置，默认情况下，日志的配置文件为 config/autoload/logger.php ，示例如下：

```php config/autoload/logger.php
<?php

return [
    'default' => [
        'handler' => [
            'class' => \Monolog\Handler\StreamHandler::class,
            'constructor' => [
                // 'stream' => BASE_PATH . '/runtime/logs/hyperf.log',
                'stream' => BASE_PATH . '/runtime/logs/hyperf'.Date('Y-m-d').'.log',
                // 'stream' => 'php://output',
                'level' => \Monolog\Level::Debug,
                // 'level' => Monolog\Logger::WARNING, // 将 INFO 改为 WARNING 或更高 可以不再自动捕获sql info基本的日志
                // 更改为WARNING，就只能写入WARNING级别的：$log->warning($data)
            ],
        ],
        'formatter' => [
            'class' => \Monolog\Formatter\LineFormatter::class,
            'constructor' => [
                'format' => null,
                'dateFormat' => null,
                'allowInlineLineBreaks' => true,
            ]
        ],
    ],
];

```

<br/>

<br/>

### 使用

App\Service 下创建LogService类

```php app/Service/LogService.php
<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Hyperf\Logger\LoggerFactory;

class LogService
{

    protected LoggerInterface $logger;

    public function __construct(LoggerFactory $loggerFactory)
    {
        // 第一个参数对应日志的 name, 第二个参数对应 config/autoload/logger.php 内的 key
        $this->logger = $loggerFactory->get('log', 'default');
    }

    public function rw_log(string $msg)
    {
        // Do something.
        $this->logger->info($msg);
    }
}

```

<br/>

控制器中添加

```php app/Controller/LogController.php
<?php
declare(strict_types=1);
namespace App\Controller;

use App\Service\LogService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;
use Hyperf\HttpServer\Contract\ResponseInterface;

#[Controller]
class LogController
{
    #[Inject]
    private LogService $logService;
    
    #[RequestMapping(path: "/log",methods: "get,post")]
    public function log(ResponseInterface $response)
    {
        $this->logService->rw_log("日志写入");
        return $response->json(['code'=>200]);
    }

}
```

<br/>



访问 http://127.0.0.1:9501/log 后，在 runtime/logs/hyperf.log 查看

![截图](/images/hyperf/4504b558cadd3ffc6c23ff38a1cad612.png)

<br/>

<br/>

#### 关于 monolog 的基础知识

https://hyperf.wiki/3.1/#/zh-cn/logger?id=关于-monolog-的基础知识

<br/>

<br/>

### 修改默认配置的使用方式

控制器中添加

```php app/Controller/LogController.php
<?php
declare(strict_types=1);
namespace App\Controller;

use App\Service\LogService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;
use Hyperf\HttpServer\Contract\ResponseInterface;

#[Controller]
class LogController
{
    #[Inject]
    protected LoggerInterface $logger;
    
    public function __construct(LoggerFactory $loggerFactory)
    {
        $this->logger = $loggerFactory->get('pull_bf_cms', 'pull_bf_cms');
    }


    #[RequestMapping(path: "/log",methods: "get,post")]
    public function log(ResponseInterface $response)
    {
        $this->logger->info("日志写入");
        return $response->json(['code'=>200]);
    }

}

```

<br/>

<br/>

<br/>

<br/>

<br/>

## Session 会话管理



### 安装

{% copy composer require hyperf/session %}



<br/>

### 配置

Session 组件的配置储存于 config/autoload/session.php 文件中，如文件不存在，可以通过 `php bin/hyperf.php vendor:publish hyperf/session` 命令来将 Session 组件的配置文件发布到 Skeleton 去。

<br/>

### 配置 Session 中间件

在使用 Session 之前，需要将 Hyperf\Session\Middleware\SessionMiddleware 中间件配置为 HTTP Server 的全局中间件，这样组件才能介入到请求流程进行对应的处理，config/autoload/middlewares.php 配置文件示例如下：

```php config/autoload/middlewares.php
<?php

return [
    // 这里的 http 对应默认的 server name，如您需要在其它 server 上使用 Session，需要对应的配置全局中间件
    'http' => [
        \Hyperf\Session\Middleware\SessionMiddleware::class,
    ],
];

```

<br/>

<br/>

<br/>

<br/>

### 使用文件储存驱动

> 文件储存驱动是默认的储存驱动，但建议生产环境下使用 Redis 驱动

当 `handler` 的值为 Hyperf\Session\Handler\FileHandler 时则表明使用 **文件** 储存驱动，所有的 Session 数据文件都会被生成并储存在 options.path 配置值对应的文件夹中，默认配置的文件夹为根目录下的 runtime/session 文件夹内。

<br/>

获得 Session 对象可通过注入 Hyperf\Contract\SessionInterface，即可调用接口定义的方法来实现使用：

```php app/Controller/sesssionController.php
<?php

namespace App\Controller;

use Hyperf\Context\ApplicationContext;
use Hyperf\Contract\SessionInterface;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;

#[Controller]
class sesssionController
{
    #[Inject]
    protected SessionInterface $session;

    #[RequestMapping(path: "/session", methods: "get,post")]
    public function session()
    {
        $this->session->set("aaa",123);   // 储存数据

        $this->session->get("aaa");   // 获取数据

    }

}

```

<br/>

各个方法: 

```php
<?php

$data = $this->session->all();   // 获取所有数据

if ($this->session->has('foo')) {
  // 判断 Session 中是否存在某个值
}
        
$data = $this->session->remove('foo');   // 获取并删除一条数据
        
$this->session->forget('foo');
$this->session->forget(['foo', 'bar']);   // 删除一条或多条数据
        
$this->session->clear();   // 清空当前 Session 数据
        
$sessionId = $this->session->getId();   // 获取当前的 Session ID


```

<br/>

<br/>

### 使用 Redis 驱动

在使用 Redis 储存驱动之前，您需要安装 hyperf/redis 组件。当 `handler` 的值为 Hyperf\Session\Handler\RedisHandler 时则表明使用 **Redis** 储存驱动。您可以通过配置 options.connection 配置值来调整驱动要使用的 Redis 连接，这里的连接与 hyperf/redis 组件的 config/autoload/redis.php 配置内的 key 命名匹配，

```php config/autoload/session.php
<?php

declare(strict_types=1);
/**
 * This file is part of Hyperf.
 *
 * @link     https://www.hyperf.io
 * @document https://hyperf.wiki
 * @contact  group@hyperf.io
 * @license  https://github.com/hyperf/hyperf/blob/master/LICENSE
 */
use Hyperf\Session\Handler;

return [
    'handler' => Handler\RedisHandler::class,
    'options' => [
        'connection' => 'default',
        'path' => BASE_PATH . '/runtime/session',
        'gc_maxlifetime' => 1200,
        'session_name' => 'HYPERF_SESSION_ID',
        'domain' => null,
        'cookie_lifetime' => 5 * 60 * 60,
        'cookie_same_site' => 'lax',
    ],
];

```

<br/>

![截图](/images/hyperf/9ac791dd13db70ba1ead21d5ec634bef.png)

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 缓存

{% copy composer require hyperf/cache %}



配置文件在 config/autoload/cache.php 中，缓存驱动，默认为 Redis

```php config/autoload/cache.php
<?php

return [
    'default' => [
        'driver' => Hyperf\Cache\Driver\RedisDriver::class,
        'packer' => Hyperf\Codec\Packer\PhpSerializerPacker::class,
        'prefix' => 'c:',
        'skip_cache_results' => [],
    ],
];

```

<br/>

### 使用

<br/>

#### 注解方式使用

<br/>

##### Cacheable

```php app/Service/UserService.php
<?php

declare(strict_types=1);

namespace App\Service;

use App\Models\User;
use Hyperf\Cache\Annotation\Cacheable;

class UserService
{
    #[Cacheable(prefix: "user", ttl: 7200, listener: "USER_CACHE")]
    public function user(int $id): array
    {
        $user = User::query()->find($id);

        return [
            'user' => $user->toArray(),
            'uuid' => $this->unique(),
        ];
    }
}

```

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 文件系统



### 安装

{% copy composer require hyperf/filesystem  %}



<br/>

### 配置文件

{% copy php bin/hyperf.php vendor:publish hyperf/filesystem %}



<br/>

配置文件在 config/autoload/file.php ，

```php config/autoload/file.php
<?php
return [
    'default' => 'local',
    'storage' => [
        'local' => [
            'driver' => LocalAdapterFactory::class,
            'root' => __DIR__ . '/../../public',
        ],
        ... 
    ],
];
        
```

<br/>

<br/>

### 使用

```php app/Controller/IndexController.php
<?php

declare(strict_types=1);

namespace App\Controller;

class IndexController extends AbstractController
{
    public function example(\League\Flysystem\Filesystem $filesystem)
    {
        // Process Upload
        $file = $this->request->file('upload');
        $stream = fopen($file->getRealPath(), 'r+');
        $filesystem->writeStream(
            'uploads/'.$file->getClientFilename(),
            $stream
        );
    }
}

```

<br/>

- **`$file = $request->file('upload');`**
  - 这行代码从请求对象 $request 中获取名为 upload 的文件上传字段。$request->file('upload') 返回一个 Hyperf\HttpMessage\Upload\UploadedFile 对象，该对象包含了上传文件的相关信息。
- **`$stream = fopen($file->getRealPath(), 'r+');`**
  - 这行代码打开上传文件的临时存储路径，并返回一个文件资源流。$file->getRealPath() 获取上传文件的临时路径，fopen 函数以读写模式 ('r+') 打开该文件，并返回一个文件指针资源。
- **`$filesystem->writeStream('images/'.$file->getClientFilename(), $stream);`**
  - 这行代码将上传的文件流写入到文件系统中。$filesystem 是一个文件系统对象，通常是通过 Hyperf 的文件系统组件（如 League\Flysystem）来操作文件。writeStream 方法将文件流写入到指定的路径。'images/'.$file->getClientFilename() 是目标文件的路径，其中 $file->getClientFilename() 获取上传文件的原始文件名。
- **`fclose($stream);`**
  - 这行代码关闭之前打开的文件流，释放系统资源。fclose 函数用于关闭文件指针资源。

<br/>

获取所有普通字段和文件字段可以用：

```php
<?php

$allData = $request->all();
$files = $request->getUploadedFiles();

```

<br/>

<br/>

<br/>

### 添加静态资源访问

如果您希望通过 http 访问上传到本地的文件，请在 `config/autoload/server.php` 配置中增加以下配置。

```php config/autoload/server.php
<?php

return [
    'settings' => [
        ...
        // 将 public 替换为上传目录
        'document_root' => BASE_PATH . '/public',
        'enable_static_handler' => true,
    ],
];

```

<br/>

访问 http://127.0.0.1:9501/images/EPyb5g1p4WwB738bd3bdbacdd70bdece14115f177318.jpg 

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 命令行

Hyperf框架允许使用 hyperf/command 组件创建和管理命令行接口。通过自定义命令类，使用注解定义命令，以及配置文件设置，可以轻松创建和执行命令。

输入 `php bin/hyperf.php`  会出现hyperf的命令提示，使用 hyperf/command 组件可以添加自定义命令运行自定义脚本。

<br/>

### 安装

通常来说该组件会默认存在，但如果您希望用于非 Hyperf 项目，也可通过下面的命令依赖 hyperf/command 组件：

{% copy composer require hyperf/command  %}

<br/>

<br/>

### 生成命令

通过 gen:command 命令来生成一个自定义命令：

{% copy php bin/hyperf.php gen:command TestCommand  %}



运行后会在 app/Command 下生成 TestCommand 类文件

```php app/Command/TestCommand.php
<?php

declare(strict_types=1);

namespace App\Command;

use Hyperf\Command\Command as HyperfCommand;
use Hyperf\Command\Annotation\Command;
use Psr\Container\ContainerInterface;

#[Command]
class TestCommand extends HyperfCommand
{
    public function __construct(protected ContainerInterface $container)
    {
        parent::__construct('demo:command');
    }

    public function configure()
    {
        parent::configure();
        $this->setDescription('Hyperf Demo Command');
    }

    public function handle()
    {
        $this->line('Hello Hyperf!', 'info');
    }
}

```

<br/>

<br/>

如果需要移动命令类的位置，需要在 config/autoload/annotations.php 文件中修改 `scan` 配置项，添加新的扫描路径：

```php config/autoload/annotations.php
<?php

return [
    'scan' => [
        'paths' => [
            BASE_PATH . '/app',
            BASE_PATH . '/app/Command/tmdb',    // 添加新的扫描路径
        ],
        'ignore_annotations' => [
            'mixin',
        ],
    ],
];

```

<br/>

<br/>

### 使用

![截图](/images/hyperf/9120ec9284e75f796f1e246aa8ed1fa0.png)

<br/>

输入 `php bin/hyperf.php` 查看

![截图](/images/hyperf/02d56df6c7349f08c1ad970249b12cb6.png)

<br/>

<br/>

输入 `php bin/hyperf.php test:print` 或者  `php bin/hyperf.php test:print <要打印的字符>` 执行脚本

![截图](/images/hyperf/80666d18af685bd46f630a3a89d81dec.png)

<br/>

输入 `php bin/hyperf.php test:print --help` 查看命令详细信息

![截图](/images/hyperf/e00733fba73cdf00572fa4c12d059458.png)

<br/>

<br/>

<br/>

<br/>

#### 设置参数



- 可选类型

```php
<?php

$this->addArgument('name', InputArgument::OPTIONAL, '姓名', 'Hyperf');

```

<br/>

<br/>

- 数组类型

```php
<?php

$this->addArgument('name', InputArgument::IS_ARRAY, '姓名');

```

演示

```sh
$ php bin/hyperf.php demo:command Hyperf Swoole
## 输出
...
array(2) {
  [0]=>
  string(6) "Hyperf"
  [1]=>
  string(6) "Swoole"
}
```

<br/>

<br/>

<br/>

<br/>

## 定时任务

通常来说，执行定时任务会通过 Linux 的 crontab 命令来实现，但现实情况下，并不是所有开发人员都能够拥有生产环境的服务器去设置定时任务的，这里 hyperf/crontab 组件为您提供了一个 秒级 定时任务功能，只需通过简单的定义即可完成一个定时任务的定义。
也就是说不会创建Linux的定时任务，而是

### 安装

安装组件

{% copy composer require hyperf/crontab %}

<br/>

### 配置

发布配置文件

{% copy php bin/hyperf.php vendor:publish hyperf/crontab %}

<br/>

添加配置

```php config/autoload/crontab.php
<?php

declare(strict_types=1);

use Hyperf\Crontab\Schedule;

return [
    'enable' => true,
    'crontab' => [
      // Callback类型定时任务（默认）
        (new Crontab())->setName('Foo')->setRule('* * * * *')->setCallback([App\Task\FooTask::class, 'execute'])->setMemo('这是一个示例的定时任务'),
        Schedule::command('test2')->setName('测试定时任务')->setRule('* * * * *')->setMemo('我是备注：测试定时任务')
    ],
];

```

<br/>

启用任务调度器进程
在使用定时任务组件之前，需要先在 config/autoload/processes.php 内注册一下 Hyperf\Crontab\Process\CrontabDispatcherProcess 自定义进程

```php config/autoload/processes.php
<?php

declare(strict_types=1);

return [
    // 分发定时任务
    \Hyperf\Crontab\Process\CrontabDispatcherProcess::class,
];

```

<br/>

<br/>

<br/>

<br/>

### tips

```php
<?php
Schedule::command('test2')->setName('测试定时任务1')->setRule('* * * * *')->setMemo('我是备注：测试定时任务'),
Schedule::command('null')->setName('测试定时任务2')->setRule('* * * * *')->setMemo('我是备注：测试定时任务'),
Schedule::command('null')->setName('测试定时任务2')->setRule('* * * * *')->setMemo('我是备注：测试定时任务'),
Schedule::command('null')->setName('测试定时任务3')->setRule('* * * * *')->setMemo('我是备注：测试定时任务'),
```

string(22) "----------------------"
[INFO] Crontab task [测试定时任务2] executed successfully at 2025-04-30 09:37:00.
[INFO] Crontab task [测试定时任务1] executed successfully at 2025-04-30 09:37:00.
[INFO] Crontab task [测试定时任务3] executed successfully at 2025-04-30 09:37:00.

对参数相同的定时任务不会重复执行。

<br/>

<br/>

<br/>

<br/>

<br/>

## 验证器 x



### 安装

引入组件包

{% copy composer require hyperf/validation  %}



<br/>

<br/>

### 配置

<br/>

#### 添加中间件

您需要为使用到验证器组件的 Server 在 `config/autoload/middlewares.php` 配置文件加上一个全局中间件 `Hyperf\Validation\Middleware\ValidationMiddleware` 的配置，如下为 `http` Server 加上对应的全局中间件的示例：

```php
<?php
return [
    'http' => [
        \Hyperf\Validation\Middleware\ValidationMiddleware::class
    ],
];
```

> 如没有正确设置全局中间件，可能会导致 `表单请求(FormRequest)` 的使用方式无效。

<br/>

<br/>

#### 添加异常处理器

```php
<?php
return [
    'handler' => [
        // 这里对应您当前的 Server 名称
        'http' => [
            \Hyperf\Validation\ValidationExceptionHandler::class,
        ],
    ],
];

```

<br/>

<br/>

<br/>

<br/>

### 发布验证器文件

由于存在多语言的功能，故该组件依赖 hyperf/translation 组件，如您未曾添加过 Translation 组件的配置文件，请先执行下面的命令来发布 Translation 组件的配置文件，如您已经发布过或手动添加过，只需发布验证器组件的语言文件即可：

<br/>

发布 Translation 组件的文件：

```sh
php bin/hyperf.php vendor:publish hyperf/translation
```

<br/>

发布验证器组件的文件：

```sh
php bin/hyperf.php vendor:publish hyperf/validation
```

<br/>

<br/>

<br/>

<br/>

### 使用

<br/>

#### 表单请求验证

对于复杂的验证场景，您可以创建一个 表单请求(FormRequest)，表单请求是包含验证逻辑的一个自定义请求类，您可以通过执行下面的命令创建一个名为 FooRequest 的表单验证类：

```sh
php bin/hyperf.php gen:request FooRequest
```

表单验证类会生成于 app\Request 目录下，如果该目录不存在，运行命令时会自动创建目录。

```php
<?php

declare(strict_types=1);

namespace App\Request;

use Hyperf\Validation\Request\FormRequest;

class TestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [

        ];
    }
}

```

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 消息队列 AMQP 组件

hyperf/amqp 是实现 AMQP 标准的组件，主要适用于对 RabbitMQ 的使用。



### 安装

{% copy composer require hyperf/amqp  %}

<br/>



### 配置

可以通过生成相应的配置文件（用命令生成的配置信息默认用 .env 文件的配置），文件在 config/autoload/amqp.php 

{% copy php bin/hyperf.php vendor:publish hyperf/amqp  %}



在 .env 文件中配置信息

```yaml
AMQP_HOST=host.docker.internal
AMQP_PORT=5672
AMQP_USER=rabbit
AMQP_PASSWORD=2025@rabbit
AMQP_VHOST=
```

<br/>

<br/>

<br/>

### BabbitMQ 添加队列



- 添加交换机

![截图](/images/hyperf/b4c3437e5ee1975f3dc563da102c173a.png)

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

- 添加队列

![截图](/images/hyperf/401153e18aa1db75d8a2fd76e1b4ea46.png)

<br/>

<br/>

- 通过 Routing Key ”路由关系（路由键）“ 将交换机与队列进行关联

交换机

![截图](/images/hyperf/ab5e4aa1a183995bc9f1ecd90b727a08.png)

<br/>

队列

![截图](/images/hyperf/2f29dc3f6622ccaf5444e29fd80c1a13.png)

<br/>

<br/>

绑定完成后在交换机中查看

![截图](/images/hyperf/82b8a4ea71815b06c3a92a8bc72dc152.png)

<br/>

<br/>

<br/>

<br/>

<br/>

### 投递消息

使用 gen:producer 命令创建一个 producer。文件在 app/Amqp/Producer/DemoProducer.php

{% copy php bin/hyperf.php gen:amqp-producer DemoProducer  %}

<br/>

在 DemoProducer 文件中，我们可以修改 `#[Producer]` 注解对应的字段来替换对应的 exchange 和 routingKey。 其中 `payload` 就是最终投递到消息队列中的数据

```php app/Amqp/Producer/DemoProducer.php
<?php

declare(strict_types=1);

namespace App\Amqp\Producer;

use Hyperf\Amqp\Annotation\Producer;
use Hyperf\Amqp\Message\ProducerMessage;

#[Producer(exchange: 'hyperf', routingKey: 'hyperf')]
class DemoProducer extends ProducerMessage
{
    public function __construct($data)
    {
        $this->payload = $data;
    }
}

```

![截图](/images/hyperf/58d590c0d72777903800fe31329e61f4.png)

<br/>

<br/>

<br/>

通过 DI Container 获取 `Hyperf\Amqp\Producer` 实例，即可投递消息。

```php
<?php
use Hyperf\Amqp\Producer;
use App\Amqp\Producers\DemoProducer;
use Hyperf\Context\ApplicationContext;

$data = ['a'=>111];
$message = new DemoProducer($data);
$producer = ApplicationContext::getContainer()->get(Producer::class);
$result = $producer->produce($message);

```

<br/>

![截图](/images/hyperf/deab36c6aabe3718af639a2755b20d8d.png)

<br/>

rabbitmq 中查看

![截图](/images/hyperf/1d45d2fc4727186ab8aa436ca5ea4d3c.png)

<br/>

队列中查看数据

![截图](/images/hyperf/5b70893bc32b83296cb44141ef06d6dd.png)

<br/>

<br/>

<br/>

<br/>

### 消费消息

使用 gen:amqp-consumer 命令创建一个 consumer。文件在 app/Amqp/Consumer/DemoConsumer.php 

{% copy php bin/hyperf.php gen:amqp-consumer DemoConsumer  %}



在 DemoConsumer 文件中，我们可以修改 `#[Consumer]` 注解对应的字段来替换对应的 exchange、routingKey 和 queue。 其中 `$data` 就是解析后的消息数据。 示例如下。

> 使用 `#[Consumer]` 注解时需 use Hyperf\Amqp\Annotation\Consumer; 命名空间；

```php app/Amqp/Consumers/DemoConsumer.php
<?php

declare(strict_types=1);

namespace App\Amqp\Consumers;

use Hyperf\Amqp\Annotation\Consumer;
use Hyperf\Amqp\Message\ConsumerMessage;
use Hyperf\Amqp\Result;
use PhpAmqpLib\Message\AMQPMessage;

#[Consumer(exchange: "hyperf", routingKey: "hyperf", queue: "hyperf", nums: 1)]
class DemoConsumer extends ConsumerMessage
{
    public function consumeMessage($data, AMQPMessage $message): Result
    {
        print_r($data);
        return Result::ACK;
    }
}

```

![截图](/images/hyperf/36812a515ad5888fdbea2d4c3d2fdbf1.png)

 `#[Consumer(exchange: 'hyperf666', routingKey: 'test66', queue: 'mq666', name: "DemoConsumer", nums: 1)]`，这段代码，如果相应的交换机、路由键、队列名称，将会自动创建。

投递消息的 `#[Producer(exchange: 'hyperf666', routingKey: 'test666')]` 同样也会自动创建。
也就是说不用在 RabbitMQ 中手动创建交换机和队列。😅

<br/>

<br/>

#### 各类消费结果使用场景

**1\. Result::ACK (确认消息)**

**场景**：

- 消息已成功处理，可以从队列中安全删除
- 业务逻辑执行成功，不需要重新处理该消息

**特点**：

- 消息会被从队列中移除
- 这是最常用的确认方式

```typescript
return Result::ACK;
```

**2\. Result::NACK (否定确认)**

**场景**：

- 消息处理失败，且不希望立即重新入队
- 可能由于临时性错误导致处理失败
- 配合死信队列使用

**特点**：

- 消息会被丢弃或进入死信队列
- 不会立即重新投递

```typescript
return Result::NACK;
```

**3\. Result::REQUEUE (重新入队)**

**场景**：

- 消息处理失败，但希望立即重新投递
- 适用于可重试的临时性错误（如网络波动、依赖服务暂时不可用）
- 业务逻辑中有重试机制

**特点**：

- 消息会重新放回队列头部或尾部
- 可能导致消息循环，应设置最大重试次数

```typescript
return Result::REQUEUE;
```

**4\. Result::DROP (静默丢弃)**

**场景**：

- 消息格式错误或内容无效，无法处理
- 业务上明确不需要处理该消息
- 防止无效消息反复投递

**特点**：

- 消息会被静默丢弃，不记录错误
- 不同于NACK的是，不会进入死信队列

```typescript
return Result::DROP;
```

<br>









