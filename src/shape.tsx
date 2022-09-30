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
    let borderGradientCorlor = null;
    if (div) {
      const Canvas = document.createElement('canvas');
      if (Canvas) {
        const ratio = window.devicePixelRatio || 1;
        Canvas.width = item.frame.width * ratio;
        Canvas.height = item.frame.height * ratio;
        // const { width: w = 350, height: h } = item.frame || {};
        const w = 350;
        const h = 350;
        Canvas.setAttribute('style', `position: absolute; left: 0px; top: 0px; width: ${item.frame.width}px; height: ${item.frame.height}px`);
        const context: CanvasRenderingContext2D | null = Canvas.getContext('2d');
        if (context) {
          context.scale(ratio, ratio);
          context.globalAlpha = opacity;
          if (fillType === 1) {
            linerColor = getCanvasGradient(context, gradient, item.frame.width, item.frame.height);
          }
          if (borderFillType === 1) {
            borderGradientCorlor = getCanvasGradient(context, borderGradient, item.frame.width, item.frame.height);
          }
          if (dashPattern.length > 0) {
            if (item._class === 'oval') { // 圆
              getCircle(context, item, borderFillType === 1 ? borderGradientCorlor : borderColor, dashPattern, lineWidth, fillType, linerColor, fillStyle);
            } else { // 矩形圆
              getRectCircle(context, item, lineWidth, borderFillType === 1 ? borderGradientCorlor : borderColor, dashPattern, fillType, linerColor, fillStyle);
            }
          } else { // 普通图形
            context.beginPath();
            context.strokeStyle = borderFillType === 1 && borderGradientCorlor ? borderGradientCorlor : borderColor;
            context.lineWidth = lineWidth;
            const list: any = [];
            (item.points || []).forEach((i: any, idx: number) => {
              const current = i.point.slice(1, i.point.length - 1).split(',');
              const form = i.curveFrom.slice(1, i.curveFrom.length - 1).split(',');
              const to = i.curveTo.slice(1, i.curveTo.length - 1).split(',');
              list.push([[form[0] * w, form[1] * h], [current[0] * w, current[1] * h], [to[0] * w, to[1] * h]]);

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
  useEffect(() => {
    const div = document.getElementById(`${id}-canvas`);
    if (div) {
      const ratio = window.devicePixelRatio || 1;
      const Canvas = document.createElement('canvas');
      Canvas.width = item.frame.width * ratio;
      Canvas.height = item.frame.height * ratio;
      Canvas.setAttribute('style', `position: absolute; left: 0px; top: 0px; width: ${item.frame.width}px; height: ${item.frame.height}px`);
      const context: CanvasRenderingContext2D | null = Canvas.getContext('2d');
      if (context) {
        context.scale(ratio, ratio);
        (layers || []).forEach((i:any) => {
          const { fills = [], borders = [], contextSettings } = i.style || {};
          const {
            color: borderC = {}, thickness = 1, isEnabled = false, gradient: borderGradient = {}, fillType: borderFillType = 0,
          } = borders.length > 0 ? borders[borders.length - 1] : {};
          const borderColor = isEnabled ? `rgba(${borderC.red * 255}, ${borderC.green * 255}, ${borderC.blue * 255}, ${borderC.alpha})` : 'transparent';
          const {
            fillType = 0, gradient = {}, color = {}, isEnabled: isFillendable = false,
          } = fills.length > 0 ? fills[fills.length - 1] : {};
          let linerColor = null;
          let borderGradientCorlor = null;
          const fillStyle = isFillendable ? `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, ${color.alpha})` : 'transparent';
          if (fillType === 1) {
            linerColor = getCanvasGradient(context, gradient, i.frame.width, i.frame.height);
          }

          if (borderFillType === 1) {
            borderGradientCorlor = getCanvasGradient(context, borderGradient, i.frame.width, i.frame.height);
          }
          context.save();
          context.beginPath();
          context.strokeStyle = borderFillType === 1 && borderGradientCorlor ? borderGradientCorlor : borderColor;
          context.lineWidth = thickness;
          context.globalAlpha = contextSettings.opacity || 1;
          context.translate(i.frame.x, i.frame.y);
          (i.points || []).forEach((j: any, idx: number) => {
            const current = j.point.slice(1, j.point.length - 1).split(',');
            const form = j.curveFrom.slice(1, j.curveFrom.length - 1).split(',');
            const to = j.curveTo.slice(1, j.curveTo.length - 1).split(',');
            if (!j.hasCurveFrom && !j.hasCurveTo) {
              if (idx === 0) {
                context.moveTo(Number(current[0]) * i.frame.width, Number(current[1]) * i.frame.height);
              } else {
                context.lineTo(Number(current[0]) * i.frame.width, Number(current[1]) * i.frame.height);
              }
            } else {
              if (idx === 0) {
                context.moveTo(Number(current[0]) * i.frame.width, Number(current[1]) * i.frame.height);
              } else {
                context.quadraticCurveTo(Number(form[0]) * i.frame.width, Number(form[1]) * i.frame.height, Number(to[0]) * i.frame.width, Number(to[1]) * i.frame.height);
              }
            }
          });
          context.fillStyle = i.windingRule !== 0 ? (fillType === 1 && linerColor ? linerColor : fillStyle || 'transparent') : 'transparent';
          context.fill();
          context.stroke();
          context.closePath();
          context.restore();
        });
      }
      div.appendChild(Canvas);
    }
  }, []);
  return (
    <div id={`${id}-canvas`} />
  );
};
