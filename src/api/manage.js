import http from '@/utils/http'
const request = http()

export function postAction(url, parameter) {
	return request({
		url,
		method: 'post',
		data: parameter,
	})
}

export function putAction(url, parameter) {
	return request({
		url,
		method: 'put',
		data: parameter,
	})
}

export function deleteAction(url, parameter) {
	return request({
		url,
		method: 'delete',
		params: parameter,
	})
}

export function getAction(url, parameter) {
	return request({
		url,
		method: 'get',
		params: parameter,
	})
}

/**
 * 获取文件服务访问路径
 * @param avatar
 * @param subStr
 * @returns {*}
 */
export function getFileAccessHttpUrl(avatar, subStr) {
	if (!subStr) subStr = 'http'
	try {
		if (avatar && avatar.startsWith(subStr)) {
			return avatar
		} else {
			if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
				return window._CONFIG['staticDomainURL'] + '/' + avatar
			}
		}
	} catch (err) {
		return
	}
}

/**
 * 文件上传 用于富文本上传图片
 * @param url
 * @param parameter
 * @returns {*}
 */
export function uploadAction(url, parameter) {
	return axios({
		url: url,
		data: parameter,
		method: 'post',
		headers: {
			'Content-Type': 'multipart/form-data', // 文件上传
		},
	})
}

export function downFile(url, parameter) {
	return request({
		url: url,
		params: parameter,
		method: 'get',
		responseType: 'blob',
	})
}
