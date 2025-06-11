---
### 基本信息
title: Hyperf 日志服务前置学习
date: 2025/5/29 13:00:00
tags: [php, hyperf,微服务,nacos,Redis,Elasticsearch]
categories: [php, hyperf]

banner: https://i0.hdslb.com/bfs/openplatform/bd94766e9017f28374eb60f130be6d423b889111.png
repo: hyperf/hyperf
---





## JSON RPC 服务

JSON RPC 是一种基于 JSON 格式的轻量级的 RPC 协议标准，易于使用和阅读。在 Hyperf 里由 hyperf/json-rpc 组件来实现，可自定义基于 HTTP 协议来传输，或直接基于 TCP 协议来传输。通过rpc协议，可以让调用本地函数一样调用远端的函数。



### 安装

{% copy    composer require hyperf/json-rpc    %}



该组件只是 JSON RPC 的协议处理的组件，通常来说，您仍需配合 hyperf/rpc-server 或 hyperf/rpc-client 来满足 服务端 和 客户端的场景，如同时使用则都需要安装：

要使用 JSON RPC 服务端：

{% copy    composer require hyperf/rpc-server    %}



要使用 JSON RPC 客户端：

{% copy    composer require hyperf/rpc-client    %}



<br/>

### 使用

服务有两种角色，一种是 服务提供者(ServiceProvider)，即为其它服务提供服务的服务，另一种是 服务消费者(ServiceConsumer)，即依赖其它服务的服务，一个服务既可能是 服务提供者(ServiceProvider)，同时又是 服务消费者(ServiceConsumer)。而两者直接可以通过 服务契约 来定义和约束接口的调用，在 Hyperf 里，可直接理解为就是一个 接口类(Interface)，通常来说这个接口类会同时出现在提供者和消费者下。



#### 定义服务提供者

目前仅支持通过注解的形式来定义 服务提供者(ServiceProvider)，后续迭代会增加配置的形式。  
我们可以直接通过 `#[RpcService]` 注解对一个类进行定义即可发布这个服务了：

在 App\JsonRpc 下创建接口 CalculatorServiceInterface.php

```php app/JsonRpc/CalculatorServiceInterface.php
<?php

namespace App\JsonRpc;

interface CalculatorServiceInterface
{
    public function add(int $a, int $b);

}
```

<br/>

写方法

```php app/JsonRpc/CalculatorService.php
<?php

namespace App\JsonRpc;

use Hyperf\RpcServer\Annotation\RpcService;

/**
 * 注意，如希望通过服务中心来管理服务，需在注解内增加 publishTo 属性
 */
#[RpcService(name: "CalculatorService", protocol: "jsonrpc", server: "jsonrpc",publishTo: "nacos")]
class CalculatorService implements CalculatorServiceInterface
{
    // 实现一个加法方法，这里简单的认为参数都是 int 类型
    public function add(int $a, int $b): int
    {
        // 这里是服务方法的具体实现
        return $a + $b;
    }
}

```

<br/>

<br/>

##### 定义 JSON RPC Server

在 config/autoload/server.php 配置文件中添加适配 jsonrpc 协议

TCP Server (适配 jsonrpc 协议)

```php config/autoload/server.php
<?php

use Hyperf\Server\Server;
use Hyperf\Server\Event;

return [
    'mode' => SWOOLE_PROCESS,
    'servers' => [
        [
            ......
        ],
        [
            'name' => 'jsonrpc',
            'type' => Server::SERVER_BASE,
            'host' => '0.0.0.0',
            'port' => 9503,
            'sock_type' => SWOOLE_SOCK_TCP,
            'callbacks' => [
                Event::ON_RECEIVE => [\Hyperf\JsonRpc\TcpServer::class, 'onReceive'],
            ],
            'settings' => [
                'open_eof_split' => true,
                'package_eof' => "\r\n",
                'package_max_length' => 1024 * 1024 * 2,
            ],
        ],
        
        
        
    ],
    'settings' => [
        ......
    ],
    'callbacks' => [
        ......
    ],
];

```

<br/>

<br/>

<br/>

### 发布到服务中心

发布服务到 nacos 需要通过 `composer require hyperf/service-governance-nacos` 引用组件（如果已安装则可忽略该步骤），然后再在 config/autoload/services.php 配置文件内配置 `drivers.nacos` 配置即可，示例如下：

