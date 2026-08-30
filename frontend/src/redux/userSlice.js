import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopsInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmt: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },

    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },

    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },

    setshopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
    },

    setitemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },

    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    addToCart: (state, action) => {
      const cartItem = action.payload;
      const itemId = cartItem.id || cartItem._id;
      const qtyToAdd = Number(cartItem.quantity) || 1;

      const existingItem = state.cartItems.find(
        (i) => (i.id || i._id) === itemId,
      );

      if (existingItem) {
        existingItem.quantity += qtyToAdd;
        if (existingItem.quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            (i) => (i.id || i._id) !== itemId,
          );
        }
      } else if (qtyToAdd > 0) {
        state.cartItems.push({
          ...cartItem,
          id: itemId,
          quantity: qtyToAdd,
        });
      }
      state.totalAmt = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    updateQty: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmt = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      state.totalAmt = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmt = 0;
    },

    // Safely normalize whatever payload comes in into an array
    setMyOrders: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.myOrders = action.payload;
      } else if (action.payload?.order && Array.isArray(action.payload.order)) {
        state.myOrders = action.payload.order;
      } else if (
        action.payload?.filteredOrders &&
        Array.isArray(action.payload.filteredOrders)
      ) {
        state.myOrders = action.payload.filteredOrders;
      } else {
        state.myOrders = [];
      }
    },

    addMyOrder: (state, action) => {
      const currentList = Array.isArray(state.myOrders) ? state.myOrders : [];
      const newOrder = action.payload;
      if (!newOrder) return;

      // Duplicate prevent karein
      const exists = currentList.some(
        (o) => o._id?.toString() === (newOrder._id || newOrder.id)?.toString(),
      );
      if (!exists) {
        state.myOrders = [newOrder, ...currentList];
      }
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload || {};
      if (!orderId || !shopId) return;

      if (!Array.isArray(state.myOrders)) return;

      const order = state.myOrders.find(
        (i) => i._id?.toString() === orderId.toString(),
      );

      if (order && Array.isArray(order.shopOrders)) {
        const shopOrder = order.shopOrders.find(
          (so) => (so.shop?._id || so.shop)?.toString() === shopId.toString(),
        );

        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    // userSlice.js
    updateRealTimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const updateOrderList = (list) => {
        if (!Array.isArray(list)) return list;
        return list.map((order) => {
          const currentOrderId = order?._id || order?.newOrder?._id;
          if (currentOrderId?.toString() === orderId?.toString()) {
            const updatedShopOrders = (order.shopOrders || []).map(
              (shopOrder) => {
                const currentShopId = shopOrder?.shop?._id || shopOrder?.shop;
                if (
                  !shopId ||
                  currentShopId?.toString() === shopId?.toString()
                ) {
                  return { ...shopOrder, status };
                }
                return shopOrder;
              },
            );

            return {
              ...order,
              status: status, 
              shopOrders: updatedShopOrders,
            };
          }
          return order;
        });
      };

      if (Array.isArray(state.myOrders)) {
        state.myOrders = updateOrderList(state.myOrders);
      } else if (state.myOrders?.orders) {
        state.myOrders.orders = updateOrderList(state.myOrders.orders);
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setshopsInMyCity,
  setitemsInMyCity,
  addToCart,
  updateQty,
  removeCartItem,
  clearCart,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  updateRealTimeOrderStatus,
  setSearchItems,
  setSocket,
} = userSlice.actions;

export default userSlice.reducer;
