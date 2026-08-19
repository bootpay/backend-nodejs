/**
 * 테스트 웹훅 발송 파라미터 (POST /v1/webhook/test)
 */
export interface SendTestWebhookParams {
    /** 웹훅 본문 Content-Type (미지정시 서버 기본값) */
    header_content_type?: number
    /** 미지정시 자동 생성 (Idempotency-Key 헤더로 전송, body 에는 포함되지 않는다) */
    idempotency_key?: string
}
