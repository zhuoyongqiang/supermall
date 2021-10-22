<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
        <detail-swiper :top-images="topImages"></detail-swiper>
        <detail-base-info :goods="goods"></detail-base-info>
        <detail-shop-info :shop="shop"></detail-shop-info>
        <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"></detail-goods-info>
        <detail-param-info ref="params" :param-info="paramInfo"></detail-param-info>
        <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
        <goods-list ref="recommends" :goods="recommends"></goods-list>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
    <toast/>
  </div>
</template>

<script>
  import DetailNavBar from "./childComps/DetailNavBar";
  import DetailSwiper from "./childComps/DetailSwiper";
  import DetailBaseInfo from "./childComps/DetailBaseInfo";
  import DetailShopInfo from "./childComps/DetailShopInfo";
  import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
  import DetailParamInfo from "./childComps/DetailParamInfo";
  import DetailCommentInfo from "./childComps/DetailCommentInfo";
  import DetailBottomBar from "./childComps/DetailBottomBar";

  import Scroll from "components/common/scroll/Scroll";
  import GoodsList from "components/content/goods/GoodsList";
  import Toast from "components/common/toast/Toast";

  import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail";
  import {debounce} from "common/utils";
  import {backTopMixin} from "common/mixin";
  import BackTop from "../../components/content/backTop/BackTop";

  import { mapActions } from 'vuex'

  export default {
    name: "Detail",
    components: {
      BackTop,
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,
      Scroll,
      GoodsList,
      Toast
    },
    mixins: [backTopMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopYS: [],
        // getThemeTopy: null,
        currentIndex: 0
      }
    },
    created() {
      // console.log(this.$route.params.iid)
      //1.保存传入的iid
      this.iid = this.$route.params.iid

      //2.根据iid请求详细数据
      getDetail(this.iid).then(res => {
        //1.获取顶部的图片轮播数据
        // console.log(res)
        const data = res.result
        this.topImages = data.itemInfo.topImages

        //2.获取商品信息
        this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

        //3.创建店铺信息的对象
        this.shop = new Shop(data.shopInfo)

        //4.保存商品的详情数据
        this.detailInfo = data.detailInfo;

        //5.获取参数的信息
        this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)

        //7.获取评论的信息
        if (data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }

        this.getThemeTopy = debounce(()=>{
          this.$nextTick(() => {
            //获取不同组件的offsetTop
            this.themeTopYS = [];
            this.themeTopYS.push(0);
            this.themeTopYS.push(this.$refs.params.$el.offsetTop);
            this.themeTopYS.push(this.$refs.comment.$el.offsetTop);
            this.themeTopYS.push(this.$refs.recommends.$el.offsetTop);
            this.themeTopYS.push(Number.MAX_VALUE)
            console.log(this.themeTopYS);
          });
        },100)
      })

      //3.请求推荐数据
      getRecommend().then(res => {
        console.log(res)
        this.recommends = res.data.list
      })

      //4.给getThemeTopY赋值（对给this.themeTopYS赋值的操作进行防抖）
      // this.getThemeTopy = debounce(()=>{
      //       //获取不同组件的offsetTop
      // this.themeTopYS = [];
      // this.themeTopYS.push(0);
      // this.themeTopYS.push(this.$refs.params.$el.offsetTop);
      // this.themeTopYS.push(this.$refs.comment.$el.offsetTop);
      // this.themeTopYS.push(this.$refs.recommends.$el.offsetTop);
      // console.log(this.themeTopYS);
      // },100)
    },
    updated() {
      this.getThemeTopy()
    },
    methods: {
      ...mapActions(['addCart']),
      imageLoad() {
        this.$refs.scroll.refresh()
        this.getThemeTopy()
      },
      //点击导航栏跳转相应的页面
      titleClick(index) {
        // console.log(this.themeTopYS[index])
        this.$refs.scroll.scrollTo(0, -this.themeTopYS[index], 200)
      },
      contentScroll(position) {
      //   //1.获取y值
        const positionY = -position.y

        //2.positionY和主题中的值进行对比
        let length = this.themeTopYS.length

        //一、通过增加最大数，减少判断条件
        for (let i = 0; i<length-1; i++) {
          if (this.currentIndex !== i && (positionY >= this.themeTopYS[i] && positionY < this.themeTopYS[i + 1])) {
            this.currentIndex = i;
            this.$refs.nav.currentIndex = this.currentIndex
          }
        }

        //二、复杂的条件判断
        // for (let i = 0; i<length; i++) {
        //   if ((this.currentIndex !== i) && ((i<length -1 && positionY >= this.themeTopYS[i] && positionY < this.themeTopYS[i+1])
        //     || (i === length-1 && positionY >= this.themeTopYS[i]))) {
        //     this.currentIndex = i;
        //     this.$refs.nav.currentIndex = this.currentIndex
        //     // console.log(this.currentIndex)
        //   }
        // }
        //抽取混入
        this.listenShowBackTop(position)
      },
      addToCart() {
        //1.获取购物车需要展示的信息
        const product = {}
        product.image = this.topImages[0]
        product.title = this.goods.title
        product.desc = this.goods.desc
        product.price = this.goods.realPrice
        product.iid = this.iid

        //2.将商品添加到购物车里(1.Promise 2.mapActions)
        // this.$store.cartList.push(product)
        // this.$store.commit('addCart',product)
        this.addCart(product).then(res => {
          console.log(res)
          this.$toast.show(res,1500)
        })



        // this.$store.dispatch('addCart',product).then(res => {
        //   console.log(res)
        // })
      }
    },
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 1;
    background-color: #ffffff;
    height: 100vh;
  }
  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #eeeeee;
  }
  .content {
    overflow: hidden;
    background-color: #ffffff;
    height: calc(100% - 44px - 49px);
  }
</style>
