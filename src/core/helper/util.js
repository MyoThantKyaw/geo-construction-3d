import { Vector2 } from "three"
import TWEEN from '@tweenjs/tween.js';

export const TWO_PI = Math.PI * 2;
export const PI_BY_2 = Math.PI / 2;
export const PI_BY_4 = Math.PI / 4;
export const THREE_PI_BY_2 = 3 * Math.PI / 2;
export const RAD_TO_DEG = 180 / Math.PI;
export const DEG_TO_RAD = Math.PI / 180;

export const hexToRgb = hex =>

  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
    , (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

const r = Math.round;
export function toRGBA(d) {
  const l = d.length;
  const rgba = {};
  if (d.slice(0, 3).toLowerCase() === 'rgb') {
    d = d.replace(' ', '').split(',');
    rgba[0] = parseInt(d[0].slice(d[3].toLowerCase() === 'a' ? 5 : 4), 10);
    rgba[1] = parseInt(d[1], 10);
    rgba[2] = parseInt(d[2], 10);
    rgba[3] = d[3] ? parseFloat(d[3]) : -1;
  } else {
    if (l < 6) d = parseInt(String(d[1]) + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? String(d[4]) + d[4] : ''), 16);
    else d = parseInt(d.slice(1), 16);
    rgba[0] = (d >> 16) & 255;
    rgba[1] = (d >> 8) & 255;
    rgba[2] = d & 255;
    rgba[3] = l === 9 || l === 5 ? r((((d >> 24) & 255) / 255) * 10000) / 10000 : -1;
  }
  return rgba;
}

export function blend(from, to, p = 0.5) {
  from = from.trim();
  to = to.trim();
  const b = p < 0;
  p = b ? p * -1 : p;
  const f = toRGBA(from);
  const t = toRGBA(to);
  if (to[0] === 'r') {
    return 'rgb' + (to[3] === 'a' ? 'a(' : '(') +
      r(((t[0] - f[0]) * p) + f[0]) + ',' +
      r(((t[1] - f[1]) * p) + f[1]) + ',' +
      r(((t[2] - f[2]) * p) + f[2]) + (
        f[3] < 0 && t[3] < 0 ? '' : ',' + (
          f[3] > -1 && t[3] > -1
            ? r((((t[3] - f[3]) * p) + f[3]) * 10000) / 10000
            : t[3] < 0 ? f[3] : t[3]
        )
      ) + ')';
  }

  return '#' + (0x100000000 + ((
    f[3] > -1 && t[3] > -1
      ? r((((t[3] - f[3]) * p) + f[3]) * 255)
      : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255
  ) * 0x1000000) +
    (r(((t[0] - f[0]) * p) + f[0]) * 0x10000) +
    (r(((t[1] - f[1]) * p) + f[1]) * 0x100) +
    r(((t[2] - f[2]) * p) + f[2])
  ).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3);
}

export function isTouchDevice() {

  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
}

export function getAngle(x, y) {

  let angle = Math.atan2(y, x);

  if (angle < 0) {
    angle = TWO_PI + angle;
  }

  return angle;
}

export function getAngle2Pts(pt1, pt2) {

  let angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);

  if (angle < 0) {
    angle = TWO_PI + angle;
  }

  return angle;
}

export function getAngleFromPt(x0, y0, x, y) {
  let angle = Math.atan2(y - y0, x - x0);

  if (angle < 0) {
    angle = TWO_PI + angle;
  }

  return angle;

}

export function getDistance(point1, point2) {
  return Math.sqrt(
    ((point2.x - point1.x) ** 2) + ((point2.y - point1.y) ** 2)
  );
}

export function getAngleDifference(angle1, angle2, isCounterClockWise = true) {


  if (angle1 < 0)
    angle1 += TWO_PI;

  if (angle2 < 0)
    angle2 += TWO_PI;

  angle1 %= TWO_PI
  angle2 %= TWO_PI

  if (isCounterClockWise) {

    if (angle1 > angle2)
      return TWO_PI - (angle1 - angle2);
    else
      return (angle2 - angle1);
  }
  else {

    if (angle2 > angle1)
      return TWO_PI - (angle2 - angle1);
    else  // angle 1 in greater
      return angle1 - angle2;

  }
}

