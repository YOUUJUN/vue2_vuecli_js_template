<template>
	<a-menu :style="style" class="contextmenu" v-show="visible" @click="handleClick">
		<a-menu-item :key="item.key" v-for="item in itemList">
			<a-icon role="menuitemicon" v-if="item.icon" :type="item.icon" />
			{{ item.text }}
		</a-menu-item>
	</a-menu>
</template>
<script>
export default {
	props: {
		visible: {
			type: Boolean,
			default: false,
			required: true,
		},

		/**
		 * [{ key: '', icon: '', text: '' },],
		 */
		itemList: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			left: 0,
			top: 0,
			target: null,
		}
	},

	computed: {
		style() {
			return {
				left: this.left + 'px',
				top: this.top + 'px',
			}
		},
	},

	created() {
		this.initEvent()
	},

	methods: {
		initEvent() {
			let openHandler = (e) => this.setPosition(e)
			let closeHandler = (e) => this.closeMenu(e)
			window.addEventListener('contextmenu', openHandler)
			window.addEventListener('mousedown', closeHandler)

			this.$once('hook:beforeDestory', () => {
				window.removeEventListener(openHandler)
				window.removeEventListener(closeHandler)
			})
		},

		setPosition(e) {
			this.left = e.clientX
			this.top = e.clientY
			this.target = e.target
		},

		closeMenu(e) {
			if (this.visible === true && ['menuitemicon', 'menuitem'].indexOf(e.target.getAttribute('role')) < 0) {
				this.$emit('update:visible', false)
			}
		},

		handleClick({ key }) {
			this.$emit('select', key, this.target)
			this.$emit('update:visible', false)
		},
	},
}
</script>
<style scoped>
.contextmenu {
	position: fixed;
	z-index: 1;
	border: 1px solid #9e9e9e;
	border-radius: 4px;
	box-shadow: 2px 2px 10px #aaaaaa !important;
	z-index: 9999;
}

::v-deep .ant-menu-item-selected {
	color: unset !important;
	background-color: unset !important;
}
</style>
