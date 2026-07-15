import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

type Tag = 'div' | 'button' | 'span' | 'aside' | 'section' | 'a' | 'label' | 'li'

interface PressableProps {
  as?: Tag
  baseStyle: CSSProperties
  hoverStyle?: CSSProperties
  activeStyle?: CSSProperties
  className?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  children?: ReactNode
  [key: string]: unknown
}

export function Pressable({
  as = 'div',
  baseStyle,
  hoverStyle,
  activeStyle,
  children,
  ...rest
}: PressableProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const style: CSSProperties = {
    ...baseStyle,
    ...(hover ? hoverStyle : null),
    ...(active ? activeStyle : null),
  }
  const Tag = as
  return (
    <Tag
      {...rest}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setActive(false)
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
    </Tag>
  )
}