export function getMinimumAngleDiff(angle1, angle2) {
  return Math.min(
    getAngleDifference(angle1, angle2),
    getAngleDifference(angle1, angle2, false)
  )
}

export function getVector2(pt1, pt2) {

  return new Vector2(pt2.x - pt1.x, pt2.y - pt1.y);

}

export function isFunction(functionToCheck) {

  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export function rotateVector(vector, angle) {

  return new Vector2(
    (Math.cos(angle) * vector.x) - (Math.sin(angle) * vector.y),
    (Math.sin(angle) * vector.x) + (Math.cos(angle) * vector.y)
  )

}

export function rotateVector_(vector, angle) {

  const x = vector.x;
  const y = vector.y;

  vector.x = (Math.cos(angle) * x) - (Math.sin(angle) * y);
  vector.y = (Math.sin(angle) * x) + (Math.cos(angle) * y);

}

export function rotateVectorArr_(vector, angle) {

  const x = vector[0];
  const y = vector[1];

  vector[0] = (Math.cos(angle) * x) - (Math.sin(angle) * y);
  vector[1] = (Math.sin(angle) * x) + (Math.cos(angle) * y);

}

export function getMidPoint(point1, point2) {
  return { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2 };
}
/**
 * 
 * @param {*} point1 
 * @param {*} point2 
 * @returns 
 */
export function getMidPoint_(point1, point2, out) {

  out.x = (point1.x + point2.x) / 2;
  out.y = (point1.y + point2.y) / 2;

}

export function getVectorOfLength(point1, point2, length) {
  const vector = { x: point2.x - point1.x, y: point2.y - point1.y };
  const len = Math.sqrt((vector.x ** 2) + (vector.y ** 2));

  vector.x = (vector.x / len) * length;
  vector.y = (vector.y / len) * length;

  return vector;
}

export function makeVectorOfLengthFrom2Pts(point1, point2, length, toVector) {

  const vector = { x: point2.x - point1.x, y: point2.y - point1.y };
  const len = Math.sqrt((vector.x ** 2) + (vector.y ** 2));

  toVector.x = (vector.x / len) * length;
  toVector.y = (vector.y / len) * length;

}

export function centerPolygon(pointArray) {

  const centerPoint = getCenterOfPoints(pointArray);

  pointArray.forEach(point => {
    point.x -= centerPoint.x;
    point.y -= centerPoint.y;
  });

}

export function getCenterOfPoints(pointArray) {

  const arr = [];
  pointArray.forEach(point => {
    arr.push([point.x, point.y]);
  });

  const x = arr.map(function (a) { return a[0] });
  const y = arr.map(function (a) { return a[1] });

  return { x: (Math.min.apply(null, x) + Math.max.apply(null, x)) / 2, y: (Math.min.apply(null, y) + Math.max.apply(null, y)) / 2 };

}

export function addTapListener(element, listener) {

  let pointerDownLoc = { x: -9999, y: -9999 };
  let pointerDownTime = 0;

  element.addEventListener("pointerdown", evt => {

    pointerDownLoc.x = evt.clientX;
    pointerDownLoc.y = evt.clientY;

    pointerDownTime = new Date().getTime();

  });

  element.addEventListener("pointerup", evt => {

    let dist = Math.sqrt(((evt.clientX - pointerDownLoc.x) ** 2) + ((evt.clientY - pointerDownLoc.y) ** 2));

    if (dist < 15 && (new Date().getTime() - pointerDownTime) < 330 && evt.button === 0) {

      pointerDownLoc = { x: -9999, y: -9999 };
      pointerDownTime = 0;

      listener(evt);

    }
  });
}

export function getShortestRotationDirection(fromAngle, toAngle) {

  if (fromAngle < 0) { fromAngle = TWO_PI + fromAngle; }

  if (toAngle < 0) { toAngle = TWO_PI + toAngle; }

  if (Math.abs(toAngle - fromAngle) > Math.PI) {

    if (fromAngle < toAngle) {

      fromAngle += TWO_PI;
    }
    else {
      toAngle += TWO_PI;
    }
  }

  return { fromAngle: fromAngle, toAngle: toAngle };
}

export function checkPointProjectionOnLine(point, startPoint, endPoint) {

  const vectorLine = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };
  const vectorPoint = { x: point.x - startPoint.x, y: point.y - startPoint.y };

  const vectorLineLen = Math.sqrt((vectorLine.x ** 2) + (vectorLine.y ** 2));

  const distFromOriginOnLine = ((vectorLine.x * vectorPoint.x) + (vectorLine.y * vectorPoint.y)) / vectorLineLen;

  if (distFromOriginOnLine < 0 || distFromOriginOnLine > vectorLineLen) {

    return 1;

  }
}

