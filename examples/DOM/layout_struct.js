//动态添加jquery
var __ohead__ = document.getElementsByTagName('head').item(0);
var __oscript__= document.createElement("script");
__oscript__.type = "text/javascript";
__oscript__.src = "./jquery-1.11.2.js";
__ohead__.appendChild( __oscript__);

/*
 *****************************************************
 *****************************************************
 *****************************************************
 */
// @by zhuangjian EVFL表达式解析

var AutoLayout = window.AutoLayout;

/**
 * Set the absolute size and position for a DOM element.
 *
 * The DOM element must have the following CSS styles applied to it:
 * - position: absolute;
 * - padding: 0;
 * - margin: 0;
 *
 * @param {Element} elm DOM element.
 * @param {Number} left left position.
 * @param {Number} top top position.
 * @param {Number} width width.
 * @param {Number} height height.
 */
var transformAttr = ('transform' in document.documentElement.style) ? 'transform' : undefined;
transformAttr = transformAttr || (('-webkit-transform' in document.documentElement.style) ? '-webkit-transform' : 'undefined');
transformAttr = transformAttr || (('-moz-transform' in document.documentElement.style) ? '-moz-transform' : 'undefined');
transformAttr = transformAttr || (('-ms-transform' in document.documentElement.style) ? '-ms-transform' : 'undefined');
transformAttr = transformAttr || (('-o-transform' in document.documentElement.style) ? '-o-transform' : 'undefined');
function setAbsoluteSizeAndPosition(elm, left, top, width, height) {
    try {
        /*
        elm.setAttribute('style',
            'position: absolute; ' +
            'padding: 0px; margin: 0px; ' +
            'width: ' + width + 'px; height: ' + height + 'px; ' +
            transformAttr + ': translate3d(' + left + 'px, ' + top + 'px, 0px);');
        */
        //保留原有样式
        elm.style.setProperty('position', 'absolute', 'important');
        elm.style.setProperty('padding', '0px', 'important');
        elm.style.setProperty('margin', '0px', 'important');
        elm.style.setProperty('width', width +'px', 'important');
        elm.style.setProperty('height', height+'px', 'important');
        elm.style.setProperty(transformAttr, 'translate3d(' + left + 'px, ' + top + 'px, 0px)', 'important');
        var borderLeftWidth = getStyle(elm,"borderLeftWidth");
        var borderTopWidth = getStyle(elm,"borderTopWidth");
        var borderRightWidth = getStyle(elm,"borderRightWidth");
        var borderBottomWidth = getStyle(elm,"borderBottomWidth");
        elm.style.setProperty('border-left-width', borderLeftWidth, 'important');
        elm.style.setProperty('border-top-width', borderTopWidth, 'important');
        elm.style.setProperty('border-right-width', borderRightWidth, 'important');
        elm.style.setProperty('border-bottom-width', borderBottomWidth, 'important');
    } catch (e) {
        //console.log(e.name + ": " + e.message);
    }
}

/**
 * Lays out the child elements of a parent element absolutely
 * using the visual format language.
 *
 * When the window is resized, the AutoLayout view is re-evaluated
 * and the child elements are resized and repositioned.
 *
 * @param {Element} parentElm Parent DOM element
 * @param {String|Array} visualFormat One or more visual format strings
 */
function autoLayout(parentElm, visualFormat) {
    var view = new AutoLayout.View();
    view.addConstraints(AutoLayout.VisualFormat.parse(visualFormat, {extended: true}));
    var elements = {};
    for (var key in view.subViews) {
        var elm = document.getElementById(key);
        if (elm) {
            //elm.className += elm.className ? ' abs' : 'abs';
            elements[key] = elm;
        }
    }
    var updateLayout = function() {
        //view.setSize(parentElm ? parentElm.clientWidth : window.innerWidth, parentElm ? parentElm.clientHeight : window.innerHeight);
        view.setSize(
                parentElm ? parentElm.clientWidth : document.documentElement.scrollWidth,
                parentElm ? parentElm.clientHeight : document.documentElement.scrollHeight);
        for (key in view.subViews) {
            var subView = view.subViews[key];
            if (elements[key]) {
                setAbsoluteSizeAndPosition(elements[key], subView.left, subView.top, subView.width, subView.height);
            }
        }
    };
    window.addEventListener('resize', updateLayout);
    updateLayout();
    return updateLayout;
}

//获取非内嵌式css
//element.style获取的是内嵌式的style，如果不是内嵌式，则是一个空对象
function getStyle(element, attr){
    if(!element) return 0;
    if(element.style && element.style[attr]){//直接在元素上写style
        return element.style[attr];
    }else if(element.currentStyle){ //IE
        return element.currentStyle[attr];
    }else{ //低版本IE不支持
        return window.getComputedStyle(element,null)[attr];
    }
}

/*
 *****************************************************
 *****************************************************
 *****************************************************
 */
// @by zhuangjian 定义结构体，构造EVFL表达式

//布局格式
var __Arrangement = {
    ROW : "row",
    COLUMN : "column"
}

