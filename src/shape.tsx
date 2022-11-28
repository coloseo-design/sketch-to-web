/* eslint-disable react/no-array-index-key */
/* eslint-disable react/style-prop-object */
/* eslint-disable no-lonely-if */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import React from 'react';
import { getColor } from './utils';
import pathParser from './parser';

const PointSvg = (props: any) => {
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
  const fill = fillType === 1 ? `url(#${item.do_objectID}-fill)` : fillStyle;
  const stroke = borderFillType === 1 ? `url(#${item.do_objectID}-stroke)` : borderColor;
  const strokeDasharray = (dashPattern || []).join(' ');

  return (
    <svg
      style={{
        position: 'absolute',
        // minHeight: 1500,
        // minWidth: 1500,
        // top: -item.frame.y,
        // left: -item.frame.x,
        // top: -lineWidth / 2,
        // left: -lineWidth / 2,
      }}
      // width={item.frame.width}
      // height={item.frame.height}
      viewBox={`${item.frame.x - lineWidth / 2} ${item.frame.y - lineWidth / 2} ${item.frame.width + lineWidth} ${item.frame.height + lineWidth}`}
    >
      {fillType === 1 && gradient.gradientType === 0
        && (
          <defs>
            <linearGradient id={`${item.do_objectID}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
              {(gradient?.stops || []).map((j: any, idx: number) => (
                <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
              ))}
            </linearGradient>
          </defs>
        )}
      {fillType === 1 && gradient.gradientType === 1
        && (
          <defs>
            <radialGradient id={`${item.do_objectID}-fill`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              {(gradient?.stops || []).map((j: any, idx: number) => (
                <stop key={idx} offset={`${j.position * 100}%`} stopColor={`${getColor(j.color)}`} />
              ))}
            </radialGradient>
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
      {item._class === 'rectangle' ? <rect rx={item.fixedRadius || 0} x={item.frame.x + lineWidth} y={item.frame.y + lineWidth} fill={fill} stroke={stroke} strokeWidth={lineWidth} strokeDasharray={strokeDasharray} width={item.frame.width - 2 * lineWidth} height={item.frame.height - 2 * lineWidth} />
        : <path d={svgInfo} strokeLinecap="round" opacity={opacity} fill={fill} stroke={stroke} strokeWidth={lineWidth} strokeDasharray={strokeDasharray} />}

    </svg>
  );
};

export default PointSvg;
