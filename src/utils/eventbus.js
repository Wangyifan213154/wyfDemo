import mitt from 'mitt'

const emitter = mitt()
// export const emitter1 = mitt(); 支持多个对象导出，但通常一个就可以
export default emitter
