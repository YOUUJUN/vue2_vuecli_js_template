<template>
	<section class="tabs-view-shell">
		<a-tabs
			@contextmenu.native="handleContextMenuEvent"
			:active-key="activePage"
			class="tab-layout-tabs"
			:hide-add="true"
			type="editable-card"
			@change="handleTabChange"
			@tabClick="handleTabClick"
			@edit="handleEdit"
			:style="{ left: sidebar.width + 'px' }"
		>
			<a-tab-pane
				:id="page.fullPath"
				:key="page.fullPath"
				v-for="page in pageList"
				:closable="!($useChain(page)['fullPath'] == indexKey)"
			>
				<span slot="tab" :pagekey="page.fullPath">{{ $useChain(page)['meta?.title'] }}</span>
			</a-tab-pane>
		</a-tabs>

		<div class="tabs-view-content">
			<page-transition>
				<keep-alive v-if="$route.meta.keepAlive">
					<router-view v-if="reloadFlag"></router-view>
				</keep-alive>

				<template v-else>
					<router-view v-if="reloadFlag"></router-view>
				</template>
			</page-transition>
		</div>

		<context-menu :visible.sync="visible" :itemList="menuItemList" @select="onMenuSelect"></context-menu>
	</section>
</template>

<script>
const ContextMenu = () => import('@/components/Menu/ContextMenu.vue')
const PageTransition = () => import('@/components/Transition/PageTransition')
import { mapGetters } from 'vuex'

