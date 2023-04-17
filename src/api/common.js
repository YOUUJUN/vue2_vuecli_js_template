import { getAction, postAction, putAction, deleteAction } from '@/api/manage'
/* 获取省市区 */
const getProvinceList = (params) => postAction('/rbac/city/queryCityListByPid', params)
/* 刷新缓存省市区 */
const refreshCityCache = (params) => postAction('/rbac/city/refreshCityCache', params)

// 获取音频地址
const getRecordUrl = (params) => postAction('/stso/calltraffic/callTraffic/getRecordUrl', params)

export { getProvinceList, refreshCityCache, getRecordUrl }
