// import { create } from 'zustand'
// import { getGpuTier } from 'detect-gpu'

// const useConfigStore = create((set) => ({
//   tier: 2, // Default to mid-range
//   isLowEnd: false,
//   shadowRes: 2048,

//   // Initialize hardware check
//   checkHardware: async () => {
//     const gpu = await getGpuTier()
//     const isLow = gpu.tier < 2 || gpu.isMobile
    
//     set({ 
//       tier: gpu.tier, 
//       isLowEnd: isLow,
//       // Drop shadow res to 512 for Tier 1 or old mobile
//       shadowRes: isLow ? 512 : 2048 
//     })
//   }
// }))