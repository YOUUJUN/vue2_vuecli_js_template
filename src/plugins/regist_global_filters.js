const FiltersRegister = {
	install(Vue) {
		Vue.filter('NumberFormat', function (value) {
			if (!value) {
				return '0'
			}
			let intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') //将整数部分逢三一断
			return intPartFormat
		})

		/** 字符串超长截取省略号显示 */
		Vue.filter('ellipsis', function (value, vlength = 25) {
			if (!value) {
				return ''
			}
			console.log('vlength: ' + vlength)
			if (value.length > vlength) {
				return value.slice(0, vlength) + '...'
			}
			return value
		})
	},
}

export default FiltersRegister
