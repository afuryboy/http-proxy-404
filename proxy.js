const express = require('express');
const proxy = require('http-proxy-middleware');
const axios = require('axios');
const chalk = require('chalk');
var ip = require('ip')
var ipAdress = ip.address()
var app = express();

class Proxy404 {
  constructor(options={}) {
    this.options = options
    var proxyOptions = {
      target: options.targetList[0],
      changeOrigin: options.changeOrigin || true,
      ws: options.ws || false,
      router: function(req) {
        var index = req.headers['proxy-index']
        var noServeFlag = false
        if (index === undefined) {
          noServeFlag = true
          console.log(chalk.bold.red(`当前targetList配置中没有可用服务器,请检查...`));
          index = 0
          console.log(chalk.bold.yellow(`http-proxy-404已经强制切换服务器到targetList配置中的第一个`));
        }
        if (options.log || options.log === undefined) {
          noServeFlag ? console.log(chalk.bold.yellow(`当前接口: ${req.url} 代理到的服务器是: ${options.targetList[index]}`)) :
          console.log(chalk.bold.green(`当前接口: ${req.url} 代理到的服务器是: ${options.targetList[index]}`));
        }
        return options.targetList[index]
      }
    }
    this.proxy = proxy(proxyOptions)
    this.start()
    console.log(chalk.bold.green(`http-proxy-404 is Serving!`));

    console.log(chalk.bold.green(`- Local:            http://localhost:${options.port} `));

    console.log(chalk.bold.green(`- On Your Network:  http://${ipAdress}:${options.port} \n`));
    app.listen(options.port)
  }
  start() {
    axios.interceptors.response.use(data => {
      return data
    },error => {
      if ((this.options['404func'] && this.options['404func'](error)) || (error && error.response && error.response.status === 404) ) {
        return Promise.resolve(404)
      }
    })
    app.all(this.options.apiReg,async(req,res,next) => {
      let mock
      var i = 0
      while(i<this.options.targetList.length) {
        let result = await axios({
          url: this.options.targetList[i] + req.url,
          method: req.method,
        })
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
}
module.exports = Proxy404