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
    //this.checkParams();
    var proxyOptions = {
      target: options.targetList[0],
      changeOrigin: options.changeOrigin || true,
      ws: options.ws || false,
      router: function(req) {
        var index = req.headers['proxy-index']
        if (options.log || options.log === undefined) {
          console.log(chalk.green(`当前接口: ${req.url} 代理到的服务器是: ${options.targetList[index]}`));
        }
        return options.targetList[index]
      }
    }
    
    this.proxy = proxy(proxyOptions)
    this.start()
    console.log(chalk.green(`Serving!`));

    console.log(chalk.green(`- Local:            http://localhost:${options.port} `));

    console.log(chalk.green(`- On Your Network:  http://${ipAdress}:${options.port}`));
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
      // let axiosOpt
      // axiosOpt = {
      //   url: this.currentTarget + req.url,
      //   method: req.method,
      // }
      // let result = await axios(axiosOpt)
      // if (result === 404) {
      //   req.headers['proxy-index'] = true
      // }
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
  // checkParams() {
  //   if(!this.options.port) {
  //     throw `port is required`
  //   }
  //   if(!this.options.targetList || this.options.targetList.length === 0) {
  //     throw `targetList is required`
  //   }
  // }
}
module.exports = Proxy404