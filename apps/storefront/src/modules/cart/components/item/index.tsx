"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState, useRef, useEffect } from "react"
import { useOptimisticCart } from "../../templates/cart-state"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  let optimisticCart: any = null
  try {
    optimisticCart = useOptimisticCart()
  } catch {
    // Safely handled if rendered in cart preview drawer outside provider
  }

  const [fallbackQty, setFallbackQty] = useState(item.quantity)
  const [fallbackRemoved, setFallbackRemoved] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const localQty = optimisticCart?.itemQuantities?.[item.id] !== undefined
    ? optimisticCart.itemQuantities[item.id]
    : fallbackQty

  const isRemoved = optimisticCart?.removedItemIds?.has(item.id) ?? fallbackRemoved

  const unitPrice =
    item.unit_price ||
    (item.total && item.quantity ? item.total / item.quantity : 0)

  const handleDelete = () => {
    if (optimisticCart) {
      optimisticCart.removeItem(item.id, unitPrice, localQty)
    } else {
      setFallbackRemoved(true)
      deleteLineItem(item.id).catch(() => setFallbackRemoved(false))
    }
  }

  const handleQuantity = (delta: number) => {
    const newQty = localQty + delta
    if (newQty <= 0) {
      handleDelete()
      return
    }

    if (optimisticCart) {
      optimisticCart.updateQuantity(item.id, newQty, unitPrice)
    } else {
      setFallbackQty(newQty)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        await updateLineItem({ lineId: item.id, quantity: newQty }).catch(() => {
          setFallbackQty(item.quantity)
        })
      }, 300)
    }
  }

  // Max quantity matches actual stock available rather than artificial 10 cap
  const maxQuantity =
    item.variant?.manage_inventory && !item.variant?.allow_backorder
      ? (item.variant?.inventory_quantity && item.variant.inventory_quantity > 0
          ? item.variant.inventory_quantity
          : 99)
      : 99

  const optimisticItem = {
    ...item,
    quantity: localQty,
    total: unitPrice * localQty,
    original_total:
      item.original_total && item.quantity
        ? (item.original_total / item.quantity) * localQty
        : unitPrice * localQty,
  }

  if (isRemoved) {
    return null
  }

  return (
    <Table.Row className="w-full transition-opacity duration-200" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex items-center gap-3">
            {/* Functional Luxury Plus / Minus Stepper */}
            <div className="inline-flex items-center border border-stone-300 bg-white rounded-xs shadow-2xs">
              <button
                type="button"
                onClick={() => handleQuantity(-1)}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors active:scale-95"
                aria-label="Decrease quantity"
                title={localQty === 1 ? "Remove item" : "Decrease quantity"}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <span className="w-9 text-center text-xs font-semibold text-stone-900 select-none flex items-center justify-center">
                {localQty}
              </span>

              <button
                type="button"
                onClick={() => handleQuantity(1)}
                disabled={localQty >= maxQuantity}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors active:scale-95 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Instant Optimistic Trash Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer active:scale-90"
              aria-label="Remove item"
              title="Remove item"
              data-testid="product-delete-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{localQty}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={optimisticItem}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
