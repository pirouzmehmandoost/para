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
    return 1;   //lg, xl, 2xl
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
    return 0.7; //lg, xl, 2xl
};

export const ACTION = {
    NONE: 0,
    ROTATE: 1,
    TRUCK: 2,
    OFFSET: 4,
    DOLLY: 8,
    ZOOM: 16,
    TOUCH_ROTATE: 32,
    TOUCH_TRUCK: 64,
    TOUCH_OFFSET: 128,
    TOUCH_DOLLY: 256,
    TOUCH_ZOOM: 512,
    TOUCH_DOLLY_TRUCK: 1024,
    TOUCH_DOLLY_OFFSET: 2048,
    TOUCH_DOLLY_ROTATE: 4096,
    TOUCH_ZOOM_TRUCK: 8192,
    TOUCH_ZOOM_OFFSET: 16384,
    TOUCH_ZOOM_ROTATE: 32768
};