```php
<?php
return [
    'enable' => [
        'discovery' => true,
        'register' => true,
    ],
    'consumers' => [],
    'providers' => [],
    'drivers' => [
//        'consul' => [
//            'uri' => 'http://127.0.0.1:8500',
//            'token' => '',
//        ],
        'nacos' => [
            // nacos server url like https://nacos.hyperf.io, Priority is higher than host:port
            // 'url' => '',
            // The nacos host info
            'host' => 'host.docker.internal' ,
            'port' => 8848,
            // The nacos account info
            'username' => null,
            'password' => null,
//            'guzzle' => [
//                'config' => null,
//            ],
//            'group_name' => 'api',
//            'namespace_id' => 'namespace_id',
            'heartbeat' => 5,
        ],
    ],
];

```

配置完成后，在启动服务时，Hyperf 会自动地将 #[RpcService] 定义了 publishTo 属性为 consul 或 nacos 的服务注册到对应的服务中心去。

![截图](/images/Hyperf日志服务前置学习/fcc96671a341e327a6d363cbd6baffb7.png)

<br/>

<br/>

<br/>

<br/>

### 创建消费端项目

可以看文档服务注册
https://hyperf.wiki/3.1/#/zh-cn/service-register?id=%e5%ae%89%e8%a3%85

<br/>

安装需要的组件

{% copy composer require hyperf/json-rpc %}



JSON RPC 客户端：

{% copy composer require hyperf/rpc-client %}

<br/>



在 app/JsonRpc 目录下创建接口

```php app/JsonRpc/CalculatorServiceInterface
<?php

namespace App\JsonRpc;

interface CalculatorServiceInterface
{
    public function add(int $a, int $b);

}
```

<br/>

<br/>

<br/>

<br/>

#### 自动创建代理消费者类

<br/>

通过配置文件就可以连接nacos服务中心去使用远程的函数/方法
安装组件 `composer require hyperf/service-governance-nacos` ，创建 config/autoload/services.php 配置相关信息

```php
<?php
return [
    // 此处省略了其它同层级的配置
    'consumers' => [
        [
            // name 需与服务提供者的 name 属性相同
            'name' => 'CalculatorService',
            // 服务接口名，可选，默认值等于 name 配置的值，如果 name 直接定义为接口类则可忽略此行配置，如 name 为字符串则需要配置 service 对应到接口类
            'service' => \App\JsonRpc\CalculatorServiceInterface::class,
            // 对应容器对象 ID，可选，默认值等于 service 配置的值，用来定义依赖注入的 key
            'id' => \App\JsonRpc\CalculatorServiceInterface::class,
            // 服务提供者的服务协议，可选，默认值为 jsonrpc-http
            // 可选 jsonrpc-http jsonrpc jsonrpc-tcp-length-check
            'protocol' => 'jsonrpc',
            // 负载均衡算法，可选，默认值为 random
            'load_balancer' => 'random',
            // 这个消费者要从哪个服务中心获取节点信息，如不配置则不会从服务中心获取节点信息
            'registry' => [
                'protocol' => 'nacos',
                'address' => 'host.docker.internal:8848',
            ],
            // 如果没有指定上面的 registry 配置，即为直接对指定的节点进行消费，通过下面的 nodes 参数来配置服务提供者的节点信息
//            'nodes' => [
//                ['host' => 'host.docker.internal', 'port' => 8848],
//            ],
//            // 配置项，会影响到 Packer 和 Transporter
//            'options' => [
//                'connect_timeout' => 5.0,
//                'recv_timeout' => 5.0,
//                'settings' => [
//                    // 根据协议不同，区分配置
//                    'open_eof_split' => true,
//                    'package_eof' => "\r\n",
//                    // 'open_length_check' => true,
//                    // 'package_length_type' => 'N',
//                    // 'package_length_offset' => 0,
//                    // 'package_body_offset' => 4,
//                ],
//                // 重试次数，默认值为 2，收包超时不进行重试。暂只支持 JsonRpcPoolTransporter
//                'retry_count' => 2,
//                // 重试间隔，毫秒
//                'retry_interval' => 100,
//                // 使用多路复用 RPC 时的心跳间隔，null 为不触发心跳
//                'heartbeat' => 30,
//                // 当使用 JsonRpcPoolTransporter 时会用到以下配置
//                'pool' => [
//                    'min_connections' => 1,
//                    'max_connections' => 32,
//                    'connect_timeout' => 10.0,
//                    'wait_timeout' => 3.0,
//                    'heartbeat' => -1,
//                    'max_idle_time' => 60.0,
//                ],
//            ],
        ]
    ],
    
    // 还需要添加驱动
    'drivers' => [
//        'consul' => [
//            'uri' => 'http://127.0.0.1:8500',
//            'token' => '',
//        ],
        'nacos' => [
            // nacos server url like https://nacos.hyperf.io, Priority is higher than host:port
            // 'url' => '',
            // The nacos host info
            'host' => 'host.docker.internal' ,
            'port' => 8848,
            // The nacos account info
            'username' => null,
            'password' => null,
//            'guzzle' => [
//                'config' => null,
//            ],
//            'group_name' => 'api',
//            'namespace_id' => 'namespace_id',
            'heartbeat' => 5,
        ],
    ],
];

```

