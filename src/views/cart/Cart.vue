<template>
  <div class="cart">
    <!--导航-->
    <nav-bar class="nav-bar">
        <div slot="center">购物车({{cartLength}})</div>
    </nav-bar>

    <!--商品列表-->
    <cart-list/>

    <!--底部汇总-->
    <cart-bottom-bar class="bottom"/>
  </div>
</template>

<script>
  import NavBar from 'components/common/navbar/NavBar';
  import CartList from "./childComps/CartList";
  import CartBottomBar from "./childComps/CartBottomBar";

  import { mapGetters } from 'vuex';
  export default {
    name: "Cart",
    components: {
      NavBar,
      CartList,
      CartBottomBar
    },
    computed: {
      //两种语法
      ...mapGetters(['cartLength'])
    }
  }
</script>

<style scoped>
  .bottom {
    position: fixed;
    bottom: 50px;
    left: 0;
    right: 0;
  }
  .nav-bar {
    background-color: var(--color-tint);
    color: #fff;
    /*font-weight: 700;*/
  }
</style>