/**
 *  id : 视图的id
    width : 宽度，若指定该值，等同于指定实际被分配的宽度，即包含视图本身的间隔但不包含父视图的间隔
    height : 高度，若指定该值，等同于指定实际被分配的高度，即包含视图本身的间隔但不包含父视图的间隔
    rows : 该视图包含的所有行视图，子视图为行排列时设置
    rowsNum : 该视图包含的所有行视图数目
    rowsSpace : 该视图所有行视图的间距。
        若当前为行排列，rowsSpace 的数目为 rows 的数目加 1，
        当数目为 1，代表所有间距是相等的
        叶子视图会计算rowsSpace和colsSpace
        非叶子视图为列排列时，设置rowsSpace等同于设置left和right
    cols : 该视图包含的所有列视图，子视图为列排列时设置
    colsNum : 该视图包含的所有列视图数目
    colsSpace : 该视图所有列视图的间距。
        若当前为列排列，colsSpace 的数目为 cols 的数目加 1，
        当数目为 1，代表所有间距是相等的
        叶子视图会计算rowsSpace和colsSpace
        非叶子视图为行排列时，设置colsSpace等同于设置top和bottom
    index : 当前视图在父视图的排位，由 0 开始
    parent : 当前视图的父视图
    arrangement : 当前视图的排列方式，行排列还是列排列
    missAdaptIgnore : 当当前视图缺失时，兄弟视图默认按比例扩充。
        此处是兄弟视图id数组，数组内的id代表该视图被忽略
    actualWidth : 实际分配给当前视图的宽度
    actualHeight : 实际分配给当前视图的高度

    //1.
    //使用递归的方法构造表达式，但是实际的有效情况是由顶层往底层布局
    //不能回溯的时候进行构造和布局，
    //因此，我们使用数组存储布局表达式，并设计一个全局下标用于标记当前视图表达式的数组位置，
    //设计一个栈用于存储布局顺序。最终是由前往后根据数组进行布局的。
    //main视图对应的下标应该是0。
    //递归当前视图的子视图前，由后往前广度遍历子视图，
    //当子视图非叶子时，全局下标+index 的值进栈，
    //遍历完后 全局下标 += 子视图总数，确保足够的间隔保证下一次的位置不会与上一次冲突
    //__GLOBAL_expression的下标不一定连续，但能确保需要提前填充的表达式的下标一定小于
        //迟些填充的表达式的下标
    //当视图递归完所有子视图后，出栈下标，将子视图和自身的表达式存于数组中

    //2.
    //子视图默认会向右向下对齐，因此在构造表达式的时候，
    //对于非叶子视图，
    //V表达式最后一个间距优先级降为10，使其子视图向上对齐
    //H表达式最后一个间距优先级降为10，使其子视图向左对齐

    //3.
    //叶子视图会设置行间距和列间距，为使之生效，对于叶子视图的父视图而言，
    //若当前为行排列，应将叶子视图的间隔反映在父视图的V表达式，父视图的H不变
    //若当前为列排列，不必将叶子视图的间隔反映在父视图的H表达式上，V表达式需要特殊处理。

    //非叶子行视图会设置colsSpace，非叶子列视图会设置rowsSpace，为使其生效，
    //若当前为行排列，传递给子视图的宽度减去相应列距，视图的H表达式只需要减去相应列距
    //若当前为列视图，视图的V表达式需要特殊处理。

    //视图的V表达式需要特殊处理原因：
    //如果列视图使用V表达式的话，会导致叶子视图行间距不生效
    //而直接不使用V表达式的话会导致一些子视图没有分配到高度
    //（布局的时候由顶层向底层布局，失去V表达式则可能导致子视图的高度为0，即使子视图嵌套的元素设置了高度也无效）
    //因此，列视图的V表达式处理如下：
    //递归所有子视图，传递给子视图的高度减去相应行距
    //如果子视图是叶子视图，在子视图的V表达式间距基础上累加当前行距
    //如果子视图是非叶子视图，返回的表达式为空，则为子视图分配高度（减去当前行距）。

    //4.
    //布局的时候自动计算有效的border，将其宽度累加到视图的右下方向
    //为了使border生效，设计逻辑是：
    //父视图分配给子视图高度/宽度时，减去子视图的border
    //如果父视图是行排列，在汇总的V表达式上累加上子视图的border(只累加到底部)
    //并分别设置子视图的H表达式(原先只需要一条汇总的H式)，累加上子视图的border(只累加到右边)
    //如果父视图是列排列，在汇总的H表达式上累加上子视图的border(只累加到右边)
    //并在3.的基础上，分别设置子视图的V表达式，累加上子视图的border(只累加到底部)

 **/
/*
    其他设计技巧：
    1、确保所有视图被填充到DOM元素，同时确保该DOM元素能嵌套子视图的DOM元素。
    2、对于行排列的元素，通过height控制其高度，width无效，
       可以通过colsSpace来间接控制，设置colsSpace相当于设置了视图的left和right值
       为使其生效，行排列的H表达式减去这部分值
       对于列排列的元素，通过width控制其宽度，height无效，
       可以通过rowsSpace来间接控制，设置rowsSpace相当于设置了视图的top和bottom值
       为使其生效，列排列的V表达式减去这部分值

       行间距和列间距的百分比设定是相对于父视图而言，
       宽度和高度的百分比设定是相对于父视图除去间距之后而言！！！


*/
//以下设计用于id到view的映射
var __GLOBAL_id2view = [];
//以下设计用于存储深度遍历过程中的EVFL表达式
var __GLOBAL_index = 0;//全局下标
var __GLOBAL_stack = [];//数组下标栈
var __GLOBAL_expression = [];//其成员为 id->表达式数组
//以下设计用于构造EVFL表达式时新的唯一名字
var __GLOBAL_uniqueid = 0;//全局id
//获取unique id
__GLOBAL_GetUniqueId = function(){
    return "id_"+__GLOBAL_uniqueid++;
};

