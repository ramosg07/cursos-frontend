'use client'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import DynamicIcon from './Icon'

export function NavItem({
  data = [],
}: {
  data:
    | [
        {
          section: string
          isOpen: boolean
          items: [
            {
              name: string
              href: string
              desc: string
              iconName: string
            },
          ]
        },
      ]
    | []
}) {
  const pathname = usePathname()

  return (
    <ScrollArea>
      <nav>
        {data.map((section) => (
          <SidebarGroup key={section.section}>
            <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item, idxItem) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={`sidebar-menu-${idxItem}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link id={item.href} href={item.href}>
                        <DynamicIcon
                          name={item.iconName}
                          size="20"
                          className={cn(
                            'mr-3',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        />
                        <span className="text-base font-semibold">
                          {item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </nav>
    </ScrollArea>
  )
}
