/* eslint-disable react/no-array-index-key */
/* eslint-disable react/style-prop-object */
/* eslint-disable no-lonely-if */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import React, { useEffect } from 'react';
import {
  getCanvasGradient, getCircle, getRectCircle, uuid, getColor,
} from './utils';
import pathParser from './parser';

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
  const { layers = [] } = item;

  const [paths, setPaths] = React.useState<any[]>([]);

  useEffect(() => {
    layers.forEach((i: any) => {
      const { style = {} } = i || {};
      const { fills = [], borders = [] } = style;
      const {
        fillType = 0, color: bgColor = {}, isEnabled: isFillendable = false, gradient = {},
      } = fills.length > 0 ? fills[0] : {};
      const {
        color: borderC = {}, thickness = 1, isEnabled = false, gradient: borderGradient = {}, fillType: borderFillType = 0,
      } = borders.length > 0 ? borders[borders.length - 1] : {};

      setPaths((list) => list.concat([{
        svgId: i.do_objectID,
        path: pathParser(i),
        svgStyle: {
          fillType,
          gradient,
          bgColor: getColor(bgColor),
          borderGradient,
          borderColor: getColor(borderC),
          borderWidth: thickness,
          borderFillType,
        },
        ...i,
      }]));
    });
  }, []);

  return (
    // <div style={{ position: 'absolute', top: 0, left: 0 }}>
    //   <svg id={item.do_objectID} width={item.frame.width} height={item.frame.height} viewBox={`0 0 ${item.frame.width} ${item.frame.height}`}>
    //     {(paths || []).map((i) => (
    //       <>
    //         {typeof i.svgStyle.fillType !== 'undefined'
    //           && (
    //             <defs>
    //               <linearGradient id={`${i.svgId}`} x1="0%" y1="0%" x2="100%" y2="0%">
    //                 {(i.svgStyle.gradient.stops || []).map((j: any, idx: number) => (
    //                   <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
    //                 ))}
    //               </linearGradient>
    //             </defs>
    //           )}
    //         {
    //         i.svgStyle.borderFillType === 1
    //           && (
    //             <defs>
    //               <linearGradient id={`${i.svgId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
    //                 {(i.svgStyle.borderGradient.stops || []).map((j: any, idx: number) => (
    //                   <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
    //                 ))}
    //               </linearGradient>
    //             </defs>
    //           )
    //         }
    //         <path d={`${i.path}`} fill={`url(#${i.svgId})`} stroke={i.svgStyle.borderFillType === 1 ? `url(#${i.svgId}-stroke)` : `${i.svgStyle.borderColor}`} strokeWidth={`${i.svgStyle.borderWidth}`} />
    //       </>
    //     ))}
    //   </svg>
    // </div>
    <>
      {(paths || []).map((i) => (
        <div
          key={i.svgId}
          style={{
            position: 'absolute',
            top: i.frame.y,
            left: i.frame.x,
            height: i.frame.height,
            width: i.frame.width,
          }}
        >
          <svg style={{ minWidth: i.frame.width, minHeight: i.frame.height }}>
            {typeof i.svgStyle.fillType !== 'undefined'
                   && (
                   <defs>
                     <linearGradient id={`${i.svgId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                       {(i.svgStyle.gradient.stops || []).map((j: any, idx: number) => (
                         <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
                       ))}
                     </linearGradient>
                   </defs>
                   )}
            {
            i.svgStyle.borderFillType === 1
              && (
                <defs>
                  <linearGradient id={`${i.svgId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
                    {(i.svgStyle.borderGradient.stops || []).map((j: any, idx: number) => (
                      <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
                    ))}
                  </linearGradient>
                </defs>
              )
            }
            <path d={`${i.path}`} fill={`url(#${i.svgId})`} stroke={i.svgStyle.borderFillType === 1 ? `url(#${i.svgId}-stroke)` : `${i.svgStyle.borderColor}`} strokeWidth={`${i.svgStyle.borderWidth}`} />
          </svg>
        </div>
      ))}
    </>
  );
};

export const PointSvg = (props: any) => {
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

  const svgInfo = pathParser(item);
  // FCE9ED37-B213-4178-B1DB-0C863A34A48D 锁的id
  return (
    <div
      key={item.do_objectID}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: item.frame.height,
        width: item.frame.width,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          minHeight: 500,
          minWidth: 500,
          top: -item.frame.y,
          left: -item.frame.x,
        }}
      >
        {fillType === 1
           && (
           <defs>
             <linearGradient id={`${item.do_objectID}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
               {(gradient?.stops || []).map((j: any, idx: number) => (
                 <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
               ))}
             </linearGradient>
           </defs>
           )}
        {
    borderFillType === 1
      && (
        <defs>
          <linearGradient id={`${item.do_objectID}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            {(borderGradient?.stops || []).map((j: any, idx: number) => (
              <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
            ))}
          </linearGradient>
        </defs>
      )
    }
        <path d={svgInfo} strokeLinecap="round" opacity={opacity} fill={fillType === 1 ? `url(#${item.do_objectID}-fill)` : fillStyle} stroke={borderFillType === 1 ? `url(#${item.do_objectID}-stroke)` : borderColor} strokeWidth={lineWidth} strokeDasharray={dashPattern.length > 0 ? `${dashPattern[0]} ${dashPattern[1]}` : ''} />
      </svg>
    </div>
  );
};
