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

export const getColor = (color: any = {}) => `rgba(${(color.red * 255).toFixed(0)}, ${(color.green * 255).toFixed(0)}, ${(color.blue * 255).toFixed(0)}, ${color.alpha})`;

export const getConvertedToNewRoundCorners = (points: any[] = []) => {
  let radius = '';
  (points || []).forEach((item: any) => {
    radius += `${item.cornerRadius}px `;
  });
  return radius;
};

export const getStyleChildrenInfo = (
  item: any,
  documentSharedStyle: any[], // 全局样式
  parentList: overrideListType[], // 父级传过来覆盖的样式文案
  imgs: any[], // 图片
  overId: string,
  wp: number, // 比例
  parentInfo: any = {},
  index: number,
) => {
  const {
    style = {}, image, isVisible,
    fixedRadius, overrideValues = [],
    isFlippedHorizontal, isFlippedVertical, windingRule, _class: className,
    hasConvertedToNewRoundCorners, points,
    textBehaviour,
  } = item || {};
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

  let parentStyle;
  if (parentInfo.windingRule === 0 && style?.windingRule === 1) {
    parentStyle = parentInfo.style;
  }

  const {
    textStyle = {},
    fills = [],
    borders = [],
    shadows = [],
    contextSettings = {},
    borderOptions = {},
  } = itemStyle || parentStyle || style || {};
  let color;
  let font;
  let family;
  let textAlign;
  let lineHeight;
  let whiteSpace;
  if (Object.keys(textStyle).length) { // 文字样式
    const text = itemValueOverride || item.attributedString?.string || '';
    const reg = /[\n]/;
    const { MSAttributedStringColorAttribute = {}, MSAttributedStringFontAttribute = {}, paragraphStyle = {} } = textStyle.encodedAttributes || {};
    color = getColor(MSAttributedStringColorAttribute);
    font = MSAttributedStringFontAttribute?.attributes?.size;
    family = MSAttributedStringFontAttribute?.attributes?.name;
    textAlign = alignMap[paragraphStyle.alignment || 0];
    lineHeight = paragraphStyle.maximumLineHeight ? `${paragraphStyle.maximumLineHeight}px` : undefined;
    whiteSpace = text.match(reg) ? 'pre-wrap' : typeof textBehaviour !== 'undefined' ? textMap[textBehaviour] : undefined;
  }

  // fillType === 0 背景 使用color填充， 1 使用Gradient渐变填充 2 使用 Pattern 图案填充
  // 背景色
  const {
    color: bgColor = {}, isEnabled: isFillendable = false, gradient = {}, fillType = 0,
  } = fills.length > 0 ? fills[parentStyle ? index : fills.length - 1] || {} : {};

  // border样式
  const {
    color: borderC = {}, thickness = 1, isEnabled = false, gradient: borderGradient = {}, fillType: borderFillType = 0,
  } = borders.length > 0 ? borders[parentStyle ? index : borders.length - 1] || {} : {};
  // border线段 type
  const { dashPattern = [], isEnabled: borderOpEnabled } = borderOptions;

  // 阴影样式
  const {
    blurRadius, color: cShadow, isEnabled: isShadow, offsetX: x, offsetY: y, spread,
  } = shadows[0] || {};
  const boxShadow = isShadow ? `${x}px ${y}px ${blurRadius}px ${spread}px ${getColor(cShadow)}` : undefined;
  const background = isFillendable ? getColor(bgColor) : undefined;
  const linearGradient = getGradient(gradient);
  const borderColor = isEnabled ? (borderFillType === 1 ? getGradient(borderGradient) : getColor(borderC)) : 'transparent';
  const borderType = borderOpEnabled && dashPattern.length > 0 ? 'dashed' : 'solid';
  const borderWidth = thickness;
  const border = isEnabled ? `${thickness}px ${borderType} ${borderColor}` : undefined;
  const radius = hasConvertedToNewRoundCorners ? getConvertedToNewRoundCorners(points) : fixedRadius ? `${fixedRadius}px` : className === 'oval' ? '50%' : undefined;

  // 填充图片
  let src;
  if (className === 'bitmap' && image) {
    const { _ref } = image || {};
    const currentImg = _ref ? imgs.find((i) => i.key === _ref) : undefined;
    src = currentImg ? currentImg.src : undefined;
  }

  const flip = isFlippedHorizontal || isFlippedVertical ? 180 : 0; // 垂直水平旋转

  const rotate = item.rotation ? 360 - item.rotation + flip : 0;

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
    transform: rotate ? `rotate(${rotate}deg)` : isFlippedHorizontal ? 'rotateY(180deg)' : isFlippedVertical ? 'rotateX(180deg)' : undefined,
    display: isVisible ? 'block' : 'none',
    opacity: contextSettings.opacity === 1 ? undefined : contextSettings.opacity,
    lineHeight,
    borderRadius: radius,
    boxSizing: isEnabled ? 'border-box' : undefined,
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
    overrideList,
    borderFillType,
    borderGradient,
    shapeStyle,
    overrideSymbolID,
  };
};
