/**
 * Created by vanward on 2018/8/2.
 */
function Swiper(event, imgUrl, option) {
    if (event === null || imgUrl === null) {
        console.error('请传入ID元素');
        return;
    }
    this.event = event;
    this.imgUrl = imgUrl;
    this.option = option;
    this.timer = option.transitionTime || 800; // 过渡时间
    this.intervalTime = option.intervalTime || 800; // 切换间隔时间
    this.index = 1;// 轮播图位置
    this.animationMark = false; //防抖控制
    this.init();//初始化控件
}

Swiper.prototype.init = function () {
    // 设置总宽和每张图的宽
    let cssStr = `
    .swiper .swiper-list {width: ${(this.imgUrl.length + 2) * this.event.clientWidth}px;}
    .swiper .swiper-list .swiper-item {width:${this.event.clientWidth}px;}`
    let styleNode = document.createElement('style');
    styleNode.innerText = cssStr;
    document.head.appendChild(styleNode);
    var html = `<div class="swiper">
                <div class="swiper-list" style="left:-${this.event.clientWidth}px">`;

    // 添加显示图片区域
    // 无缝轮播，收尾多加一张
    let temStr = `<div class="swiper-item">
          <a href="${this.imgUrl[this.imgUrl.length - 1].linkHref === null ? "#" : this.imgUrl[this.imgUrl.length - 1].linkHref}"><img src="${this.imgUrl[this.imgUrl.length - 1].imgSrc}" alt="轮播图图片-pawn"></a>
        </div>`

    this.imgUrl.map(item => {
        temStr += `<div class="swiper-item">
                  <a href="${item.linkHref === null ? "#" : item.linkHref}"><img src="${item.imgSrc}" alt="轮播图图片-pawn"></a>
              </div>`
    })
    temStr += `<div class="swiper-item">
              <a href="${this.imgUrl[0].linkHref === null ? "#" : this.imgUrl[0].linkHref}"><img src="${this.imgUrl[0].imgSrc}" alt="轮播图图片-pawn"></a>
            </div>`
    html += temStr + "</div>";

    temStr = `<div class="swiper-tool">
              <div class="swiper-spot swiper-spot-active"></div>`;

    // 添加小圆点
    for (let i = 1, len = this.imgUrl.length; i < len; i++) {
        temStr += `<div class="swiper-spot"></div>`;
    }
    html += temStr + "</div>";

    temStr = `<div class="swiper-btn swiper-btn-left"><</div>
            <div class="swiper-btn swiper-btn-right">></div>`;

    html += temStr;

    this.event.innerHTML += html + "</div>";
    /* 生成的页面结构
     <div class="swiper">
     <div class="swiper-list" style="left:-546px">
     <div class="swiper-item">
     <a href="#"><img src="../" alt="轮播图图片-pawn"></a>
     </div><div class="swiper-item">
     <a href="#"><img src="../" alt="轮播图图片-pawn"></a>
     </div><div class="swiper-item">
     <a href="1"><img src="../" alt="轮播图图片-pawn"></a>
     </div><div class="swiper-item">
     <a href="#"><img src="../" alt="轮播图图片-pawn"></a>
     </div><div class="swiper-item">
     <a href="#"><img src="../" alt="轮播图图片-pawn"></a>
     </div>
     </div>
     <div class="swiper-tool">
     <div class="swiper-spot swiper-spot-active"></div>
     <div class="swiper-spot"></div>
     <div class="swiper-spot"></div>
     </div>
     <div class="swiper-btn swiper-btn-left"><</div>
     <div class="swiper-btn swiper-btn-right">></div>
     </div>
     */
    // 调用绑定事件
    this.bindEvent();
}

