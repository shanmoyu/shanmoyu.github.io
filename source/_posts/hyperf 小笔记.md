---
## 基本信息
title: Hyperf 小笔记
date: 2025/5/26 13:00:00
tags: [php,hyperf,VSCode,Docker,PhpStorm,Typora,mysql,小笔记]
categories: [php,hyperf]

banner: 
repo: hyperf/hyperf

comments: false  # 设置 false 禁止评论
---







## VSCode

### VSCode格式化快捷键

Shift + Alt + F

<br/>

### 强制折叠

```typescript
//#regiont
//........
//#endregion
```

<br/>

<br/>

## Hyperf

<br/>

### CORS跨域请求问题

中间件添加

```php
<?php

declare(strict_types=1);

namespace App\Middleware;


use Hyperf\Context\Context;
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
        // 跨域问题，只允许 http://localhost:5173 源通过
        $response = Context::get(ResponseInterface::class);
        $response = $response->withHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Headers', 'DNT,Keep-Alive,User-Agent,Cache-Control,Content-Type,Authorization');
        Context::set(ResponseInterface::class, $response);
        if ($request->getMethod() == 'OPTIONS') {
            return $response;
        }

        var_dump($this->request->all());
        return $handler->handle($request);
    }
}

```

原理了解：https://www.bilibili.com/video/BV1rp4y1K7nU/?spm_id_from=333.337.search-card.all.click&vd_source=a2d4c4a250ac1de22f16d959095bc5b9
掌握CORS跨域请求，看这个视频就够了【渡一教育】

Access-Control-Allow-Origin：允许哪些源可以访问
Access-Control-Allow-Method：允许哪些请求方式
Access-Control-Allow-Headers：允许哪些请求头的添加和更改
Access-Control-Max-Age：允许多少秒内不用再重复发送预检请求，客户端会缓存本次响应

<br/>

<br/>

### 导入项目安装所需的依赖

```sh
composer install
```

<br/>

<br/>

### hyperf 改时区

#### hyperf 改时区

```php
<?php
date_default_timezone_set('Asia/Shanghai');   // bin/hyperf.php
```

#### docker容器中hyperf改时区

Dockerfile 文件中修改配置

```sh
ARG timezone

ENV TIMEZONE=${timezone:-"UTC"} \
    APP_ENV=prod \
    SCAN_CACHEABLE=(true)
```

<br/>

<br/>

### 配置静态资源

安装 `composer require hyperf/filesystem`

如果您希望通过 http 访问上传到本地的文件，请在 config/autoload/server.php 配置中增加以下配置。

```php
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

在项目根目录下创建public文件夹：例如 /public/images/1.png，访问url http://127.0.0.1:9501/public/images/1.png
该目录能正常解析html和js

<br/>

<br/>

<br/>

### 生成文件命令

hyperf 生成配置文件

```sh
php bin/hyperf.php vendor:publish hyperf/session
```

用命令生成的配置信息默认用 .env 文件的配置

<br/>

生成中间件文件

```sh
php bin/hyperf.php gen:middleware Auth/FooMiddleware
```

<br/>

<br/>

### 记录

1、hyperf是常驻内存的，每次修改了之后需要停止服务然后重启才能生效

2、开发阶段，请不要设置 scan_cacheable 为 true

3、composer analyse 可以检测代码在哪里有错误

4、不能通过全局变量获取参数比如$_POST

5、如果代码不生效，可以使用composer dump-autoload -o 之后在启动

6、多个协程传递数据要用channel->push,channnl->pop

7、server.php 里面如果设置了daemonize=>1，则会按照守护进程进行运行

8、使用 `php bin/hyperf.php vendor:publish hyperf/<组件名>`，就可以在autoload里面直接==生成相应的配置文件==

9、使用 @Inject 注解时需 use Hyperf\Di\Annotation\Inject

10、可以使用make去实例化对象

11、@Inject 覆盖顺序为子类覆盖 Trait 覆盖 父类

12、`php bin/hyperf.php gen:middleware Auth/FooMiddleware` ==生成中间件文件==  

<br/>

<br/>

<br/>

<br/>

## PHP

### 内存限制问题

查看 php.ini 配置文件 或者 在命令行使用函数打印

```sh
php -r "var_dump(ini_get('memory_limit'));"
```

<br/>

本脚本修改为无内存限制

```php
<?php

ini_set('memory_limit', '-1');

