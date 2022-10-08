/* eslint-disable no-nested-ternary */
/* eslint-disable no-bitwise */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */

export interface overridListType {
  style?: any;
  oid: string;
  type: string;
  text?: string;
  parentId?: 'stringValue' | 'layerStyle' | 'fillColor' | 'textStyle' | 'symbolID';
}

const gradientTypeMap: any = {
  0: 'linear-gradient',
  1: 'radial-gradient',
};

const alignMap: any = {
  0: 'left',
  1: 'right',
  2: 'center',
  3: 'justify',
};

export const uuid = (): string => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
};

export const getGradient = (gradient: any) => { // 渐变
  const { stops = [], gradientType = 0 } = gradient || {};
  let color = '';
  const linear = gradientTypeMap[gradientType] || 'linear-gradient';
  stops.forEach((item: any) => {
    color += `rgba(${item.color.red * 255}, ${item.color.green * 255}, ${item.color.blue * 255}, ${item.color.alpha}) ${item.position * 100}%,`;
  });
  return `${linear}(${color.slice(0, color.length - 1)})`;
};

export const getCanvasGradient = ( // canvas渐变
  context: CanvasRenderingContext2D, gradient: any, width: number, height: number,
) => {
  const {
    from, to, stops, gradientType,
  } = gradient || {};
  const fromAxios = from.slice(1, from.length - 1).split(',');
  const toAxios = to.slice(1, to.length - 1).split(',');
  const linerColor = gradientType === 1 ? context.createRadialGradient(Number(fromAxios[0]) * width, Number(fromAxios[1]) * height, width / 2, Number(toAxios[0]) * width, Number(toAxios[1]) * height, width / 2) : context.createLinearGradient(Number(fromAxios[0]) * width, Number(fromAxios[1]) * height, Number(toAxios[0]) * width, Number(toAxios[1] * height));
  stops.forEach((item: any) => {
    linerColor.addColorStop(item.position, `rgba(${item.color.red * 255}, ${item.color.green * 255}, ${item.color.blue * 255}, ${item.color.alpha})`);
  });

  return linerColor;
};

export const getCircle = ( // 画圆
  context: CanvasRenderingContext2D,
  item: any,
  color: string | CanvasGradient | null,
  dashPattern: number[],
  lineWidth: number,
  fillType: number,
  linerColor: CanvasGradient | null,
  fillStyle: string,
) => {
  context.beginPath();
  context.arc(item.frame.width / 2, item.frame.width / 2, item.frame.width / 2, 0, 2 * Math.PI);
  context.strokeStyle = color || 'transparent';
  dashPattern.length > 0 && context.setLineDash(dashPattern);
  context.lineWidth = lineWidth;
  context.fillStyle = fillType === 1 && linerColor ? linerColor : fillStyle || 'transparent';
  (fillStyle || linerColor) && context.fill();
  context.stroke();
  context.closePath();
  return context;
};

export const getRectCircle = ( // 画虚线圆角矩形
  context: CanvasRenderingContext2D,
  item: any,
  lineWidth: number,
  color: string | CanvasGradient | null,
  dashPattern: number[],
  fillType: number,
  linerColor: CanvasGradient | null,
  fillStyle: string,
) => {
  const { width, height } = item.frame;
  const x = 0;
  const y = 0;
  const radius = item.fixedRadius || 0;
  context.beginPath(); // 开始绘制路径
  context.lineWidth = lineWidth; // 边框大小
  context.setLineDash(dashPattern);
  // 起始点:moveTo(x,y) 二次贝塞尔曲线:quadraticCurveTo('控制点x','控制点y','结束点x','结束点y') 结束点:lineTo(x,y) ;
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.fillStyle = fillType === 1 && linerColor ? linerColor : fillStyle || 'transparent'; // 为圆角矩形填充颜色
  context.strokeStyle = color || 'transparent'; // 矩形边框颜色
  context.closePath(); // 闭合绘制的路径
  context.fill(); // 填充当前的路径,默认颜色是黑色
  context.stroke(); // 绘制确切的路径

  return context;
};

export const getColor = (color: any = {}) => `rgba(${(color.red * 255).toFixed(0)}, ${(color.green * 255).toFixed(0)}, ${(color.blue * 255).toFixed(0)}, ${color.alpha})`;

