---
# 基本信息
title: Hyperf
date: 2025/5/26 13:00:00
tags: [php,hyperf]
categories: [php,hyperf]

banner: https://i0.hdslb.com/bfs/openplatform/bd94766e9017f28374eb60f130be6d423b889111.png
repo: hyperf/hyperf
---





> perf本机项目目录：D:/Docker/Hyperf
> 数据库名：test
> 表名：test01

表的数据结构：

![](https://i0.hdslb.com/bfs/openplatform/dfc36ee48af69e85a0ed87173c7c665db4ede5a7.png)







## 安装

可以通过docker快速的运行开发Hyperf项目

- 启动容器

```sh hyperf/hyperf-skeleton <项目名>
docker run --name hyperf -v D:/Docker/Hyperf:/data/project -w /data/project -p 9501:9501 -it --privileged -u root --entrypoint /bin/sh hyperf/hyperf:8.1-alpine-v3.18-swoole
## 不同版本可以在docker镜像库中查看
```

- 创建项目

```sh
composer create-project hyperf/hyperf-skeleton <项目名>
```

- 启动项目

```sh
cd <项目名>
php bin/hyperf.php start
```

接下来，就可以在宿主机 `D:/Docker/Hyperf/<项目名>` 中看到好的代码。 由于 Hyperf 是持久化的 CLI 框架，修改代码后，通过 `CTRL + C` 终止当前启动的进程实例，并重新执行 `php bin/hyperf.php start` 启动命令即可（或者重启docker容器）。

`docker stop hyperf`   停止容器
`docker start hyperf`   启动容器

`docker exec -it hyperf /bin/bash`  进入容器
`cd Test`
`php bin/hyperf.php start`   启动服务

<br/>

<br/>

<br/>

## 数据库操作



### 安装插件

```sh
composer require hyperf/db-connection
```

启动容器时安装了就不用再装

修改.env配置文件

```yaml
APP_NAME=skeleton
APP_ENV=dev

DB_DRIVER=mysql
DB_HOST=host.docker.internal    ## host.docker.internal 解释成主机（宿主机）
DB_PORT=3306
DB_DATABASE=test
DB_USERNAME=root
DB_PASSWORD=2025_2.
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
DB_PREFIX=   ## 需要除去表名的前缀

REDIS_HOST=host.docker.internal
REDIS_AUTH=2025_2.
REDIS_PORT=6379
REDIS_DB=0

```

<br/>

#### 多库连接

如果需要连接多个数据库，新增库需添加新配置：

```yaml
## 如果需要连接多个数据库
## /*新增库需添加新配置*/

DB_DRIVER_TWO=mysql
DB_HOST_TWO=host.docker.internal
DB_PORT_TWO=3306
DB_DATABASE_TWO=wechat_program
DB_USERNAME_TWO=root
DB_PASSWORD_TWO=2025_2.
DB_CHARSET_TWO=utf8mb4
DB_COLLATION_TWO=utf8mb4_unicode_ci
DB_PREFIX_TWO=

```

在 config/autoload/database.php 中添加配置

```php
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
use function Hyperf\Support\env;

return [
    'default' => [...........],
    'db2' => [
        'driver' => env('DB_DRIVER_TWO', 'mysql'),
        'host' => env('DB_HOST_TWO', 'localhost'),
        'database' => env('DB_DATABASE_TWO', 'hyperf'),
        'port' => env('DB_PORT_TWO', 3306),
        'username' => env('DB_USERNAME_TWO', 'root'),
        'password' => env('DB_PASSWORD_TWO', ''),
        'charset' => env('DB_CHARSET_TWO', 'utf8'),
        'collation' => env('DB_COLLATION_TWO', 'utf8_unicode_ci'),
        'prefix' => env('DB_PREFIX_TWO', ''),
        'pool' => [
            'min_connections' => 1,
            'max_connections' => 10,
            'connect_timeout' => 10.0,
            'wait_timeout' => 3.0,
            'heartbeat' => -1,
            'max_idle_time' => (float) env('DB_MAX_IDLE_TIME', 60),
        ],
        'commands' => [
            'gen:model' => [
                'path' => 'app/Model/db2',
                'force_casts' => true,
                'inheritance' => 'Model',
            ],
        ],
    ],

]

```

<br/>

<br/>

<br/>

### 创建模型

创建模型

```powershell
## 生成所有模型，--with-comments 添加注释
php bin/hyperf.php gen:model --with-comments

## 创建指定模型 
php bin/hyperf.php gen:model <table_name> --with-comments

## --pool 指定数据库 
php bin/hyperf.php gen:model <table_name> --pool db2
```

<br/>

<br/>

<br/>

### 时间戳

默认情况下，Hyperf 预期你的数据表中存在 `created_at` 和 `updated_at` 。如果你不想让 Hyperf 自动管理这两个列， 可以将模型中的 `$timestamps` 属性设置为 false：
created_at 和 updated_at 为 创建时间和更新时间

```php
<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\DbConnection\Model\Model;

class Test01 extends Model
{
    public bool $timestamps = false;
}

```

<br/>

<br/>

### 操作

#### 插入模型

插入：
要往数据库新增一条记录，先创建新模型实例，给实例设置属性，然后调用 save 方法：

```php
<?php
use App\Model\Test01;

$test01 = new Test01();
$test01->conn = 'Hyperf';
$test01->save();   

```

{% note color:cyan    created_at&nbsp;和&nbsp;updated_at&nbsp;时间戳将会自动设置，不需要手动赋值。 %}

<br/>

批量插入：

```php
<?php
use App\Model\Test01;

Test01::insert([
  ['conn' => 'hyperf 1'],
  ['conn' => 'hyperf 2'],
  ['conn' => 'hyperf 3']
]);

```

<br/>

<br/>

<br/>

#### 更新模型

更新：

```php
<?php
use App\Model\Test01;

// find 默认参数为id字段
$test01 = Test01::query()->find(3);
$test01->conn = 'Hi Hyperf 3';
$test01->save();

```

批量/条件查询 更新:

```php
<?php
use App\Model\Test01;

User::query()->where('conn', 'Hyperf')->update(['conn' => 'Hi Hyperf 3']);

```

<br/>

<br/>

<br/>

#### 查询模型

查询：

```php
<?php 
use App\Model\Test01;

$test01 = Test01::query()->where('id',4)->first()->toArray();   ## 查询一条

```

<br/>

批量查询：

```php
<?php
use App\Model\Test01;

$test01 = Test01::query()->where('conn','Hyperf')->get()->toArray();

```

**当查询不到数据时， first() 会返回null无法转空数组，get() 可以转空数组**，也就是 first()->toArray(); 会报错

<br/>

<br/>

#### 分块查询以及注意事项*

查询数据时如果数据太大，可以使用 `chunk` 方法对数据进行分块处理

查询指定字段时尽量使用 `select('id')` 方法，避免使用 `get('id')`、`pluck('id')`, select 会直接返回id字段的数据，get和pluck 会先查询全部数据再获取单列值的集合，两个占用的内存不一样，使用的 `chunk` 方法也不一样。

```php
<?php

## TmdbMovieCast 表，查询 tmdb_credit_id 字段返回的结果不重复，并分10000条一块一块执行
TmdbMovieCast::select('tmdb_credit_id')->distinct()->chunk(10000,function ($list){
    foreach ($list as $cast) {
        $data = [
            'id' => $cast['tmdb_credit_id'],
        ];
    }
    $producer = $this->container->get(Producer::class);
    $tmdbCredit = new TmdbCreditProducer($data);
    $result = $producer->produce($tmdbCredit);
});
        
```

`TmdbMovieCast::select('tmdb_credit_id')->get();` 即便不用toArray()，也可以使用foreach取出数据：

```php
<?php
$MovieList = Movie::select('name')->get();
foreach ($MovieList as $movie) {
    //  两种都能取出数据
    var_dump($movie->name);
    var_dump($movie['name']);
}
```

<br/>

<br/>

<br/>

#### 删除模型

```php
<?php
use App\Model\Test01;

$test01 = Test01::query()->find(10);
$test01->delete();

// $test01 = Test01::query()->where('id',9)->delete();
// return $test01;  // delete() 返回0或1

```

<br/>

<br/>

#### DB 原生查询

`DB::select`
该方法将一个SQL查询字符串作为参数，返回一个包含查询结果的数组。以下是一个使用DB::select方法查询用户表的示例：

```php
<?php

## 预编译语句
$users = DB::select('SELECT name, email FROM users WHERE active = ?', [1]);

```

<br/>

`DB::raw()`
不将表达式作为字符串处理，而将其视为原生SQL语句。以下是一个使用DB::raw函数的例子：

```php
<?php

$email = "test@example.com'; DELETE FROM users; -- ";
$users = DB::select(DB::raw("SELECT name, email FROM users WHERE email = '$email'"));

```

<br/>

`......`

```php
<?php

// 插入
 $data = DB::insert("insert into test01(conn) values ('DBtest')");
 
// 更新
$data = DB::update("update test01 set conn=? where id=?",["DBU",19]);

// 删除
$data = DB::delete("delete from test01 where id=?",[19]);

// 查询
$data = Db::table('test01')->where(["id"=>18])->orWhere(["id"=>17])->get();
$data = Db::table('test01')->where(["id"=>1,"conn"=>"aa"])->get()->toArray();   ## where传关联数组
$data = Db::table('test01')->where(["id"=>1])->where(["conn"=>"aa"])->get()->toArray();  ## 多个where方法
$data = Db::table('test01')->where([])->get()->toArray();  ## 条件空

```

<br/>

<br/>

<br/>

<br/>

### 事务回滚



#### 自动管理数据库事务

你可以使用 `Db` 的 `transaction` 方法在数据库事务中运行一组操作。如果事务的闭包 `Closure` 中出现一个异常，事务将会回滚。如果事务闭包 `Closure` 执行成功，事务将自动提交。一旦你使用了 `transaction` ， 就不再需要担心手动回滚或提交的问题：

```php
<?php
use Hyperf\DbConnection\Db;

Db::transaction(function () {
    Db::table('user')->update(['votes' => 1]);

    Db::table('posts')->delete();
});

```

<br/>

#### 手动管理数据库事务

如果你想要手动开始一个事务，并且对回滚和提交能够完全控制，那么你可以使用 `Db` 的 `beginTransaction`, `commit`, `rollBack`:

```php
<?php
use Hyperf\DbConnection\Db;

Db::beginTransaction();
try{

    // Do something...

    Db::commit();
} catch(\Throwable $ex){
    Db::rollBack();
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

<br/>

<br/>

## 路由

在Web开发中，路由是指根据用户请求的URL地址，将请求分发到相应的处理器。通过定义路由规则，可以实现不同URL地址对应不同的处理逻辑，实现灵活的页面跳转和数据处理。

### 注释定义路由

`#[Controller]` 为满足更细致的路由定义需求而存在，使用 `#[Controller]` 注解用于表明当前类为一个 Controller 类，同时需配合 `#[RequestMapping]` 注解来对请求方法和请求路径进行更详细的定义。
在 Controller 目录下创建文件

```php
<?php
declare(strict_types=1);

namespace App\Controller;

use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;

#[Controller]
class NewController
{
    #[RequestMapping(path: "/php/info", methods: "get,post")]
    public function info(RequestInterface $request)
    {
        // 从请求中获得 id 参数，存在则返回，不存在则返回默认值 1
        $id = $request->input('id', 1);
        return [
            'id' => $id,
            'all' => $request->all()
        ];
    }


    #[RequestMapping(path: "/php/index", methods: "get")]
    public function index(RequestInterface $request)
    {
        // 存在则返回，不存在则返回默认值 null
        $id = $request->route('id');
        // 存在则返回，不存在则返回默认值 0
        $id = $request->route('id', 0);
        return [
            'id' => $id,
            'all' => $request->all()
        ];
    }

}

```

<br/>

<br/>

<br/>

### 普通路由

在 config/routes.php 文件内完成所有的路由定义

```php
<?php

// 我的测试代码：
Router::addRoute(
    ['GET'],
    '/php/test{id:\d+}',   //（{id:\d+} id的值必须匹配0~9的数字一次）
    'App\Controller\TwoController@info');
Router::addRoute(
    ['GET', 'POST', 'HEAD'],
    '/php/test{str:[a-z]+}',   // {str:[a-z]+} str的值必须匹配a~z的字母一次
    'App\Controller\TwoController@info2');


// 各个添加路由方法
## 通过get请求方式访问 /test1 目录，返回的值写在test1方法里
Router::get('/test1','App\Controller\TestController::test1');
Router::get('/test2','App\Controller\TestController@test2');
Router::get('/test3',[\App\Controller\TestController::class,'test3']);
//下面为示例另外写法
/*
Router::post('/post', 'App\Controller\IndexController::post');
Router::post('/post', 'App\Controller\IndexController@post');
Router::post('/post', [\App\Controller\IndexController::class, 'post']);

Router::addRoute(['GET', 'POST', 'HEAD'], '/multi', 'App\Controller\IndexController::multi');
Router::addRoute(['GET', 'POST', 'HEAD'], '/multi', 'App\Controller\IndexController@multi');
Router::addRoute(['GET', 'POST', 'HEAD'], '/multi', [\App\Controller\IndexController::class, 'multi']);
*/

```

**必填参数**
可以对 $uri 进行一些参数定义，通过 {} 来声明参数，如 `/user/{id}` 则声明了 id 值为一个必填参数。

**可选参数**
可以通过 [] 来声明中括号内的参数为一个可选参数，如 `/user/[{id}]`。

**校验参数**
可以使用正则表达式对参数进行校验

以下是一些例子

```php
<?php 
use Hyperf\HttpServer\Router\Router;

// 可以匹配 /user/42, 但不能匹配 /user/xyz    
Router::addRoute('GET', '/user/{id:\d+}', 'handler');

// 可以匹配 /user/foobar, 但不能匹配 /user/foo/bar
Router::addRoute('GET', '/user/{name}', 'handler');

// 也可以匹配 /user/foo/bar as well
Router::addRoute('GET', '/user/{name:.+}', 'handler');

// 这个路由
Router::addRoute('GET', '/user/{id:\d+}[/{name}]', 'handler');
// 等同于以下的两个路由
Router::addRoute('GET', '/user/{id:\d+}', 'handler');
Router::addRoute('GET', '/user/{id:\d+}/{name}', 'handler');

// 多个可选的嵌套也是允许的
Router::addRoute('GET', '/user[/{id:\d+}[/{name}]]', 'handler');

// 这是一条无效的路由, 因为可选部分只能出现在最后
Router::addRoute('GET', '/user[/{id:\d+}]/{name}', 'handler');

```

<br/>

<br/>

<br/>

### 各个函数解释

**input**
通过 `input(string key, default = null)` 和 `inputs(array keys, default = null): array` 获取指定 一个 或 多个 任意形式的输入值：

```php
<?php

// 存在则返回，不存在则返回 null
$name = $request->input('name');
// 存在则返回，不存在则返回默认值 Hyperf
$name = $request->input('name', 'Hyperf');

```

<br/>

**all()**
以数组形式获取到所有输入数据:

```php
<?php

$all = $request->all();

```

<br/>

**route**
与input功能差不多但是它可以从路径、参数、查询参数中获取值。

```php
<?php

$str = $request->route('str','a');

```

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

<br/>

## 视图引擎

### 安装

```sh
composer require hyperf/view-engine
```

<br/>

### 生成配置

```sh
php bin/hyperf.php vendor:publish hyperf/view-engine
```

<br/>

### 使用

在 config/autoload 下找到配置文件 view.php，在根目录下创建存放视图文件的目录

![](https://i0.hdslb.com/bfs/openplatform/8f8e69aa9ff09190a298639b1433d6629e2ceb60.png)

<br/>

<br/>

在对应的目录里创建视图文件 index.blade.php（没有/storage/view就在根目录下创建）。

```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hyperf</title>
</head>
<body>
Hello, {{ $name }}. You are using blade template now.
</body>
</html>

```

<br/>

<br/>

控制器中获取 Hyperf\View\Render 实例，然后调用 render 方法并传递视图文件地址 index 和 渲染数据 即可，文件地址忽略视图文件的后缀名。

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Hyperf\HttpServer\Annotation\AutoController;
use Hyperf\View\RenderInterface;

#[AutoController]
class ViewController
{
    public function index(RenderInterface $render)
    {
        return $render->render('index', ['name' => 'Hyperf']);
    }
}

```

<br/>

<br/>

访问对应的 URL，即可获得如下所示的视图页面：

```sh
Hello, Hyperf. You are using blade template now.
```

<br/>

<br/>

<br/>

<br/>

## 数据库迁移/操作

记录一下

```php
<?php

declare(strict_types=1);

namespace App\Command;

use App\Model\User;
use Hyperf\Command\Command as HyperfCommand;
use Hyperf\Command\Annotation\Command;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Schema\Schema;
use Hyperf\DbConnection\Db;
use Hyperf\Di\Annotation\Inject;
use Hyperf\Logger\LoggerFactory;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;

#[Command]
class test_print extends HyperfCommand
{
    #[Inject]
    protected LoggerInterface $logger;


    public function __construct(protected ContainerInterface $container,LoggerFactory $loggerFactory)
    {
        parent::__construct('test_mysql');
        $this->logger = $loggerFactory->get('数据库迁移', 'command');
    }

    public function configure()
    {
        parent::configure();
        $this->setDescription('Hyperf Demo Command');
    }

    public function handle()
    {
        var_dump('数据库迁移脚本执行');
        $this->logger->info("数据库迁移脚本执行");


        // 迁移文件
        try {
            Db::statement("CREATE TABLE new_table SELECT * FROM users"); // 只复制结构
            Db::statement("INSERT INTO new_table SELECT * FROM users"); // 复制数据
        } catch (\Exception $e){
            var_dump('数据迁移出错');
            var_dump($e->getMessage());
        }


        // 检查字段并添加
        Schema::table('new_table', function (Blueprint $table) {
            // 检查字段是否存在，如果不存在则添加
            if (!Schema::hasColumn('new_table', 'new_column')) {
                $table->string('new_column', 100)->nullable()->comment('新字段');
                var_dump('字段创建成功');
            }
        });


        // 检查字段并删除
        Schema::table('new_table', function (Blueprint $table) {
            if (Schema::hasColumn('new_table', 'new_column')) {
                $table->dropColumn('new_column');
                var_dump('字段删除成功');
            }
        });
    }


}

```



<br>

<br>