<template>
	<article class="root">
		<header>
			<a-tabs defaultActiveKey="1" @change="switchLogType">
				<a-tab-pane tab="登录日志" key="1"></a-tab-pane>
				<a-tab-pane tab="操作日志" key="2"></a-tab-pane>
			</a-tabs>
			<div class="table-page-search-wrapper">
				<a-row type="flex" justify="space-between">
					<a-col :span="20">
						<a-form-model layout="inline" @keyup.enter.native="searchQuery">
							<a-row :gutter="16">
								<a-col :span="6">
									<a-form-model-item label="搜索日志">
										<a-input placeholder="请输入搜索日志" v-model="queryParam.logContent"></a-input>
									</a-form-model-item>
								</a-col>
								<a-col :span="6">
									<a-form-model-item label="接口路径">
										<a-input placeholder="请输入接口路径" v-model="queryParam.requestUrl"></a-input>
									</a-form-model-item>
								</a-col>

								<a-col :span="6">
									<a-form-model-item label="耗时大于(毫秒)">
										<a-input-number id="inputNumber" v-model="queryParam.costTime" />
									</a-form-model-item>
								</a-col>
								<a-col :span="6">
									<a-form-model-item label="是否成功">
										<a-select v-model="queryParam.isSuccess" placeholder="选择是否成功">
											<a-select-option :value="undefined">请选择</a-select-option>
											<a-select-option :value="1">成功</a-select-option>
											<a-select-option :value="0">失败</a-select-option>
										</a-select>
									</a-form-model-item>
								</a-col>
							</a-row>
							<a-row :gutter="16">
								<a-col :span="6">
									<a-form-model-item label="操作人名称">
										<a-input placeholder="请输入操作人名称" v-model="queryParam.username"></a-input>
									</a-form-model-item>
								</a-col>
								<a-col :span="8">
									<a-form-model-item label="创建时间">
										<a-range-picker
											:value="logDateValue"
											format="YYYY-MM-DD"
											:placeholder="['开始时间', '结束时间']"
											@change="onDateChange"
										/>
									</a-form-model-item>
								</a-col>
							</a-row>
						</a-form-model>
					</a-col>
					<a-col class="tr">
						<a-row style="margin-bottom: 24px">
							<a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
							<a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">
								重置
							</a-button>
						</a-row>
					</a-col>
				</a-row>
			</div>
		</header>

		<main>
			<a-table
				ref="table"
				bordered
				size="middle"
				rowKey="id"
				:columns="columns"
				:dataSource="dataSource"
				:pagination="ipagination"
				:loading="loading"
				@change="handleTableChange"
				style="margin-top: 14px"
			></a-table>
		</main>

		<footer></footer>
	</article>
</template>
<script>
import dataListMixin from '@/mixins/data_list_mixin'

const columns = [
	{
		title: '序号',
		dataIndex: '',
		key: 'rowIndex',
		align: 'center',
		customRender: function (t, r, index) {
			return parseInt(index) + 1
		},
	},
	{
		title: '日志内容',
		align: 'left',
		dataIndex: 'logContent',
		scopedSlots: { customRender: 'logContent' },
		ellipsis: true,
	},
	{
		title: '接口路径',
		align: 'center',
		dataIndex: 'requestUrl',
		ellipsis: true,
	},
	// {
	// 	title: '操作人ID',
	// 	dataIndex: 'userid',
	// 	align: 'center',
	// },
	{
		title: '操作人名称',
		dataIndex: 'username',
		align: 'center',
	},
	{
		title: 'IP',
		dataIndex: 'ip',
		align: 'center',
	},
	{
		title: '耗时(毫秒)',
		dataIndex: 'costTime',
		align: 'center',
		sorter: true,
	},
	{
		title: '是否成功',
		dataIndex: 'isSuccess',
		align: 'center',
		customRender: function (text) {
			if (text === 1) {
				return '成功'
			} else {
				return '失败'
			}
		},
	},
	{
		title: '失败原因',
		dataIndex: 'response',
		align: 'center',
		ellipsis: true,
	},
	{
		title: '创建时间',
		dataIndex: 'createTime',
		align: 'center',
	},
]

const operateColumn = {
	title: '操作类型',
	dataIndex: 'operateType_dictText',
	align: 'center',
}

export default {
	mixins: [dataListMixin],

	data() {
		return {
			url: {
				list: '/rbac/sys/log/list',
			},
			queryParam: {
				logType: 1,
			},
			logDateValue: [],
			columns,
		}
	},

	methods: {
		onDateChange: function (value, dateString) {
			this.logDateValue = value
			this.queryParam.createTime_begin = dateString[0]
			this.queryParam.createTime_end = dateString[1]
		},
		//重写重置按钮方法 因为日期重置填写逻辑
		searchReset() {
			this.logDateValue = []
			const queryParam = Object.assign({}, this.$options.data.call(this).queryParam)
			this.queryParam = { ...queryParam }
			this.loadData(1)
			this.$message.success('重置搜索项成功!')
		},
		//切换日志类型
		switchLogType(activeKey) {
			if (activeKey == 1) {
				this.columns = columns
			} else if (activeKey == 2) {
				this.tabKey = '2'
				let newColumns = [...columns]
				newColumns.splice(8, 0, operateColumn)
				this.columns = newColumns
			}

			Object.assign(this.queryParam, {
				logType: activeKey,
			})

			this.loadData(1)
		},
	},
}
</script>
<style scoped>
.root {
	background: #fff;
	padding: 2.4rem;
}
.root .ant-input-number {
	width: auto !important;
}
</style>
