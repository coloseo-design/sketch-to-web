/* eslint-disable func-names */
/* eslint-disable operator-assignment */
/* eslint-disable no-plusplus */

const pathParser = function (item) {
  const { points = [] } = item;
  const { x, y } = getXY(points[0].point, item);
  let ret = `M${toS(x)},${toS(y)}`;
  const n = item.isClosed ? points.length + 1 : points.length;
  for (let i = 1; i < n; ++i) {
    let now = i;
    if (now === points.length) {
      now = 0;
    }
    const prev = (i - 1);
    const { x: x1, y: y1 } = getXY(points[prev].curveFrom, item);
    const { x: x2, y: y2 } = getXY(points[now].curveTo, item);
    const { x: currentX, y: currentY } = getXY(points[now].point, item);
    if (!points[now].hasCurveTo && !points[now].hasCurveFrom) {
      ret += `L${toS(currentX)},${toS(currentY)}`;
    } else {
      ret += `C${toS(x1)},${toS(y1)} ${toS(x2)},${toS(y2)} ${toS(currentX)},${toS(currentY)}`;
    }
  }

  if (item.isClosed) {
    ret += 'Z';
  }
  return ret;
};
function toS(a) {
  return Number(a).toFixed(6).replace(/\.?0+$/, '');
}

function s2p(s) {
  const [x, y] = s.slice(1, s.length - 1).split(',');
  return { x, y };
}
function getXY(s, current) {
  let { x, y } = s2p(s);
  x = current.frame.width * x + current.frame.x;
  y = current.frame.height * y + current.frame.y;
  // x = current.frame.width * x;
  // y = current.frame.height * y;
  return { x, y };
}

export default pathParser;
