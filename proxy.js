const express = require('express');
const proxy = require('http-proxy-middleware');
const axios = require('axios');
const chalk = require('chalk');
const https = require('https');
const http = require('https');
const isPortReachable = require('is-port-reachable');
var ip = require('ip')
var ipAdress = ip.address()
var app = express();
const regHttps = /^https/;
const httpAgent = new http.Agent({  
  rejectUnauthorized: false,
  keepAlive: true
});
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false,
  keepAlive: true
});
class Proxy404 {
  constructor(options={}) {
    this.options = options
    this.init()
  }
  async init() {
    var that = this
    var proxyOptions = {
      target: this.options.targetList[0],
      changeOrigin: this.options.changeOrigin || true,
      ws: this.options.ws || false,
      secure: this.options.secure || false,
      router: function(req) {
        let forceProxyUrl = req.headers['force-proxy-url']
        if (forceProxyUrl) {
          console.log(chalk.bold.yellow(`当前接口: ${req.url} 被强制设置代理;代理到的服务器是: ${forceProxyUrl}`)) 
          return forceProxyUrl
        }
        var index = req.headers['proxy-index']
        var noServeFlag = false
        if (index === undefined) {
          noServeFlag = true
          console.log(chalk.bold.red(`当前targetList配置中没有可用服务器,请检查...`));
          index = 0
          console.log(chalk.bold.yellow(`http-proxy-404已经强制切换服务器到targetList配置中的第一个`));
        }
        if (that.options.log || that.options.log === undefined) {
          noServeFlag ? console.log(chalk.bold.yellow(`当前接口: ${req.url} 代理到的服务器是: ${that.options.targetList[index]}`)) :
          console.log(chalk.bold.green(`当前接口: ${req.url} 代理到的服务器是: ${that.options.targetList[index]}`));
        }
        return that.options.targetList[index]
      }
    }
    this.proxy = proxy(proxyOptions)
    this.start()
    let portenabled = await this.checkPort(this.options.port||8081);
    console.log(chalk.bold.green(`http-proxy-404 is Serving!`));

    console.log(chalk.bold.green(`- Local:            http://localhost:${portenabled} `));

    console.log(chalk.bold.green(`- On Your Network:  http://${ipAdress}:${portenabled} \n`));
    app.listen(portenabled)
  }
  start() {
    axios.interceptors.response.use(data => {
      let func200 = this.options['200func']
      if(func200) {
        let funRes = func200(data)
        let type = Object.prototype.toString.call(funRes)
        if (type === '[object Boolean]' && funRes) {
          return Promise.resolve(404)
        } else if(type === '[object String]') {
          this.options.forceUrl = funRes
          return Promise.resolve('force')
        } else {
          return data
        }
      } else {
        return data
      }
    },error => {
      let func404 = this.options['404func']
      if (func404 || (error && error.response && error.response.status === 404) ) {
        if(func404) {
          let funRes = func404(error)
          let type = Object.prototype.toString.call(funRes)
          if (type === '[object Boolean]' && funRes) {
            return Promise.resolve(404)
          } else if(type === '[object String]') {
            this.options.forceUrl = funRes
            return Promise.resolve('force')
          } else {
            return error
          }
        } else {
          return Promise.resolve(404)
        }
      }
    })
    app.all(this.options.apiReg,async(req,res,next) => {
      let mock
      var i = 0
      while(i<this.options.targetList.length) {
        var isHttps = regHttps.test(this.options.targetList[i])
        let result = await axios({
          url: this.options.targetList[i] + req.url,
          method: req.method,
          httpAgent: isHttps ? httpAgent : null,
          httpsAgent: isHttps ? httpsAgent : null
        })
        if(result === 'force') {
          req.headers['force-proxy-url'] = this.options.forceUrl
          break
        }
        if (result !== 404) {
          req.headers['proxy-index'] = i;
          break
        }
        i++
      }
      next()
    })
    app.use(this.options.apiReg,this.proxy)
  }
  async checkPort(port) {
    let reachable = await isPortReachable(port)
    if (reachable) {
      //console.log(`端口: ${port}被占`);
      port++
      return await this.checkPort(port)
    } else {
      //console.log(`端口: ${port}可以使用`);
      return port
    }
  }
}
module.exports = Proxy404