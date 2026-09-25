package com.smartcart.order.dto;

public class InternalOrderNotificationRequest {

    private Long sellerId;

    private Long orderId;

    private String orderStatus;

    public InternalOrderNotificationRequest() {
    }

    public InternalOrderNotificationRequest(
            Long sellerId,
            Long orderId,
            String orderStatus) {

        this.sellerId = sellerId;
        this.orderId = orderId;
        this.orderStatus = orderStatus;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
}