export function projectPointOnSegment(point, linePt1, linePt2) {

  const vectLineStartToPointX = point.x - linePt1.x;
  const vectLineStartToPointY = point.y - linePt1.y;

  const vectX = linePt2.x - linePt1.x;
  const vectY = linePt2.y - linePt1.y;

  const vectorLen = Math.sqrt((vectX ** 2) + (vectY ** 2));
  const distFromOriginOnLine = ((vectX * vectLineStartToPointX) + (vectY * vectLineStartToPointY)) / vectorLen;

  if (distFromOriginOnLine < 0) {
    return { x: linePt1.x, y: linePt1.y };
  }
  else if (distFromOriginOnLine > vectorLen) {
    return { x: linePt2.x, y: linePt2.y };
  }

  const dotProduct = Math.sqrt((vectLineStartToPointX ** 2) + (vectLineStartToPointY ** 2)) * Math.cos(getAngle(vectLineStartToPointX, vectLineStartToPointY) - getAngle(vectX, vectY));

  return { x: linePt1.x + (vectX / vectorLen) * dotProduct, y: linePt1.y + (vectY / vectorLen) * dotProduct };

}

export function projectPointOnLine(point, linePt1, linePt2) {

  const vectX = linePt2.x - linePt1.x;
  const vectY = linePt2.y - linePt1.y;

  const len = Math.sqrt((vectX ** 2) + (vectY ** 2));

  const vectPtX = point.x - linePt1.x;
  const vectPtY = point.y - linePt1.y;


  const dotProduct = Math.sqrt((vectPtX ** 2) + (vectPtY ** 2)) * Math.cos(getAngle(vectPtX, vectPtY) - getAngle(vectX, vectY));

  return { x: linePt1.x + (vectX / len) * dotProduct, y: linePt1.y + (vectY / len) * dotProduct };

}

export function getDistFromPtToLine(point, linePt1, linePt2) {

  const vectX = linePt2.x - linePt1.x;
  const vectY = linePt2.y - linePt1.y;

  const len = Math.sqrt((vectX ** 2) + (vectY ** 2));

  const vectPtX = point.x - linePt1.x;
  const vectPtY = point.y - linePt1.y;

  const dotProduct = Math.sqrt((vectPtX ** 2) + (vectPtY ** 2)) * Math.cos(getAngle(vectPtX, vectPtY) - getAngle(vectX, vectY));

  return Math.sqrt(((linePt1.x + (vectX / len) * dotProduct - point.x) ** 2) + ((linePt1.y + (vectY / len) * dotProduct - point.y) ** 2));

}

export function intersect2Lines4Pts(pt1, pt2, pt3, pt4) {

  const D = ((pt1.x - pt2.x) * (pt3.y - pt4.y)) - ((pt1.y - pt2.y) * (pt3.x - pt4.x));

  const ptIntersect = {
    x:
      ((((pt1.x * pt2.y) - (pt1.y * pt2.x)) * (pt3.x - pt4.x)) - ((pt1.x - pt2.x) * ((pt3.x * pt4.y) - (pt3.y * pt4.x)))) / D
    , y:
      ((((pt1.x * pt2.y) - (pt1.y * pt2.x)) * (pt3.y - pt4.y)) - ((pt1.y - pt2.y) * ((pt3.x * pt4.y) - (pt3.y * pt4.x)))) / D
  };

  if (isNaN(ptIntersect.x) || isNaN(ptIntersect.y))
    return undefined;

  return ptIntersect;

}

export function checkBetweenTwoPoint(point1, pt1, pt2) {

  const lineLen = Math.sqrt(((pt2.x - pt1.x) ** 2) + ((pt2.y - pt1.y) ** 2));
  return getDistance(pt1, point1) < lineLen && getDistance(pt2, point1) < lineLen;

}

