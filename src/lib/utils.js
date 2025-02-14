import { Vector3 } from "three"

export function flattenAttributes(data) {
    // Check if data is a plain object; return as is if not
    if (
        typeof data !== "object" ||
        data === null ||
        data instanceof Date ||
        typeof data === "function"
    ) {
        return data;
    };

    // If data is an array, apply flattenAttributes to each element and return as array
    if (Array.isArray(data)) {
        return data.map((item) => flattenAttributes(item));
    };

    // Initialize an object with an index signature for the flattened structure
    let flattened = {};

    // Iterate over each key in the object
    for (let key in data) {
        // Skip inherited properties from the prototype chain
        if (!data.hasOwnProperty(key)) continue;

        // If the key is 'attributes' or 'data', and its value is an object, merge their contents
        if (
            (key === "attributes" || key === "data") &&
            typeof data[key] === "object" &&
            !Array.isArray(data[key])
        ) {
            Object.assign(flattened, flattenAttributes(data[key]));
        } else {
            // For other keys, copy the value, applying flattenAttributes if it's an object
            flattened[key] = flattenAttributes(data[key]);
        }
    };
    return flattened;
};

export const scaleMeshAtBreakpoint = (width) => {
    if (width <= 360) {
        return 0.6;
    }
    if (width <= 480) {
        return 0.7;
    }
    if (width <= 640) { //sm
        return 0.8;
    }
    if (width <= 768) { //md
        return 0.9;
    }
    if (width <= 1024) { //md
        return 0.95;
    }
    if (width <= 1920) { //md
        return 1.0;
    }
    return 1.1;   //lg, xl, 2xl
};

export const scalePositionAtBreakPoint = (width) => {
    if (width <= 360) {
        return 1.5;
    }
    if (width <= 480) {
        return 1.2;
    }
    if (width <= 640) { //sm
        return 1.0;
    }
    if (width <= 768) { //md
        return 0.9;
    }
    if (width <= 900) {
        return 0.8;
    }
    if (width <= 1024) { //lg
        return 0.7;
    }
    if (width <= 1280) { //xl
        return 0.6;
    }
    if (width <= 1536) { //2xl
        return 0.5;
    }
    return 0.4;
};

export const calculatePositions = (scaleFactor, numPositions, center) => {
    const positions = [];
    const xOffset = [];
    const yOffset = -25;

    if (numPositions === 1) {
        return [new Vector3(center.x, yOffset, center.z)];
    };


    if (numPositions % 2 == 1) {
        xOffset.push(0);
    };

    for (let i = 1; i < numPositions; i++) {
        let offset = parseInt((scalePositionAtBreakPoint(scaleFactor) * parseInt(i * scaleFactor)) / (numPositions * 2)) * (i % 2 === 0 ? 1 : -1);
        xOffset.push(offset);
        xOffset.push(-1 * offset);
    };

    for (let i = 0; i < numPositions; i++) {
        const pos = new Vector3(xOffset[i] + center.x, yOffset, center.z);
        positions.push(pos);
    };

    positions.sort((a, b) => a.x - b.x);

    if (numPositions > 2) {
        positions.forEach((vec, i) => {
            vec.z += (i % 2 === 0) ? -50 : 0
        })
    };

    return positions;
};