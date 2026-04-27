import React from 'react';

/**
 * Icons8 icon component.
 * Styles: fluency | ios | material-outlined | windows | color | nolan | stickers
 *
 * Usage:
 *   <Icon8 name="mountain" />                  → fluency 24px
 *   <Icon8 name="home" style="ios" size={20} /> → ios outline 20px
 *   <Icon8 name="star" style="fluency" size={32} />
 */
export default function Icon8({ name, style = 'fluency', size = 24, className = '', alt = '' }) {
  const url = `https://img.icons8.com/${style}/${size * 2}/${name}.png`;
  return (
    <img
      src={url}
      alt={alt || name}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}

/* Pre-built icon sets */
export const icons = {
  /* Navigation & UI */
  home:       (p) => <Icon8 name="home"          style="ios" {...p} />,
  search:     (p) => <Icon8 name="search"         style="ios" {...p} />,
  cart:       (p) => <Icon8 name="shopping-bag"   style="ios" {...p} />,
  user:       (p) => <Icon8 name="user-male"      style="ios" {...p} />,
  settings:   (p) => <Icon8 name="settings"       style="ios" {...p} />,
  back:       (p) => <Icon8 name="back"           style="ios" {...p} />,
  menu:       (p) => <Icon8 name="menu"           style="ios" {...p} />,
  close:      (p) => <Icon8 name="close"          style="ios" {...p} />,

  /* Resort specific */
  ger:        (p) => <Icon8 name="tent"           style="fluency" {...p} />,
  mountain:   (p) => <Icon8 name="mountain"       style="fluency" {...p} />,
  food:       (p) => <Icon8 name="restaurant"     style="fluency" {...p} />,
  shop:       (p) => <Icon8 name="shop"           style="fluency" {...p} />,
  location:   (p) => <Icon8 name="map-pin"        style="fluency" {...p} />,
  calendar:   (p) => <Icon8 name="calendar"       style="fluency" {...p} />,
  star:       (p) => <Icon8 name="star"           style="fluency" {...p} />,
  people:     (p) => <Icon8 name="conference-call" style="fluency" {...p} />,
  phone:      (p) => <Icon8 name="phone"          style="fluency" {...p} />,
  email:      (p) => <Icon8 name="email"          style="fluency" {...p} />,
  money:      (p) => <Icon8 name="money-bag"      style="fluency" {...p} />,
  trip:       (p) => <Icon8 name="trekking"       style="fluency" {...p} />,
  horse:      (p) => <Icon8 name="horse"          style="fluency" {...p} />,
  nature:     (p) => <Icon8 name="deciduous-tree" style="fluency" {...p} />,
  wildlife:   (p) => <Icon8 name="eagle"          style="fluency" {...p} />,
  weather:    (p) => <Icon8 name="sun"            style="fluency" {...p} />,
  snow:       (p) => <Icon8 name="snow"           style="fluency" {...p} />,
  wifi:       (p) => <Icon8 name="wifi"           style="fluency" {...p} />,
  clock:      (p) => <Icon8 name="time"           style="fluency" {...p} />,
  check:      (p) => <Icon8 name="checkmark"      style="fluency" {...p} />,
  cancel:     (p) => <Icon8 name="cancel"         style="fluency" {...p} />,
  refund:     (p) => <Icon8 name="refund"         style="fluency" {...p} />,
  invoice:    (p) => <Icon8 name="purchase-order" style="fluency" {...p} />,
  analytics:  (p) => <Icon8 name="combo-chart"    style="fluency" {...p} />,
};

/* Type icon lookup */
export function TypeIcon({ type, size = 20 }) {
  const map = {
    ger:     { name: 'tent',       style: 'fluency' },
    trip:    { name: 'trekking',   style: 'fluency' },
    food:    { name: 'restaurant', style: 'fluency' },
    product: { name: 'shop',       style: 'fluency' },
    sauna:   { name: 'sauna',      style: 'fluency' },
  };
  const { name, style } = map[type] || { name: 'info', style: 'fluency' };
  return <Icon8 name={name} style={style} size={size} />;
}
