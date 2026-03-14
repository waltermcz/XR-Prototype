// AR.js ships as a UMD bundle with no official TypeScript types.
// This declaration silences the TS7016 "implicit any" hint for the dynamic import.
// window.THREEx is populated as a side effect when this module loads.
declare module '@ar-js-org/ar.js/three.js/build/ar.js'
