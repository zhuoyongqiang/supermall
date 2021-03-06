import BackTop from "components/content/backTop/BackTop";

export const backTopMixin = {
  components: {
    BackTop
  },
  data: function () {
    return {
      isShowBackTop: false
    }
  },
  methods: {
    backTop() {
      this.$refs.scroll.scrollTo(0,0,300)
    },
    listenShowBackTop(position) {
      this.isShowBackTop = (-position.y) >1000
    }
  }
}