Swiper.prototype.bindEvent = function () {
    this.swiperList = this.event.getElementsByClassName('swiper-list')[0];//图片列表
    this.swiperTool = this.event.getElementsByClassName('swiper-tool')[0];//圆点
    this.swiperSpot = this.event.getElementsByClassName('swiper-spot');//圆点控件
    this.swiperBtnLeft = this.event.getElementsByClassName('swiper-btn-left')[0];
    this.swiperBtnRight = this.event.getElementsByClassName('swiper-btn-right')[0];

    // 开启自动轮播 -> 移动取消自动轮播 -> 松手重新开启轮播
    var timer = setInterval(autoPlay.bind(this), this.intervalTime);
    this.event.addEventListener("mouseover", () => {
        clearInterval(timer);
    });
    this.event.addEventListener("mouseout", () => {
        timer = setInterval(autoPlay.bind(this), this.intervalTime);
    });

    // 移动端手指滑动
    let stratPointX = 0;
    let offsetX = 0;
    this.event.addEventListener("touchstart", (e) => {
        clearInterval(timer);
        stratPointX = e.changedTouches[0].pageX;
        offsetX = this.swiperList.offsetLeft;
        this.animationMark = true;
    });
    this.event.addEventListener("touchmove", (e) => {
        let disX = e.changedTouches[0].pageX - stratPointX;
        let left = offsetX + disX;
        this.swiperList.style.transitionProperty = 'none';
        this.swiperList.style.left = left + 'px';
    });
    this.event.addEventListener("touchend", () => {
        let left = this.swiperList.offsetLeft;
        // 判断正在滚动的图片距离左右图片的远近，超过50%就变化
        this.index = Math.round(-left / this.event.clientWidth);
        this.animationMark = false;
        // 开启定时器
        timer = setInterval(autoPlay.bind(this), this.intervalTime);
        this.render();
    });

    // 左右按钮 事件监听
    this.swiperBtnLeft.addEventListener('click', () => {
        if (this.animationMark) return;
        this.index--;
        this.render();
    });
    this.swiperBtnRight.addEventListener('click', () => {
        if (this.animationMark) return;
        this.index++;
        console.error(this.index)
        this.render();
    });


    // 下面小圆点点击事件监听
    this.swiperTool.addEventListener('click', e => {
        let target = e.target;
        if (target.className !== "swiper-spot") return;
        this.spotClick(target);
    });


    // 播放
    function autoPlay() {
        if (this.animationMark) return;
        this.index++;
        this.render();
    }
};

// 渲染当前要显示的界面
Swiper.prototype.render = function () {
    if (this.animationMark) return;
    this.animationMark = true;
    this.swiperList.style.left = (-1) * this.event.clientWidth * this.index + 'px';
    this.swiperList.style.transition = 'left ' + this.timer / 1000 + 's';
    setTimeout(() => {
        if (this.index <= 0) {
            this.swiperList.style.transitionProperty = 'none';
            this.index = this.imgUrl.length;
            this.swiperList.style.left = (-1) * this.event.clientWidth * this.index + 'px';
        } else if (this.index > this.imgUrl.length) {
            this.swiperList.style.transitionProperty = 'none';
            this.index = 1;
            this.swiperList.style.left = (-1) * this.event.clientWidth * this.index + 'px';
        }
        this.animationMark = false;
    }, this.timer);

    this.renderSpot();
}

// renderSpot => 渲染最下面的小圆点
Swiper.prototype.renderSpot = function () {
    let flag = this.index;
    if (this.index <= 0) {
        flag = this.imgUrl.length;
    } else if (this.index > this.imgUrl.length) {
        flag = 1;
    }
    for (let i = 0, len = this.swiperSpot.length; i < len; i++) {
        if (i === (flag - 1)) {
            this.swiperSpot[i].className = "swiper-spot swiper-spot-active";
        } else {
            this.swiperSpot[i].className = "swiper-spot";
        }
    }
}

// 圆点点击事件
Swiper.prototype.spotClick = function (obj) {
    for (let i = 0, len = this.swiperSpot.length; i < len; i++) {
        if (this.swiperSpot[i] === obj) {
            this.index = i + 1;
            this.render();
            break;
        }
    }
}











