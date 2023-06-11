export class SupplierFetchException extends Error {
  constructor(supplier: string, msg: string) {
    super(`supplier ${supplier} failed to fetch data becuause "${msg}"`)
  }
}