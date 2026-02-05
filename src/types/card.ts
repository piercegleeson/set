export type Color = 'red' | 'green' | 'purple'
export type Shape = 'diamond' | 'oval' | 'squiggle'
export type Shading = 'solid' | 'striped' | 'empty'
export type Count = 1 | 2 | 3

export interface Card {
  id: string
  color: Color
  shape: Shape
  shading: Shading
  count: Count
}
