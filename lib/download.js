/*
 * @Author: duchengdong
 * @Date: 2020-11-27 11:03:21
 * @LastEditors: duchengdong
 * @LastEditTime: 2021-12-29 16:54:28
 * @Description:
 */
const download = require('download-git-repo')
const ora = require('ora')
const path = require('path')

const templateUrls = [
	{
		name: 'react+react-router+redux',
		url: 'direct:https://gitee.com/duchengdong/react-app-redux-template.git#master',
	},
	{
		name: 'vue3+vue-router',
		url: 'direct:https://gitee.com/duchengdong/vue3.x-router-template.git#master',
	},
	{
		name: 'vue2+vue-router+vuex',
		url: 'direct:https://gitee.com/duchengdong/vue2.x-router-vuex-template.git#master',
	},
	{
		name: 'uni-template-vue',
		url: 'direct:https://gitee.com/duchengdong/uni-template-vue.git#main',
	},
	{
		name: 'uni-template-vue',
		url: 'direct:https://gitee.com/duchengdong/react-ts-template.git#master',
	},
]

const getTempUrl = tempType => {
	return templateUrls.find(v => v.name == tempType).url
}

module.exports = function (target, tempType) {
	target = path.join(target || '.', '.download-tmp')
	let tempUrl = getTempUrl(tempType)
	return new Promise((resolve, reject) => {
		// 这里可以根据具体的模板地址设置下载的url，注意，如果是git，url后面的branch不能忽略
		const spinner = ora('正在下载项目模板中...')
		spinner.start()
		download(
			tempUrl,
			target,
			{
				clone: true,
			},
			err => {
				if (err) {
					spinner.fail('下载项目模板失败😭')
					reject(err)
				} else {
					spinner.succeed('下载项目模板成功😊')
					// 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
					resolve(target)
				}
			}
		)
	})
}