var __view = function(id){
    this.id = id;
    this.width = 0;
    this.height = 0;
    this.rows = [];
    this.rowsNum = function(){
        if(this.rows) return this.rows.length;
        return 0;
    };
    this.rowsSpace = [];
    this.cols = [];
    this.colsNum = function(){
        if(this.cols) return this.cols.length;
        return 0;
    };
    this.colsSpace = [];
    this.index = 0;
    this.parent = null;
    this.arrangement = __Arrangement.ROW;

    this.missAdaptIgnore = []; //当当前视图缺失时，兄弟视图默认按比例扩充。此处是id数组
    this.actualWidth = 0; //实际被分配宽度
    this.actualHeight = 0;//实际被分配高度
    this.borderWidth = [];//border四个方向的宽度
    this.borderWidth["left"] = parseFloat(getStyle(document.getElementById(this.id),"borderLeftWidth"));
    this.borderWidth["right"] = parseFloat(getStyle(document.getElementById(this.id),"borderTopWidth"));
    this.borderWidth["top"] = parseFloat(getStyle(document.getElementById(this.id),"borderRightWidth"));
    this.borderWidth["bottom"] = parseFloat(getStyle(document.getElementById(this.id),"borderBottomWidth"));


    this.__updateRowsOrCols("rows",function(caller){
        caller.arrangement = __Arrangement.ROW;
        for (var i = 0; i < caller.rows.length; i++) {
            caller.rows[i].index = i;
            caller.rows[i].parent = caller;
        }
    });
    this.__updateRowsOrCols("cols",function(caller){
        caller.arrangement = __Arrangement.COLUMN;
        for (var i = 0; i < caller.cols.length; i++) {
            caller.cols[i].index = i;
            caller.cols[i].parent = caller;
        }
    });
    //判断是不是百分比
    this.ifPercent = function(number){
        var patt =  new RegExp(/^\d+\.{0,1}\d*%$/);
        var result = patt.test(number);
        return result;
    };
    //百分比转换为小数
    this.toPoint = function(percent){
        var str = percent.replace("%","");
        str= str/100;
        return str;
    };
    //获取数值，如果是百分比，则转换为小数*母数
    this.getNumber = function(number,parent){
        if(this.ifPercent(number))
            return this.toPoint(number)*parent;
        else
            return number;
    };

    this.isLeaf = function(){
        return (this.rowsNum() == 0 && this.colsNum() == 0);
    };

    this.EVFL = function(){
        //clear
        __GLOBAL_index = 0;//全局下标
        __GLOBAL_stack = [];//数组下标栈
        __GLOBAL_expression = [];//其成员为 id->表达式数组
        __GLOBAL_uniqueid = 0;//全局id

        __GLOBAL_stack.push(__GLOBAL_index++);//main视图对应的数组下标是0
        this.layout(document.documentElement.scrollWidth,document.documentElement.scrollHeight)
        //__GLOBAL_expression的下标不一定连续，但需要提前填充的表达式的下标一定小于
        //需要迟些填充的表达式的下标
        for(var key in __GLOBAL_expression){
            autoLayout(document.getElementById(__GLOBAL_expression[key].id), __GLOBAL_expression[key].expression);
            console.log(__GLOBAL_expression[key].id);
            console.log(__GLOBAL_expression[key].expression);
        }
    };

    // width和height代表当前视图应该具备的宽度和高度
    // 这是父视图根据定义信息计算过的
    this.layout = function(width,height){
        //存储当前视图的实际宽度和高度，包括border
        this.actualWidth = width;
        this.actualHeight = height;

        //减去border
        //width -= parseFloat(borderLeftWidth)+parseFloat(borderRightWidth);
        //height -= parseFloat(borderTopWidth)+parseFloat(borderBottomWidth);

        //处理id到view的映射
        __GLOBAL_id2view[this.id] = this;

        //返回的json数据结构
        var ret = {name : "", expression: []};
        //对叶子视图进行处理
        if(this.isLeaf()){
            var left=0,right=0,top=0,bottom=0;
            //加上border，累积到右边和底部
            /*
            right+=this.borderWidth["left"];
            right+=this.borderWidth["right"];
            bottom+=this.borderWidth["top"];
            bottom+=this.borderWidth["bottom"];
            */
            if(this.colsSpace.length>0){
                if(this.colsSpace.length==1){
                    left = right = this.getNumber(this.colsSpace[0],width);
                }else{
                    left = this.getNumber(this.colsSpace[0],width);
                    right = this.getNumber(this.colsSpace[1],width);
                }
            }
            if(this.rowsSpace.length>0){
                if(this.rowsSpace.length==1){
                    top = bottom = this.getNumber(this.rowsSpace[0],height);
                }else{
                    top = this.getNumber(this.rowsSpace[0],height);
                    bottom = this.getNumber(this.rowsSpace[1],height);
                }
            }

            var name = __GLOBAL_GetUniqueId();
            ret.name = name;
            var newexp;

            newexp = 'H:|['+name+':-('+left+')-'+'['+this.id+'('+(width-left-right)+')]-('+right+')-]|';
            ret.expression.push(newexp);

            newexp = 'V:|-('+top+')-['+name+'('+(height-top-bottom)+')]-('+bottom+')-|';
            ret.expression.push(newexp);

            return ret;
        }
        //行排列，则计算高度和间隔
        if(this.arrangement == __Arrangement.ROW){
            //首先遍历一层，计算子视图的高度/宽度、间隔
            var ifSetRowSpace = (this.rowsSpace.length > 0);
            var remainHeight = height; //除去行距之后剩余的高度
            //填充间隔数组
            var spaceArr = new Array();
            //这里的思想是：
            //间隔如果是百分比，是相对当前高度进行分配的
            //子视图的行高若是使用百分比，是从剩余的高度进行分配的
            if(ifSetRowSpace && this.rowsSpace.length == 1){//间距相等
                var rs = this.getNumber(this.rowsSpace[0],height);
                remainHeight = remainHeight - ((this.rowsNum()+1)*rs);
                for (var i = 0; i < this.rowsNum()+1; i++) {
                    spaceArr.push(rs);
                }
            }else{
                for (var i = 0; i < this.rowsSpace.length; i++) {//间距不等
                    var rs = this.getNumber(this.rowsSpace[i],height);
                    remainHeight = remainHeight - rs;
                    spaceArr.push(rs);
                }
                for (var i = this.rowsSpace.length; i < this.rowsNum()+1;i++){
                    spaceArr.push(0);
                }
            }
/*
            //垂直方向上算上border，累积到底部
            spaceArr[this.rowsNum()] += this.borderWidth["top"];
            spaceArr[this.rowsNum()] += this.borderWidth["bottom"];
            remainHeight -= this.borderWidth["top"];
            remainHeight -= this.borderWidth["bottom"];
*/

            //这里的思想是：标记未能明确高度的行视图，如果只有一个视图确认了高度，
            //其他视图将会均分剩余的高度，以此类推
            var rharr = new Array();
            var flag_rharr = new Array();
            var remain_remain = remainHeight;
            for (var i = 0; i < this.rowsNum(); i++) {
                if(this.rows[i].height == 0){
                    flag_rharr.push(i);
                }else{
                    if(this.ifPercent(this.rows[i].height)){
                        rharr[i] = remainHeight * this.toPoint(this.rows[i].height);
                        remain_remain -= rharr[i];
                    }else{
                        rharr[i] = this.rows[i].height;
                        remain_remain -= rharr[i];
                    }
                }
            }
            //填充标记的视图
            if(flag_rharr.length>0){
                var ave = remain_remain/flag_rharr.length;
                for (var i = 0; i < flag_rharr.length; i++) {
                    rharr[flag_rharr[i]] = ave;
                }
            }

            //递归当前视图的子视图前，由后往前广度遍历子视图，
            //当子视图非叶子时，全局下标+index 的值进栈，
            //遍历完后 全局下标+=子视图数
            for (var i = this.rowsNum()-1; i >= 0; i--) {
                if( !this.rows[i].isLeaf() ){
                    __GLOBAL_stack.push(__GLOBAL_index+this.rows[i].index);
                }
            }
            __GLOBAL_index += this.colsNum();

            //计算当前视图的left和right
            var left=0,right=0;
            if(this.colsSpace.length>0){
                if(this.colsSpace.length==1){
                    left = right = this.getNumber(this.colsSpace[0],width);
                }else{
                    left = this.getNumber(this.colsSpace[0],width);
                    right = this.getNumber(this.colsSpace[1],width);
                }
            }
            /*
            //水平方向上算上border，累积到右边
            right += this.borderWidth["left"];
            right += this.borderWidth["right"];
*/

            //遍历每个行视图，获取名字/表达式数组，将表达式数组合并
            var sum_nameArr = new Array();
            var sum_expressionArr = new Array();
            //当前为行排列，计算是否是叶子视图的父视图
            var leafSpace = new Array();
            var leafFlag = new Array();
            var ifParentHasLeaf = false;
            for (var i = 0; i < this.rowsNum(); i++) {
                //除去left值和right值
                //var r = this.rows[i].layout(width-left-right,rharr[i]);
                var r = this.rows[i].layout(
                    width-left-right-this.rows[i].borderWidth["left"]-this.rows[i].borderWidth["right"],
                    rharr[i]-this.rows[i].borderWidth["top"]-this.rows[i].borderWidth["bottom"]);
                sum_nameArr.push(r.name);
                sum_expressionArr = sum_expressionArr.concat(r.expression);

                //计算叶子视图间距，用于父视图的V表达式上
                if(!leafSpace[i*2])leafSpace[i*2]=0;
                if(!leafSpace[i*2+1])leafSpace[i*2+1]=0;
                if(this.rows[i].isLeaf()){
                    ifParentHasLeaf = true;
                    leafFlag[i] = true;
                    if(this.rows[i].rowsSpace.length>0){
                        if(this.rows[i].rowsSpace.length==1){
                            leafSpace[i*2]+=this.getNumber(this.rows[i].rowsSpace[0],rharr[i]);
                            leafSpace[i*2+1]+=this.getNumber(this.rows[i].rowsSpace[0],rharr[i]);
                        }else{
                            leafSpace[i*2]+=this.getNumber(this.rows[i].rowsSpace[0],rharr[i]);
                            leafSpace[i*2+1]+=this.getNumber(this.rows[i].rowsSpace[1],rharr[i]);
                        }
                    }
                    //加上border，累积到底部
                    //leafSpace[i*2+1]+=this.rows[i].borderWidth["top"];
                    //leafSpace[i*2+1]+=this.rows[i].borderWidth["bottom"];
                }else{
                    leafFlag[i] = false;
                }
            }

            //构造垂直表达式，并生成新的名字，将表达式并入数组
            //叶子视图会设置行间距和列间距，为使之生效，对于叶子视图的父视图而言，
            //若当前为行排列，应在父视图的V表达式上计算间隔，H不变
            var name = __GLOBAL_GetUniqueId();
            if(!ifParentHasLeaf){//孩子视图中没有叶子视图
                var newexp = 'V:|['+name+':-('+spaceArr[0]+')-';
                //newexp += '['+sum_nameArr[0]+'('+rharr[0]+')]';
                newexp += '['+sum_nameArr[0]+'('+(rharr[0]-this.rows[0].borderWidth["top"]-this.rows[0].borderWidth["bottom"])+')]';
                for (var i = 1; i < this.rowsNum(); i++) {
                    //newexp += '-('+spaceArr[i]+')-'+'['+sum_nameArr[i]+'('+rharr[i]+')]'
                    newexp += '-('+(spaceArr[i]+this.rows[i-1].borderWidth["top"]+this.rows[i-1].borderWidth["bottom"])
                    +')-'+'['+sum_nameArr[i]+'('+(rharr[i]-this.rows[i].borderWidth["top"]-this.rows[i].borderWidth["bottom"])+')]'
                }
                //newexp += '-('+spaceArr[this.rowsNum()]+'@10)-]|';
                newexp += '-('+(spaceArr[this.rowsNum()]+this.rows[this.rowsNum()-1].borderWidth["top"]+this.rows[this.rowsNum()-1].borderWidth["bottom"])+'@10)-]|';
                sum_expressionArr.push(newexp);
            }else{
                var newexp = 'V:|['+name+':-('+(spaceArr[0]+leafSpace[0])+')-';
                //newexp += '['+sum_nameArr[0]+'('+(rharr[0]-leafSpace[0]-leafSpace[1])+')]';
                newexp += '['+sum_nameArr[0]+'('+(rharr[0]-leafSpace[0]-leafSpace[1]-this.rows[0].borderWidth["top"]-this.rows[0].borderWidth["bottom"])+')]';
                for (var i = 1; i < this.rowsNum(); i++) {
                    //newexp += '-('+(spaceArr[i]+leafSpace[i*2-1]+leafSpace[i*2])+')-'+'['+
                    //    sum_nameArr[i]+'('+(rharr[i]-leafSpace[i*2]-leafSpace[i*2+1])+')]';
                    newexp += '-('+(spaceArr[i]+leafSpace[i*2-1]+leafSpace[i*2]+this.rows[i-1].borderWidth["top"]+this.rows[i-1].borderWidth["bottom"])+')-'+'['+
                        sum_nameArr[i]+'('+(rharr[i]-leafSpace[i*2]-leafSpace[i*2+1]-this.rows[i].borderWidth["top"]-this.rows[i].borderWidth["bottom"])+')]';
                }
                //newexp += '-('+(spaceArr[this.rowsNum()]+leafSpace[this.rowsNum()*2-1])+'@10)-]|';
                newexp += '-('+(spaceArr[this.rowsNum()]+leafSpace[this.rowsNum()*2-1]+this.rows[this.rowsNum()-1].borderWidth["top"]+this.rows[this.rowsNum()-1].borderWidth["bottom"])+'@10)-]|';
                sum_expressionArr.push(newexp);
            }

            //水平拉伸
            //除去left值和right值
            for (var i = 0; i < this.rowsNum(); i++) {
                newexp = 'H:|-('+left+')-['+sum_nameArr[i]+'('+
                    (width-left-right-this.rows[i].borderWidth["left"]-this.rows[i].borderWidth["right"])
                    +')]-('+
                    (right+this.rows[i].borderWidth["left"]+this.rows[i].borderWidth["right"])
                    +'@10)-|'
                sum_expressionArr.push(newexp);
            }
            //newexp = 'H:|-('+left+')-['+name+'('+(width-left-right)+')]-('+right+'@10)-|'
            //sum_expressionArr.push(newexp);
/*
            for (var i = 0; i < this.rowsNum(); i++) {
                newexp = 'H:|-('+borderWidthArr[i]+')-['+
                    sum_nameArr[i]+'('+(width-borderWidthArr[i]*2)+
                    ')]-('+borderWidthArr[i]+')-|'
                sum_expressionArr.push(newexp);
            }
*/
            //出栈下标，将id与表达式存于数组中
            //布局，并返回 名字->空数组
            var tid = this.id;
            __GLOBAL_expression[__GLOBAL_stack.pop()] = {
                "id":tid,
                "expression":sum_expressionArr
            };
            //autoLayout(document.getElementById(this.id), sum_expressionArr);
            ret.name = this.id;
            ret.expression = [];
            return ret;
        }else{ // 列排列，计算宽度和间隔
            //首先遍历一层，计算子视图的高度/宽度、间隔
            var ifSetColsSpace = (this.colsSpace.length > 0);
            var remainWidth = width; //除去列距之后剩余的宽度
            //填充间隔数组
            var spaceArr = new Array();
            //这里的思想是：
            //间隔如果是百分比，是相对当前宽度进行分配的
            //子视图的列宽若是使用百分比，是从剩余的宽度进行分配的
            if(ifSetColsSpace && this.colsSpace.length == 1){//间距相等
                var cs = this.getNumber(this.colsSpace[0],width);
                remainWidth = remainWidth - ((this.colsNum()+1)*cs);
                for (var i = 0; i < this.colsNum()+1; i++) {
                    spaceArr.push(cs);
                }
            }else{
                for (var i = 0; i < this.colsSpace.length; i++) {//间距不等
                    var cs = this.getNumber(this.colsSpace[i],width);
                    remainWidth = remainWidth - cs;
                    spaceArr.push(cs);
                }
                for (var i = this.colsSpace.length; i < this.colsNum()+1;i++){
                    spaceArr.push(0);
                }
            }
/*
            //水平方向上算上border，累积到右边
            spaceArr[this.colsNum()] += this.borderWidth["left"];
            spaceArr[this.colsNum()] += this.borderWidth["right"];
            remainWidth -= this.borderWidth["left"];
            remainWidth -= this.borderWidth["right"];
*/

            //这里的思想是：标记未能明确宽度的列视图，如果只有一个视图确认了宽度，
            //其他视图将会均分剩余的宽度，以此类推
            var cwarr = new Array();
            var flag_cwarr = new Array();
            var remain_remain = remainWidth;
            for (var i = 0; i < this.colsNum(); i++) {
                if(this.cols[i].width == 0){
                    flag_cwarr.push(i);
                }else{
                    if(this.ifPercent(this.cols[i].width)){
                        cwarr[i] = remainWidth * this.toPoint(this.cols[i].width);
                        remain_remain -= cwarr[i];
                    }else{
                        cwarr[i] = this.cols[i].width;
                        remain_remain -= cwarr[i];
                    }
                }
            }
            //填充标记的视图
            if(flag_cwarr.length>0){
                var ave = remain_remain/flag_cwarr.length;
                for (var i = 0; i < flag_cwarr.length; i++) {
                    cwarr[flag_cwarr[i]] = ave;
                }
            }

            //递归当前视图的子视图前，由后往前广度遍历子视图，
            //当子视图非叶子时，全局下标+index 的值进栈，
            //遍历完后 全局下标+=子视图数
            for (var i = this.colsNum()-1; i >= 0; i--) {
                if( !this.cols[i].isLeaf() ){
                        __GLOBAL_stack.push(__GLOBAL_index+this.cols[i].index);
                    }
            }
            __GLOBAL_index += this.colsNum();

            //计算top和bottom
            var top=0,bottom=0;
            if(this.rowsSpace.length>0){
                if(this.rowsSpace.length==1){
                    top = bottom = this.getNumber(this.rowsSpace[0],height);
                }else{
                    top = this.getNumber(this.rowsSpace[0],height);
                    bottom = this.getNumber(this.rowsSpace[1],height);
                }
            }
            /*
            //垂直方向上算上border，累积到底部
            bottom += this.borderWidth["top"];
            bottom += this.borderWidth["bottom"];
*/

            //遍历每个列视图，获取名字/表达式数组，将表达式数组合并
            var sum_nameArr = new Array();
            var sum_expressionArr = new Array();
            for (var i = 0; i < this.colsNum(); i++) {
                //除去top和bottom
                //var r = this.cols[i].layout(cwarr[i],height-top-bottom);
                var r = this.cols[i].layout(
                    cwarr[i]-this.cols[i].borderWidth["left"]-this.cols[i].borderWidth["right"],
                    height-top-bottom-this.cols[i].borderWidth["top"]-this.cols[i].borderWidth["bottom"]);

                //以下操作是为了两个目的：
                //  除去当前视图的行距后，
                //1、非叶子子视图直接分配剩余的高度
                //2、叶子视图修改V表达式，当前视图的行距累加到叶子视图上
                //这是因为如果对当前列排列使用V表达式的话，会导致叶子视图行间距不生效
                //而直接不使用V表达式的话会导致一些子视图没有分配到高度
                if(r.expression.length == 0){//非叶子视图
                    //newexp = 'V:|-('+top+')-['+r.name+'('+(height-top-bottom)+')]-('+bottom+'@10)-|'
                    newexp = 'V:|-('+top+')-['+r.name+'('+
                    (height-top-bottom-this.cols[i].borderWidth["top"]-this.cols[i].borderWidth["bottom"])
                    +')]-('+(bottom+this.cols[i].borderWidth["top"]+this.cols[i].borderWidth["bottom"])+'@10)-|'
                    sum_expressionArr.push(newexp);
                }else{//叶子视图
                    for (var ei = r.expression.length - 1; ei >= 0; ei--) {
                        var patt = /^V:{1}.*/;
                        if(patt.test(r.expression[ei])){//取出V表达式
                            //不计算boder
                            /*
                            //console.log(r.expression[ei]);
                            //V:|-(0)-[id_5(219.5)]-(0)-|
                            //默认是贪婪模式；在量词后面直接加上一个问号？就是非贪婪模式。
                            //使其匹配第一个'('
                            patt = /(V:\|-\()(.*?)(\).*)/;
                            //match用法请查看https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
                            //console.log(r.expression[ei].match(patt));
                            var newTop = parseFloat(r.expression[ei].match(patt)[2])+top;
                            //$0为匹配patt的整个表达式，$1为第一个括号内容，以此类推
                            r.expression[ei]=r.expression[ei].replace(patt,'$1'+newTop+'$3');
                            //默认是贪婪模式，使其匹配到最后一个'('
                            patt = /(V:.*\()(.*?)(\).*)/;
                            //console.log(r.expression[ei].match(patt));
                            var newBottom = parseFloat(r.expression[ei].match(patt)[2])+bottom;
                            r.expression[ei]=r.expression[ei].replace(patt,'$1'+newBottom+'$3');
                            //console.log(r.expression[ei]);
                            */
                            //计算border
                            patt = /(V:\|-\()(.*?)(\).*\()(.*?)(\).*\()(.*?)(\).*)/;
                            console.log(r.expression[ei].match(patt));
                            //默认是贪婪模式；在量词后面直接加上一个问号？就是非贪婪模式。
                            //使其匹配第一个'('
                            //match用法请查看https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
                            var newTop = parseFloat(r.expression[ei].match(patt)[2])+top;
                            //$0为匹配patt的整个表达式，$1为第一个括号内容，以此类推
                            r.expression[ei]=r.expression[ei].replace(patt,'$1'+newTop+'$3$4$5$6$7');
                            //var newHeight = height-top-bottom-this.cols[i].borderWidth["top"]-this.cols[i].borderWidth["bottom"];
                            //r.expression[ei]=r.expression[ei].replace(patt,'$1$2$3'+newHeight+'$5$6$7');
                            var newBottom = parseFloat(r.expression[ei].match(patt)[6])+bottom+this.cols[i].borderWidth["top"]+this.cols[i].borderWidth["bottom"];
                            r.expression[ei]=r.expression[ei].replace(patt,'$1$2$3$4$5'+newBottom+'$7');
                            //console.log(r.expression[ei]);
                        }
                    }
                }
                sum_nameArr.push(r.name);
                sum_expressionArr = sum_expressionArr.concat(r.expression);
            }
            //构造水平表达式，并生成新的名字，将表达式并入数组
            var name = __GLOBAL_GetUniqueId();
            var newexp = 'H:|['+name+':-('+spaceArr[0]+')-'
            //newexp += '['+sum_nameArr[0]+'('+cwarr[0]+')]'
            newexp += '['+sum_nameArr[0]+'('+(cwarr[0]-this.cols[0].borderWidth["left"]-this.cols[0].borderWidth["right"])+')]'
            for (var i = 1; i < this.colsNum(); i++) {
                //newexp += '-('+spaceArr[i]+')-'+'['+sum_nameArr[i]+'('+cwarr[i]+')]'
                newexp += '-('+(spaceArr[i]+this.cols[i-1].borderWidth["left"]+this.cols[i-1].borderWidth["right"])
                    +')-'+'['+sum_nameArr[i]+'('+(cwarr[i]-this.cols[i].borderWidth["left"]-this.cols[i].borderWidth["right"])+')]'
            }
            //newexp += '-('+spaceArr[this.colsNum()]+'@10)-]|';
            newexp += '-('+(spaceArr[this.colsNum()]+this.cols[this.colsNum()-1].borderWidth["left"]+this.cols[this.colsNum()-1].borderWidth["right"])+'@10)-]|';
            sum_expressionArr.push(newexp);

            //垂直拉伸，见上面特殊处理
            //除去top值和bottom值
            //newexp = 'V:|-('+top+')-['+name+'('+(height-top-bottom)+')]-('+bottom+'@10)-|'
            //sum_expressionArr.push(newexp);

/*
            for (var i = 0; i < this.colsNum(); i++) {
                newexp = 'V:|-('+borderWidthArr[i]+')-['+
                    sum_nameArr[i]+'('+(height-borderWidthArr[i]*2)+
                    ')]-('+borderWidthArr[i]+')-|';
                sum_expressionArr.push(newexp);
            }
*/
            //出栈下标，将id与表达式存于数组中
            //布局，并返回 名字->空数组
            var tid = this.id;
            __GLOBAL_expression[__GLOBAL_stack.pop()] = {
                "id":tid,
                "expression":sum_expressionArr
            };
            //autoLayout(document.getElementById(this.id), sum_expressionArr);
            ret.name = this.id;
            ret.expression = [];
            return ret;
        }
    };
};



