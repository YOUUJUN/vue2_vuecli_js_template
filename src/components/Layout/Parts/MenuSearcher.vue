<template>
	<section class="seacher-wrap">
		<a-icon @click="ifSearch = !ifSearch" class="searcher-icon" type="search" />

		<component :is="componentTag">
			<a-select
				class="searcher-input"
				:class="{ 'searcher-input-hide': ifSearch }"
				showSearch
				:showArrow="false"
				placeholder="搜索菜单"
				optionFilterProp="children"
				:filterOption="filterOption"
				:getPopupContainer="(node) => node.parentNode"
				@change="searchMethods"
			>
				<a-select-option v-for="(site, index) in searchMenuOptions" :key="index" :value="site.id">
					{{ site.meta.title }}
				</a-select-option>
			</a-select>
		</component>
	</section>
</template>
<script>
import { asyncRouters } from '@/router/index'

import { mapGetters } from 'vuex'

export default {
	data() {
		return {
			searchMenuOptions: [],
			visible: false,
			ifSearch: true,
			componentTag: 'span',
		}
	},

	computed: {
		...mapGetters(['permissionList']),
	},

	created() {
		//生成菜单下拉列表项
		this.genMenuList()
	},

	methods: {
		genMenuList() {
			console.log('permissionList', this.permissionList)
			const renderList = [...this.permissionList, ...asyncRouters].flat(Infinity)
			let menuCache = []
			this.searchMenus(renderList, menuCache)
			this.searchMenuOptions = menuCache
			console.log('renderList', this.renderList)
		},

		searchMenus(menus, list = []) {
			for (let item of menus) {
				if (!item.hidden && item.component.trim() !== 'Layout/BlankLayout') {
					list.push(item)
				}
				if (item.children && item.children.length > 0) {
					this.searchMenus(item.children, list)
				}
			}
		},

		//模糊搜索
		filterOption(input, option) {
			return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
		},

		searchMethods(value) {
			let route = this.searchMenuOptions.filter((item) => item.id === value)[0]
			if (route.meta.internalOrExternal === true) {
				window.open(route.redirect, '_blank')
			} else {
				this.$router.push({ path: route.path }).catch(() => {})
			}
			this.visible = false
		},
	},
}
</script>
<style scoped>
.searcher-icon {
	color: #fff;
	padding: 10px;
	font-size: 18px;
	cursor: pointer;
	border-radius: 50%;
	margin-right: 4px;
	transition: all 0.3s;
}

.searcher-icon:hover {
	background: hsla(0, 0%, 100%, 0.3);
}

.searcher-input {
	width: 170px;
	opacity: 1;
	transition: all 0.3s;
}

.searcher-input-hide {
	width: 0 !important;
	opacity: 0;
}
</style>
