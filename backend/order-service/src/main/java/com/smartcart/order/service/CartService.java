package com.smartcart.order.service;

import com.smartcart.order.entity.Cart;
import com.smartcart.order.entity.CartItem;
import com.smartcart.order.repository.CartItemRepository;
import com.smartcart.order.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    public Cart getOrCreateCart(Long customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomerId(customerId);
                    return cartRepository.save(cart);
                });
    }

    public Cart getCartByCustomerId(Long customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    public List<CartItem> getCartItems(Long customerId) {

        Cart cart = getCartByCustomerId(customerId);

        return cartItemRepository.findByCartCartId(cart.getCartId());
    }

    public CartItem addItem(
            Long customerId,
            CartItem cartItem) {

        Cart cart = getOrCreateCart(customerId);

        cartItem.setCart(cart);

        return cartItemRepository.save(cartItem);
    }

    public CartItem updateItem(
            Long customerId,
            Long productId,
            Integer quantity) {

        Cart cart = getCartByCustomerId(customerId);

        CartItem cartItem = cartItemRepository
                .findByCartCartIdAndProductId(
                        cart.getCartId(),
                        productId
                )
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    public void removeItem(
            Long customerId,
            Long productId) {

        Cart cart = getCartByCustomerId(customerId);

        CartItem cartItem = cartItemRepository
                .findByCartCartIdAndProductId(
                        cart.getCartId(),
                        productId
                )
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }

    public void clearCart(Long customerId) {

        Cart cart = getCartByCustomerId(customerId);

        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(cart.getCartId());

        cartItemRepository.deleteAll(cartItems);
    }
}