import { getAction, postAction, putAction, deleteAction } from './manage'
import ls from '@/utils/ls_operation'
import { UI_CACHE_DB_DICT_DATA } from '@/utils/root/local_storageKeys'

//权限管理
const getPermissionList = (params) => getAction('/rbac/sys/permission/list', params)

//字典标签专用（通过code获取字典数组）
const ajaxGetDictItems = (code, params) => getAction(`/rbac/sys/dict/getDictItems/${code}`, params)
//从缓存中获取字典配置
const getDictItemsFromCache = (dictCode) => ls.get(UI_CACHE_DB_DICT_DATA)?.[dictCode] || null

/**
 * 查找数据字典对象中相匹配的值
 * @param dictCodes 格式为 数据字典code组成的数组
 * @returns {*}
 */
export function findMatchDict(dictCodes) {
	const cacheObj = ls.get(UI_CACHE_DB_DICT_DATA)
	return new Promise((resolve, reject) => {
		let result = {}
		dictCodes.reduce((total, value, index) => {
			let dictValue = cacheObj?.[value]
			if (dictValue) {
				total[value] = dictValue
			}

			return total
		}, result)

		resolve(result)
	})
}

//从后台加载全部数据字典
const fetchDictData = (params) => getAction('/rbac/sys/dict/getAllDictItems', params)
//刷新全部数据字典
const refreshDictCache = (params) => postAction('/rbac/sys/dict/refreshDictCache', params)
//新增字典项
const addDictItem = (params) => postAction('/rbac/sys/dict/add', params)
//修改字典项
const editDictItem = (params) => putAction('/rbac/sys/dict/edit', params)
//删除字典项
const deleteDictItem = (params) => deleteAction('/rbac/sys/dict/delete', params)

//新增字典详细项
const addDictItemDetail = (params) => postAction('/rbac/sys/dictItem/add', params)
//编辑字典详细项
const editDictItemDetail = (params) => putAction('/rbac/sys/dictItem/edit', params)
//删除字典详细项
const deleteDictItemDetail = (params) => deleteAction('/rbac/sys/dictItem/delete', params)

// 校验字段值是否重复
const duplicateCheck = (params) => getAction('/rbac/sys/common/duplicateCheck', params)

// 校验授权标识是否重复
const permsDuplicateCheck = (params) => getAction('/rbac/sys/permission/checkPerms', params)

//获取树形结构菜单数据(不包含按钮)
const queryTreeMenuList = (params) => getAction('/rbac/sys/permission/queryTreeList', params)
//获取树形结构菜单数据(包含按钮)
const queryFullTreeMenuList = (params) => getAction('/rbac/sys/permission/getTree', params)

//权限管理
const addPermission = (params) => postAction('/rbac/sys/permission/add', params)
const editPermission = (params) => putAction('/rbac/sys/permission/edit', params)
const deletePermission = (params) => deleteAction('/rbac/sys/permission/delete', params)

//获取系统业务平台列表
const fetchAllSystemPlatform = (params) => getAction('/rbac/sys/subsystem/list', params)

export {
	getPermissionList,
	ajaxGetDictItems,
	getDictItemsFromCache,
	fetchDictData,
	refreshDictCache,
	addDictItem,
	editDictItem,
	addDictItemDetail,
	editDictItemDetail,
	deleteDictItemDetail,
	deleteDictItem,
	duplicateCheck,
	permsDuplicateCheck,
	queryTreeMenuList,
	queryFullTreeMenuList,
	addPermission,
	editPermission,
	deletePermission,
	fetchAllSystemPlatform,
}
