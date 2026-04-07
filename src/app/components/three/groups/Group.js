'use client';

import React, { useRef } from 'react';

const Group = (props, children) => {
  const groupRef = useRef(undefined);
  return <group ref={groupRef} {...props}> {...children} </group>
};

export default React.memo(Group);
