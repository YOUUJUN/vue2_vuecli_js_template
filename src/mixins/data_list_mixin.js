/**
 * table分页逻辑混入
 *
 */

import { getAction, postAction, deleteAction, downFile } from '@/api/manage'
import ls, { getToken } from '@/utils/ls_operation'
import { ACCESS_TOKEN } from '@/utils/root/local_storageKeys'
import { Modal } from 'ant-design-vue'

export default {
	data() {
		return {
			/* token header */
			tokenHeader: { Authorization: ls.get(ACCESS_TOKEN) },
			/* 查询列表用是否用post方法 */
			postMethod: false,
			/* 查询条件-请不要在queryParam中声明非字符串值的属性 */
			queryParam: {},
			/* 动态生成的查询条件，防止重置清除 */
			dynamicParam: {},
			/* 数据源 */
			dataSource: [],
			/* 分页参数 */
			ipagination: {
				current: 1,
				pageSize: 10,
				pageSizeOptions: ['10', '20', '30'],
				showTotal: (total, range) => {
					return range[0] + '-' + range[1] + ' 共' + total + '条'
				},
				showQuickJumper: true,
				showSizeChanger: true,
				total: 0,
			},
			/* 排序参数 */
			isorter: {
				column: 'createTime',
				order: 'desc',
			},

			/* table加载状态 */
			loading: false,
			/* table选中keys*/
			selectedRowKeys: [],
			/* table选中records*/
			selectionRows: [],

			/** 是否一进页面就开始加载数据 */
			loadByInit: true,

			url: {},
		}
	},

	created() {
		if (this.loadByInit) {
			this.loadData()
		}
	},

	methods: {
		//获取数据
		loadData(page) {
			return new Promise((resolve, reject) => {
				if (!this.url.list) {
					console.error('请设置url.list属性!')
					return
				}
				//加载数据 若传入参数1则加载第一页的内容
				if (page === 1) {
					this.ipagination.current = 1
				}

				let params = this.getQueryParams() //查询条件
				this.loading = true

				const fetchAction = this.postMethod ? postAction : getAction

				fetchAction(this.url.list, params)
					.then((res) => {
						if (res?.result) {
							this.dataSource = res.result?.records || res.result || []
							if (typeof res?.result?.total === 'number') {
								this.ipagination.total = res.result.total
							}
						}

						resolve(res)
					})
					.catch((err) => {
						console.error('loadData err', err)
						reject(err)
					})
					.finally(() => {
						this.loading = false
						this.onClearSelected()
					})
			})
		},

		//查询当前页数据，若当前页无数据且分页数大于1，则再次查前一页
		searchQuery() {
			return new Promise((resolve, reject) => {
				const currentPage = this.ipagination.current
				try {
					this.loadData(currentPage)
						.then((res) => {
							const { result, success } = res
							if (success) {
								if (result?.records.length === 0 && currentPage > 1) {
									this.loadData(currentPage - 1)
								}
								resolve(res)
							} else {
								resolve({})
							}
						})
						.catch((err) => {
							console.error('loadData err', err)
							reject(err)
						})
				} catch {}
			})
		},

		//处理删除
		handleDelete: function (id) {
			if (!this.url.delete) {
				this.$message.error('请设置url.delete属性!')
				return
			}

			deleteAction(this.url.delete, { id: id }).then((res) => {
				if (res.success) {
					this.$message.success(res.message)
					this.searchQuery()
					this.onClearSelected()
				} else {
					this.$message.warning(res.message)
				}
			})
		},

		//处理导出
		handleExportXls(fileName) {
			if (!fileName || typeof fileName != 'string') {
				fileName = '导出文件'
			}
			let param = this.getQueryParams()
			if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
				param['ids'] = this.selectedRowKeys.join(',')
			}
			console.log('导出参数', param)
			downFile(this.url.exportXlsUrl, param).then((data) => {
				if (!data) {
					this.$message.warning('文件下载失败')
					return
				}
				if (typeof window.navigator.msSaveBlob !== 'undefined') {
					window.navigator.msSaveBlob(
						new Blob([data], { type: 'application/vnd.ms-excel' }),
						fileName + '.xls',
					)
				} else {
					let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
					let link = document.createElement('a')
					link.style.display = 'none'
					link.href = url
					link.setAttribute('download', fileName + '.xls')
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link) //下载完成移除元素
					window.URL.revokeObjectURL(url) //释放掉blob对象
				}
			})
		},

		//处理重置按钮
		searchReset() {
			const queryParam = Object.assign({}, this.$options.data.call(this).queryParam)
			this.queryParam = { ...queryParam, ...this.dynamicParam }
			this.loadData(1)
			this.$message.success('重置搜索项成功!')
		},

		//生成查询条件
		getQueryParams() {
			//获取查询条件
			const params = Object.assign({}, this.queryParam, this.dynamicParam, this.isorter, {
				pageNo: this.ipagination.current,
				pageSize: this.ipagination.pageSize,
				field: this.getQueryField(),
			})
			return params
		},

		//获取需要查询的表字段
		getQueryField() {
			var str = 'id,'
			this.columns.forEach(function (value) {
				str += ',' + value.dataIndex
			})
			return str
		},

		//监听分页变化
		handleTableChange(pagination, filters, sorter) {
			console.log('filters', filters, sorter)
			if (Object.keys(sorter).length > 0) {
				this.isorter.column = sorter.field
				this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
			}
			this.ipagination = pagination
			this.loadData()
		},

		//监听选中行
		onSelectChange(selectedRowKeys, selectionRows) {
			this.selectedRowKeys = selectedRowKeys
			this.selectionRows = selectionRows
		},
		//清空选中行
		onClearSelected() {
			this.selectedRowKeys = []
			this.selectionRows = []
		},
		/* 导入 */
		handleImportExcel(info) {
			this.loading = true
			if (info.file.status !== 'uploading') {
				console.log(info.file, info.fileList)
			}
			if (info.file.status === 'done') {
				this.loading = false
				if (info.file.response.success) {
					this.$message.success(info.file.response.message || `${info.file.name} 文件上传成功`)
					this.loadData()
				} else {
					this.$message.error(`${info.file.name} ${info.file.response.message}.`)
				}
			} else if (info.file.status === 'error') {
				if (info.file.response.status === 500) {
					let data = info.file.response
					const token = getToken()
					if (token && data.message.includes('Token失效')) {
						Modal.error({
							title: '登录已过期',
							content: '很抱歉，登录已过期，请重新登录',
							okText: '重新登录',
							mask: false,
							onOk: () => {
								store.dispatch('user/Logout')
							},
						})
					}
				} else {
					this.$message.error(`文件上传失败: ${info.file.msg} `)
				}
			}
		},
		handleEdit: function (record) {
			this.$refs.modalForm.edit(record)
			this.$refs.modalForm.title = '编辑'
			this.$refs.modalForm.disableSubmit = false
		},
		handleAdd: function () {
			this.$refs.modalForm.add()
			this.$refs.modalForm.title = '新增'
			this.$refs.modalForm.disableSubmit = false
		},
		handleDetail: function (record) {
			this.$refs.modalForm.edit(record)
			this.$refs.modalForm.title = '详情'
			this.$refs.modalForm.disableSubmit = true
		},
		modalFormOk() {
			// 新增/修改 成功时，重载列表
			this.loadData()
		},
	},
}
