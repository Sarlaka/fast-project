/*
 * @Author: duchengdong
 * @Date: 2020-11-27 17:38:37
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-12-02 12:23:22
 * @Description: 
 */
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const fs = require('fs');
const rm = require('rimraf').sync

module.exports = function (metadata = {}, src, dest = '.') {
    if (!src) {
        return Promise.reject(new Error(`无效的source：${src}`))
    }

    return new Promise((resolve, reject) => {
        Metalsmith(process.cwd())
            .metadata(metadata)
            .clean(false)
            .source(src)
            .destination(dest)
            .use((files, metalsmith, done) => {
                const meta = metalsmith.metadata()
                Object.keys(files).forEach(fileName => {
                    try {
                        const t = files[fileName].contents.toString()
                        files[fileName].contents = new Buffer.from(Handlebars.compile(t)(meta))
                    } catch (error) {
                        // console.log(error)
                        // files[fileName].contents = new Buffer.from(Handlebars.compile(t)(meta),'binary')
                    }
                })
                done()
            }).build(err => {
                rm(src)
                err ? reject(err) : resolve(dest)
            })
    })
}