---
### 基本信息
title: Hyperf 其他组件
date: 2025/5/29 13:00:01
tags: [php, hyperf,JWT,Swagger]
categories: [php, hyperf]

banner: https://i0.hdslb.com/bfs/openplatform/bd94766e9017f28374eb60f130be6d423b889111.png
repo: hyperf/hyperf

comments: false  # 设置 false 禁止评论
---





## JWT

[hyperf-ext/jwt](https://github.com/hyperf-ext/jwt) JWT 组件，实现了完整用于 JWT 认证的能力

### 安装

安装前必须要安装 `composer require hyperf/cache` 缓存组件

hyperf3.0以下

{% copy composer require hyperf-ext/jwt %}

<br/>

hyperf3.0不兼容hyperf-ext/jwt

{% copy composer require hyperf-extension/jwt %}



### 配置

`php bin/hyperf.php vendor:publish hyperf-ext/jwt` 生成配置文件
`php bin/hyperf.php vendor:publish hyperf-extension/jwt`

<br/>

生成公钥私钥
`php bin/hyperf.php gen:jwt-keypair`

流程：

- 选择加密算法
Select algorithm:
  [0] RS256
  [1] RS384
  [2] RS512
  [3] ES256
  [4] ES384
  [5] ES512
\>0
- 是否选择随机字符串密码
Use random passphrase:
  [0] Yes
  [1] No
\>1
- 设置密码（可以为空） 
Set passphrase (can be empty):
\>jwt
- 是否覆盖配置
Are you sure you want to override the key pair? This will invalidate all existing tokens. (yes/no) [no]:
\>y

> 在第二个步骤可以选择使用随机字符串密码

<br/>

<br/>

### 使用

fromUser：通常使用用户的唯一标识符（主键）作为 JWT 的 subject (sub)。
fromSubject ：是一个更通用的方法，可以接受任何可转换为字符串的值作为subject。

#### 生成token

生成 token 的方法需要传入 JwtSubjectInterface 接口的对象，接口需要实现两个方法：
getJwtIdentifier() 是为 jwt 里面的 sub 参数赋值，要求唯一。
getJwtCustomClaims() 这个方法是给 payload 添加我们自己想要补充的数据，它最后会在 jwt 默认的参数数组合并，生成最终的 payload。

##### fromSubject

个人推荐 fromSubject()，因为返回的值比较直观

CustomerPayload

```php app/Cache/CustomerPayload.php
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

namespace App\Cache;

use HyperfExtension\Jwt\Contracts\JwtSubjectInterface;

class CustomerPayload implements JwtSubjectInterface
{
    // 定义一个主键
    protected string|int $primaryKey;

    // 定义返回体
    protected array $customerPayload;

    /**
     * @param string|int $primaryKey jwt主键sub(一般为用户id或者自行生成的uuid)
     * @param array $customerPayload 需要携带的数据
     */
    public function __construct(string|int $primaryKey, array $customerPayload)
    {
        $this->primaryKey = $primaryKey;
        $this->customerPayload = $customerPayload;
    }

    public function getJwtIdentifier()
    {
        return $this->primaryKey;
    }

    public function getJwtCustomClaims(): array
    {
        return $this->customerPayload;
    }

}

```

<br/>

LoginController

```php app/Controller/LoginController.php
<?php
declare(strict_types=1);
namespace App\Controller;

use App\Cache\CustomerPayload;
use App\Cache\UserPayload;
use App\Model\User;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Hyperf\Swagger\Annotation as SA;
use HyperfExtension\Jwt\Jwt;

#[SA\HyperfServer('http')]
class LoginController
{
    #[Inject]
    private Jwt $jwt;

    #[SA\Post(path: '/login', summary: '用户登录', tags: ['用户'])]
    public function login(RequestInterface $request,ResponseInterface $response): \Psr\Http\Message\ResponseInterface
    {
        // 判断用户
        $username = $request->input('username');
        $password = $request->input('password');
        $where = [
            'username' => $username,
            'password' => $password,
        ];
        $user = User::where($where)->first()->toArray();
        if (empty($user)) {
            return $response->json(['code'=>0]);
        }

        // 获取一个JwtSubjectInterface对象
        unset($user['password']);
        $payloadClass = new CustomerPayload($user['id'], ['data' => $user]);

        // 获取一个jwt对象
        $token = $this->jwt->fromSubject($payloadClass);
        var_dump($token);

        // 返回
        $data = ['token' => $token];
        return $response->json([
            'code' => 200,
            'msg' => 'success',
            'data' => $data
        ]);
    }

}
```

<br/>

![截图](/images/Hyperf其他组件/d7f84bf016319607b91e61816a9477d4.png)

<br/>

![截图](/images/Hyperf其他组件/d5a004bbcebee5fa65edbfb7f354f94d.png)

<br/>

<br/>

<br/>

##### fromUser

UserPayload

```php app/Cache/UserPayload.php
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

namespace App\Cache;

use HyperfExtension\Jwt\Contracts\JwtSubjectInterface;

class UserPayload implements JwtSubjectInterface
{
    public $user = [];

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function getJwtIdentifier()
    {
        return $this->user['id'];
    }

    public function getJwtCustomClaims(): array
    {
        return $this->user;
    }
}

```

<br/>

LoginController

```php app/Controller/LoginController.php
<?php
declare(strict_types=1);
namespace App\Controller;

use App\Cache\CustomerPayload;
use App\Cache\UserPayload;
use App\Model\User;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Hyperf\Swagger\Annotation as SA;
use HyperfExtension\Jwt\Jwt;

#[SA\HyperfServer('http')]
class LoginController
{
    #[Inject]
    private Jwt $jwt;

    #[SA\Post(path: '/login', summary: '用户登录', tags: ['用户'])]
    public function login(RequestInterface $request,ResponseInterface $response): \Psr\Http\Message\ResponseInterface
    {
        // 判断用户
        $username = $request->input('username');
        $password = $request->input('password');
        $where = [
            'username' => $username,
            'password' => $password,
        ];
        $user = User::where($where)->first()->toArray();
        if (empty($user)) {
            return $response->json(['code'=>0]);
        }

        // 获取一个JwtSubjectInterface对象
        unset($user['password']);
        $payloadClass2 = new UserPayload($user);

        // 获取一个jwt对象
        $token2 = $this->jwt->fromUser($payloadClass2);
        var_dump($token2);

        $data = "{'token': $token2}";
        return $response->json([
            'code' => 200,
            'msg' => 'success',
            'data' => $data
        ]);
    }

}
```

<br/>

![截图](/images/Hyperf其他组件/b49312fa5dc83ae242ddd1135741aa60.png)

<br/>

<br/>

<br/>

#### 解构token

##### 验证token时效性

```php
<?php

// 检查判断token时效性，如果有效则返回payload，无效则返回false
$check = $this->jwt->check(true);

```

<br/>

##### 解析token

token 需要在 Authorization 参数中，其值在 Bearer 之后拼接 Token，例如：
`Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjk1MDEvbG9naW4iLCJpYXQiOjE3NDU5MTczODMsImV4cCI6MTc0NTkyMDk4MywibmJmIjoxNzQ1OTE3MzgzLCJqdGkiOiJwaUo0Vmo0dEdWREs1dXdkIiwic3ViIjoiMjUiLCJwcnYiOiI3OGI5MGM2NTUxYmY4NzAyYjE2NWYxZWUxYzE2ZTU1OTRlYjY3MGQ2IiwiZGF0YSI6eyJpZCI6MjUsInVzZXJuYW1lIjoiYWFhYSIsImNyZWF0ZWRfYXQiOiIyMDI1LTA0LTI5IDA5OjAyOjU2IiwidXBkYXRlZF9hdCI6bnVsbH19.rXp3IwjLk6jzADbMDuGsSYUbnfdRj2x2K-y6wNz4jb3Nv2Nlz4B9KhhBc58UwnWOT85xwdyJY1EAv2XSg_JHdQ`

然后传入后端

从请求头中解析token：

![截图](/images/Hyperf其他组件/ae617098a036ab15fcb8e1e6095e02ae.png)

```php
<?php

// 获取token payload数据
$payload = $this->jwt->getPayload();
var_dump($payload->toArray());

```

<br/>

<br/>

<br/>

#### 各类方法

```php
<?php

// 从请求中获取token，如果有效则返回payload，无则返回null
$token = $this->jwt->getToken();

// 检查判断token时效性，如果有效则返回payload，无效则返回false
$check = $this->jwt->check(true);

// 刷新token，会删除旧的token 生成新的token
$new_token = $this->jwt->refresh(true);


// 从请求中解析token载荷信息
$payload = $this->jwt->getPayload();
// 将token加入黑名单（token失效）
$this->jwt->getBlacklist()->add($payload);

```

<br/>

<br/>

<br/>

<br/>

<br/>

## Swagger

hyperf/swagger 组件基于 zircote/swagger-php 进行封装



### 安装

{% copy  composer require hyperf/swagger  %}

<br/>



### 配置

{% copy  php bin/hyperf.php vendor:publish hyperf/swagger %}



|参数名|作用|
|:--:|:--:|
|enable|是否启用 Swagger 文档生成器|
|port|Swagger 文档生成器的端口号|
|json_dir|Swagger 文档生成器生成的 JSON 文件保存目录|
|html|Swagger 文档生成器生成的 HTML 文件保存路径|
|url|Swagger 文档的 URL 路径|
|auto_generate|是否自动生成 Swagger 文档|
|scan.paths|需要扫描的 API 接口文件所在的路径，一个数组|

如果 http://localhost:9500/swagger js文件资源请求超时，手动修改 `config/autoload/swagger.php` 配置，将 `unpkg.hyperf.wiki` 手动替换为 `unpkg.com` 或者 在前端公共资源CDN存储库中查找
https://cdn.staticfile.net/swagger-ui/5.11.0/swagger-ui.min.css
https://cdn.staticfile.net/swagger-ui/5.11.0/swagger-ui-bundle.min.js
https://cdn.staticfile.net/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js

七牛免费CDN前端公开库：https://www.staticfile.net/
字节跳动静态资源公共库：https://cdn.bytedance.com/


修改配置文件中的 `'html' => null`：

```php
<?php

declare(strict_types=1);

return [
    'enable' => true,
    'port' => 9500,
    'json_dir' => BASE_PATH . '/storage/swagger',
    'html' => <<<'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="SwaggerUI"
    />
    <title>SwaggerUI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
  </head>
  <body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: GetQueryString("search"),
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
      });
    };
    function GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
      var context = "";
      if (r != null)
        context = decodeURIComponent(r[2]);
      reg = null;
      r = null;
      return context == null || context == "" || context == "undefined" ? "/http.json" : context;
    }
  </script>
  </body>
</html>
HTML,
    'url' => '/swagger',
    'auto_generate' => true,
    'scan' => [
        'paths' => null,
    ],
];

```

<br/>

<br/>

#### 生成文档

可以不生成文档，直接使用 url 的方式导入到其他软件里

```sh
php bin/hyperf.php gen:swagger
```

<br/>

使用Apifox软件管理swagger接口

![截图](/images/Hyperf其他组件/bb159e09e8ac0e00e9362e5b65494f89.png)

![截图](/images/Hyperf其他组件/c896e12163bc1a6db10c07c7eaf9c1d5.png)

<br/>

<br/>

<br/>

<br/>

### 使用

<br/>

#### 方法一

 SA 命名空间都为 `use Hyperf\Swagger\Annotation as SA`

配置在控制器类或者方法上

`#[SA\HyperfServer('http')]`

```php
<?php
#[SA\HyperfServer('http')]
class LoginController
{

    #[SA\Get(path: '/param', description: '用来测试的接口', summary: 'GET 示例', tags: ['参数示例'])]
    #[SA\HeaderParameter(name: 'Authorization', description: '鉴权 token, 在 Header 添加参数 Authorization，其值为在 Bearer 之后拼接 Token', required: true, schema: new SA\Schema(type: 'string'),)]
    #[SA\PathParameter(name: 'id',description: '用户 ID',required: true, schema: new SA\Schema(type: 'string'))]
    #[SA\QueryParameter(name: 'username', description: '用户名字段描述', required: true, schema: new SA\Schema(type: 'string'))]
    #[SA\RequestBody(
        description: '请求参数',
        content: [
            new SA\MediaType(
                mediaType: 'application/x-www-form-urlencoded',
                schema: new SA\Schema(
                    required: ['username', 'age'],
                    properties: [
                        new SA\Property(property: 'username', description: '用户名字段描述', type: 'string'),
                        new SA\Property(property: 'age', description: '年龄字段描述', type: 'string'),
                        new SA\Property(property: 'city', description: '城市字段描述', type: 'string'),
                    ]
                ),
            ),
        ],
    )]
    #[SA\Response(
        response: 200,
        description: '200的描述',
        content: new SA\JsonContent(
            required: ['code','msg','data'],
            properties: [
                new SA\Property(property: 'code', title: '响应码', type: 'integer', default: '200', example: '200'),
                new SA\Property(property: 'msg', title: '返回的信息提示', type: 'string',example: '登录成功'),
                new SA\Property(property: 'data', title: '携带的数据', type: 'object', default: ["token"=>'aaa'], example: ["token"=>'bbb']),
            ],
            type: 'object'
        ),
    )]
    #[SA\Response(
        response: 400,
        description: '400的描述',
        content: new SA\JsonContent(
            required: ['code','msg'],
            properties: [
                new SA\Property(property: 'code', title: '响应码', type: 'integer', example: '400'),
                new SA\Property(property: 'msg', title: '返回的信息提示', type: 'string',example: '用户名或密码不正确'),
            ],
            type: 'object'
        )
    )]    
    #[SA\Response(
        response: 500,
        description: '500的描述',
        content: new SA\JsonContent(
            example: '{"code":500,"data":[]}'
        ),
    )]
    public function param(RequestMapping $request): array
    {

        return [];
    }

}
    
```

不使用配合验证器，可以删除 rules: 参数

<br/>

<br/>

** HTTP 参数类型**

**请求头参数 (head)**：请求头参数存放在HTTP请求的头部，通常包含请求的基本信息，如客户端所能接受的内容类型、语言等。服务器通过解析这些参数来理解和处理请求。例如，Accept-Language请求头可以指定客户端接受的语言偏好。

**路径参数 (path)**：路径参数直接附加在URL的路径部分，用于指定资源的位置。例如，在URL http://www.example.com/api/user/123 中，/api/user/123 是路径参数，指向服务器上特定的资源。

**查询参数 (query)**：查询参数附加在URL的末尾，以键值对的形式出现，如 ?key=value。多个查询参数之间用&符号分隔。查询参数通常用于GET请求，用于传递额外的信息给服务器。

**请求体参数 (body)**：请求体参数包含在HTTP请求的正文中，格式可以多样，如表单数据、JSON、XML等。服务器会根据请求头中的Content-Type来解析请求体中的数据。例如，Content-Type: application/json 表示请求体中的内容是JSON格式。

<br/>

#### 方法二

返回参数的第二种写法，推荐第二种的写法，这样可以显示数据结构和正确的json格式

参数信息可以 创建并写入Schema文件中

```sh
php bin/hyperf.php gen:swagger-schema -N UserSchema   ## 使用命令创建
```

代码添加：

```php
<?php
#[SA\Response(response: 200, content: new SA\JsonContent(ref: '#/components/schemas/UserSchema', type: 'object'))]
```

```php
<?php

declare(strict_types=1);

namespace App\Schema;

use Hyperf\Swagger\Annotation\Property;
use Hyperf\Swagger\Annotation\Schema;
use JsonSerializable;

#[Schema(title: 'UserSchema')]
class UserSchema implements JsonSerializable
{
    public function __construct(
        #[Property(property: 'code', title: '响应码',required: ['code'], type: 'integer',default: '200')]
        public string $code,
        #[Property(property: 'msg', title: '是否正确访问', type: 'string',default: 'success')]
        public int $msg,
        #[Property(property: 'data', title: '携带的数据', type: 'object',default: ["token"=>1])]
        public object $data
    )
    {
        
    }

    public function jsonSerialize(): mixed
    {
        return [
            'code' => $this->code,
            'msg' => $this->msg,
            'data' => $this->data
        ];
    }
}

```

<br/>

![截图](/images/Hyperf其他组件/aa441ae8240eadd579febf97358efd65.png)



<br>