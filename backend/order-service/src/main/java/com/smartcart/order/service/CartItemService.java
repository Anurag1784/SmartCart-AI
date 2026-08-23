package com.smartcart.order.service;

import com.smartcart.order.entity.Cart;
import com.smartcart.order.entity.CartItem;
import com.smartcart.order.repository.CartItemRepository;
import com.smartcart.order.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;

    public CartItemService(
            CartItemRepository cartItemRepository,
            CartRepository cartRepository) {

        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
    }

    public List<CartItem> getItemsByCartId(Long cartId) {
        return cartItemRepository.findByCartCartId(cartId);
    }

    public CartItem getItem(Long cartId, Long productId) {

        return cartItemRepository
                .findByCartCartIdAndProductId(cartId, productId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));
    }

    public CartItem addItem(Long cartId, CartItem cartItem) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        cartItem.setCart(cart);

        return cartItemRepository.save(cartItem);
    }

    public CartItem updateQuantity(
            Long cartId,
            Long productId,
            Integer quantity) {

        CartItem cartItem = getItem(cartId, productId);

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    public void removeItem(
            Long cartId,
            Long productId) {

        CartItem cartItem = getItem(cartId, productId);

        cartItemRepository.delete(cartItem);
    }

    public void removeAllItems(Long cartId) {

        List<CartItem> cartItems =
                cartItemRepository.findByCartCartId(cartId);

        cartItemRepository.deleteAll(cartItems);
    }
}