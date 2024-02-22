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
import { geoMeasure, geoAnalysis, rangeViewer, geoSlope } from '@/utils/analysis/hooks/index'

export default function () {
	const { drawPolyline, drawRectangle, measureAreaSpace } = geoMeasure()
	const { visibilityAnalysis } = geoAnalysis()
	const { VisibilityArange } = rangeViewer()
	const { createNew4Distance, createNew4Num } = geoSlope()

	const geoAnalysisState = reactive([
		{
			name: '空间分析',
			icon: 'Paperclip',
			callback: '',
			actived: false,
			childList: [
				{
					name: '距离量算',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/距离量算.png'),
					callback: drawPolyline,
					class: ''
				},
				{
					name: '面积量算',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/面积量算.png'),
					callback: measureAreaSpace,
					class: ''
				},
				{
					name: '通视分析',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/通视分析.png'),
					callback: visibilityAnalysis,
					class: ''
				},
				{
					name: '可视域分析',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/可视域.png'),
					callback: VisibilityArange,
					class: ''
				},
				{
					name: '坡度坡向分析',
					icon: '',
					img: require('@/assets/image/数据中台缩略图/坡度坡向分析.png'),
					callback: createNew4Num,
					class: ''
				},
			]
		},
	])
	return {
		geoAnalysisState
	}
}