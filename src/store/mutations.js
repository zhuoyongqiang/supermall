import {
  ADD_COUNTER,
  ADD_TO_CART
} from "./mutations_type";

export default {
  //mutations唯一的目的就是修改state中的状态
  //muations中的每个方法尽可能完成的事件比较单一一点
  [ADD_COUNTER](state,payload) {
    payload.count++
  },
  [ADD_TO_CART](state,payload) {
    payload.checked = true
    state.cartList.push(payload)
  }
  // state.cartList.push(payload)
  //payload新添加的商品
  // let oldProduct = null;
  // for (let item of state.cartList) {
  //   if (item.iid === payload.iid) {
  //     oldProduct = item;
  //   }
  // }
}
