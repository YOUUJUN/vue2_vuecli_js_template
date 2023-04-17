import { isURL } from '@/utils/validate'
import { asyncRouters } from '@/router/index'

const indexPath = window._CONFIG['indexURL']

// 生成首页路由
export function generateIndexRouter(data) {
	let indexPage = data.find((item) => item.path === '/index')
	console.log('indexPage', indexPage, data)
	if (!indexPage) {
		data.unshift({
			redirect: '',
			path: '/index',
			component: 'exception/Blank',
			route: true,
			hidden: true,
			meta: {
				keepAlive: null,
				internalOrExternal: null,
				componentName: 'index',
				title: '首页',
			},
			name: 'index',
			alwaysShow: null,
		})
	}

	let indexRouter = [
		{
			path: '/',
			component: (resolve) => require(['@components/Layout/Layout.vue'], resolve),
			redirect: indexPath,
			children: [...asyncRouters, ...generateChildRouters(data)],
		},

		{
			path: '*',
			redirect: '/404',
			hidden: true,
			meta: {},
		},
	]

	console.log('indexRouter', indexRouter)

	return indexRouter
}

// 生成嵌套路由（子路由）
function generateChildRouters(data) {
	const routers = []
	for (let item of data) {
		let component = ''
		if (item.component.indexOf('Layout') >= 0) {
			component = 'components/' + item.component
		} else if (item.component !== '') {
			component = 'views/' + item.component
		}

		// eslint-disable-next-line
		let URL = (item?.meta?.url || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
		if (isURL(URL)) {
			item.meta.url = URL
		}

		let componentPath = (resolve) => require(['@/' + component + '.vue'], resolve)

		let menu = {
			path: item.path,
			name: item.name,
			redirect: item.redirect,
			component: componentPath,
			hidden: item.hidden,
			meta: {
				invisible: item.hidden,
				title: item.meta.title,
				icon: item.meta.icon,
				link: item.meta.url,
				internalOrExternal: item.meta.internalOrExternal,
				keepAlive: item.meta.keepAlive,
			},
		}

		if (menu.meta?.internalOrExternal === true && !menu.meta?.link) {
			Object.assign(menu.meta, {
				link: menu.redirect,
			})
		}

		// if (item.alwaysShow) {
		// 	menu.alwaysShow = true
		// 	menu.redirect = menu.path
		// }
		if (item.children && item.children.length > 0) {
			menu.children = [...generateChildRouters(item.children)]
		}
		//根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）------
		//判断是否生成路由
		if (item?.route === false) {
			//console.log(' 不生成路由 item.route：  '+item.route);
			//console.log(' 不生成路由 item.path：  '+item.path);
		} else {
			routers.push(menu)
		}
	}
	return routers
}
