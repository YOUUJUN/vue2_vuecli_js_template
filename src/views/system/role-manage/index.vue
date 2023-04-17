<template>
	<article class="root">
		<header class="header-wrap">
			<a-form-model layout="inline" @keyup.enter.native="searchQuery">
				<a-form-item label="角色名称">
					<a-input placeholder="" v-model="queryParam.roleName"></a-input>
				</a-form-item>

				<a-form-item label="角色状态">
					<a-select style="width: 170px" v-model="queryParam.status" placeholder="选择角色状态">
						<a-select-option :value="undefined">请选择</a-select-option>
						<a-select-option :value="1">启用</a-select-option>
						<a-select-option :value="0">禁用</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-model-item>
					<a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
					<a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
				</a-form-model-item>
			</a-form-model>

			<a-row :gutter="[8, 14]" style="margin: 14px 0">
				<a-col :span="24">
					<a-button @click="handleAdd" type="primary" icon="plus">新增角色</a-button>
					<!-- <a-button
						v-show="selectedRowKeys.length > 0"
						ghost
						@click="handleDelBunch"
						type="primary"
						icon="delete"
						style="margin-left: 8px"
					>
						批量删除
					</a-button>
					<a-button
						@click="handleBatchFrozen(1)"
						type="primary"
						v-show="selectedRowKeys.length > 0"
						ghost
						style="margin-left: 8px"
					>
						批量启用
					</a-button>
					<a-button
						@click="handleBatchFrozen(0)"
						type="primary"
						v-show="selectedRowKeys.length > 0"
						ghost
						style="margin-left: 8px"
					>
						批量禁用
					</a-button> -->
				</a-col>

				<!-- <a-col :span="24">
					<div class="ant-alert ant-alert-info">
						已选择&nbsp;
						<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>
						项&nbsp;&nbsp;
						<a style="margin-left: 24px" @click="onClearSelected">清空</a>
					</div>
				</a-col> -->
			</a-row>
		</header>

		<main>
			<a-table
				ref="table"
				size="middle"
				bordered
				:scroll="{ x: true }"
				rowKey="id"
				:columns="columns"
				:dataSource="dataSource"
				:pagination="ipagination"
				:loading="loading"
				@change="handleTableChange"
			>
				<template slot="status_dictText" slot-scope="text, record">
					<div>
						<span style="margin-right: 6px">{{ record.status === 1 ? '启用' : '禁用' }}</span>
						<a-switch
							:defaultChecked="record.status === 1"
							:checked="record.status === 1"
							@change="(checked) => confirmDisableRole(checked, record)"
							v-if="record.roleCode !== 'admin'"
						/>
					</div>
				</template>

				<template slot="action" slot-scope="text, record">
					<a-button type="link" size="small" @click="handlePermission(record)">角色权限</a-button>
					<a-button type="link" size="small" @click="handleView(record)">查看</a-button>
					<a-button type="link" size="small" @click="handleEdit(record)" v-if="record.roleCode !== 'admin'">
						编辑
					</a-button>
					<a-popconfirm
						title="确定删除吗?"
						@confirm="() => handleDel(record)"
						v-if="record.roleCode !== 'admin'"
					>
						<a-button type="link" size="small">删除</a-button>
					</a-popconfirm>
				</template>
			</a-table>
		</main>

		<footer></footer>

		<role-drawer
			ref="roleDrawer"
			:visible.sync="visible"
			:ctrlMode="ctrlMode"
			@handleQuery="searchQuery"
		></role-drawer>

		<permission-selector ref="permissionSelector"></permission-selector>
	</article>
</template>
<script>
import dataListMixin from '@/mixins/data_list_mixin'
import RoleDrawer from './modules/RoleDrawer.vue'
import PermissionSelector from './modules/PermissionSelector.vue'

import { fetchUserRoleRelation, deleteRole, editRoleStatus } from '@/api/user'

const columns = [
	{
		title: '序号',
		dataIndex: '',
		key: 'rowIndex',
		width: 90,
		align: 'center',
		customRender: function (t, r, index) {
			return parseInt(index) + 1
		},
	},
	{
		title: '角色名称',
		align: 'center',
		ellipsis: true,
		dataIndex: 'roleName',
	},
	{
		title: '角色说明',
		align: 'center',
		dataIndex: 'description',
		ellipsis: true,
	},
	{
		title: '创建时间',
		dataIndex: 'createTime',
		align: 'center',
	},
	{
		title: '角色状态',
		align: 'center',
		width: 110,
		dataIndex: 'status_dictText',
		scopedSlots: { customRender: 'status_dictText' },
	},
	{
		title: '操作',
		dataIndex: 'action',
		width: 300,
		align: 'center',
		scopedSlots: { customRender: 'action' },
	},
]