<br/>

写接口 app/JsonRpc/CalculatorServiceInterface.php

```php app/JsonRpc/CalculatorServiceInterface.php
<?php

namespace App\JsonRpc;

interface CalculatorServiceInterface
{
    public function add(int $a, int $b);

}
```

<br/>

<br/>

调用方法：

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

use App\JsonRpc\CalculatorServiceInterface;
use Hyperf\Di\Annotation\Inject;

class IndexController extends AbstractController
{

    #[Inject]
    private CalculatorServiceInterface $CalculatorService;
    public function index()
    {
        $a = $this->CalculatorService->add(1,2);
        var_dump($a);
        return '200';
    }
}

```

访问 url

![截图](/images/Hyperf日志服务前置学习/e620e064672ab38b02da98df4d38faae.png)

<br/>

<br/>

<br/>

<br/>

<br/>

## Redis队列

异步队列区别于 `RabbitMQ` `Kafka` 等消息队列，它只提供一种 `异步处理` 和 `异步延时处理` 的能力，并 **不能** 严格地保证消息的持久化和 **不支持** 完备的 ACK 应答机制。



### 安装

{% copy   composer require hyperf/async-queue    %}



<br/>

### 配置

配置文件位于 config/autoload/async_queue.php，如该文件不存在，可通过 `php bin/hyperf.php vendor:publish hyperf/async-queue` 命令来将发布对应的配置文件，也可自行创建。

```php config/autoload/async_queue.php
<?php

return [
    'default' => [
        'driver' => Hyperf\AsyncQueue\Driver\RedisDriver::class,
        'redis' => [
            'pool' => 'default'
        ],
        'channel' => 'queue',
        'timeout' => 2,
        'retry_seconds' => 5,
        'handle_timeout' => 10,
        'processes' => 1,
        'concurrent' => [
            'limit' => 10,
        ],
        'max_messages' => 0,
    ],
];

```

<br/>

<br/>

<br/>

### 使用

#### 配置异步消费进程

组件已经提供了默认 异步消费进程，只需要将它配置到 config/autoload/processes.php 中即可。

```php config/autoload/processes.php
<?php

return [
    Hyperf\AsyncQueue\Process\ConsumerProcess::class,
];

```

<br/>

<br/>

### 工作原理

`ConsumerProcess` 是异步消费进程，会根据用户创建的 `Job` 或者使用 `#[AsyncQueueMessage]` 的代码块，执行消费逻辑。 `Job` 和 `#[AsyncQueueMessage]` 都是需要投递和执行的任务，即数据、消费逻辑都会在任务中定义。

- `Job` 类中成员变量即为待消费的数据，`handle()` 方法则为消费逻辑。
- `#[AsyncQueueMessage]` 注解的方法，构造函数传入的数据即为待消费的数据，方法体则为消费逻辑。

![截图](/images/Hyperf日志服务前置学习/309d141127380bb4bacbb7364d781a5d.png)

<br/>

### 任务执行流转流程

![截图](/images/Hyperf日志服务前置学习/c2b05ada664afb089a1265d68d092999.png)

<br/>



如果redis队列消息没有被消费删除，那可能是进入了失败/超时队列

<br/>

<br/>

<br/>

### 代码实例



#### 传统方式

这种模式会把对象直接序列化然后存到 Redis 等队列中，所以为了保证序列化后的体积，尽量不要将 `Container`，`Config` 等设置为成员变量。