if(!__view.prototype.__updateRowsOrCols){
    __view.prototype.__updateRowsOrCols = function(key, callback){
        if(key && this instanceof __view){
            Object.defineProperty(this, key, {
                get: function(){
                    return this.key;
                },
                set: function(value){
                    this.key = value;
                    callback(this);
                }
            });
        }
    }
};


/*
 *****************************************************
 *****************************************************
 *****************************************************
 */
 // @by zhuangjian 构造布局用结构体

// right example layout
var exampleVFL = [
    '|-[child1(child3)]-[child3]-|',
    '|-[child2(child4)]-[child4]-|',
    '[child5(child4)]-|',
    'V:|-[child1(child2)]-[child2]-|',
    'V:|-[child3(child4,child5)]-[child4]-[child5]-|'
];
document.getElementById('vfl').innerHTML = exampleVFL.join('\n');

// same example expressed as EVFL
/*
var exampleEVFL = [
    'V:|-[col1:[child1(child2)]-[child2]]-|',
    'V:|-[col2:[child3(child4,child5)]-[child4]-[child5]]-|',
    'H:|-[col3:[col1(col2)]-[col2]]-|',
    'V:|-[col4:[col3(child6)]-[child6]]-|',
    'H:|-[col4]-|'
];
 */

var exampleEVFL = [
    "V:|[row_2_0:[child1(321.5)][child2(321.5)]]|",
    "H:|[row_2_0(341.5)]|",
    "V:|[row_3_1:[child3(214.3)][child4(214.3)][child5(214.3)]]|",
    "H:|[row_3_1(341.5)]|",
    "H:|[col_2_1:[row_2_0(341.5)][row_3_1(341.5)]]|",
    "V:|[col_2_1(643)]|"
];
document.getElementById('evfl').innerHTML = exampleEVFL.join('\n');


