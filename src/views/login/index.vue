<template>
	<article class="root">
		<section class="body-wrap">
			<div class="inner-wrap">
				<div class="login-wrap">
					<main class="login-panel">
						<h2 class="log-title">社区综合服务平台</h2>

						<a-form :form="form" class="user-layout-login" ref="formLogin" id="formLogin">
							<a-form-item>
								<a-input
									size="large"
									v-decorator="['username', validatorRules.username]"
									type="text"
									placeholder="请输入帐户名"
								>
									<template slot="prefix">
										<img src="@/assets/images/login/user.png" class="input-icon" />
									</template>
								</a-input>
							</a-form-item>

							<a-form-item>
								<a-input
									v-decorator="['password', validatorRules.password]"
									size="large"
									type="password"
									autocomplete="false"
									placeholder="请输入密码"
								>
									<template slot="prefix">
										<img src="@/assets/images/login/lock.png" class="input-icon" />
									</template>
								</a-input>
							</a-form-item>

							<a-row :gutter="0">
								<a-col :span="16">
									<a-form-item>
										<a-input
											v-decorator="['inputCode', validatorRules.inputCode]"
											size="large"
											type="text"
											@change="inputCodeChange"
											placeholder="请输入验证码"
										>
											<template slot="prefix">
												<img src="@/assets/images/login/password.png" class="input-icon" />
											</template>
										</a-input>
									</a-form-item>
								</a-col>
								<a-col :span="8" style="text-align: right">
									<img
										v-if="requestCodeSuccess"
										style="margin-top: 2px"
										:src="randCodeImage"
										@click="handleChangeCheckCode"
									/>
									<img
										v-else
										style="margin-top: 2px"
										src="@/assets/images/login/checkcode.png"
										@click="handleChangeCheckCode"
									/>
								</a-col>
							</a-row>

							<a-form-item style="margin-top: 24px">
								<a-button
									size="large"
									type="primary"
									htmlType="submit"
									class="login-button"
									:loading="loginBtn"
									@click.stop.prevent="handleSubmit"
									:disabled="loginBtn"
								>
									登录
								</a-button>
							</a-form-item>
						</a-form>
					</main>
				</div>
			</div>
		</section>
	</article>
</template>

<script>
import { mapActions } from 'vuex'
import { UI_CACHE_DB_DICT_DATA } from '@/utils/root/local_storageKeys'
import ls, { removeToken } from '@/utils/ls_operation'
import { timeFix } from '@/utils/index'
import { getRandomImage, fetchUserPlatforms } from '@/api/user'
import { fetchDictData } from '@/api/system'

export default {
	data() {
		return {
			form: this.$form.createForm(this),

			validatorRules: {
				username: {
					rules: [{ required: true, message: '请输入用户名!' }],
				},
				password: { rules: [{ required: true, message: '请输入密码!', validator: 'click' }] },
				inputCode: { rules: [{ required: true, message: '请输入验证码!' }] },
			},

			//验证码图片
			randCodeImage: '',
			randCodeUid: '',

			//验证码
			inputCodeContent: '',
			requestCodeSuccess: false,

			//登录按钮加载
			loginBtn: false,
		}
	},

	created() {
		removeToken()
		this.getRouterData()
		this.handleChangeCheckCode()
	},

	methods: {
		...mapActions('user', ['Login', 'saveUserAccessiblePlatforms', 'selectUserPlatform']),
		...mapActions('seat_center', ['getSeatInfo']),

		handleSubmit() {
			let loginParams = {}
			this.loginBtn = true
			// 使用账户密码登录
			this.form.validateFields(
				['username', 'password', 'inputCode', 'rememberMe'],
				{ force: true },
				(err, values) => {
					if (!err) {
						loginParams.username = values.username
						loginParams.password = values.password
						loginParams.code = this.inputCodeContent
						loginParams.uuid = this.randCodeUid
						console.log('登录参数', loginParams)
						this.Login(loginParams)
							.then((res) => {
								this.loginSuccess(res)
							})
							.catch((err) => {
								this.requestFailed(err)
							})
					} else {
						this.loginBtn = false
					}
				},
			)
		},

		inputCodeChange(e) {
			this.inputCodeContent = e.target.value
		},

		handleChangeCheckCode() {
			getRandomImage({
				count: 4,
			})
				.then((res) => {
					console.log('res', res)
					const { success, result } = res
					if (success) {
						const { uuid, code } = result
						this.randCodeImage = code
						this.randCodeUid = uuid
						this.requestCodeSuccess = true
					} else {
						this.$message.error(res.message)
						this.requestCodeSuccess = false
					}
				})
				.catch(() => {
					this.requestCodeSuccess = false
				})
		},

		loginSuccess(response) {
			const { sysUserVO } = response.result
			console.log('sysUserVO', sysUserVO)

			const indexPath = window._CONFIG['indexURL']

			//获取用户所属平台列表
			fetchUserPlatforms()
				.then((res) => {
					console.log('res', res)
					const { success, result } = res
					if (success) {
						this.saveUserAccessiblePlatforms(result)

						if (result.length === 1) {
							const platformId = result[0].id
							this.selectUserPlatform(platformId).then((res) => {
								this.$router.push({ path: indexPath }).catch(() => {})
							})
						} else {
							this.$router.push({ path: indexPath }).catch(() => {})
						}

						this.$notification.success({
							message: '欢迎',
							description: `${timeFix()}，欢迎回来`,
						})

						//登录成功后，获取字典数据存储到ls
						fetchDictData().then((res) => {
							const { success, result } = res
							if (success) {
								ls.set(UI_CACHE_DB_DICT_DATA, result, 7 * 24 * 60 * 60 * 1000)
							}
						})
					}
				})
				.catch((err) => {
					console.error('err', err)
				})

			if (sysUserVO?.platformType === '2') {
				this.getSeatInfo({
					tenantId: sysUserVO?.tenantId,
				})
			}
		},

		requestFailed(err) {
			this.$message.error(err.message)
			this.loginBtn = false
		},

		getRouterData() {
			this.$nextTick(() => {
				if (this.$route.params.username) {
					this.form.setFieldsValue({
						username: this.$route.params.username,
					})
				}
			})
		},
	},
}
</script>

<style lang="less" scoped>
.root {
	position: relative;
	display: flex;
	height: 100vh;
	width: 100vw;

	.body-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-image: url('~@/assets/images/login/bg_back.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;

		.inner-wrap {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			width: 1370px;
			height: 800px;
			padding-right: 150px;
			background-image: url('~@/assets/images/login/bg_front.png');
			background-repeat: no-repeat;
			background-size: 100% 100%;

			.login-wrap {
				display: flex;
				width: 320px;

				.login-panel {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					padding: 10px 0;

					.log-title {
						font-size: 34px;
						color: #333333;
						margin-bottom: 25px;
						font-weight: bold;
						font-family: MicrosoftYaHei-Bold;
						text-align: center;
					}
				}
			}
		}
	}
}

.login-button {
	width: 100%;
}

.input-icon {
	width: auto;
	height: 20px;
}

::v-deep .login-panel .ant-input {
	border: none;
	border-bottom: 1px solid #d9d9d9;
	border-radius: unset;
	padding-left: 45px;
}
</style>