> 因为 Job 会被序列化，所以成员变量不要包含 匿名函数 等 无法被序列化 的内容，如果不清楚哪些内容无法被序列化，尽量使用注解方式。

```php app/Job/ExampleJob.php
<?php

declare(strict_types=1);

namespace App\Job;

use Hyperf\AsyncQueue\Job;

class ExampleJob extends Job
{
    public $params;
    
    /**
     * 任务执行失败后的重试次数，即最大执行次数为 $maxAttempts+1 次
     */
    protected int $maxAttempts = 2;

    public function __construct($params)
    {
        // 这里最好是普通数据，不要使用携带 IO 的对象，比如 PDO 对象
        $this->params = $params;
    }

    public function handle()
    {
        // 根据参数处理具体逻辑
        // 通过具体参数获取模型等
        // 这里的逻辑会在 ConsumerProcess 进程中执行
        var_dump($this->params);
    }
}

```

<br/>

<br/>

正确定义完 `Job` 后，我们需要写一个专门投递消息的 `Service`，代码如下。

```php app/Service/QueueService.php
<?php

declare(strict_types=1);

namespace App\Service;

use App\Job\ExampleJob;
use Hyperf\AsyncQueue\Driver\DriverFactory;
use Hyperf\AsyncQueue\Driver\DriverInterface;

class QueueService
{
    protected DriverInterface $driver;

    public function __construct(DriverFactory $driverFactory)
    {
        $this->driver = $driverFactory->get('default');
    }

    /**
     * 生产消息.
     * @param $params 数据
     * @param int $delay 延时时间 单位秒
     */
    public function push($params, int $delay = 0): bool
    {
        // 这里的 `ExampleJob` 会被序列化存到 Redis 中，所以内部变量最好只传入普通数据
        // 同理，如果内部使用了注解 @Value 会把对应对象一起序列化，导致消息体变大。
        // 所以这里也不推荐使用 `make` 方法来创建 `Job` 对象。
        return $this->driver->push(new ExampleJob($params), $delay);
    }
}

```

<br/>

<br/>

<br/>

投递消息

接下来，调用我们的 `QueueService` 投递消息即可。

```php app/Controller/QueueController.php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\QueueService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\AutoController;

#[AutoController]
class QueueController extends AbstractController
{
    #[Inject]
    protected QueueService $service;

    /**
     * 传统模式投递消息
     */
    public function index()
    {
        $this->service->push([
            'group@hyperf.io',
            'https://doc.hyperf.io',
            'https://www.hyperf.io',
        ]);

        return 'success';
    }
}

```

<br/>

<br/>

<br/>

#### 注释方式

框架除了传统方式投递消息，还提供了注解方式。

> 注解方式会在非消费环境下自动投递消息到队列，故，如果我们在队列中使用注解方式时，则不会再次投递到队列当中，而是直接在本消费进程中执行。 如果仍然需要在队列中投递消息，则可以在队列中使用传统模式投递。

让我们重写上述 QueueService，直接将 ExampleJob 的逻辑搬到 example 方法中，并加上对应注解 `#[AsyncQueueMessage]`，具体代码如下。

```php app/Service/QueueService.php
<?php

declare(strict_types=1);

namespace App\Service;

use Hyperf\AsyncQueue\Annotation\AsyncQueueMessage;

class QueueService
{
    #[AsyncQueueMessage]
    public function example($params)
    {
        // 需要异步执行的代码逻辑
        // 这里的逻辑会在 ConsumerProcess 进程中执行
        var_dump($params);
    }
}

```

<br/>

<br/>

<br/>

投递消息

注解模式投递消息就跟平常调用方法一致，代码如下。

```php app/Controller/QueueController.php
<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\QueueService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\AutoController;

#[AutoController]
class QueueController extends AbstractController
{
    #[Inject]
    protected QueueService $service;

    /**
     * 注解模式投递消息
     */
    public function example()
    {
        $this->service->example([
            'group@hyperf.io',
            'https://doc.hyperf.io',
            'https://www.hyperf.io',
        ]);

        return 'success';
    }
}

```

<br/>

<br/>

<br/>

<br/>

<br/>

## 模型全文检索



### [安装](https://hyperf.wiki/3.1/#/zh-cn/scout?id=%e5%ae%89%e8%a3%85)