/*
            <span id="c1_4">
            <span id="c1_3">
            <span id="c1_2">
            <div itemtype="menu" funcmap="child1" id="c1"><div>1</div></div>
            <div itemtype="menu" funcmap="child2" id="c2"><div>2</div></div>
            </span>
            <div itemtype="menu" funcmap="child3" id="c3"><div>3</div></div>
            </span>
            <div itemtype="menu" funcmap="child4" id="c4"><div>4</div></div>
            </span>
            <div itemtype="menu" funcmap="child5" id="c5"><div>5</div></div>
*/
//test 1: 行行行
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__child1234,__child5];
__child1234.rows = [__child12,__child34];
__child12.rows = [__child1,__child2];
__child34.rows = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]

__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.colsSpace = [10];
__right.colsSpace = [10];
__clayout.EVFL();
*/

//test 2: 行行列
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.cols = [__child1234,__child5];
__child1234.rows = [__child12,__child34];
__child12.rows = [__child1,__child2];
__child34.rows = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.colsSpace = [10];
__clayout.EVFL();
*/

//test 3: 行列行
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__child1234,__child5];
__child1234.cols = [__child12,__child34];
__child12.rows = [__child1,__child2];
__child34.rows = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.colsSpace = [10];
__right.colsSpace = [10];
__clayout.EVFL();
*/

