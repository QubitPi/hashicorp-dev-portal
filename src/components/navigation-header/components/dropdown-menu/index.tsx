import { ReactElement, useMemo, useState } from 'react'
import Link from 'next/link'
import slugify from 'slugify'
import { IconChevronDown16 } from '@hashicorp/flight-icons/svg-react/chevron-down-16'
import { IconDocs16 } from '@hashicorp/flight-icons/svg-react/docs-16'
import { IconHome16 } from '@hashicorp/flight-icons/svg-react/home-16'
import { IconTerminalScreen16 } from '@hashicorp/flight-icons/svg-react/terminal-screen-16'
import { IconTools16 } from '@hashicorp/flight-icons/svg-react/tools-16'
import { ProductSlug } from 'types/products'
import ProductIcon from 'components/product-icon'
import Text from 'components/text'
import {
  NewNavigationHeaderItem as NavigationHeaderItem,
  NavigationHeaderDropdownMenuProps,
  SupportedIcon,
} from 'components/navigation-header/types'
import s from './dropdown-menu.module.css'

/**
 * The icons supported in this menu in addition to the Product logo icons.
 */
const supportedIcons: { [key in SupportedIcon]: ReactElement } = {
  docs: <IconDocs16 />,
  home: <IconHome16 />,
  terminalScreen: <IconTerminalScreen16 />,
  tools: <IconTools16 />,
}

/**
 * A dropdown menu consisiting of an activator button and a dropdown containing
 * menu item groups.
 *
 * TODO: add more details as more interaction support is added
 */
const NavigationHeaderDropdownMenu = ({
  label,
  itemGroups,
}: NavigationHeaderDropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const numberOfItemGroups = itemGroups.length
  const menuId = useMemo(() => `menu-${slugify(label)}`, [label])

  /**
   * Generates a unique ID for a single dropdown menu item based on the ID of
   * the group it belongs to.
   */
  const getItemId = (groupId: string, itemIndex: number): string => {
    return `${groupId}-item-${itemIndex}`
  }

  /**
   * Generates a unique ID for a group of items based on the main menu ID and
   * the index of the group.
   */
  const getItemGroupId = (groupIndex: number): string => {
    return `${menuId}-itemGroup-${groupIndex}`
  }

  /**
   * Handles click interaction with the activator button. When clicked, if the
   * menu is:
   *  - open, then it will be closed
   *  - closed, then it will be opened
   */
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  /**
   * Handles the start of a mouse hover interaction with the activator button.
   * When the mouse pointer hovers over the activator button, the menu will be
   * opened if it is not already open.
   */
  const handleMouseEnter = () => {
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  /**
   * Handles the end of a mouse hover interaction with the entire menu. If the
   * menu is open, and the mouse moves outside the bounds either the activator
   * button or the dropdown menu list, then the menu will be closed.
   */
  const handleMouseLeave = () => {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <div className={s.root} onMouseLeave={handleMouseLeave}>
      <div className={s.activatorWrapper}>
        <button
          aria-controls={menuId}
          aria-expanded={isOpen}
          className={s.activator}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
        >
          <Text
            asElement="span"
            className={s.activatorText}
            size={200}
            weight="medium"
          >
            {label}
          </Text>
          <IconChevronDown16 className={s.activatorIcon} />
        </button>
      </div>
      <div
        className={s.dropdownContainer}
        id={menuId}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        {itemGroups.map((items: NavigationHeaderItem[], groupIndex: number) => {
          const groupId = getItemGroupId(groupIndex)
          const showDivider =
            numberOfItemGroups > 1 && groupIndex !== numberOfItemGroups - 1
          return (
            <>
              <ul className={s.itemGroup}>
                {items.map((item: NavigationHeaderItem, itemIndex: number) => {
                  const isFirstMenuItem = itemIndex === 0
                  const isLastMenuItem = itemIndex === numberOfItemGroups - 1
                  const icon = supportedIcons[item.icon] || (
                    <ProductIcon productSlug={item.icon as ProductSlug} />
                  )
                  const itemId = getItemId(groupId, itemIndex)

                  return (
                    <li className={s.itemContainer} key={itemId}>
                      <Link href={item.path}>
                        <a
                          className={s.itemLink}
                          onKeyDown={(e) => {
                            const isTab = e.key === 'Tab' && !e.shiftKey
                            const isShiftTab = e.key === 'Tab' && e.shiftKey

                            if (isFirstMenuItem && isShiftTab) {
                              setIsOpen(false)
                            } else if (isLastMenuItem && isTab) {
                              setIsOpen(false)
                            }
                          }}
                        >
                          {icon}
                          <Text
                            asElement="span"
                            className={s.itemText}
                            size={100}
                            weight="regular"
                          >
                            {item.label}
                          </Text>
                        </a>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              {showDivider && <hr className={s.itemGroupDivider} />}
            </>
          )
        })}
      </div>
    </div>
  )
}

export default NavigationHeaderDropdownMenu
