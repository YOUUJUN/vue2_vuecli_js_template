<template>
	<a-drawer
		:title="title"
		:maskClosable="true"
		width="650"
		placement="right"
		:closable="true"
		@close="close"
		:visible="visible"
		style="overflow: auto; padding-bottom: 53px"
	>
		<a-form>
			<a-form-item label="所拥有的权限">
				<a-tree
					checkable
					@check="onCheck"
					:checkedKeys="checkedKeys"
					:treeData="treeData"
					@expand="onExpand"
					@select="onTreeNodeSelect"
					:selectedKeys="selectedKeys"
					:expandedKeys="expandedKeysss"
					:checkStrictly="checkStrictly"
				>
					<!-- <span slot="hasDatarule" slot-scope="{ slotTitle, ruleFlag }">
						{{ slotTitle }}
						<a-icon v-if="ruleFlag" type="align-left" style="margin-left: 5px; color: red"></a-icon>
					</span> -->
				</a-tree>
			</a-form-item>
		</a-form>

		<div class="drawer-bootom-button">
			<a-dropdown style="float: left" :trigger="['click']" placement="topCenter">
				<a-menu slot="overlay">
					<a-menu-item key="1" @click="switchCheckStrictly(1)">父子关联</a-menu-item>
					<a-menu-item key="2" @click="switchCheckStrictly(2)">取消关联</a-menu-item>
					<a-menu-item key="3" @click="checkALL">全部勾选</a-menu-item>
					<a-menu-item key="4" @click="cancelCheckALL">取消全选</a-menu-item>
					<a-menu-item key="5" @click="expandAll">展开所有</a-menu-item>
					<a-menu-item key="6" @click="closeAll">合并所有</a-menu-item>
				</a-menu>
				<a-button>
					树操作
					<a-icon type="up" />
				</a-button>
			</a-dropdown>
			<a-popconfirm title="确定放弃编辑？" @confirm="close" okText="确定" cancelText="取消">
				<a-button style="margin-right: 0.8rem">取消</a-button>
			</a-popconfirm>
			<a-button @click="handleSubmit(false)" type="primary" :loading="loading" ghost style="margin-right: 0.8rem">
				仅保存
			</a-button>
			<a-button @click="handleSubmit(true)" type="primary" :loading="loading">保存并关闭</a-button>
		</div>
	</a-drawer>
</template>
<script>
import { queryRolePermission, addRolePermission } from '@/api/user'
import { queryFullTreeMenuList } from '@/api/system'

export default {
	name: 'RoleModal',
	components: {
		// RoleDataruleModal,
	},
	data() {
		return {
			roleId: '',
			treeData: [],
			defaultCheckedKeys: [],
			checkedKeys: [],
			expandedKeysss: [],
			allTreeKeys: [],
			autoExpandParent: true,
			checkStrictly: true,
			title: '角色权限配置',
			visible: false,
			loading: false,
			selectedKeys: [],
		}
	},

	watch: {
		visible() {
			if (this.visible) {
				this.loadData()
			}
		},
	},

	methods: {
		onTreeNodeSelect(id) {
			if (id && id.length > 0) {
				this.selectedKeys = id
			}
		},
		onCheck(o) {
			if (this.checkStrictly) {
				this.checkedKeys = o.checked
			} else {
				this.checkedKeys = o
			}
		},
		show(roleId) {
			this.roleId = roleId
			this.visible = true
		},
		close() {
			this.reset()
			this.$emit('close')
			this.visible = false
		},
		onExpand(expandedKeys) {
			this.expandedKeysss = expandedKeys
			this.autoExpandParent = false
		},
		reset() {
			this.expandedKeysss = []
			this.checkedKeys = []
			this.defaultCheckedKeys = []
			this.loading = false
		},
		expandAll() {
			this.expandedKeysss = this.allTreeKeys
		},
		closeAll() {
			this.expandedKeysss = []
		},
		checkALL() {
			this.checkedKeys = this.allTreeKeys
		},
		cancelCheckALL() {
			this.checkedKeys = []
		},
		switchCheckStrictly(v) {
			if (v == 1) {
				this.checkStrictly = false
			} else if (v == 2) {
				this.checkStrictly = true
			}
		},
		handleCancel() {
			this.close()
		},
		handleSubmit(exit) {
			let params = {
				roleId: this.roleId,
				permissionIds: this.checkedKeys,
				lastpermissionIds: this.defaultCheckedKeys,
			}
			this.loading = true
			console.log('请求参数：', params)
			addRolePermission(params).then((res) => {
				if (res.success) {
					this.$message.success(res.message)
					this.loading = false
					if (exit) {
						this.close()
					}
				} else {
					this.$message.error(res.message)
					this.loading = false
					if (exit) {
						this.close()
					}
				}
				this.loadData()
			})
		},
		async loadData() {
			const { result } = await queryFullTreeMenuList()
			this.treeData = result.treeList
			this.allTreeKeys = result.ids
			const msg = await queryRolePermission({ roleId: this.roleId })

			let roleExistKeys = [...msg.result]
			this.checkedKeys = roleExistKeys.filter((value, index) => {
				if (this.allTreeKeys.includes(value)) {
					return value
				}
			})
			this.defaultCheckedKeys = roleExistKeys
			this.expandedKeysss = this.allTreeKeys
		},
	},
}
</script>
<style lang="less" scoped>
.drawer-bootom-button {
	position: absolute;
	bottom: 0;
	width: 100%;
	border-top: 1px solid #e8e8e8;
	padding: 10px 16px;
	text-align: right;
	left: 0;
	background: #fff;
	border-radius: 0 0 2px 2px;
}
</style>
