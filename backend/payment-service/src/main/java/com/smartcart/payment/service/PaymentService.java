package com.smartcart.payment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.smartcart.payment.client.OrderClient;
import com.smartcart.payment.dto.PaymentRequest;
import com.smartcart.payment.dto.PaymentResponse;
import com.smartcart.payment.entity.Payment;
import com.smartcart.payment.enums.PaymentStatus;
import com.smartcart.payment.repository.PaymentRepository;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.http.HttpStatus;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    private final OrderClient orderClient;

    // RazorpayClient is provided by our RazorpayConfig class.
    private final RazorpayClient razorpayClient;

    // Razorpay secret is stored only on the backend.
    // It must NEVER be exposed to the React frontend.
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderClient orderClient,
            RazorpayClient razorpayClient
    ) {

        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
        this.razorpayClient = razorpayClient;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        // Prevent creating more than one SmartCart payment
        // for the same order.
        if (paymentRepository.findByOrderId(request.getOrderId()).isPresent()) {

            throw new IllegalStateException(
                    "Payment already exists for order ID: "
                            + request.getOrderId()
            );
        }

        // Create our internal SmartCart payment record first.
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        try {

            // Razorpay expects the amount in the smallest currency unit.
            // For INR, the smallest unit is paise.
            long amountInPaise = request.getAmount()
                    .movePointRight(2)
                    .longValueExact();

            // Data required to create a Razorpay Order.
            JSONObject razorpayOrderRequest = new JSONObject();

            // Amount sent to Razorpay in paise.
            razorpayOrderRequest.put(
                    "amount",
                    amountInPaise
            );

            // INR is the currency used by SmartCart.
            razorpayOrderRequest.put(
                    "currency",
                    "INR"
            );

            // SmartCart order ID is used as Razorpay's receipt reference.
            razorpayOrderRequest.put(
                    "receipt",
                    "SMARTCART_ORDER_" + request.getOrderId()
            );

            // Create the real Razorpay Order.
            Order razorpayOrder =
                    razorpayClient.orders.create(
                            razorpayOrderRequest
                    );

            // Store Razorpay's Order ID in our database.
            savedPayment.setGatewayOrderId(
                    razorpayOrder.get("id")
            );

            // Payment remains PENDING until the customer
            // successfully completes Razorpay Checkout.
            savedPayment.setPaymentStatus(
                    PaymentStatus.PENDING
            );

            Payment updatedPayment =
                    paymentRepository.save(savedPayment);

            return mapToResponse(updatedPayment);

        } catch (RazorpayException | ArithmeticException exception) {

            // Print the actual Razorpay error in the Payment Service console.
            exception.printStackTrace();

            // Mark our SmartCart payment as failed.
            savedPayment.setPaymentStatus(
                    PaymentStatus.FAILED
            );

            // Store the development error message.
            savedPayment.setFailureReason(
                    "Unable to create Razorpay order: "
                            + exception.getMessage()
            );

            Payment failedPayment =
                    paymentRepository.save(savedPayment);

            return mapToResponse(failedPayment);
        }
    }

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse verifyRazorpayPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        // Validate that all values were received.
        if (razorpayOrderId == null ||
                razorpayOrderId.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Razorpay order ID is required"
            );
        }

        if (razorpayPaymentId == null ||
                razorpayPaymentId.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Razorpay payment ID is required"
            );
        }

        if (razorpaySignature == null ||
                razorpaySignature.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Razorpay signature is required"
            );
        }

        // Find the SmartCart payment using the Razorpay Order ID
        // that OUR backend previously stored.
        Payment payment =
                paymentRepository
                        .findByGatewayOrderId(razorpayOrderId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Payment not found for Razorpay order ID: "
                                                + razorpayOrderId
                                )
                        );

        // Do not verify an already completed payment again.
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {

            return mapToResponse(payment);
        }

        try {

            // Create the exact data Razorpay expects for
            // server-side signature verification.
            JSONObject verificationData =
                    new JSONObject();

            verificationData.put(
                    "razorpay_order_id",
                    payment.getGatewayOrderId()
            );

            verificationData.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            verificationData.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            // Razorpay SDK performs HMAC-SHA256 signature verification
            // using our backend-only secret.
            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            verificationData,
                            razorpayKeySecret
                    );

            // A failed signature means we must NOT mark
            // the payment as successful.
            if (!signatureValid) {

                payment.setPaymentStatus(
                        PaymentStatus.FAILED
                );

                payment.setFailureReason(
                        "Razorpay payment signature verification failed"
                );

                Payment failedPayment =
                        paymentRepository.save(payment);

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid Razorpay payment signature"
                );
            }

            // Signature is valid.
            // Store the real Razorpay Payment ID.
            payment.setGatewayPaymentId(
                    razorpayPaymentId
            );

            // Mark SmartCart payment as successful.
            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS
            );

            // Remove any previous failure reason.
            payment.setFailureReason(null);

            Payment successfulPayment =
                    paymentRepository.save(payment);

            // Tell Order Service that the payment succeeded.
            orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    PaymentStatus.SUCCESS.name()
            );

            return mapToResponse(successfulPayment);

        } catch (RazorpayException exception) {

            // Razorpay SDK verification error.
            exception.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to verify Razorpay payment",
                    exception
            );
        }
    }

    // =========================================================
    // OLD SIMULATED PAYMENT FLOW
    // =========================================================

    @Transactional
    public PaymentResponse processPayment(
            Long paymentId,
            boolean paymentSuccessful
    ) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found with ID: "
                                                + paymentId
                                )
                        );

        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {

            throw new IllegalStateException(
                    "Payment cannot be processed because current status is: "
                            + payment.getPaymentStatus()
            );
        }

        /*
         * IMPORTANT:
         *
         * This method is still the old simulated payment flow.
         *
         * We are keeping it for now so we do not break
         * existing functionality.
         *
         * The real Razorpay flow uses verifyRazorpayPayment().
         */

        if (paymentSuccessful) {

            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS
            );

            payment.setGatewayPaymentId(
                    "SIM_PAYMENT_" + payment.getPaymentId()
            );

            payment.setFailureReason(null);

        } else {

            payment.setPaymentStatus(
                    PaymentStatus.FAILED
            );

            payment.setFailureReason(
                    "Simulated payment failure"
            );
        }

        Payment updatedPayment =
                paymentRepository.save(payment);

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                payment.getPaymentStatus().name()
        );

        return mapToResponse(updatedPayment);
    }

    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    @Transactional
    public PaymentResponse refundPayment(Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found for ID: "
                                                + paymentId
                                )
                        );

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {

            throw new IllegalStateException(
                    "Only successful payments can be refunded"
            );
        }

        payment.setPaymentStatus(
                PaymentStatus.REFUNDED
        );

        Payment refundedPayment =
                paymentRepository.save(payment);

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                PaymentStatus.REFUNDED.name()
        );

        return mapToResponse(refundedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found for ID: "
                                                + paymentId
                                )
                        );

        return mapToResponse(payment);
    }

    // =========================================================
    // GET PAYMENT BY ORDER ID
    // =========================================================

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {

        Payment payment =
                paymentRepository.findByOrderId(orderId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found for order ID: "
                                                + orderId
                                )
                        );

        return mapToResponse(payment);
    }

    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private PaymentResponse mapToResponse(Payment payment) {

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(payment.getOrderId())
                .customerId(payment.getCustomerId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .paymentStatus(payment.getPaymentStatus())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}