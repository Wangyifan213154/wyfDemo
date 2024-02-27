import store from '@/store'
import {
	reactive,
	toRefs,
	ref,
	onUnmounted,
	onMounted,
	watch,
	getCurrentInstance
} from 'vue'
import { mawa } from '@/assets/czml/玛娃.js'

export default function () {

	const exEffectState = reactive([
		{
			name: '示例效果',
			icon: 'Paperclip',
			callback: '',
			actived: false,
			childList: [
				{
					name: '流云材质',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/距离量算.png'),
					callback: () => {
						window.sceneAction.environmentController.createCloudMaterial()
					},
					class: ''
				},
				{
					name: '电雪花材质',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/距离量算.png'),
					callback: () => {
						window.sceneAction.environmentController.createEMIMaterial()
					},
					class: ''
				},
				{
					name: '台风',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/距离量算.png'),
					callback: () => window.sceneAction.environmentController.loadTyphoon(mawa),
					class: ''
				},
			]
		},
	])
	return {
		exEffectState
	}
}