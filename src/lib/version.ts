/**
 * SDK 버전 — package.json 의 version 을 런타임에 읽는다.
 * src/lib(ts)와 dist/lib(컴파일 결과)는 루트로부터 깊이가 같아 '../../package.json' 이 양쪽에서 맞는다.
 * (resolveJsonModule import 는 rootDir 을 바꿔 dist 구조를 깨므로 require 를 쓴다.)
 */
let version = '0.0.0'
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    version = String(require('../../package.json').version || version)
} catch (e) {
    // package.json 을 못 읽어도 SDK 는 동작해야 한다 — 기본값 유지
}

export const SDK_VERSION: string = version
