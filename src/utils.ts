/* eslint-disable no-nested-ternary */
/* eslint-disable no-bitwise */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */

export interface overrideListType {
  style?: any;
  oid: string;
  type: string;
  text?: string;
  parentId?: 'stringValue' | 'layerStyle' | 'fillColor' | 'textStyle' | 'symbolID';
}

// const i1 = {
//   height: 176.84,
//   width: 135.18,
//   x: 101.83,
//   y: 72.65999999999998,
//   x1: 128.160095,
//   y1: 115.079887,
//   x2: 269.580109,
//   y2: 272.779877,
//   from: '{0.19477733441404804, 0.239877856}',
//   to: '{1.2409380088733715, 1.13164442}',
// };

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

const textMap: any = {
  0: 'nowrap',
  1: 'pre-wrap',
  2: 'nowrap', // 应该是省略号
};
export const StringToArray = (current: string) => {
  const tem = current.slice(1, current.length - 1);
  return tem.split(',');
};

export const getGradientXY = (gradient: any = {}, item: any = {}) => {
  const { from = '', to = '' } = gradient;
  const {
    x, y, width, height,
  } = item.frame || {};
  const f = StringToArray(from);
  const t = StringToArray(to);
  return {
    x1: f.length > 0 ? (Number(f[0]) * width + x).toFixed(3) : '0%',
    y1: f.length > 1 ? (Number(f[1]) * height + y).toFixed(3) : '0%',
    x2: t.length > 0 ? (Number(t[0]) * width + x).toFixed(3) : '100%',
    y2: t.length > 1 ? (Number(t[1]) * height + y).toFixed(3) : '0%',
  };
};

export const colorParser = (color: number) => (color * 255).toFixed(0);

export const getColor = (color: any = {}) => `rgba(${colorParser(color.red)}, ${colorParser(color.green)}, ${colorParser(color.blue)}, ${color.alpha})`;

export const getGradient = (gradient: any) => { // 渐变
  const { stops = [], gradientType = 0 } = gradient || {};
  let color = '';
  const linear = gradientTypeMap[gradientType] || 'linear-gradient';
  stops.forEach((item: any) => {
    color += `${getColor(item.color)} ${item.position * 100}%,`;
  });
  return `${linear}(${color.slice(0, color.length - 1)})`;
};

export const getConvertedToNewRoundCorners = (points: any[] = []) => {
  let radius = '';
  (points || []).forEach((item: any) => {
    radius += `${item.cornerRadius}px `;
  });
  return radius;
};

export const getBorders = (borders: any[] = [], borderOptions: any, parentStyle: any, index: number) => {
  // border样式
  const {
    color: borderC = {}, thickness = 0, isEnabled = false, gradient: borderGradient = {}, fillType = 0,
  } = borders.length > 0 ? borders[parentStyle ? index : borders.length - 1] || {} : {};
  // border线段 type
  const { dashPattern = [], isEnabled: borderOpEnabled } = borderOptions;
  const borderColor = isEnabled ? (fillType === 1 ? getGradient(borderGradient) : getColor(borderC)) : 'transparent';
  const borderType = borderOpEnabled && dashPattern.length > 0 ? 'dashed' : 'solid';
  const borderWidth = thickness;
  const border = isEnabled ? `${thickness}px ${borderType} ${borderColor}` : undefined;
  // 如果borderColor颜色是渐变的就用svg画， 渐变色不能用来当作borderColor
  return {
    borderFillType: fillType,
    borderGradient,
    borderWidth,
    borderColor,
    borderType,
    borderIsEnabled: isEnabled,
    border,
    borderOpEnabled,
    dashPattern,
    isBorderGradient: isEnabled && fillType > 0,
  };
};

export const getFills = (fills: any[] = [], parentStyle: any, index: number, windingRule?: number, styleWindingRule?: number) => {
  // fillType === 0 背景 使用color填充， 1 使用Gradient渐变填充 2 使用 Pattern 图案填充
  // 背景色
  const {
    color: bgColor = {}, isEnabled = false, gradient = {}, fillType = 0,
  } = fills.length > 0 ? fills[parentStyle ? index : fills.length - 1] || {} : {};
  const background = isEnabled ? getColor(bgColor) : (windingRule === 0 || styleWindingRule === 0) ? '#fff' : undefined;
  const linearGradient = getGradient(gradient);
  return {
    background,
    linearGradient,
    fillType,
    gradient,
    isFillGradient: isEnabled && fillType > 0,
  };
};

export const getBoxShadow = (shadows: any[] = []) => {
  // 阴影样式
  const {
    blurRadius, color: cShadow, isEnabled: isShadow, offsetX: x, offsetY: y, spread,
  } = shadows[0] || {};
  const boxShadow = isShadow ? `${x}px ${y}px ${blurRadius}px ${spread}px ${getColor(cShadow)}` : undefined;
  return boxShadow;
};

export const getRadius = (item: any) => {
  const {
    hasConvertedToNewRoundCorners, points, fixedRadius, _class: className,
  } = item;
  const radius = hasConvertedToNewRoundCorners ? getConvertedToNewRoundCorners(points) : fixedRadius ? `${fixedRadius}px` : className === 'oval' ? '50%' : undefined;
  return radius;
};

