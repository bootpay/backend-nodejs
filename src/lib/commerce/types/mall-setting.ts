/**
 * 몰 설정 (Mall Setting)
 * 요청/응답 바디는 flatten 형식이며, 전달된 값(non-null)만 서버로 전송된다.
 * supervisor scope 전용 endpoint.
 */
export interface MallSettingUpdateParams {
    // 위젯
    normal_widget_key?: string
    subscription_widget_key?: string

    // 사업자 정보
    seller_name?: string
    seller_name_en?: string
    biz_email?: string
    biz_tel?: string
    biz_fax?: string
    registration_no?: string
    corp_reg_no?: string
    mail_order_sales_number?: string
    owner_name?: string
    zip?: string
    addr_1?: string
    addr_2?: string
    privacy_name?: string
    privacy_email?: string

    // 몰 기본 정보
    name?: string
    description?: string
    status?: number
    invoice_title?: string

    // 브랜딩
    use_logo?: boolean
    logo?: string
    use_favicon?: boolean
    favicon?: string
    use_open_graph?: boolean
    og_image?: string
    use_signature?: boolean
    signature?: string

    // 고객센터 운영시간
    use_operation_time?: boolean
    customer_service_center_operation_time?: string
    rest_start_hour?: number
    rest_start_minute?: number
    rest_end_hour?: number
    rest_end_minute?: number
    /** 휴무일 (요일 코드 배열 또는 서버 정의 문자열) */
    rest_day?: any
    hosting_service?: string

    // 주문/연령 정책
    use_non_member_order?: boolean
    use_age_accept_19?: boolean
    use_age_accept_14?: boolean
    use_age_accept_parent_name?: boolean
    use_age_accept_parent_birth?: boolean
    use_age_accept_parent_email?: boolean

    // 회원가입 수집 항목
    use_membership_collect_phone?: boolean
    use_membership_collect_tel?: boolean
    use_membership_collect_email?: boolean
    use_membership_collect_address?: boolean
    use_membership_collect_bank?: boolean
    use_membership_collect_birth?: boolean
    use_membership_collect_gender?: boolean
    use_membership_collect_interest?: boolean
    membership_collect_interest_number?: number
    use_membership_collect_customs?: boolean
    use_membership_collect_nickname?: boolean
    use_membership_collect_recommend_id?: boolean
    recommend_id_point_to?: number
    recommend_id_point_from?: number
    use_membership_collect_business?: boolean
    use_membership_collect_register?: boolean
    membership_only_business?: boolean

    // 기업(그룹) 회원
    use_corporate_department?: boolean
    sub_group_type?: number
    use_corporate_signup_approval?: boolean
    /** 기업 회원 허용 이메일 도메인 목록 */
    corporate_email_domains?: any
    use_corporate_auto_approve?: boolean
    use_corporate_invite_only?: boolean

    // 회원 정보 노출 항목
    use_member_info_phone?: boolean
    use_member_info_tel?: boolean
    use_member_info_email?: boolean
    use_member_info_address?: boolean
    use_member_info_bank?: boolean
    use_member_info_birth?: boolean
    use_member_info_gender?: boolean
    use_member_info_customs?: boolean
    use_member_info_nickname?: boolean
    use_member_info_register?: boolean

    // 주문자 수집 항목
    orderer_collect_phone?: boolean
    orderer_collect_tel?: boolean
    orderer_collect_email?: boolean

    // 주문/취소 정책
    order_prefix?: string
    use_order_cancel?: boolean
    /** 취소 승인 사용 여부 (서버 필드명 오타 그대로 유지) */
    use_oder_cancel_approval?: boolean
    /** 취소 사유 목록 */
    order_cancel_reasons?: any
    order_cancel_reason_required_type?: number
    order_cancel_request_message?: string
    order_cancel_done_message?: string

    // 회원 가입/인증 방식
    use_general_membership?: boolean
    general_membership_duplication?: number
    use_certification?: boolean
    certification_type?: number
    general_membership_id_type?: number
    use_membership_duplication_email?: boolean
    use_membership_duplication_phone?: boolean
    use_social_membership?: boolean
    /** 사용 소셜 로그인 타입 */
    social_membership_type?: any

    // 적립금
    use_point?: boolean
    use_point_transaction?: boolean
    point_display_name?: string
    point_min_balance?: number
    /** 적립 제외 조건 */
    point_not_condition?: any
    /** 적립 조건 */
    point_condition?: any
    use_point_max_rate?: boolean
    point_max_rate?: number
    use_point_max_amount?: boolean
    point_max_amount?: number
    point_rate?: number
    point_calc_type1?: number
    point_calc_type2?: number
    use_point_advance_discount?: boolean
    point_advance_discount_rate?: number
    use_point_expire?: boolean
    point_expire_type?: number
    point_issue_event_type?: number
    point_issue_delay_days?: number

    // 오픈마켓 / 상품
    use_open_market?: boolean
    use_product_approval?: boolean
    use_product_review?: boolean
    use_product_review_point?: boolean
    product_review_point?: number
    product_review_photo_point?: number
    use_product_review_answer?: boolean
    use_product_review_auto_answer?: boolean
    product_review_auto_answer_minute?: number
    product_review_auto_answer_text?: string
    use_product_qna?: boolean
    product_qna_member_auth?: number
    use_product_qna_answer_option?: boolean

    // 게시판 / 상담
    use_notice?: boolean
    use_qna?: boolean
    use_faq?: boolean
    use_chat_support?: boolean
    chat_support_type?: number
    chat_support_key?: string

    // 휴면 / 탈퇴
    use_dormant?: boolean
    dormant_year?: number
    dormant_restore?: number
    use_withdrawal?: boolean
    use_withdrawal_guide_message?: boolean
    use_withdrawal_guide_message_after?: boolean
    withdrawal_guide_message_after?: string
    use_withdrawal_auto?: boolean
    withdrawal_auto_year?: number

    // 정기구독 정산
    use_subscription_aggregate_transaction?: boolean
    subscription_month_day?: number
    subscription_week_day?: number

    // 구매 한도
    use_limit?: boolean
    limit_month_purchase?: number
    limit_week_purchase?: number
    use_limit_payment?: boolean
    use_limit_message?: boolean

    // 약관
    terms_of_service?: string
    terms_of_privacy_policy?: string
    terms_of_privacy_collect?: string
    terms_of_privacy_third?: string

    // 결제 / 노출
    payment_timeout?: number
    product_sort_type?: number
    mall_theme_type?: number
    catalog_display_type?: number
    catalog_headline?: string
    catalog_bg_color?: string
    catalog_view_type_pc?: number
    catalog_view_type_mobile?: number
    catalog_product_sort_type?: number

    // 장바구니 / 위시리스트
    use_cart?: boolean
    cart_storage_period?: number
    cart_max_limit?: number
    cart_add_action?: number
    cart_direct_purchase?: boolean
    cart_option_change?: boolean
    cart_discount_display?: boolean
    use_wishlist?: boolean
    wishlist_max_limit?: number
    cart_wishlist_display?: boolean
}

export interface CommerceMallSetting extends MallSettingUpdateParams {
    mall_setting_id?: string
    project_id?: string
    seller_id?: string
    created_at?: string
    updated_at?: string
    [key: string]: unknown
}
