import { USER_AUTH, SYS_BUTTON_AUTH } from '@/utils/root/local_storageKeys'
import ls from '@/utils/ls_operation'

/**
 *
 * @param {string} auth 权限名
 * 返回授权策略
 */
function getAuthType(auth) {
	let authType = '1'
	const authList = JSON.parse(ls.get(SYS_BUTTON_AUTH))
	let authData = authList.find((item) => item.action === auth)
	if (authData) {
		let { type } = authData
		authType = type
	}

	return authType
}

function injectAction(el, binding, vnode) {
	const check = binding.value
	const instance = vnode.context
	const $auth = instance.$auth
	let result = $auth(check)
	if (!result) {
		let ctrlType = getAuthType(check)
		if (ctrlType == '1') {
			el?.parentNode && el.parentNode.removeChild(el)
		} else if (ctrlType == '2') {
			el.disabled = true
			el.setAttribute('title', '无此权限')
			vnode.componentInstance.$options.disabled = true
		}
	}
}

/**
 *
 *  USER_AUTH :  { action: "user:edit", describe: "用户编辑", type: "1", status: "1" }
 *
 */
const AuthorityPlugin = {
	install(Vue) {
		Vue.directive('has', {
			inserted(el, binding, vnode) {
				setTimeout(() => injectAction(el, binding, vnode), 0)
			},

			componentUpdated(el, binding, vnode) {
				setTimeout(() => injectAction(el, binding, vnode), 0)
			},
		})

		Vue.mixin({
			methods: {
				/**
				 *
				 * @param {string} auth 权限名
				 * @param {number} type 授权策略 type=1 :可见/可访问(授权后可见/可访问); type=2 :可编辑(未授权时禁用)
				 */
				$auth(auth) {
					const authList = JSON.parse(ls.get(USER_AUTH))
					if (authList.findIndex((item) => item.action === auth) !== -1) {
						return true
					} else {
						return false
					}
				},
			},
		})
	},
}

export default AuthorityPlugin
