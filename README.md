
## 介绍

http-proxy-404mock 是一个基于http-proxy-middleware 开发的node代理服务器

你可以用它做什么呢?

你可以配置一堆不同环境的接口服务地址

它会自动嗅探接口在当前配置地址中是否404,如果404,它会往下一个地址中继续请求,直至成功

## Install



```console
$ npm install http-proxy-404 --save-dev
```
or

```console
$ yarn add http-proxy-404 -D
```

## Usage

step1: 创建serve.js

```console
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
    //在这里你可以重新定义404的范围
  }
})
```

step2: 配置webpack

```console
proxy: {
    '/': {
      target: 这里写上http-proxy-404 起的服务地址,
      ws: false,
      changeOrigin: true,
      // bypass: function(req,res,proxyOptions) {
      //     console.log(req.headers);
      // }
    }
  }
```

## options

- options.port: 代理服务的端口, 必填
  
- options.log: 是否打印日志 默认值true

- options.apiReg: 接口匹配规则
  
- options.changeOrigin:  将host header 改成目标 url, 默认值true
  
- options.ws: 如果你想代理websockets ,默认值false

- options.404func: 你可以通过函数去自定 404的范围