#### [引入组件包和 Elasticsearch 驱动](https://hyperf.wiki/3.1/#/zh-cn/scout?id=%e5%bc%95%e5%85%a5%e7%bb%84%e4%bb%b6%e5%8c%85%e5%92%8c-elasticsearch-%e9%a9%b1%e5%8a%a8)

{% copy composer require hyperf/scout %}

{% copy composer require hyperf/elasticsearch %}

<br/>

### 配置

#### 配置文件

生成配置文件

{% copy php bin/hyperf.php vendor:publish hyperf/scout  %}

这个命令将在你的 config 目录下生成一个 scout.php 配置文件。

配置文件:

```php config/autoload/scout.php
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
use Hyperf\Scout\Provider\ElasticsearchProvider;

use function Hyperf\Support\env;

return [
    'default' => env('SCOUT_ENGINE', 'elasticsearch'),
    'chunk' => [
        'searchable' => 500,
        'unsearchable' => 500,
    ],
    'prefix' => env('SCOUT_PREFIX', ''),
    'soft_delete' => false,
    'concurrency' => 100,
    'engine' => [
        'elasticsearch' => [
            'driver' => ElasticsearchProvider::class,
            'index' => null,
            'hosts' => [
                env('ELASTICSEARCH_HOST', 'https://elastic:elastic@host.docker.internal:9200'),
            ],
        ],
    ],
];

```

<br/>

<br/>

### ES同步

先创建模型，然后在模型里添加 `use Searchable;` ，这个 trait 会注册一个模型观察者来保持模型和所有驱动的同步：

```php app/Model/Test01.php
 <?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\DbConnection\Model\Model;
use Hyperf\Scout\Searchable;

/**
 * @property int $id id
 * @property string $conn 填充内容
 * @property \Carbon\Carbon $created_at 
 * @property \Carbon\Carbon $updated_at 
 */
class Test01 extends Model
{
    // 自动检测并数据同步到es：
    use Searchable;
    /**
     * The table associated with the model.
     */
    protected ?string $table = 'test01';

    /**
     * The attributes that are mass assignable.
     */
    protected array $fillable = [];

    /**
     * The attributes that should be cast to native types.
     */
    protected array $casts = ['id' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
}

```

<br/>

如果你想要将 Scout 安装到现有的项目中，你可能已经有了想要导入搜索驱动的数据库记录。使用 Scout 提供的命令 `import` 把所有现有记录导入到搜索索引里：

{% copy php bin/hyperf.php scout:import "App\Model\Test01" %}

![截图](/images/Hyperf日志服务前置学习/5581b58cd3ba47772900af630ea8c544.png)

<br/>

<br/>

#### 同步测试

写一个服务类

```php app/Service/NewService.php
<?php

namespace App\Service;

use App\Model\Test01;

class NewService
{
    // 数据写入
    public function addNews($conn)
    {
        $db = new Test01();
        $db->conn = $conn;
        return $db->save();
    }

    public function updateTest($id,$conn)
    {
        $db = Test01::find($id);
        $db->conn = $conn;
        return $db->save();
    }

    public  function seachTest($conn)
    {
        $db = Test01::search($conn)->get()->all();
        return $db;
    }


}
```

<br/>

<br/>

写一个添加sql信息的控制器

```php app/Controller/NewController.php
<?php

namespace App\Controller;

use App\Service\NewService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Annotation\Controller;
use Hyperf\HttpServer\Annotation\RequestMapping;

#[Controller]
class NewControoler
{
    #[Inject]
    private NewService $newService;
    #[RequestMapping(path: "/estest",methods: "POST,GET")]
    public function estest()
    {
        $this->newService->addNews("estest");
        return '200';
    }


    #[RequestMapping(path: "/update",methods: "POST,GET")]
    public function update()
    {
        $this->newService->updateTest("16","updatetest");
        return '200';
    }

    #[RequestMapping(path: "/seach",methods: "POST,GET")]
    public function seach()
    {
        $r = $this->newService->seachTest("estest");
        return ['200',$r];
    }

}
```

<br/>

去es里查询

![截图](/images/Hyperf日志服务前置学习/de8f74b9c4a7bf7d24a1509f6ae4bc2b.png)

<br/>

<br/>

<br/>

<br/>

## Elasticsearch 使用 *

