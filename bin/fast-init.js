// #!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const inquirer = require('inquirer')
const download = require('../lib/download')
const generator = require('../lib/generator')
const latestVersion = require('latest-version')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

program.usage('<project-name>').parse(process.argv)

// 根据输入，获取项目名称
let projectName = program.args[0]

if (!projectName) {
	// project-name 必填
	// 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
	program.help()
	return
}

const list = glob.sync('*') // 遍历当前目录
let next = undefined
let rootName = path.basename(process.cwd())
if (list.length) {
	// 如果当前目录不为空
	if (
		list.filter(name => {
			const fileName = path.resolve(process.cwd(), path.join('.', name))
			const isDir = fs.statSync(fileName).isDirectory()
			return name.indexOf(projectName) !== -1 && isDir
		}).length !== 0
	) {
		console.log(`项目${projectName}已经存在！`)
		return
	}
	next = Promise.resolve(projectName)
} else if (rootName === projectName) {
	next = inquirer
		.prompt([
			{
				name: 'buildInCurrent',
				message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
				type: 'confirm',
				default: true,
			},
		])
		.then(answer => {
			return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
		})
} else {
	next = Promise.resolve(projectName)
}
next && go()

function go() {
	next.then(projectRoot => {
		if (projectRoot !== '.') {
			fs.mkdirSync(projectRoot)
		}
		return inquirer
			.prompt([
				{
					type: 'list',
					name: 'tempType',
					message: '请选择你的项目模板',
					choices: ['react+react-router+redux', 'vue3+vue-router', 'vue2+vue-router+vuex', 'uni-template-vue', 'react-ts-template'],
					default: 0,
				},
			])
			.then(answers => {
				return {
					tempType: answers.tempType,
					projectRoot,
				}
			})
	})
		.then(info => {
			const {projectRoot, tempType} = info
			return download(projectRoot, tempType).then(target => {
				return {
					name: projectRoot,
					root: projectRoot,
					downloadTemp: target,
				}
			})
		})
		.then(context => {
			return inquirer
				.prompt([
					{
						name: 'projectName',
						message: '项目名称',
						default: context.name,
					},
					{
						name: 'projectVersion',
						message: '项目版本号',
						default: '0.1.0',
					},
					{
						name: 'projectDescription',
						message: '项目简介',
						default: `前端项目-${context.name}`,
					},
				])
				.then(answers => {
					// return latestVersion('react').then(version => {
					//     answers.supportReactVersion = version
					//     return {
					//         ...context,
					//         metadata: {
					//             ...answers
					//         }
					//     }
					// })
					return {
						...context,
						metadata: {
							...answers,
						},
					}
				})
		})
		.then(context => {
			// 添加生成的逻辑
			return generator(context.metadata, context.downloadTemp, context.root)
		})
		.then(context => {
			console.log(logSymbols.success, chalk.green('创建成功:)'))
			console.log(chalk.green('>>>cd ' + context + '\n   npm install\n   npm start'))
		})
		.catch(err => {
			console.error(logSymbols.error, chalk.red(`创建失败：${error.message}`))
		})
}