//test 4:行列列
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.cols = [__child1234,__child5];
__child1234.cols = [__child12,__child34];
__child12.rows = [__child1,__child2];
__child34.cols = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.rowsSpace = [10];
__right.rowsSpace = [10];
__clayout.EVFL();
*/

//test 5: 列列列
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.cols = [__child1234,__child5];
__child1234.cols = [__child12,__child34];
__child12.cols = [__child1,__child2];
__child34.cols = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.rowsSpace = [10];
__right.rowsSpace = [10];
__right.colsSpace = [10];
__clayout.EVFL();
*/


//test 6: 列列行
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__child1234,__child5];
__child1234.cols = [__child12,__child34];
__child12.cols = [__child1,__child2];
__child34.cols = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[10]
__child4.colsSpace=[10]
__child34.rowsSpace = [10];
__right.colsSpace = [10];

__clayout.EVFL();
*/

//test 7:列行列
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child34 = new __view("c3_4");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.cols = [__child1234,__child5];
__child1234.rows = [__child12,__child34];
__child12.cols = [__child1,__child2];
__child34.cols = [__child3,__child4];
//__child4.missAdaptIgnore = ['child5' ];
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=[30]
__child4.colsSpace=[10]
__child34.colsSpace=[10]
__child12.rowsSpace = [10]
__child34.rowsSpace=[10]
__right.rowsSpace=[10]
__clayout.EVFL();
*/