ES是一个开源的高扩展的分布式全文检索引擎，它可以近乎实时的存储、检索数据。通过对索引的分片来进行快速查询，可以通过多台服务进行备份

资料学习：[Elasticsearch教学视频_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Qz411e7yx?spm_id_from=333.788.videopod.episodes&vd_source=25f1414c270c619f0808f44bf577e1d5)

### ES的结构

![截图](/images/Hyperf日志服务前置学习/227383b52f0d93bdb018502564b65f04.png)

<br/>

![截图](/images/Hyperf日志服务前置学习/fd44c1eb1c33a67d35ddd1f322bfc832.png)

<br/>

![截图](/images/Hyperf日志服务前置学习/60d1f5f915a653a869c97e452ed41bba.png)

<br/>

<br/>

![截图](/images/Hyperf日志服务前置学习/f1c0c220227a0a033d0d5f29269cb59d.png)

<br/>

`/索引/类型/文档/属性/`

<br/>

Elasticsearch：index --> type --> doc --> field
MySQL: 数据库 --> 数据表 --> 行 --> 列

在 7.X 版本中，直接去除了 type 的概念，就是说 index 不再会有 type。

<br/>

### RESTful语法

Elasticsearch的大多数操作，主要是通过API进行搜索和其他操作。

```sh
## GET 请求
http://ip:port/index   ## 查询索引信息
http://ip:port/index/type/doc_id   ## 查询指定文档信息

## POST 请求
http://ip:port/index/type/_search   ## 查询文档，可以在请求体中添加json字符串代表查询条件
http://ip:port/index/type/doc_id/_update   ## 修改文档，可以在请求体中添加json字符串代表修改的具体信息

## PUT请求
http://ip:port/index   ## 创建一个索引，需要在请求体中指定索引的信息
http://ip:port/index/type/_mappings   ## 代表创建索引时，指定索引文档存储的属性信息

## DELETE请求
http://ip:port/index   ## 删除跑路
http://ip:port/index/type/doc_id   ## 删除指定的文档
```

<br/>

<br/>

#### 索引的操作

#### 创建一个索引

```sh
## 创建索引
## "number_of_shards": 5,      ## 分片数
## "number_of_replicas": 1     ## 备份数
PUT /person
{
    "settings": 
    {
        "number_of_shards": 5,       
        "number_of_replicas": 1      
    }
}
```

<br/>

![截图](/images/Hyperf日志服务前置学习/f5288e958f4ae44e98aad46ee4cf921f.png)

<br/>

![截图](/images/Hyperf日志服务前置学习/6f1ed1b07e17014a3b97684a04c7b681.png)

<br/>

<br/>

#### 查看索引信息

查看刚刚创建的索引的状态

![截图](/images/Hyperf日志服务前置学习/b0052cb1e738ca82cec237afc960ab17.png)

<br/>

![截图](/images/Hyperf日志服务前置学习/088c0be3d16d5f6ea06841618d40b5a1.png)

<br/>

```sh
## 查看索引信息
GET /person
```

![截图](/images/Hyperf日志服务前置学习/2cfd24368c9d922375ac61b7146bd3bd.png)

<br/>

<br/>

<br/>

#### 删除索引

![截图](/images/Hyperf日志服务前置学习/23cab07aa2cbe1ac1062df02f062c660.png)

<br/>

```sh
## 删除索引
DELETE /person
```

<br/>

<br/>

<br/>

### 创建索引并指定数据结构

![截图](/images/Hyperf日志服务前置学习/6ff63c6dffabd5f5cd34ced03571aefc.png)

![截图](/images/Hyperf日志服务前置学习/a9c878a0c71c89332c3024b810c9cb32.png)

<br/>

在 6.0 的时候，已经默认只能支持一个索引一个 type 了，7.0 版本新增了一个参数 include_type_name ，即让所有的 API 是 type 相关的，这个参数在 7.0 默认是 true，不过在 8.0 的时候，会默认改成 false，也就是不包含 type 信息了，这个是 type 用于移除的一个开关。

- 索引操作：`PUT {index}/{type}/{id}` 需要修改成 `PUT {index}/_doc/{id}`
- Mapping 操作：PUT {index}/{type}/_mapping 则变成 PUT {index}/_mapping
- 所有增删改查搜索操作返回结果里面的关键字 _type 都将被移除

