<template>
	<article class="root">
		<header class="head">
			<section class="head-start">
				<figure class="head-logo">
					<img src="~@/assets/images/logo.png" />
				</figure>

				<div class="head-split"></div>

				<h2 class="head-title">社区综合服务平台</h2>
			</section>

			<section class="head-end">
				<a-button class="exit" @click="logout">
					退出登录
					<img src="~@/assets/images/platform/exit.png" />
				</a-button>
			</section>
		</header>

		<main class="body">
			<section class="platform-container" :class="{ fixOrder: accessiblePlatforms.length > 5 }">
				<p class="blank-title" v-if="accessiblePlatforms.length === 0">当前账户下暂无可用角色权限</p>
				<div
					v-else
					class="platform-item"
					v-for="(item, index) of accessiblePlatforms"
					:key="index"
					@click="enterPlatform(item.id)"
				>
					<figure class="platform-logo">
						<img :src="getPlatformLogo(item.name)" />
						<figcaption>{{ item.name }}</figcaption>
					</figure>
				</div>
			</section>
		</main>

		<footer class="foot"></footer>
	</article>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

function getPlatformLogo(name) {
	const logoUrl = {
		社区服务平台: require('@/assets/images/platform/community.png'),
		系统管理: require('@/assets/images/platform/setting.png'),
	}

	if (logoUrl[name]) {
		return `${logoUrl[name]}`
	} else {
		return ''
	}
}

export default {
	data() {
		return {}
	},

	computed: {
		...mapGetters(['accessiblePlatforms']),
	},

	created() {
		console.log('accessiblePlatforms', this.accessiblePlatforms)
	},

	methods: {
		getPlatformLogo,
		...mapActions('user', ['setToken', 'selectUserPlatform', 'Logout']),

		enterPlatform(platformId) {
			const indexPath = window._CONFIG['indexURL']
			this.selectUserPlatform(platformId).then((res) => {
				this.$router.push({ path: indexPath }).catch(() => {})
			})
		},

		logout() {
			this.Logout()
		},
	},
}
</script>
<style lang="less" scoped>
.root {
	display: flex;
	height: 100%;
	flex-direction: column;
	.head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex: none;
		height: 6rem;
		color: #fff;
		background: #303c54;
		padding: 0 2rem;

		.head-start {
			display: flex;
			align-items: center;
			height: 100%;
			.head-logo {
				height: 60%;
				margin: 0;
				img {
					height: 100%;
					width: auto;
				}
			}

			.head-split {
				height: 60%;
				width: 0.2rem;
				background: #fafafa;
				margin: 0 20px;
			}

			.head-title {
				color: #fff;
				font-size: 1.9rem;
				margin: 0;
			}
		}

		.head-end {
			display: flex;
			align-items: center;

			.exit {
				background: none;
				border: none;
				color: #fff;
				font-size: 1.6rem;

				img {
					width: 2.3rem;
					vertical-align: bottom;
					margin-left: 0.8rem;
				}
			}
		}
	}

	.body {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: auto;
		background: #3c4b64;
		height: 100%;

		// .platform-container {
		// 	display: grid;
		// 	grid-template-columns: repeat(5, 1fr);
		// 	row-gap: 3rem;
		// 	justify-content: space-around;
		// 	width: 110rem;
		// 	margin: 6rem auto 0;

		// 	.platform-item {
		// 		justify-self: center;
		// 		align-self: center;
		// 		text-align: center;
		// 		font-size: 16px;
		// 		color: #fff;
		// 		cursor: pointer;
		// 		border: 1px solid transparent;

		// 		:active {
		// 			box-shadow: 2px 2px 5px #1890ff;
		// 		}

		// 		figcaption {
		// 			margin-top: 0.6rem;
		// 		}
		// 	}
		// }

		.platform-container {
			display: flex;
			justify-content: center;
			align-items: center;
			align-content: flex-start;
			width: 110rem;
			margin: 0 auto;
			column-gap: 120px;
			row-gap: 20px;
			flex-wrap: wrap;

			.platform-item {
				text-align: center;
				font-size: 16px;
				color: #fff;
				cursor: pointer;
				border: 1px solid transparent;

				:active {
					box-shadow: 2px 2px 5px #1890ff;
				}

				figcaption {
					margin-top: 0.6rem;
				}
			}

			.blank-title {
				font-size: 2.4rem;
				color: #fafafa;
				letter-spacing: 0.12rem;
			}
		}
	}

	.fixOrder {
		justify-content: flex-start !important;
	}
}
</style>
