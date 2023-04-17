<template>
	<div class="header">
		<section class="start">
			<img class="logo" src="@/assets/images/logo.png" @click="goHome" />
		</section>

		<section class="center">
			<div class="bread-wrap">
				<hamburger :is-active="!sidebar.opened" @toggleClick="toggleClick"></hamburger>
			</div>

			<div class="ctrl-wrap">
				<span class="welcome">欢迎进入{{ platTitle }}</span>
			</div>
		</section>

		<section class="end">
			<div class="search-wrap">
				<menu-searcher></menu-searcher>
			</div>
			<div class="avatar-wrap">
				<header-avatar></header-avatar>
			</div>
		</section>
	</div>
</template>

<script>
const hamburger = () => import('@/components/Hamburger/index.vue')

import { mapGetters, mapActions } from 'vuex'
import HeaderAvatar from './HeaderAvatar.vue'
import MenuSearcher from './MenuSearcher.vue'

export default {
	name: 'NavBar',

	components: {
		hamburger,
		HeaderAvatar,
		MenuSearcher,
	},

	data() {
		//首页path
		this.indexKey = window._CONFIG['indexURL'].trim()
		return {
			visible: false,
		}
	},

	computed: {
		...mapGetters(['sidebar', 'userInfo']),

		platTitle() {
			const obj = {
				1: '监管平台中心系统',
				2: '运营平台中心系统',
				3: '服务平台中心系统',
			}

			return obj[this.userInfo.platformType]
		},
	},

	methods: {
		...mapActions('display', ['toggleSideBar']),

		...mapActions('user', ['Logout']),

		toggleClick() {
			this.toggleSideBar()
		},

		handleMenuClick(e) {
			if (e.key === '1') {
				this.handleLogOut()
				this.visible = false
			}
		},

		//处理退出登录
		async handleLogOut() {
			await this.Logout()
			this.$router.push({ path: '/user/login' })
		},

		//返回首页
		goHome() {
			this.$router.push({
				path: this.indexKey,
			})
		},
	},
}
</script>

<style></style>

<style scoped>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	line-height: 100%;
	border-bottom: 0.1rem solid #f5f5f5;
	box-sizing: border-box;
}

.header .start,
.header .center,
.header .end {
	display: inline-flex;
	height: 100%;
}

.start {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 24rem;
	flex: none;
}

.start .logo {
	width: auto;
	height: 70%;
	cursor: pointer;
}

.start .logo-text {
	font-family: '微软雅黑';
	font-weight: 400;
	font-size: 1.8rem;
	color: #979797;
	margin-left: 1rem;
}

.center {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex: auto;
	margin-left: 1.4rem;
	margin-right: 0;
	min-width: 0;
}

.bread-wrap {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.bread-nav {
	margin-left: 1.5rem;
}

.ctrl-wrap {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 100%;
	overflow: hidden;
}

.ctrl-wrap .welcome {
	margin-left: 1.4rem;
	color: #fff;
	font-size: 1.4rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	line-height: 1;
}

.end {
	flex: none;
	margin-left: 1.5rem;
	margin-right: 1.8rem;
}

.search-wrap {
	display: inline-flex;
	height: 100%;
	line-height: 100%;
	margin: 0 10px;
	align-items: center;
}

.avatar-wrap {
	display: inline-flex;
	height: 100%;
	line-height: 100%;
	align-items: center;
	cursor: pointer;
}
</style>