export default {
	mixins: [dataListMixin],

	components: {
		RoleDrawer,
		PermissionSelector,
	},

	data() {
		return {
			columns,
			url: {
				list: '/rbac/sys/role/list',
			},

			//窗体控制
			visible: false,
			ctrlMode: 'add',
		}
	},

	methods: {
		//处理添加
		handleAdd() {
			this.ctrlMode = 'add'
			this.visible = true
		},

		//处理编辑
		handleEdit(record) {
			this.ctrlMode = 'modify'
			this.visible = true
			this.$nextTick(() => {
				this.$refs.roleDrawer.setData(record)
			})
		},

		//处理查看
		handleView(record) {
			this.loading = true
			fetchUserRoleRelation({
				roleId: record.id,
			})
				.then((res) => {
					console.log('res', res)
					const { success, message, result } = res
					if (success) {
						let userList = result?.map((item) => {
							return {
								id: item.userId,
								realName: item.realName,
							}
						})
						let payload = {
							form: record,
							list: userList,
						}
						this.ctrlMode = 'view'
						this.visible = true
						this.$nextTick(() => {
							this.$refs.roleDrawer.setData(payload)
						})
					}
				})
				.catch((err) => {
					console.error('err', err)
				})
				.finally(() => {
					this.loading = false
				})
		},

		//处理删除
		handleDel(record) {
			deleteRole({
				ids: record.id,
			})
				.then((res) => {
					const { success, message } = res
					if (success) {
						this.$message.success('删除成功!')
						this.searchQuery()
					} else {
						this.$message.warning('删除失败!')
					}
				})
				.catch((err) => {
					console.error('err', err)
					this.$message.warning('删除失败!')
				})
		},

		//处理批量删除
		handleDelBunch() {
			let keys = this.selectedRowKeys
			if (keys.length <= 0) {
				this.$message.warning('请选择一条记录！')
				return
			}

			this.$confirm({
				title: '确认删除',
				content: '是否删除选中数据?',
				onOk: () => {
					deleteRole({
						ids: keys.join(','),
					})
						.then((res) => {
							const { success, message } = res
							if (success) {
								this.$message.success('删除成功!')
								this.searchQuery()
							} else {
								this.$message.warning('删除失败!')
							}
						})
						.catch((err) => {
							console.error('err', err)
							this.$message.warning('删除失败!')
						})
				},
				onCancel() {
					console.log('Cancel')
				},
			})
		},

		confirmDisableRole(checked, record) {
			let status = Number(checked)
			if (status === 0) {
				this.$confirm({
					title: '是否确认禁用当前角色？',
					content: '如果禁用当前角色，绑定该角色的所有用户将丢失权限',
					onOk: () => {
						this.handleDisableRole(checked, record)
					},
					onCancel() {},
				})
			} else {
				this.handleDisableRole(checked, record)
			}
		},

		//处理启用禁用
		handleDisableRole(checked, record) {
			let status = Number(checked)
			record.status = status
			editRoleStatus({
				ids: [record.id],
				status,
			})
				.then((res) => {
					const { success } = res
					if (success) {
						this.$message.success('修改角色状态成功!')
					} else {
						this.$message.warning('修改角色状态失败!')
					}
				})
				.catch((err) => {
					console.error('err', err)
					this.$message.warning('修改角色状态失败!')
				})
		},

		//处理批量启用禁用
		handleBatchFrozen: function (status) {
			if (this.selectedRowKeys.length <= 0) {
				this.$message.warning('请选择一条记录！')
				return
			}

			this.$confirm({
				title: '确认操作',
				content: `是否${status === 1 ? '启用' : '禁用'}选中角色?`,
				onOk: () => {
					editRoleStatus({
						ids: this.selectedRowKeys,
						status,
					})
						.then((res) => {
							const { success } = res
							if (success) {
								this.$message.success('修改角色状态成功!')
								this.searchQuery()
							} else {
								this.$message.warning('修改角色状态失败!')
							}
						})
						.catch((err) => {
							console.error('err', err)
							this.$message.warning('修改角色状态失败!')
						})
				},
			})
		},

		//处理分配角色权限
		handlePermission(record) {
			const { id } = record
			this.$refs.permissionSelector.show(id)
		},
	},
}
</script>
<style scoped>
.root {
	background: #fff;
	padding: 2.4rem;
}
</style>