export const getTextStyle = (textStyle: any, itemValueOverride: any, item: any) => {
  // 文案样式
  const { textBehaviour, attributedString } = item;
  let color;
  let font;
  let family;
  let textAlign;
  let lineHeight;
  let whiteSpace;
  if (Object.keys(textStyle).length) { // 文字样式
    const text = itemValueOverride || attributedString?.string || '';
    const reg = /[\n]/;
    const { MSAttributedStringColorAttribute = {}, MSAttributedStringFontAttribute = {}, paragraphStyle = {} } = textStyle.encodedAttributes || {};
    color = getColor(MSAttributedStringColorAttribute);
    font = MSAttributedStringFontAttribute?.attributes?.size;
    family = MSAttributedStringFontAttribute?.attributes?.name;
    textAlign = alignMap[paragraphStyle.alignment || 0];
    lineHeight = paragraphStyle.maximumLineHeight ? `${paragraphStyle.maximumLineHeight}px` : undefined;
    whiteSpace = text.match(reg) ? 'pre-wrap' : typeof textBehaviour !== 'undefined' ? textMap[textBehaviour] : undefined;
  }
  return {
    color,
    font,
    family,
    textAlign,
    lineHeight,
    whiteSpace,
  };
};

export const getSrc = (item: any, imgs: any[] = []) => {
  // 填充图片src
  const { _class: className, image } = item;
  let src;
  if (className === 'bitmap' && image) {
    const { _ref } = image || {};
    const currentImg = _ref ? imgs.find((i) => i.key === _ref) : undefined;
    src = currentImg ? currentImg.src : undefined;
  }
  return src;
};

export const getOverrideList = (item: any, documentSharedStyle: any[] = []) => {
  const { overrideValues = [], do_objectID: doObjectID } = item;
  const overrideList: overrideListType[] = [];
  overrideValues.forEach((i: any) => { // 覆盖的值
    const { value = '', overrideName = '' } = i || {};
    const keyIndex = overrideName.lastIndexOf('_');
    const overrideObjectID = overrideValues.length > 0 ? overrideName.slice(0, keyIndex) : '';
    const overrideType = overrideName.slice(keyIndex + 1);
    const overrideStyle = overrideValues.length > 0 ? documentSharedStyle.find((j) => j.do_objectID === value)?.value : undefined;
    overrideList.push({
      style: overrideStyle,
      oid: overrideObjectID,
      type: overrideType,
      text: overrideType === 'stringValue' || overrideType === 'symbolID' ? value : undefined,
      parentId: doObjectID,
    });
  });
  return overrideList;
};

export const getItemStyle = (parentList: overrideListType[] = [], item: any = {}) => {
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
  return {
    itemStyle,
    itemValueOverride,
    overrideSymbolID,
  };
};

export const getStyleChildrenInfo = (
  item: any,
  parentList: overrideListType[], // 父级传过来覆盖的样式文案
  imgs: any[], // 图片
  overId: string,
  parentInfo: any = {},
  index: number,
) => {
  const {
    style = {}, isVisible,
    isFlippedHorizontal, isFlippedVertical, windingRule, _class: className,
    textBehaviour,
  } = item || {};

  let parentStyle;
  if (parentInfo.windingRule === 0 && style?.windingRule === 1) {
    parentStyle = parentInfo.style;
  }

  const { itemStyle, itemValueOverride, overrideSymbolID } = getItemStyle(parentList, item);

  const {
    textStyle = {},
    fills = [],
    borders = [],
    shadows = [],
    contextSettings = {},
    borderOptions = {},
    windingRule: styleWindingRule,
  } = itemStyle || parentStyle || style || {};

  const flip = isFlippedHorizontal || isFlippedVertical ? 180 : 0; // 垂直水平旋转

  const rotate = item.rotation ? 360 - item.rotation + flip : 0;

  // NSNonZeroWindingRule：非零缠绕。射线从左到右每交叉路径一次+1，从右到左每交叉一次-1。如果最终交叉数为0，则该点在路径之外；如果交叉数不为0，则在路径之内。默认缠绕规则。
  // windingRule === 0 不需要填充 (使用#fff填充)
  // windingRule === 1 使用自己的颜色填充

  const {
    border, borderWidth, borderType, borderColor, borderFillType, borderGradient, borderIsEnabled, borderOpEnabled, dashPattern, isBorderGradient,
  } = getBorders(borders, borderOptions, parentStyle, index);

  const {
    background, linearGradient, fillType, gradient, isFillGradient,
  } = getFills(fills, parentStyle, index, windingRule, styleWindingRule);
  const {
    color,
    font,
    family,
    textAlign,
    lineHeight,
    whiteSpace,
  } = getTextStyle(textStyle, itemValueOverride, item);
  const boxShadow = getBoxShadow(shadows);
  const radius = getRadius(item);
  const src = getSrc(item, imgs);
  const currentStyle: any = {
    position: 'absolute',
    top: `${item.frame.y}px`,
    left: `${item.frame.x}px`,
    width: `${item.frame.width}px`,
    height: `${item.frame.height}px`,
    border: overId === item.do_objectID ? '1px solid red' : border,
    color,
    fontSize: `${font}px`,
    fontFamily: family,
    textAlign,
    background: (className !== 'shapeGroup' && className !== 'text') ? (fillType === 1 ? `${linearGradient}` : background) : undefined,
    boxShadow,
    transform: rotate ? `rotate(${rotate}deg)` : isFlippedHorizontal ? 'rotateY(180deg)' : isFlippedVertical ? 'rotateX(180deg)' : undefined,
    display: isVisible ? 'block' : 'none',
    opacity: contextSettings.opacity === 1 ? undefined : contextSettings.opacity,
    lineHeight,
    borderRadius: radius,
    boxSizing: borderIsEnabled ? 'border-box' : undefined,
    whiteSpace,
    textOverflow: textBehaviour === 2 ? 'ellipsis' : undefined,
    overflow: textBehaviour === 2 ? 'hidden' : undefined,
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
    borderFillType,
    borderGradient,
    shapeStyle,
    overrideSymbolID,
    isGradient: isBorderGradient || isFillGradient,
  };
};
