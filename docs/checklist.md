## 基本规定

- 使用疏排，不使用紧排。但非必要情况下要求外框彼此紧贴
- 只针对宋体、楷体、黑体、仿宋体四种主要字体进行适配
- 不涉及与图片等的混排

## 版心的设计元素

- 字号、字体
- 文字方向（暂时只支持横排）
- 分栏（放弃）
- 一行的长度（宽度或字数）
- 一页的行数（高度或行数）
- 行距
- 字距
- 边框（是否支持待定）


## 需考虑的内容

- 默认值
- 行长是否需要为字号的整数倍
> 中文在不与西文混排的状况下，所使用的文字外框皆为正方形，除段落最后一行不对齐外，各行行首、行尾皆需对齐，这是重要的排版原则。
- 即使存在注释或ruby文字，行距仍必须保持不变。
> 繁体中文排版中，字间的注音符号可能会超入行距空间，而翻译书籍也可能使用类似日文排版的ruby文字，此时行距仍需保持一致。当文中需要配置这些元素时，于设计版心的阶段就须考量到这些要素来决定行距。

> 版心的行距多半介于文字尺寸的50%–100%之间，当行长较短或文字尺寸较小时，行距设定也会相对较小。反之，行距一般不会超过文字尺寸，就算超过文字尺寸，也不会因而增加易读性。

> 指定版心的方法中，有着不以行距，而是依行高来设定的方法。行高就是彼此邻接的两行之基准点间的距离。基准点依照处理方式而会有所不同，直排时为行左右的中央线，横排时为行上下的中央线。当配置的文字全部尺寸相同时，有着以下关系：  
> 
> 行高=文字尺寸÷2+行距+文字尺寸÷2=文字尺寸+行距  
> 行距=行高-文字尺寸


### 繁简差异

> 在繁、简中文排版中，标点符号于字面上的位置与形状差异为二者主要的分歧点

#### 点号

- 句号逗号顿号
> 句号：U+3002 IDEOGRAPHIC FULL STOP [。]  
> 逗号：U+FF0C FULLWIDTH COMMA [，]  
> 顿号：U+3001 IDEOGRAPHIC COMMA [、]  
>
> 在科技文献、教科书、理工书籍等包含西文词句的横排书籍中，也有用：  
> 句号：U+FF0E FULLWIDTH FULL STOP [．]  
> 逗号或顿号：U+002C COMMA [,] / U+FF0C FULLWIDTH COMMA [，]  

- 冒号和分号
> 冒号：U+FF1A FULLWIDTH COLON [：]   
> 分号：U+FF1B FULLWIDTH SEMICOLON [；]  

- 惊叹号和问号
> U+FF01 FULLWIDTH EXCLAMATION MARK [！]
> U+FF1F FULLWIDTH QUESTION MARK [？]

#### 标号

- 引号
> 繁体  
> U+300C LEFT CORNER BRACKET [「]  
> U+300D RIGHT CORNER BRACKET [」]  
> U+300E LEFT WHITE CORNER BRACKET [『]  
> U+300F RIGHT WHITE CORNER BRACKET [』]
> 简体  
> U+201C LEFT DOUBLE QUOTATION MARK [“]  
> U+201D RIGHT DOUBLE QUOTATION MARK [”]  
> U+2018 LEFT SINGLE QUOTATION MARK[‘]  
> U+2019 RIGHT SINGLE QUOTATION MARK [’]  
> \+ 繁体引号用于直排，但顺序相反

- 括号

> 繁体甲式  
> U+FF08 FULLWIDTH LEFT PARENTHESIS [（ ]  
> U+FF09 FULLWIDTH RIGHT PARENTHESIS [）]  
> 繁体乙式  
> 待定

> 其他  
> 前方头括号 U+3010 LEFT BLACK LENTICULAR BRACKET [【]  
> 后方头括号 U+3011 RIGHT BLACK LENTICULAR BRACKET [】]  
> 前空心方头括号 U+3016 LEFT WHITE LENTICULAR BRACKET [〖]  
> 后空心方头括号 U+3017 RIGHT WHITE LENTICULAR BRACKET [〗]  
> 前六角括号 U+3014 LEFT TORTOISE SHELL BRACKET [〔]  
> 后六角括号 U+3015 RIGHT TORTOISE SHELL BRACKET [〕]  
> 前方括号 U+FF3B FULLWIDTH LEFT SQUARE BRACKET [［]  
> 后方括号 U+FF3D FULLWIDTH RIGHT SQUARE BRACKET [］]  
> 前花括号 U+FF5B FULLWIDTH LEFT CURLY BRACKET [｛]  
> 后花括号 U+FF5D FULLWIDTH RIGHT CURLY BRACKET[｝]

- 破折号
> 两个汉字空间的 U+2E3A TWO-EM DASH [⸺]  
> 或两个 U+2014 EM DASH [—]

- 删节号（省略号）
> 两个 U+2026 HORIZONTAL ELLIPSIS […]

- 着重号
> 横排时位于下方（底端），直排时位于右侧（顶端）  
> U+25CF BLACK CIRCLE [●] 或 U+2022 BULLET [•]

- 连接号
> 台湾：甲式为U+2013 EN DASH [–]、乙式为 U+FF5E FULLWIDTH TILDE [～]或 U+007E TILDE [~]  
> 国标：短横线[–]、一字线[—]和浪纹线[～]3 种

> 标点符号用法》(GB/T 15834—2011)中没有指定这三个符号的码位，但是基本上可以推断一字线是 U+2014 EM DASH [—]，浪纹线是 U+FF5E FULLWIDTH TILDE [～]。但是对于短横线，该标准5.1.6节规定：短横线比汉字『一』略短，占半个字位置，因此可以是 U+2013 EN DASH [–]。这些连接号的实际长短根据所用处理系统和使用字体会有区别。

- 间隔号
> U+00B7 MIDDLE DOT [·]

- 书名号
> U+FE4F WAVY LOW LINE [﹏]  
> U+300A LEFT DOUBLE ANGLE BRACKET [《] 與 U+300B RIGHT DOUBLE ANGLE BRACKET [》]  
> U+3008 LEFT ANGLE BRACKET [〈] 與 U+3009 RIGHT ANGLE BRACKET [〉]

- 专名号
> U+FF3F FULLWIDTH LOW LINE [＿]

- 分隔号
> U+002F SOLIDUS [/]、U+FF0F FULLWIDTH SOLIDUS [／]