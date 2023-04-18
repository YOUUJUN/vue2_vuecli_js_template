/**
 * 验证是否为url
 * @param {string} url
 * @returns {Boolean}
 */

export function validURL(url) {
	const reg =
		/^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
	return reg.test(url)
}

export function deepClone(obj, hash = new WeakMap()) {
	if (hash.has(obj)) {
		return obj
	}
	let res = null
	const reference = [Date, RegExp, Set, WeakSet, Map, WeakMap, Error]

	if (reference.includes(obj.constructor)) {
		res = new obj.constructor(obj)
	} else if (Array.isArray(obj)) {
		res = []
		obj.forEach((e, i) => {
			res[i] = deepClone(e)
		})
	} else if (typeof obj === 'Object' && obj !== null) {
		res = {}
		for (const key in obj) {
			if (Object.hasOwnProperty.call(obj, key)) {
				res[key] = deepClone(obj[key])
			}
		}
	} else {
		res = obj
	}
	hash.set(obj, res)
	return res
}

//template中使用可选链
export const useChain = (target) => {
	return new Proxy(target, {
		get: (target, key) => {
			const keys = key.split('?.')
			return keys.reduce((a, b) => a?.[b], target)
		},
	})
}

export function timeFix() {
	const time = new Date()
	const hour = time.getHours()
	return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

//deep equal
export function equal(a, b) {
	if (a === b) return true

	if (a && b && typeof a == 'object' && typeof b == 'object') {
		if (a.constructor !== b.constructor) return false

		var length, i, keys
		if (Array.isArray(a)) {
			length = a.length
			if (length != b.length) return false
			for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false
			return true
		}

		if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags
		if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
		if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()

		keys = Object.keys(a)
		length = keys.length
		if (length !== Object.keys(b).length) return false

		for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false

		for (i = length; i-- !== 0; ) {
			var key = keys[i]

			if (!equal(a[key], b[key])) return false
		}

		return true
	}

	// true if both NaN, false otherwise
	return a !== a && b !== b
}

/**
 * better error handler for async func
 *
 * @param asyncFunc
 * @param params
 * @returns {Promise<*[]>}
 */

export async function errorCaptured(asyncFunc, ...params) {
	try {
		const res = await asyncFunc(...params)
		return [null, res]
	} catch (e) {
		return [e, null]
	}
}

/**
 * 根据组件名获取父级
 * @param vm
 * @param name
 * @returns {Vue | null|null|Vue}
 */
export function getVmParentByName(vm, name) {
	let parent = vm.$parent
	if (parent && parent.$options) {
		if (parent.$options.name === name) {
			return parent
		} else {
			let res = getVmParentByName(parent, name)
			if (res) {
				return res
			}
		}
	}
	return null
}

/**
 * 简单实现防抖方法
 *
 * 防抖(debounce)函数在第一次触发给定的函数时，不立即执行函数，而是给出一个期限值(delay)，比如100ms。
 * 如果100ms内再次执行函数，就重新开始计时，直到计时结束后再真正执行函数。
 * 这样做的好处是如果短时间内大量触发同一事件，只会执行一次函数。
 *
 * @param fn 要防抖的函数
 * @param delay 防抖的毫秒数
 * @returns {Function}
 */
export function simpleDebounce(fn, delay = 100) {
	let timer = null
	return function () {
		let args = arguments
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			fn.apply(this, args)
		}, delay)
	}
}

// 手机号码或者银行卡号脱敏
export function mobileSpec(tel, firstnum = 3, endnum = 4, tag = '****') {
	if (!tel) {
		return ''
	}
	tel = tel.trim()
	let specHead = ''
	if (tel.indexOf('+') != -1) {
		specHead = tel.substring(0, 3)
		tel = tel.replace(/\s+/g, '')
		tel = tel.replace(specHead, '')
		specHead += ' '
	}

	const head = tel.substring(0, firstnum)
	let end = tel.substring(tel.length - endnum)
	if (endnum == 1 && tel.length <= 2) {
		end = ''
	}
	return specHead + head + tag + end
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
	let event = document.createEvent('HTMLEvents')
	event.initEvent('resize', true, true)
	event.eventType = 'message'
	window.dispatchEvent(event)
}

/*根据出生日期算出年龄*/
export function jsGetAge(strBirthday) {
	var returnAge
	var strBirthdayArr = strBirthday.split('-')
	var birthYear = strBirthdayArr[0]
	var birthMonth = strBirthdayArr[1]
	var birthDay = strBirthdayArr[2]

	var d = new Date()
	var nowYear = d.getFullYear()
	var nowMonth = d.getMonth() + 1
	var nowDay = d.getDate()

	if (nowYear == birthYear) {
		returnAge = 0 //同年 则为0岁
	} else {
		var ageDiff = nowYear - birthYear //年之差
		if (ageDiff > 0) {
			if (nowMonth == birthMonth) {
				var dayDiff = nowDay - birthDay //日之差
				if (dayDiff < 0) {
					returnAge = ageDiff - 1
				} else {
					returnAge = ageDiff
				}
			} else {
				var monthDiff = nowMonth - birthMonth //月之差
				if (monthDiff < 0) {
					returnAge = ageDiff - 1
				} else {
					returnAge = ageDiff
				}
			}
		} else {
			returnAge = -1 //返回-1 表示出生日期输入错误 晚于今天
		}
	}

	return returnAge //返回周岁年龄
}

/**
 * 重复值验证工具方法
 *
 * 使用示例：
 * { validator: (rule, value, callback) => validateDuplicateValue('sys_fill_rule', 'rule_code', value, this.model.id, callback) }
 *
 * @param tableName 被验证的表名
 * @param fieldName 被验证的字段名
 * @param fieldVal 被验证的值
 * @param dataId 数据ID，可空
 * @param callback
 */
export function validateDuplicateValue(tableName, fieldName, fieldVal, dataId, callback) {
	if (fieldVal) {
		let params = { tableName, fieldName, fieldVal, dataId }
		api.duplicateCheck(params)
			.then((res) => {
				res['success'] ? callback() : callback(res['message'])
			})
			.catch((err) => {
				callback(err.message || err)
			})
	} else {
		callback()
	}
}

//休眠函数
export function sleep(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

const formatNumber = (n) => {
	n = n.toString()
	return n.length > 1 ? n : '0' + n
}

// 格式化时间
export function formatTime(date) {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export function getYMDHMS(timestamp, num = '1') {
	if (!timestamp) {
		return '--'
	} else {
		let time = new Date(timestamp * num)
		return formatTime(time)
	}
}

/**
 * 过滤对象中为空的属性
 * @param obj
 * @returns {*}
 */
export function filterObj(obj) {
	if (!(typeof obj == 'object')) {
		return
	}

	for (let key in obj) {
		if (obj.hasOwnProperty(key) && (obj[key] == null || obj[key] == undefined || obj[key] === '')) {
			delete obj[key]
		}
	}
	return obj
}
