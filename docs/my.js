

window.onload = function(){

    // 文章目录隐藏过渡动画
    var elements = document.getElementsByClassName("toc-item toc-level-2");
    // console.log(elements);
    var cap_action = document.getElementsByClassName("cap-action");
    // console.log(cap_action);
    var catalog_status = 1;
    var arrHeight = [];

    Array.from(elements).forEach(element => {
        // var se = element.querySelector(".toc-link");
        var children = element.children;
        // console.log(children);
        if(children.length <= 1){
            return;
        }
        var height = children[1].offsetHeight;
        arrHeight.push(height);
        // console.log(arrHeight);
        children[0].href = 'javascript:void(0);';
        children[1].style.maxHeight = height+'px';

        // 过渡动画
        children[0].addEventListener('click', function() {
            // console.log(children[1].style.maxHeight);

            if (children[1].style.maxHeight != "0px") {
                children[1].setAttribute('style', 'max-height: 0px;');
            } else {
                children[1].style.maxHeight = height+'px';
                catalog_status = 1;
            }

        });

        // 关闭多级目录
        cap_action[0].onclick = function() {
            i = 0
            Array.from(elements).forEach(element => {
                var children = element.children;
                if(children.length <= 1){
                    return;
                }
                // console.log(children,arrHeight[i],arrHeight)
                if(catalog_status == 1){
                    children[1].setAttribute('style', 'max-height: 0px;');
                }else{
                    children[1].style.maxHeight = arrHeight[i]+'px';
                }
                i += 1;
            });
            catalog_status = catalog_status ? 0 : 1;
        };
        
    });



    // img引用网络图片资源无法加载问题解决
    var imgs = document.getElementsByTagName("img");
    document.getElementById('start').setAttribute('name', 'referrer');
    document.getElementById('start').setAttribute('content', 'never');;
    Array.from(imgs).forEach(img => {
        img.setAttribute('referrerpolicy', 'no-referrer');
    });



    // url #锚点效果
    const hostUrl = window.location.href.split("#")[0]
    console.log(hostUrl);
    function rederString(s){
        location.replace(hostUrl + "#" + s);
    }
    let animationText = "Hello_World!!";
    let animationIndex = 0;
    function getAnimationString(){
        let resultText = animationText.substring(0, animationIndex) + "*" + animationText.substring(animationIndex+1);
        animationIndex = (animationIndex > animationText.length-2) ? 0 : animationIndex + 1;
        return resultText;
    }
    const updateTimeSecond = 0.2;
    function update(){
        rederString(getAnimationString());
        setTimeout(()=>{
            requestAnimationFrame(update);
        },updateTimeSecond*1000)
    }
    update();

}

