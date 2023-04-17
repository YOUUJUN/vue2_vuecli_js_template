/**
 * 全局组件注册公共模块
 *
 */

import { DictSelectTag, DictMultiSelectTag } from '@/components/Dict/index'
const ComponentsRegister = {
	install(Vue) {
		// 字典单选组件
		Vue.component('j-dict-select-tag', DictSelectTag)
		// 字典多选组件
		Vue.component('j-multi-select-tag', DictMultiSelectTag)
	},
}

export default ComponentsRegister