export function intersectTwoSegments(pt1, pt2, pt3, pt4) {

  const pt = intersect2Lines4Pts(pt1, pt2, pt3, pt4);
  if (pt) {
    if (checkBetweenTwoPoint(pt, pt1, pt2) && checkBetweenTwoPoint(pt, pt3, pt4)) {
      return pt;
    }
  }
  return undefined;
}

export function getPolygonCentroid(pts, outPt) {

  var first = pts[0], last = pts[pts.length - 1];
  if (first.x != last.x || first.y != last.y) pts.push(first);
  var twicearea = 0,
    x = 0, y = 0,
    nPts = pts.length,
    p1, p2, f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i]; p2 = pts[j];
    f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
    twicearea += f;
    x += (p1.x + p2.x - 2 * first.x) * f;
    y += (p1.y + p2.y - 2 * first.y) * f;
  }
  f = twicearea * 3;

  outPt.x = x / f + first.x;
  outPt.y = y / f + first.y;
}

export function getColorWithOpacity(colorHex, opacity) {

  const colorRGB = hexToRgb(colorHex);
  return "rgba(" + colorRGB[0] + ", " + colorRGB[1] + ", " + colorRGB[2] + ", " + opacity + ")";
}

export function drawTestPoint(ptPx, ctx) {

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(ptPx.x, ptPx.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

export const isTouchAvailable = isTouchDevice();

export function isMobileAndTablet () {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


export function round(value, step) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

export function lineIsPointInPath(x, y, startPt, endPt) {

  const lineVector = new Vector2(endPt.x - startPt.x, endPt.y - startPt.y);
  const vectorToTestPtPx = new Vector2(x - startPt.x, y - startPt.y);

  const distFromOriginOnLine = lineVector.dot(vectorToTestPtPx.x, vectorToTestPtPx.y) / lineVector.mag();

  if (distFromOriginOnLine < 0 || distFromOriginOnLine > lineVector.mag()) {
    return 1;
  }

  lineVector.makeUnitVector();

  lineVector.x *= distFromOriginOnLine;
  lineVector.y *= distFromOriginOnLine;

  lineVector.x += startPt.x;
  lineVector.y += startPt.y;

  if (Math.sqrt(((lineVector.x - x) ** 2) + ((lineVector.y - y) ** 2)) < 15) {

    return -1;
  }

  return 1;
}

export function getLineFormula(pt1, pt2) {
  var m = (pt2.y - pt1.y) / (pt2.x - pt1.x);
  return { m: m, c: pt1.y - (m * pt1.x) }
}

export function getIntersectsCircleAndLine(c, r, pt1, pt2) {

  const projectedPtOnLine = projectPointOnLine(c, pt1, pt2);

  const b = Math.sqrt((r ** 2) - (Math.sqrt(((projectedPtOnLine.x - c.x) ** 2) + ((projectedPtOnLine.y - c.y) ** 2)) ** 2));

  if (b === 0) {
    return [
      projectedPtOnLine
    ]
  }
  else {
    const lineVector = new Vector2(
      pt2.x - pt1.x,
      pt2.y - pt1.y
    );

    lineVector.setLength(b);

    return [
      {
        x: projectedPtOnLine.x - lineVector.x,
        y: projectedPtOnLine.y - lineVector.y,
      }, {
        x: projectedPtOnLine.x + lineVector.x,
        y: projectedPtOnLine.y + lineVector.y,
      }
    ]
  }
}


export function isEqual(val1, val2, tolerance = 0.000001) {
  return Math.abs(val1 - val2) <= tolerance;
}

export function isPtEqual(pt1, pt2, tolerance = 0.000001) {
  return (Math.abs(pt1.x - pt2.x) <= tolerance) && (Math.abs(pt1.y - pt2.y) <= tolerance);
}

export function isEqualToDecimalPlaces(val1, val2, noOfDecimalPlaces) {
  return (Math.round(val1 * noOfDecimalPlaces) / noOfDecimalPlaces) === (Math.round(val2 * noOfDecimalPlaces) / noOfDecimalPlaces);
}

const inflection = 9;
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export function easingSmoothOriginal(t) {

  const error = sigmoid(-10 / 2)
  return Math.min(
    Math.max((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0),
    1)
}

export function easingSmooth(t) {

  const error = sigmoid(-inflection / 2)
  return Math.min(
    Math.max((sigmoid(inflection * (t - 0.5)) - error) / (1 - 2 * error), 0),
    1)
}

export function removeItemFromList(item, list) {

  let index = list.findIndex(ele => ele === item);
  if (index > -1)
    list.splice(index, 1);
}


export function setOpacity(materialList, opacity) {
  materialList.forEach(material => {
    if (material.defaultOpacity) {
      material.opacity = material.defaultOpacity * opacity;
    }
    else {
      material.opacity = opacity;
    }
    material.needsUpdate = true;
  });
}


export function animateShiftAndRotate(group, toPos, fromAngle, toAngle, shiftRotateTween, animationController, options) {

  if (shiftRotateTween.isPlaying()) { shiftRotateTween.stop(); }

  const distance = Math.sqrt(((group.position.x - toPos.x) ** 2) + (((group.position.y - toPos.y) ** 2)));

  shiftRotateTween = new TWEEN.Tween({ angle: fromAngle, x: group.position.x, y: group.position.y })
    .delay(options.delay !== undefined ? options.delay : 0)
    .to({ angle: toAngle, x: toPos.x, y: toPos.y }, options.duration !== undefined ? options.duration : 1600 + (distance * 8))
    .easing(easingSmooth)
    .onStart(() => { })
    .onUpdate((value) => {

      group.position.x = value.x;
      group.position.y = value.y;
      group.rotation.z = value.angle;

      group.updateMatrix();

    }).onComplete(() => {

      animationController.removeAnimation(shiftRotateTween.getId());

      if (options.onFinish) {
        options.onFinish();
      }


    }).onStop(() => {

      animationController.removeAnimation(shiftRotateTween.getId());

    });

  animationController.addAnimation(shiftRotateTween.getId());

  shiftRotateTween.start();

  return shiftRotateTween;

}

/**
 * 
 * @param {Vector2} lineVector 
 * @param {Number} directionFactor 
 * @returns 
 */
export function getPencilInclinationAngle(lineVector, directionFactor) {

  return getAngle(lineVector.x, lineVector.y) - (-directionFactor * .9);

}


/**
 * 
 * @param {HTMLElement} elementToView 
 * @param {*} scrollContainer 
 * @param {*} customOptions 
 */
export function scrollTo(elementToView, scrollContainer, position, customOptions = {}) {

  const options = {
    duration: 700,
  }


  Object.assign(options, customOptions);

  const containerHeight = scrollContainer.clientHeight - getComputedStyleValue(scrollContainer, 'padding-top');

  if (position === 'start' || position === "end") {

    if (position === 'start') {
      $(scrollContainer).animate({
        scrollTop: 0,
      }, options.duration, "swing", () => { });
    }
    else if (position === 'end') {
      $(scrollContainer).animate({
        scrollTop: customOptions.scrollTop || containerHeight + 200,
      }, options.duration, "swing", () => { });
    }

  }
  else {

    let scrollContainerRect = scrollContainer.getBoundingClientRect();

    const elementMarginBottom = getComputedStyleValue(elementToView, 'margin-bottom');
    const elementMarginTop = getComputedStyleValue(elementToView, 'margin-top');

    let rowRect = elementToView.getBoundingClientRect();

    // const elePosRelativeToParent = ( elementToView.offsetTop ) - getComputedStyleValue(elementToView, 'margin-top');
    const elePosRelativeToParent = getPositionRelativeToParent(elementToView, scrollContainer) - getComputedStyleValue(elementToView, 'margin-top');

    console.log("elePosRelativeToParent ", elePosRelativeToParent);

    let currentPosition = undefined;
    if ((rowRect.top - (elementMarginTop / 2)) <= scrollContainerRect.top)
      currentPosition = 'beyondTop';
    else if ((rowRect.bottom + (elementMarginBottom / 2)) >= scrollContainerRect.bottom)
      currentPosition = 'beyondBottom';


    if (currentPosition) {

      console.log("scroll top 1 ", (elePosRelativeToParent - 5))
      $(scrollContainer).animate({
        scrollTop: elePosRelativeToParent - 5,
      }, options.duration, "swing", () => { });


      // if ((currentPosition === 'currentPosition' && position !== 'bottom') || (position === 'top')) {

      //   console.log("scroll top 1 ",(elePosRelativeToParent - 5))
      //   $(scrollContainer).animate({
      //     scrollTop: elePosRelativeToParent - 5,
      //   }, options.duration, "swing", () => { });
      // }
      // else if (currentPosition === "beyondBottom" || position === 'bottom') {

      //   console.log("scroll top ", ((elePosRelativeToParent) - (containerHeight - elementToView.getBoundingClientRect().height - elementMarginTop - elementMarginBottom)));
      //   $(scrollContainer).animate({
      //     scrollTop: (elePosRelativeToParent) - (containerHeight - elementToView.getBoundingClientRect().height - elementMarginTop - elementMarginBottom),
      //   }, options.duration, "swing", () => { });
      // }


    }


  }

}

/**
 * 
 * @param {HTMLElement} div 
 * @param {HTMLDivElement} parent 
 */
export function getPositionRelativeToParent(div, parent) {

  if (div.parentElement === parent) {

    return div.offsetTop;
  }
  else {

    if (getComputedStyle(div.parentElement).position === 'relative') {

      return div.offsetTop + getPositionRelativeToParent(div.parentElement, parent);
    }
    else {
      return getPositionRelativeToParent(div.parentElement, parent);
    }


  }

}

export function getComputedStyleValue(ele, property) {

  const value = window.getComputedStyle(ele, null).getPropertyValue(property)
  return parseFloat(value.substring(0, value.length - 2));

}

export function getDistFromPtToSegment(pt, segPt1, segPt2) {

  const vectX = segPt2.x - segPt1.x;
  const vectY = segPt2.y - segPt1.y;

  const lineLen = Math.sqrt((vectX ** 2) + (vectY ** 2));

  if (getDistance(segPt1, pt) <= lineLen && getDistance(segPt2, pt) <= lineLen) {

    const vectPtX = pt.x - segPt1.x;
    const vectPtY = pt.y - segPt1.y;

    const dotProduct = Math.sqrt((vectPtX ** 2) + (vectPtY ** 2)) * Math.cos(getAngle(vectPtX, vectPtY) - getAngle(vectX, vectY));

    return Math.sqrt(((segPt1.x + (vectX / lineLen) * dotProduct - pt.x) ** 2) + ((segPt1.y + (vectY / lineLen) * dotProduct - pt.y) ** 2));

  }
  else {

    return undefined;

  }

}

export function getSideOfSegment(pt, segPt1, segPt2) {

  const normalVector = {
    x: -(segPt2.y - segPt1.y),
    y: (segPt2.x - segPt1.x),
  }

  const vect = {
    x: pt.x - segPt1.x,
    y: pt.y - segPt1.y,
  }

  const dot = (normalVector.x * vect.x) + (normalVector.y * vect.y);

  return Math.sign(dot);

}

export function areLinesParallel(pt1, pt2, pt3, pt4) {

  const vect1 = { x: pt2.x - pt1.x, y: pt2.y - pt1.y };
  const vect2 = { x: pt4.x - pt3.x, y: pt4.y - pt3.y };

  const angle1 = getAngle(vect1.x, vect1.y);
  const angle2 = getAngle(vect2.x, vect2.y);

  const diff = getMinimumAngleDiff(angle1, angle2) % Math.PI;

  console.log("diff ", diff);

  const res = {
    parallel: isEqual(Math.abs(diff - Math.PI), 0) || isEqual(Math.abs(diff), 0),
    inReversedOrder: getMinimumAngleDiff(angle1, angle2) > 1,
  }

  return res;


}

/**
  * 
  * @param {String} str 
  * @returns 
  */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ptArr e.g -> [ scale, value, scale, value ]
export function interpolatePts(ptArr, x) {

  let i;
  for (i = 0; i < ptArr.length; i += 2) {

    if (x < ptArr[i]) {
      if (i === 0)
        return ptArr[1] - ((ptArr[i] - x) * (ptArr[3] - ptArr[1]) / (ptArr[2] - ptArr[0]));
      else
        return ptArr[i + 1] + ((ptArr[i + 1] - ptArr[i - 1]) * (x - ptArr[i]) / (ptArr[i] - ptArr[i - 2]));

    }
  }

  if (i === ptArr.length)
    return ptArr[ptArr.length - 1];

}
