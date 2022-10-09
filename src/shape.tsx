/* eslint-disable no-lonely-if */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import React, { useEffect } from 'react';
import {
  getCanvasGradient, getCircle, getRectCircle, uuid,
} from './utils';

const Shape = (props: any) => {
  const {
    item,
    lineWidth = 1, // 线宽
    borderColor = 'transparent', // 线条颜色
    fillStyle = 'transparent', // 填充色
    gradient = {}, // 填充渐变
    fillType = 0, // 填充类型
    opacity = 1,
    dashPattern = [], // 虚线
    borderFillType = 0, // 线的填充类型
    borderGradient = {}, // 线的渐变
  } = props;
  const id = uuid();
  useEffect(() => {
    const div = document.getElementById(`${id}`);
    let linerColor = null;
    let borderGradientColor = null;
    if (div) {
      const Canvas = document.createElement('canvas');
      if (Canvas) {
        const ratio = window.devicePixelRatio || 1;
        Canvas.width = item.frame.width * ratio;
        Canvas.height = item.frame.height * ratio;
        Canvas.setAttribute('style', `position: absolute; left: 0px; top: 0px; width: ${item.frame.width}px; height: ${item.frame.height}px`);
        const context: CanvasRenderingContext2D | null = Canvas.getContext('2d');
        if (context) {
          context.scale(ratio, ratio);
          context.globalAlpha = opacity;
          if (fillType === 1) { // 渐变填充
            linerColor = getCanvasGradient(context, gradient, item.frame.width, item.frame.height);
          }
          if (borderFillType === 1) { // border 渐变填充
            borderGradientColor = getCanvasGradient(context, borderGradient, item.frame.width, item.frame.height);
          }
          if (dashPattern.length > 0) {
            if (item._class === 'oval') { // 圆
              getCircle(context, item, borderFillType === 1 ? borderGradientColor : borderColor, dashPattern, lineWidth, fillType, linerColor, fillStyle);
            } else { // 矩形圆
              getRectCircle(context, item, lineWidth, borderFillType === 1 ? borderGradientColor : borderColor, dashPattern, fillType, linerColor, fillStyle);
            }
          } else { // 普通图形
            context.beginPath();
            context.strokeStyle = borderFillType === 1 && borderGradientColor ? borderGradientColor : borderColor;
            context.lineWidth = lineWidth;
            (item.points || []).forEach((i: any, idx: number) => {
              const current = i.point.slice(1, i.point.length - 1).split(',');
              const from = i.curveFrom.slice(1, i.curveFrom.length - 1).split(',');
              const to = i.curveTo.slice(1, i.curveTo.length - 1).split(',');

              if (idx === 0) {
                context.moveTo(Number(current[0]) * item.frame.width, Number(current[1]) * item.frame.height);
              } else if (!i.hasCurveFrom && !i.hasCurveTo) {
                context.lineTo(Number(current[0]) * item.frame.width, Number(current[1]) * item.frame.height);
              } else {
                context.quadraticCurveTo(Number(to[0]) * item.frame.width, Number(to[1]) * item.frame.height, Number(current[0]) * item.frame.width, Number(current[1]) * item.frame.height);
              }
            });
            context.fillStyle = item.windingRule !== 0 ? (fillType === 1 && linerColor ? linerColor : fillStyle || 'transparent') : 'transparent';
            context.fill();
            context.stroke();
            context.closePath();
          }
        }
      }
      div.appendChild(Canvas);
    }
  }, []);
  return (
    <div id={id} />
  );
};

export default Shape;

export const TestCanvas = (props: any) => {
  const id = uuid();
  const { item } = props;
  const { layers } = item;

  const [paths, setPaths] = React.useState<any[]>([]);

  useEffect(() => {
    layers.forEach((i: any) => {
      let result = '';
      (i.points || []).forEach((j: any, idx: number) => {
        const current = j.point.slice(1, j.point.length - 1).split(',');
        const form = j.curveFrom.slice(1, j.curveFrom.length - 1).split(',');
        const to = j.curveTo.slice(1, j.curveTo.length - 1).split(',');
        const ML = `${idx === 0 ? 'M' : 'L'} ${Number(current[0]) * i.frame.width + i.frame.x} ${Number(current[1]) * i.frame.height + i.frame.y}`;
        const C = `C${Number(form[0]) * i.frame.width + i.frame.x} ${Number(form[1]) * i.frame.height + i.frame.y} ${Number(to[0]) * i.frame.width + i.frame.x} ${Number(to[1]) * i.frame.height + i.frame.y} ${Number(current[0]) * i.frame.width + i.frame.x} ${Number(current[1]) * i.frame.height + i.frame.y}`;
        result += `${ML} ${C}`;
      });
      setPaths((list) => list.concat([{ key: i.do_objectID, path: `${result} Z`, i }]));
    });
  }, []);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <svg width={item.frame.width} height={item.frame.height} viewBox={`0 0 ${item.frame.width} ${item.frame.height}`}>
        {(paths || []).map((i) => (
          <path key={i.key} d={`${i.path}`} stroke="blue" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
};
