export interface ICloudoptBackgroundModule {
    refresh(param: string)
    start(param: string)
    stop(param: string): void
}
