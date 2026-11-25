export type KeysOfType<T, ValueType> = {
  [K in keyof T]-?: T[K] extends ValueType | null | undefined ? K : never
}[keyof T]

// Old version:
// // 1 - make the union of keys
// type KeysOfType<T, ValueType> = {
  // [K in keyof T]: T[K] extends ValueType | null ? K : never
// }[keyof T]
// // 2- exclude any nullish 
// type ExampleType = KeysOfType<MeshStandardMaterial, string>
// // 3- then export and this one
// type TextureType = NonNullable<MeshStandardMaterialMaps>
