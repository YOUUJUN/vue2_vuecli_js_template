<template>
	<a-layout class="root-wrap">
		<a-layout-header class="header-wrap">
			<nav-bar></nav-bar>
		</a-layout-header>
		<a-layout class="main-wrap">
			<a-layout-sider
				class="aside-wrap"
				theme="light"
				v-model="sidebar.opened"
				collapsible
				@collapse="toggleClick"
				:width="sidebar.width"
			>
				<side-bar></side-bar>
			</a-layout-sider>
			<a-layout-content class="content-wrap">
				<section class="content">
					<div class="inner-wrap">
						<tabs-view></tabs-view>
					</div>
				</section>
				<a-layout-footer class="foot-wrap">
					Copyright
					<a-icon type="copyright" />
					2022
					<span>合肥泛米智能科技有限公司</span>
				</a-layout-footer>
			</a-layout-content>
		</a-layout>
	</a-layout>
</template>

<script>
const SideBar = () => import('./Parts/SideBar.vue')
const NavBar = () => import('./Parts/NavBar.vue')

const TabsView = () => import('./TabsView.vue')

import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'Layout',

	components: {
		SideBar,
		NavBar,

		TabsView,
	},

	data() {
		return {}
	},

	computed: {
		...mapGetters(['sidebar']),
	},

	methods: {
		...mapActions('display', ['toggleSideBar']),

		toggleClick(collapsed) {
			this.toggleSideBar(collapsed)
		},
	},
}
</script>

<style scoped>
.root-wrap {
	display: flex;
	height: 100%;
}

.header-wrap {
	flex: none;
	height: 6rem;
	line-height: 6rem;
	padding: 0;
	background: #1890ff;
}

.main-wrap {
	flex: auto;
}

.aside-wrap {
	overflow: auto;
	border-right: 0.01rem solid #e8e8e8;
	overflow-x: hidden;
	margin-bottom: 48px;
}

.content-wrap {
	display: flex;
	flex-direction: column;
}

.content {
	position: relative;
	flex: auto;
}

.inner-wrap {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	overflow: auto;
	overflow-x: hidden;
}

.foot-wrap {
	flex: none;
	text-align: center;
	padding: 0 0 1rem 0;
	color: rgba(0, 0, 0, 0.45);
	font-size: 14px;
}
</style>