//test 8: 列行行
/*
            <span id="c1_4">
            <span id="c1_3">
            <span id="c1_2">
            <div itemtype="menu" funcmap="child1" id="c1"><div>1</div></div>
            <div itemtype="menu" funcmap="child2" id="c2"><div>2</div></div>
            </span>
            <div itemtype="menu" funcmap="child3" id="c3"><div>3</div></div>
            </span>
            <div itemtype="menu" funcmap="child4" id="c4"><div>4</div></div>
            </span>
            <div itemtype="menu" funcmap="child5" id="c5"><div>5</div></div>
*/
/*
var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __child1 = new __view("c1");
var __child2 = new __view("c2");
var __child3 = new __view("c3");
var __child4 = new __view("c4");
var __child5 = new __view("c5");
var __child12 = new __view("c1_2");
var __child123 = new __view("c1_3");
var __child1234 = new __view("c1_4");
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__child1234,__child5];
__child1234.rows = [__child123,__child4];
__child123.cols = [__child12,__child3];
__child12.cols = [__child1,__child2];
//__child4.missAdaptIgnore = ['child5' ];
//__child12.rowsSpace = [10,10]
__child1.rowsSpace=[5]
__child1.colsSpace=[5]
__child2.rowsSpace=[5]
__child2.colsSpace=[5]
__child4.rowsSpace=['5%']
__child4.colsSpace=['5%']
__child123.rowsSpace=[5]
__right.rowsSpace=[5]
__right.colsSpace=[5]
__clayout.EVFL();
*/



/*
            <span id="c1_8">
            <span id="c1_2">
            <div itemtype="menu" funcmap="child1" id="c1"><div>1</div></div>
            <div itemtype="menu" funcmap="child2" id="c2"><div>2</div></div>
            </span>
            <span id="c3_8">
            <span id="c3_6">
            <div itemtype="menu" funcmap="child3" id="c3"><div>3</div></div>
            <div itemtype="menu" funcmap="child4" id="c4"><div>4</div></div>
            <div itemtype="menu" funcmap="child5" id="c5"><div>5</div></div>
            <div itemtype="menu" funcmap="child1" id="c6"><div>6</div></div>
            </span>
            <span id="c7_8">
            <div itemtype="menu" funcmap="child2" id="c7"><div>7</div></div>
            <div itemtype="menu" funcmap="child3" id="c8"><div>8</div></div>
            </span>
            </span>
            </span>
            <span id="c9_11">
            <div itemtype="menu" funcmap="child4" id="c9"><div>9</div></div>
            <span id="c10_11">
            <div itemtype="menu" funcmap="child5" id="c10"><div>10</div></div>
            <div itemtype="menu" funcmap="child5" id="c11"><div>11</div></div>
            </span>
            </span>
*/

//test 复杂视图1

var __clayout = new __view(undefined);
var __left = new __view("left");
var __right = new __view("right");
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __1 = new __view("c1");
var __2 = new __view("c2");
var __3 = new __view("c3");
var __4 = new __view("c4");
var __5 = new __view("c5");
var __6 = new __view("c6");
var __7 = new __view("c7");
var __8 = new __view("c8");
var __9 = new __view("c9");
var __10 = new __view("c10");
var __11 = new __view("c11");

var __1_2 = new __view("c1_2");
var __10_11 = new __view("c10_11");
var __1_8 = new __view("c1_8");
var __3_8 = new __view("c3_8");
var __3_6 = new __view("c3_6" );
var __7_8 = new __view("c7_8" );
var __9_11 = new __view("c9_11" );
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__1_8,__9_11];
__1_8.rows = [__1_2,__3_8];
__1_2.cols = [__1,__2];
__3_8.rows = [__3_6,__7_8];
__3_6.cols = [__3,__4,__5,__6];
__7_8.cols = [__7,__8];
__9_11.cols = [__9,__10_11];
__10_11.rows = [__10,__11];
__7.rowsSpace = [2];
__10.rowsSpace = [10];
__10.colsSpace = [10];
__7_8.rowsSpace = [2];
/*
__7.rowsSpace = [10];
__7.colsSpace = [10];
__7_8.rowsSpace = [10];
__7_8.colsSpace = [10];
__10.rowsSpace = [10];
__10.colsSpace = [10];
__10_11.rowsSpace = [10];
__10_11.colsSpace = [10];
__right.colsSpace = [10];
*/
__clayout.EVFL();


//test 复杂视图2
/*
var __clayout = new __view(undefined);
var __left = new __view("left" );
var __right = new __view("right" );
var __text = new __view("text");
var __vf1 = new __view("vfl");
var __text2 = new __view("text2");
var __evf1 = new __view("evfl");
var __1 = new __view("c1");
var __2 = new __view("c2");
var __3 = new __view("c3");
var __4 = new __view("c4");
var __5 = new __view("c5");
var __6 = new __view("c6");
var __7 = new __view("c7");
var __8 = new __view("c8");
var __9 = new __view("c9");
var __10 = new __view("c10");
var __11 = new __view("c11");

var __1_8 = new __view("c1_8" );
var __1_2 = new __view("c1_2" );
var __3_8 = new __view("c3_8" );
var __3_6 = new __view("c3_6"  );
var __7_8 = new __view("c7_8"  );
var __9_11 = new __view("c9_11" );
var __10_11 = new __view("c10_11" );
__clayout.cols = [__left,__right];
__left.rows = [__text,__vf1,__text2,__evf1];
__right.rows = [__1_8,__9_11];
__1_8.cols = [__1_2,__3_8];
__1_2.rows = [__1,__2];
__3_8.cols = [__3_6,__7_8];
__3_6.rows = [__3,__4,__5,__6];
__7_8.rows = [__7,__8];
__9_11.cols = [__9,__10_11];
__10_11.rows = [__10,__11];

__7.rowsSpace = [10];
__7.colsSpace = [10];
__7_8.rowsSpace = [10];
__7_8.colsSpace = [10];
__10.rowsSpace = [10];
__10.colsSpace = [10];
__10_11.rowsSpace = [10];
__10_11.colsSpace = [10];
__right.rowsSpace = [10];
__right.colsSpace = [10];

__clayout.EVFL();
*/

