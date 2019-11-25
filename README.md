<div align="center">
  <h1>http-proxy-404</h1>
  <p>just proxy serve,proxy 404 interface to target servers</p>
</div>

<h2 align="center">Introduction</h2>

http-proxy-404mock 是一个基于http-proxy-middleware 开发的node代理服务器

<small>Http-proxy-404 is a node proxy server based on http-proxy-middleware</small>

你可以用它做什么呢?

<small>What can you do with it?</small>

你可以配置一堆不同环境的接口服务地址

<small>You can configure a bunch of interface service addresses for different environments.</small>

它会自动嗅探接口在当前配置的服务器地址中 请求的response的状态是否为404,如果请求的状态是404,它会往下一个地址中继续请求,直至成功

<small>It will automatically sniff the interface to request the response status in the currently configured server address is 404,If the status of the request is 404, it will continue the request to the next address until it succeeds</small>

<h2 align="center">Install</h2>



```bash
$ npm install http-proxy-404 --save-dev
```
or

```bash
$ yarn add http-proxy-404 -D
```

<h2 align="center">Usage</h2>

step1: create serve.js

```js
const Proxy404 = require('http-proxy-404')

new Proxy404({
  port: 8081,
  apiReg: '/api*',
  targetList: [
    'target host1',
    'target host2',
    'target host3'
  ],
  '404func': function(res) {
    if(!res.response) {
      return true
    }
  }
})
```

step2: Configuring webpack

```js
proxy: {
    '/': {
      target: "http://x.x.x.x:port", // Please fill in the proxy service address output by http-proxy-404
      ws: false,
      changeOrigin: true,
    }
  }
```

step3: run serve.js

```bash
nodemon serve.js
```

or in your package.json

```json
"scripts": {
    "dev": "webpack-dev-server xxx & nodemon serve.js"
  },
```

<h2 align="center">options</h2>

|Name|Required|Type|Default|Description|
|:--:|:--:|:--:|:-----:|:----------|
|**`port`**|**`false`**|`{Number}`| 8081 | Proxy service port,If the port is occupied will port++ and until the port is available|
|**`log`**|**`false`**|`{Boolean}`|true|Whether to print the log|
|**`apiReg`**|**`true`**|`{RegExp}`|null|Interface matching rule|
|**`changeOrigin`**|**`false`**|`{Boolean}`|true| changes the origin of the host header to the target URL|
|**`ws`**|**`false`**|`{Boolean}`|false|if you want to proxy websockets|
|**`404func`**|**`false`**|`{Function}`|null|Custom function used to determine 404;Return `true` means you want to proxy next;Return `false` instead|
|**`200func`**|**`false`**|`{Function}`|null|Custom function used to determine 200;Return `true` means you want to proxy next;Return `false` instead;If you return a string, it will be defaulted to the address of the mandatory proxy|
|**`secure`**|**`false`**|`{Boolean}`|false|if you want to verify the SSL Certs|


<h2 align="center">update log</h2>

2019-11-25:
- 新增 参数配置 `200func`
- 新增自动检测端口占用功能,并自动分配可用端口