```

<br/>

<br/>

<br/>

## Docker

<br/>

### 不能编辑文件问题

使用docker cp命令

1. 从容器中拷贝文件到宿主机：
   ```sh
   docker cp 容器ID或名称:/path/to/container/file /path/to/host/
   ```
2. 在宿主机上使用熟悉的编辑器进行编辑。
3. 将编辑后的文件拷贝回容器：
   ```sh
   docker cp /path/to/host/file 容器ID或名称:/path/to/container/
   ```

docker cp D:/docker/my.cnf mysql8.0:/etc

<br/>

<br/>

### 容器启动不了问题

Docker 先到后启动的容器会依次按2~254分配

<br/>

遇到容器启动不了而端口没有被占用可以尝试重启或者重启WinNAT服务

```sh
net stop winnat    ## 停止WinNAT服务
net start winnat   ## 重新启动WinNAT服务
```

<br/>

### 修改已启动容器的配置

如果已经映射了文件，删除容器 文件不会丢失，重新添加端口并映射文件然后运行容器就可以

<br/>

- 容器配置文件位置

docker 容器目录： 进入 \\\wsl$ 目录 ，直接搜索 containers 目录
`\\wsl.localhost\docker-desktop\tmp\docker-desktop-root\var\lib\docker\containers`

![截图](/images/hyperf小笔记/39f83d9b0f605357e70dd2763f55d74a.png)

<br/>

<br/>

#### 添加端口映射的方法

打开后修改其中的 config.v2.json 和 hostconfig.json，config.v2.json有两处需要添加，只添加一处，还是会恢复原样：  
位置1：

```json
"ExposedPorts": {
  "9501/tcp": {},
  "9500/tcp": {}
},
```

位置2:

```json
"Ports": {
  "9501/tcp": [
    {
    "HostIp": "0.0.0.0",
    "HostPort": "9501"
    }
  ],
  "9500/tcp": [
    {
    "HostIp": "0.0.0.0",
    "HostPort": "9500"
    }
  ]
},
```

<br/>

hostconfig.json：

```json
"PortBindings": {
  9501/tcp": [
    {
    "HostIp": "",
    "HostPort": "9501"
    }
  ],
  "9500/tcp": [
    {
    "HostIp": "",
    "HostPort": "9500"
    }
  ]
},
```

<br/>

<br/>

<br/>

<br/>

<br/>

#### 添加目录映射的方法

修改容器的“config.v2.json”配置文件
在“MountPoints”数组，增加映射：

```json
"MountPoints":{"/root/code":{"Source":"/run/desktop/mnt/host/d/code","Destination":"/root/code","RW":true,"Name":"","Driver":"","Type":"bind","Propagation":"rprivate","Spec":{"Type":"bind","Source":"/run/desktop/mnt/host/d/code","Target":"/root/code"},"SkipMountpointCreation":false}}
```

<br/>

修改容器的“hostconfig.json”配置文件
在“Binds”数组，增加映射：

```json
"Binds":["/run/desktop/mnt/host/d/code:/root/code"]
```

<br/>

<br/>

<br/>

## PhpStorm

### 全局搜索

PhpStorm 全局搜索：** Ctrl + Shift + F**

输入法冲突：如果按下快捷键没有反应，可能是因为输入法占用了该快捷键。特别是在 Windows 10 自带的中文输入法中，Ctrl + Shift + F 是简繁体转换的快捷键
切换输入法：尝试切换到英文输入法，然后再按 Ctrl + Shift + F


**双击Shift** 也能全局搜索

<br/>

<br/>

<br/>

## Typora

### Typora 不用注册机激活

https://blog.csdn.net/weixin_45320660/article/details/135482861

<br/>

<br/>

按照 Typora路径到 —> resources —> page-dist —> static —> js 这个路径找到一个或多个文件
LicenseIndex.180dd4c7.xxxxxxx.chunk.js

```sh
hasActivated="true"==e.hasActivated  ## 替换为  
hasActivated="true"=="true"
```

<br/>

<br/>

<br/>

## mysql

#### sql严格模式

<br/>

```sh
// sql语句报错：1055 - Expression。
// mysql5.7以上默认严格模式：ONLY_FULL_GROUP_BY：要求select语句中所查询出的列必须是在group by中进行声明，否则就会报错。
// 也就是值需要是来自于聚合函数（sum、avg、max等）的结果
// 1、SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));  本次会话有效
// 2、mysql配置文件中添加配置：lunix：mysql --help | grep cnf（查看文件位置），不再文件末尾添加sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
// 3、Windows 直接在mysql目录下创建my.ini，在[mysqld]部分下添加添加sql_mode=NO_ENGINE_SUBSTITUTION，其他配置信息网上找
```





<br><br>

![截图](/images/blbl.png)

<br>