export const getStyleChildrenInfo = (
  item: any,
  documentSharedStyle: any[],
  parentList: overridListType[],
  imgs: any[],
  overId: string,
  wp: number,
) => {
  const {
    style = {}, image, isVisible, fixedRadius, overrideValues = [], isFlippedHorizontal, isFlippedVertical, windingRule, _class: className,
  } = item || {};
  let parentStyle;
  const overridList: overridListType[] = [];
  overrideValues.forEach((i: any) => {
    const { value = '', overrideName = '' } = i || {};
    const keyIndex = overrideName.lastIndexOf('_');
    const overridobjectID = overrideValues.length > 0 ? overrideName.slice(0, keyIndex) : '';
    const overridType = overrideName.slice(keyIndex + 1);
    const overrideStyle = overrideValues.length > 0 ? documentSharedStyle.find((j) => j.do_objectID === value)?.value : undefined;
    overridList.push({
      style: overrideStyle,
      oid: overridobjectID,
      type: overridType,
      text: overridType === 'stringValue' || overridType === 'symbolID' ? value : undefined,
      parentId: item.do_objectID,
    });
  });
  let itemStyle;
  let itemValueOverride: string | undefined;
  let overrideSymbolID;
  parentList.forEach((j) => { // 覆盖的值value，style等
    if (j.oid === item.do_objectID) {
      if (j.style && j.type === 'layerStyle') itemStyle = j.style;
      if (j.type === 'stringValue') itemValueOverride = j.text;
      if (j.type === 'symbolID') overrideSymbolID = j.text;
    }
  }); // 覆盖的值和style

  const {
    textStyle = {},
    fills = [],
    borders = [],
    shadows = [],
    contextSettings = {},
    borderOptions = {},
    windingRule: styleRule,
  } = itemStyle || style || {};
  let color;
  let font;
  let family;
  let textAlign;
  let lineHeight;
  if (Object.keys(textStyle).length) { // 文字样式
    const { MSAttributedStringColorAttribute = {}, MSAttributedStringFontAttribute = {}, paragraphStyle = {} } = textStyle.encodedAttributes || {};
    color = getColor(MSAttributedStringColorAttribute);
    font = MSAttributedStringFontAttribute?.attributes?.size;
    family = MSAttributedStringFontAttribute?.attributes?.name;
    textAlign = alignMap[paragraphStyle.alignment || 0];
    lineHeight = paragraphStyle.maximumLineHeight ? `${paragraphStyle.maximumLineHeight}px` : undefined;
  }

  // fillType === 0 背景 使用color填充， 1 使用Gradient渐变填充 2 使用 Pattern 图案填充
  // 背景色
  const {
    color: bgColor = {}, isEnabled: isFillendable = false, gradient = {}, fillType = 0,
  } = fills.length > 0 ? fills[fills.length - 1] : {};

  // border样式
  const {
    color: borderC = {}, thickness = 1, isEnabled = false, gradient: borderGradient = {}, fillType: borderFillType = 0,
  } = borders.length > 0 ? borders[borders.length - 1] : {};
  // border线段 type
  const { dashPattern = [], isEnabled: borderOpEnabled } = borderOptions;

  // 阴影样式
  const {
    blurRadius, color: cshadow, isEnabled: isShadow, offsetX: x, offsetY: y, spread,
  } = shadows[0] || {};
  const boxShadow = isShadow ? `${x}px ${y}px ${blurRadius}px ${spread}px ${getColor(cshadow)}` : undefined;
  const background = isFillendable ? getColor(bgColor) : undefined;
  const linearGradient = getGradient(gradient);
  const borderColor = isEnabled ? (borderFillType === 1 ? getGradient(borderGradient) : getColor(borderC)) : 'transparent';
  const borderType = borderOpEnabled && dashPattern.length > 0 ? 'dashed' : 'solid';
  const borderWidth = thickness;
  const border = isEnabled ? `${thickness}px ${borderType} ${borderColor}` : undefined;
  const radius = fixedRadius ? `${fixedRadius}px` : className === 'oval' ? '50%' : undefined;

  // 填充图片
  let src;
  if (className === 'bitmap' && image) {
    const { _ref } = image || {};
    const currentImg = _ref ? imgs.find((i) => i.key === _ref) : undefined;
    src = currentImg ? currentImg.src : undefined;
  }

  // isFlippedHorizontal, isFlippedVertical
  const rotate = 360 - (item.rotation || 0);

  // NSNonZeroWindingRule：非零缠绕。射线从左到右每交叉路径一次+1，从右到左每交叉一次-1。如果最终交叉数为0，则该点在路径之外；如果交叉数不为0，则在路径之内。默认缠绕规则。
  // windingRule === 0 不需要填充
  const currentStyle: any = {
    position: 'absolute',
    top: `${item.frame.y * wp}px`,
    left: `${item.frame.x * wp}px`,
    width: `${item.frame.width * wp}px`,
    height: `${item.frame.height * wp}px`,
    border: overId === item.do_objectID ? '1px solid red' : border,
    color,
    fontSize: `${font}px`,
    fontFamily: family,
    textAlign,
    background: (windingRule !== 0 && className !== 'shapeGroup' && className !== 'text') ? (fillType === 1 ? `${linearGradient}` : background) : undefined,
    boxShadow,
    transform: isFlippedHorizontal ? 'rotateY(180deg)' : isFlippedVertical ? 'rotateX(180deg)' : rotate ? `rotate(${rotate}deg)` : undefined,
    display: isVisible ? undefined : 'none',
    opacity: contextSettings.opacity,
    lineHeight,
    borderRadius: radius,
    boxSizing: isEnabled ? 'border-box' : undefined,
  };
  if (className === 'bitmap') { // 图片
    Object.assign(currentStyle, {
      backgroundImage: `url(${src})`,
    });
  }

  const shapeStyle = {
    position: currentStyle.position,
    top: currentStyle.top,
    left: currentStyle.left,
    width: currentStyle.width,
    height: currentStyle.height,
    transform: currentStyle.transform,
    display: currentStyle.display,
  };

  return {
    currentStyle,
    itemValueOverride,
    background,
    borderColor,
    borderType,
    borderWidth,
    opacity: contextSettings.opacity,
    dashPattern: borderOpEnabled ? dashPattern : [],
    gradient,
    fillType,
    overridList,
    borderFillType,
    borderGradient,
    shapeStyle,
    parentStyle,
    overrideSymbolID,
  };
};
