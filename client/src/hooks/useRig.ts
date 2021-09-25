
export const temp = 0;
// export const useRig: () => React.MutableRefObject<InternalRig | undefined> = () => {
//     const xrCamera = useXRCamera();
//     const hands = useHands();

//     const rig = useRef<InternalRig>();

//     useBeforeRender(() => {
//         let position = new Vector3(0, 0, 0);
//         if (xrCamera) {
//             position = xrCamera.position;
//         }

//         let rotation = new Vector3(0, 0, 0);
//         if (xrCamera) {
//             rotation = xrCamera.rotationQuaternion.toEulerAngles();
//         }

//         rig.current = {
//             head: {
//                 position,
//                 rotation,
//             },
//             leftHand: hands.left?.controller.grip
//                 ? {
//                     position: hands.left.controller.grip.position,
//                     rotation: hands.left.controller.grip.rotation,
//                 }
//                 : undefined,
//             rightHand: hands.right?.controller.grip
//                 ? {
//                     position: hands.right.controller.grip.position,
//                     rotation: hands.right.controller.grip.rotation,
//                 }
//                 : undefined,
//         };
//     });

//     return rig;
// };
