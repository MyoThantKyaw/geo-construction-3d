import Scene from "../Scene";
import * as util from "./util"
import  { Point as FlattenPoint, Circle as FlattenCircle, Line as FlattenLine, Segment as FlattenSegment, Arc as FlattenArc, } from '@flatten-js/core';
import IntersectionPoint from "../geometryConstructors/materials/IntersectionPoint";


/**
 * 
 * @param {Scene} scene 
 */
export function getAllIntersectionPoints(scene, points = []) {

    const items = scene.items;
    for (let i = 0; i < items.length; i++) {

        const item = items[i];
        item.flattenGeo = undefined;
    }

    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (!item.visible || !(item.lineIntersectable || item.isCircularCurve)) {
            continue
        }
        
        if (!item.flattenGeo) {
            createFlattenGeo(item);
        }

        for (let j = 0; j < items.length; j++) {

            if (!(items[j].isStraightLine || items[j].isCircularCurve)) {
                continue
            }

            if (j <= i || !items[j].visible) {
                continue
            }

            const itemToIntersect = items[j];

            if (!itemToIntersect.flattenGeo) {
                createFlattenGeo(itemToIntersect);
            }

            points.push(...intersect(item, itemToIntersect))
        }
    }
}


/**
 * 
 * @param {Scene} scene 
 */
export function getIntersectionPoint(scene, itemToChange, points = []) {

    const items = scene.items;
    for (let i = 0; i < items.length; i++) {

        const item = items[i];
        item.flattenGeo = undefined;
    }

    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (!item.visible || !(item.lineIntersectable || item.isCircularCurve)
        || itemToChange.hasItemInDependencyChain(item)) {
            continue
        }
        
        if (!item.flattenGeo) {
            createFlattenGeo(item);
        }

        for (let j = 0; j < items.length; j++) {

            if (!(items[j].isStraightLine || items[j].isCircularCurve)
            || itemToChange.hasItemInDependencyChain(items[j])) {
                continue
            }

            if (j <= i || !items[j].visible) {
                continue
            }

            const itemToIntersect = items[j];

            if (!itemToIntersect.flattenGeo) {
                createFlattenGeo(itemToIntersect);
            }

            points.push(...intersect(item, itemToIntersect))
        }
    }

    // return points;

}

function createFlattenGeo(item) {

    if (item.isSegment) {
        item.flattenGeo = new FlattenSegment(
            new FlattenPoint(item.pt1.x, item.pt1.y), new FlattenPoint(item.pt2.x, item.pt2.y)
        );
    }
    else if (item.isCircle) {
        item.flattenGeo = new FlattenCircle(new FlattenPoint(item.centerPt.x, item.centerPt.y), item.radius);
    }
    else if (item.isArc) {
        item.flattenGeo = new FlattenArc(new FlattenPoint(item.centerPt.x, item.centerPt.y), item.radius, item.arcRotationAngle, item.arcRotationAngle + item.arcAngle, true);
    }
}

function intersect(item1, item2) {

    const res = [];

    if (item1.isArc || item1.isCircle || item2.isArc || item2.isCircle) {

        const intersRes = item1.flattenGeo.intersect(item2.flattenGeo);

        const res0 = intersRes[0];
        const res1 = intersRes[1];

        let is_res0_ok = res0 && item1.flattenGeo.contains(res0) && item2.flattenGeo.contains(res0) && !areTangents(item1, item2)
        let is_res1_ok = res1 && item1.flattenGeo.contains(res1) && item2.flattenGeo.contains(res1)

        let reverseOrder = false;
        if (item1.isSegment) {

            is_res0_ok = res0 && is_res0_ok && !onTipsOnSegment(res0, item1);
            is_res1_ok = res1 && is_res1_ok && !onTipsOnSegment(res1, item1);

            reverseOrder = is_res0_ok && !is_res1_ok && util.getDistance(item2.centerPt, item1.pt1) < util.getDistance(item2.centerPt, item1.pt2);
        }

        if (item2.isSegment) {
          
            is_res0_ok = res0 && is_res0_ok && !onTipsOnSegment(res0, item2);
            is_res1_ok = res1 && is_res1_ok && !onTipsOnSegment(res1, item2);

            reverseOrder = is_res0_ok && !is_res1_ok && util.getDistance(item1.centerPt, item2.pt1) < util.getDistance(item1.centerPt, item2.pt2);

        }

        if (is_res0_ok) {// point 1 ok
            res.push(new IntersectionPoint(item1.scene, res0.x, res0.y, item1, item2, reverseOrder ? 1 : 0));
        }
        if (is_res1_ok) {
            res.push(new IntersectionPoint(item1.scene,res1.x, res1.y, item1, item2, reverseOrder ? 0 : 1));
        }

        
    }
    else {

        let isOk = true;

        const intersRes = item1.flattenGeo.intersect(item2.flattenGeo);

        if (item1.isSegment) {
            isOk = isOk && intersRes[0] && !onTipsOnSegment(intersRes[0], item1);
        }
        if (item2.isSegment) {
            isOk = isOk && intersRes[0] && !onTipsOnSegment(intersRes[0], item2);
        }
        else {
            isOk = isOk && intersRes[0];
        }

        if (isOk) {

            res.push(new IntersectionPoint(item1.scene, intersRes[0].x, intersRes[0].y, item1, item2, undefined));
        }
    }

    return res;

}

function areTangents(item1, item2) {

    if (item1.isCircularCurve && item2.isSegment) {

        return util.getDistFromPtToLine(item1.centerPt, item2.pt1, item2.pt2) === item1.radius;
    }
    else if (item1.isSegment && item2.isCircularCurve) {
        return util.getDistFromPtToLine(item2.centerPt, item1.pt1, item1.pt2) === item2.radius;
    }
    else if (item1.isCircularCurve && item2.isCircularCurve) {
        return util.getDistance(item1.centerPt, item2.centerPt) === item1.radius + item2.radius;
    }
    else {
        return false;
    }

}

function onTipsOnSegment(res, seg) {

    return (util.isEqual(res.x, seg.pt1.x, 0.0001) && util.isEqual(res.y, seg.pt1.y, 0.0001)) || (util.isEqual(res.x, seg.pt2.x, 0.0001) && util.isEqual(res.y, seg.pt2.y, 0.0001))

}