export default {
	name: 'TabLayout',
	components: {
		PageTransition,
		ContextMenu,
	},

	data() {
		//首页path
		this.indexKey = window._CONFIG['indexURL'].trim()

		return {
			pageList: [],
			linkList: [],
			activePage: '',

			//显示隐藏右键菜单
			visible: false,
			//右键菜单列表项
			menuItemList: [
				{ key: '4', icon: 'reload', text: '刷 新' },
				{ key: '1', icon: 'arrow-left', text: '关闭左侧' },
				{ key: '2', icon: 'arrow-right', text: '关闭右侧' },
				{ key: '3', icon: 'close', text: '关闭其它' },
			],

			//刷新标识
			reloadFlag: true,
		}
	},

	computed: {
		...mapGetters(['sidebar']),
	},

	watch: {
		$route: {
			handler(newRoute) {
				this.handleRouteChange(newRoute)
			},
		},

		activePage: {
			handler(key) {
				let gotoRoute = this.pageList.find((page) => {
					return page.fullPath === key
				})

				if (gotoRoute && gotoRoute.fullPath !== this.$route.fullPath) {
					this.$router
						.push({
							path: gotoRoute.fullPath,
						})
						.catch((err) => {})
				}
			},
		},
	},

	created() {
		console.log('this.$route.path', this.$route.path, this.indexKey)
		if (this.$route.path !== this.indexKey) {
			this.setIndexAsFirst()
		}
		this.initData()
	},

	methods: {
		//初始化tab栏
		initData() {
			let currentRoute = Object.assign({}, this.$route)
			currentRoute.meta = Object.assign({}, currentRoute.meta)

			this.pageList.push(currentRoute)
			this.linkList.push(currentRoute.fullPath)
			this.activePage = currentRoute.fullPath
		},

		//监听路由刷新
		handleRouteChange(newRoute) {
			let newPath = newRoute.fullPath
			this.activePage = newPath

			//判断新路由是否为首页
			if (newPath === this.indexKey) {
				if (!newRoute?.meta?.keepAlive) {
					this.reloadRoute()
				}
			} else {
				if (this.linkList.includes(newPath)) {
					let oldRouteIndex = this.pageList.findIndex((page) => {
						return page.fullPath === newPath
					})
					let oldRoute = this.pageList[oldRouteIndex]
					this.pageList.splice(
						oldRouteIndex,
						1,
						Object.assign({}, newRoute, {
							meta: oldRoute.meta,
						}),
					)
				} else {
					this.pageList.push(Object.assign({}, newRoute))
					this.linkList.push(newPath)
				}
			}

			console.log('pageList', this.pageList)
		},

		//设置首页为第一个tab栏
		setIndexAsFirst() {
			this.pageList.splice(0, 0, {
				name: 'Index',
				path: this.indexKey,
				fullPath: this.indexKey,
				meta: {
					title: '首页',
				},
			})
			this.linkList.splice(0, 0, this.indexKey)
		},

		//监听tab页改变
		handleTabChange(key) {
			this.activePage = key
		},

		//监听tab编辑
		handleEdit(targetKey, action) {
			if (action === 'remove') {
				this.handleTabRemove(targetKey)
			}
		},

		//处理关闭tab
		handleTabRemove(key) {
			if (key === this.indexKey) {
				this.$message.warning('首页不能关闭!')
				return
			}

			if (this.pageList.length === 1) {
				this.$message.warning('这是最后一页，不能再关闭了啦')
				return
			}

			let removeIndex = this.linkList.findIndex((link) => link === key)
			this.pageList = this.pageList.filter((page) => page.fullPath !== key)
			this.linkList = this.linkList.filter((link) => link !== key)
			let nextIndex = removeIndex >= this.linkList.length ? this.linkList.length - 1 : removeIndex
			this.activePage = this.linkList[nextIndex]
		},

		//监听tab点击事件
		handleTabClick() {},

		//刷新路由
		reloadRoute() {},

		//监听windows 鼠标右击事件
		handleContextMenuEvent(event) {
			const target = event.target
			const pagekey = this.getPageKey(target)
			if (pagekey !== null) {
				event.preventDefault()
				this.visible = true
			}
		},

		getPageKey(target, depth) {
			depth = depth || 0
			if (depth > 2) {
				return null
			}
			let pageKey = target.getAttribute('pagekey')
			pageKey =
				pageKey ||
				(target.previousElementSibling ? target.previousElementSibling.getAttribute('pagekey') : null)
			return pageKey || (target.firstElementChild ? this.getPageKey(target.firstElementChild, ++depth) : null)
		},

		//处理右键菜单点击事件
		onMenuSelect(key, target) {
			let pageKey = this.getPageKey(target)
			switch (key) {
				case '1':
					this.closeLeft(pageKey)
					break
				case '2':
					this.closeRight(pageKey)
					break
				case '3':
					this.closeOthers(pageKey)
					break
				case '4':
					this.routeReload()
					break
				default:
					break
			}
		},

		//关闭左侧菜单
		closeLeft(pageKey) {
			if (pageKey === this.indexKey) {
				return
			}
			let tempList = [...this.pageList]
			let indexContent = tempList.slice(0, 1)[0]
			let index = this.linkList.indexOf(pageKey)
			this.linkList = this.linkList.slice(index)
			this.pageList = this.pageList.slice(index)
			this.linkList.unshift(indexContent.fullPath)
			this.pageList.unshift(indexContent)
			if (this.linkList.indexOf(this.activePage) < 0) {
				this.activePage = this.linkList[0]
			}
		},

		//关闭右侧菜单
		closeRight(pageKey) {
			let index = this.linkList.indexOf(pageKey)
			this.linkList = this.linkList.slice(0, index + 1)
			this.pageList = this.pageList.slice(0, index + 1)
			if (this.linkList.indexOf(this.activePage < 0)) {
				this.activePage = this.linkList[this.linkList.length - 1]
			}
		},

		//关闭其他菜单
		closeOthers(pageKey) {
			let index = this.linkList.indexOf(pageKey)
			if (pageKey == this.indexKey) {
				this.linkList = this.linkList.slice(index, index + 1)
				this.pageList = this.pageList.slice(index, index + 1)
				this.activePage = this.linkList[0]
			} else {
				let indexContent = this.pageList.slice(0, 1)[0]
				this.linkList = this.linkList.slice(index, index + 1)
				this.pageList = this.pageList.slice(index, index + 1)
				this.linkList.unshift(indexContent.fullPath)
				this.pageList.unshift(indexContent)
				this.activePage = this.linkList[1]
			}
		},

		//刷新单页组件
		routeReload() {
			this.reloadFlag = false
			this.$nextTick(() => {
				this.reloadFlag = true
			})
		},
	},
}
</script>

<style>
.tab-layout-tabs .ant-tabs-bar {
	margin: 1rem 2.4rem 0;
	border-bottom: 1px solid transparent;
}
</style>

<style scoped>
.tabs-view-shell {
	height: 100%;
	overflow: hidden;
	padding: 5rem 2.4rem 1rem;
}

.tab-layout-tabs {
	position: fixed;
	top: 6rem;
	right: 0;
	left: 24rem;
	background: #f0f2f5;
	opacity: 1;
	z-index: 3;
	transition: all 0.2s;
}

.tabs-view-content {
	position: relative;
	height: 100%;
	border-radius: 0.4rem;
	overflow: auto;
	box-shadow: -0.1rem -0.1rem 0.5rem 0 rgba(0, 0, 0, 0.1);
	background: #fff;
}
</style>
