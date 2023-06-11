export class PartNotFoundException extends Error {
  constructor(partNumber: string) {
    super(`failed to find part with number "${partNumber}"`)
  }
}