<br/>

#### ES 6.0 以下语法

```sh
## ES 6.0 及以下版本语法（有一个或多个Type类型）
## settings 指定分片和备份数
## mappings 指定数据结构：user类型，文档属性名：id、conn属性
PUT /users
{
    "settings": 
    {
        "number_of_shards": 5,       
        "number_of_replicas": 1      
    },
    ## 指定数据结构
    "mappings": {
      ## 类型Type
      "user":{
        ## 文档存储的Field
        "properties":{
          ## Field属性名
          "name":{
            ## 类型
            "type":"text",
            ## 指定当前Field可以作为查询的条件
            "index":true,
            ## 是否额外存储
            "store":false
          },
          "conn":{
            "type":"text"
          },
          "date":{
            "type":"date",
            ## 时间类型的格式化方式, 日期类型必须要加*
            "format":"yyyy-MM-dd HH:mm:ss"
          }
        }
      }
    }
}
```

<br/>

#### ES 7.0 以上语法

```sh
## ES 7.0 及以上版本语法（没有Type类型）
PUT /user
{
    "settings": 
    {
        "number_of_shards": 5,       
        "number_of_replicas": 1      
    },
    "mappings": {
      "properties":{
        "name":{
          "type":"text",
          "index":true,
          "store":false
        },
        "conn":{
          "type":"text"
        },
        "date":{
          "type":"date",
          "format":"yyyy-MM-dd HH:mm:ss"
        }
      }
     
    }
}
```

<br/>

<br/>

<br/>

### 操作文档

Elasticsearch 8.12.2

|method|url地址|描述|
|:--:|:--:|:--:|
|PUT|ip:9200 / 索引名称 / 默认文档类型 / 文档id|创建文档（指定文档id )|
|POST|ip:9200 / 索引名称 / 默认文档类型|创建文档（随机文档id )|
|POST|ip:9200 / 索引名称 / _update / 文档id|修改文档|
|DELETE|ip:9200 / 索引名称 / 默认文档类型 / 文档id|删除文档|
|GET|ip:9200 / 索引名称 / 默认文档类型 / 文档id|查询文档通过文档id|
|POST|ip:9200 / 索引名称 / 默认文档类型 /_search|查询所有数据|

> 默认文档类型 = _doc

<br/>

#### 添加数据

```sh
## 添加文档，自动生成id
## POST 和 PUT 都可以添加
## 自动id特点：长度为20个字符，URL安全，base64编码，GUID，分布式生成不冲突
POST /user/_doc
{
  "name": "name1",
  "conn": "我吃牛肉",
  "date": "2000-01-01 14:29:20"
}


## 添加文档，手动指定id
POST /user/_doc/1
{
  "name": "name1",
  "conn": "我吃牛肉",
  "date": "2000-01-01 14:29:20"
}
```

![截图](/images/Hyperf日志服务前置学习/ab5eada2408543de1ea65d702ee46dfb.png)

![截图](/images/Hyperf日志服务前置学习/19f6644317e9b6be73977fe3979db45f.png)

<br/>

<br/>

#### 更新数据

```sh
## 对id为的数据进行覆盖操作，整个数据覆盖
## PUT [注意如果PUT不传递值，那么值就会被覆盖]
PUT /user/_doc/2
{
  "conn": "我不吃牛肉2"
}

## POST [灵活性更高]
POST /user/_doc/2
{
  "conn": "我不吃牛肉2"
}


## 路径带_update,需要在参数外套一层 doc，这种方式不影响其他字段
POST /user/_update/2
{
  "doc": {
    "conn": "我不吃牛肉"
  }
}
```

<br/>

#### 查询数据

```sh
## 获取索引信息
GET /user

## 查询所有文档数据
GET /user/_search

## 通过id查询
GET /user/_doc/2

## 简单的条件查询
GET /user/_search?q=name:name1

```

<br/>

<br/>

#### 删除数据

```sh
## 删除索引
DELETE /user

## 删除指定文档 
DELETE /user/_doc/1

```

<br/>

<br/>

<br/>

### php 操作 Elasticsearch



#### 索引管理

https://learnku.com/docs/elasticsearch-php/6.0/index-operations/2007#9877a5

<br/>

#### 索引文档

https://learnku.com/docs/elasticsearch-php/6.0/crud/2008









<br>