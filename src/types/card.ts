export type Color = 'red' | 'blue' | 'yellow'
export type Shape = 'diamond' | 'circle' | 'square'
export type Shading = 'solid' | 'striped' | 'empty'
export type Count = 1 | 2 | 3

export interface Card {
  id: string
  color: Color
  shape: Shape
  shading: Shading
  count: Count
}