/*
 *****************************************************
 *****************************************************
 *****************************************************
 */


/**以下是数组操作**/

function __only_unique__(value, index, self) {
    return self.indexOf(value) === index;
}

/**获取所有映射值**/
function __get_unique_funcmap_arr__(){
    var elems = $("[itemtype]")
    var map_arr = new Array(elems.length)
    for(var i=elems.length-1;i>=0;i--){
        map_arr.push($(elems[i]).attr("funcmap"));
    }
    var unique_map_arr = map_arr.filter(__only_unique__);
    return unique_map_arr;
}


/**以下是处理界面元素等操作**/

//处理功能检查
function __function_check__(e) {
    var ifCan = e.data
    if(ifCan == false){
        alert("检查到您没有操作该功能的权限");
        // 防止默认行为
        if (e.preventDefault) {
            e.preventDefault();//IE以外
        } else {
            e.returnValue = false;//IE
        }/*
        if (e.stopPropagation) {
            e.stopPropagation();//IE以外
        } else {
            e.cancelBubble = true;//IE
        }
        e.stopImmediatePropagation(); */
    } else{
        alert("您可以使用该功能")
    }
}

//如果设置了hideflag且其没有可显示的孩子项，则隐藏（递归）
function __hide__(parent){
    var parentparent = $(parent).parent()
    if($(parent).attr("hideflag")){
        if($(parent).children("[itemtype]").length == 0){
            $(parent).remove()
            $(parent).attr("disabled","disabled")
        }
    }

    if(parentparent){
        if($(parentparent)[0] == $("body")[0]){
            return
        }else{
            __hide__(parentparent)
        }
    }
}

//处理映射结果
function __deal_with_map_result__(data){
    var elems = $("[itemtype]")
    for(var i=elems.length-1;i>=0;i--){
        var itemtype = $(elems[i]).attr("itemtype")
        var funcmap = $(elems[i]).attr("funcmap")
        for(var j=0;j<data.length;j++){
            if(data[j].Key == funcmap){
                if(itemtype == "menu"){
                    $(elems[i]).click(data[j].IfCan,__function_check__);
                }
                if(!data[j].IfCan){
                    var parent = $(elems[i]).parent()
                    //如果设置了hideflag且其没有可显示的孩子项，则隐藏（递归）
                    $(elems[i]).remove()
                    $(elems[i]).attr("disabled","disabled")
                    __hide__($(parent))
                }
                break
            }
        }
    }
}


//dom元素隐藏事件，没有计算border宽度
function __hide_handleLayout(id){
    var view = __GLOBAL_id2view[id];
    if(view==undefined) return;
    var p = view.parent;
    var expandLength = 0;//待扩展的高度或宽度
    if(p.arrangement == __Arrangement.ROW){
        expandLength += view.actualHeight;
        if(p.rowsSpace.length == 1){
            expandLength += p.rowsSpace[0];
        }else if(p.rowsSpace.length > 1){
            expandLength += p.rowsSpace[view.index];
            p.rowsSpace.splice(view.index,1);//第index个间隔将被去除
        }
        //最后修改，因为一旦更改了p.rows，则index会被更动
        p.rows.splice(view.index,1);
        p.rows = p.rows;//此步骤是为了更新index
        var rn = p.rowsNum();
        if(rn>0){
            var proportionLength = 0;
            for (var i = 0; i < rn; i++) {
                if( view.missAdaptIgnore.length>0 &&
                    view.missAdaptIgnore.indexOf(p.rows[i].id)>=0){
                    continue;
                }else{
                    proportionLength += p.rows[i].actualHeight;
                }
            }
            for (var i = 0; i < rn; i++) {
                p.rows[i].height = p.rows[i].actualHeight;
                if( view.missAdaptIgnore.length>0 &&
                    view.missAdaptIgnore.indexOf(p.rows[i].id)>=0){
                    continue;
                }else{
                    p.rows[i].height += (p.rows[i].actualHeight/proportionLength)*expandLength;
                }
            }
        }else{
            //递归检查
            __hide_handleLayout(p.id);
        }
    }else{
        expandLength += view.actualWidth;
        if(p.colsSpace.length == 1){
            expandLength += p.colsSpace[0];
        }else if(p.colsSpace.length > 1){
            expandLength += p.colsSpace[view.index];
            p.colsSpace.splice(view.index,1);//第index个间隔将被去除
        }
        //最后修改，因为一旦更改了p.cols，则index会被更动
        p.cols.splice(view.index,1);
        p.cols = p.cols;//此步骤是为了更新index
        var cn = p.colsNum();
        if(cn>0){
            var proportionLength = 0;
            for (var i = 0; i < cn; i++) {
                if( view.missAdaptIgnore.length>0 &&
                    view.missAdaptIgnore.indexOf(p.cols[i].id)>=0){
                    continue;
                }else{
                    proportionLength += p.cols[i].actualWidth;
                }
            }
            for (var i = 0; i < cn; i++) {
                p.cols[i].width = p.cols[i].actualWidth;
                if( view.missAdaptIgnore.length>0 &&
                    view.missAdaptIgnore.indexOf(p.cols[i].id)>=0){
                    continue;
                }else{
                    p.cols[i].width += (p.cols[i].actualWidth/proportionLength)*expandLength;
                }
            }
        }else{
            //递归检查
            __hide_handleLayout(p.id);
        }
    }
}

window.onload = function(){
    /*
    $('#child1').remove();
    __hide_handleLayout('child1');
    $('#child2').remove();
    __hide_handleLayout('child2');
    __clayout.EVFL();
    */

    //首先获取所有映射值，用以发送请求判断是否显示界面元素
    var data = [
        {
            IfCan:true,
            Key:"text"
        },
        {
            IfCan:true,
            Key:"vfl"
        },
        {
            IfCan:true,
            Key:"text2"
        },
        {
            IfCan:true,
            Key:"evfl"
        },
        {
            IfCan:true,
            Key:"child1"
        },
        {
            IfCan:true,
            Key:"child2"
        },
        {
            IfCan:true,
            Key:"child3"
        },
        {
            IfCan:true,
            Key:"child4"
        },
        {
            IfCan:true,
            Key:"child5"
        }
    ]
    //映射情况
    __deal_with_map_result__(data);
}
