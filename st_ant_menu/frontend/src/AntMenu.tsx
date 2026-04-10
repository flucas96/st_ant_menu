import { Menu } from "antd";
import type { MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import {
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";
import * as AllIcons from "@ant-design/icons";
import { ComponentType } from "react";
import { Helmet } from 'react-helmet';


// Create a mapping of all available Ant Design icons
const Icons: Record<string, ComponentType<any>> = {};
Object.keys(AllIcons).forEach((key) => {
  Icons[key as keyof typeof AllIcons] = AllIcons[key as keyof typeof AllIcons] as ComponentType<any>;
});


type MenuItem = Required<MenuProps>['items'][number];


function parseMenuItems(data: any[], iconSize: string, iconMinWidth: string): MenuItem[] {
  return data.map((item: any) => {
    // Build icon element
    let icon: React.ReactNode = undefined;
    if (item.icon) {
      try {
        if (item.icon.startsWith('fa-')) {
          icon = (
            <div style={{ minWidth: iconMinWidth, display: 'flex', alignItems: 'center' }}>
              <i className={`fa ${item.icon}`} style={{ fontSize: iconSize }} />
            </div>
          );
        } else {
          const Icon = Icons[item.icon];
          if (Icon) {
            icon = (
              <div style={{ minWidth: iconMinWidth, display: 'flex', alignItems: 'center' }}>
                {React.createElement(Icon, { style: { fontSize: iconSize } })}
              </div>
            );
          }
        }
      } catch (error) {
        console.warn(`Failed to create icon for "${item.icon}":`, error);
      }
    }

    // Build label element
    let label: React.ReactNode = item.label;
    if (item.label && typeof item.label === 'string' && item.label.match(/<(.*?)>/)) {
      label = <span dangerouslySetInnerHTML={{ __html: item.label }} />;
    }

    // Handle divider type
    if (item.type === 'divider') {
      return { type: 'divider' as const, key: item.key || Math.random().toString() };
    }

    // Handle group type
    if (item.type === 'group') {
      return {
        type: 'group' as const,
        key: item.key,
        label,
        children: item.children ? parseMenuItems(item.children, iconSize, iconMinWidth) : [],
      };
    }

    // Regular item or submenu
    const result: any = {
      key: item.key,
      label,
      icon,
      disabled: item.disabled ? true : false,
    };

    if (item.children) {
      result.children = parseMenuItems(item.children, iconSize, iconMinWidth);
    }

    return result as MenuItem;
  });
}



/**
 * A React component that renders an Ant Design menu based on the provided menu data.
 */
const MenuComponent = (props: ComponentProps) => {
  const { menu_data, key, defaultSelectedKeys, defaultOpenKeys, additionalHeight, close_auto, multiple, css_styling, theme,menu_click, iconSize,modus,generall_css_styling, inlineIndent, custom_font_awesome_url,
    iconMinWidth} = props.args;
    const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys || []);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultSelectedKeys || []);
    const [clickOccurred, setClickOccurred] = useState<boolean>(false);  // Track if a click occurred
    const rootSubmenuKeys = menu_data.map((item: any) => item.key);
  

  useEffect(() => {
    // Select the menu element
    const menuElement = document.querySelector('.ant-menu');
  
    // If the menu exists, observe changes in its size
    if (menuElement) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          // Set the height when the size of the menu changes
          const height = entry.target.clientHeight;
          Streamlit.setFrameHeight(height + additionalHeight);
        }
      });
  
      // Start observing
      resizeObserver.observe(menuElement);
  
      // Cleanup
      return () => {
        resizeObserver.unobserve(menuElement);
      };
    }
  }, []);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    
    } else {
      if (menu_click == true && clickOccurred) {
        Streamlit.setComponentValue(keys);
      }

      if (close_auto == true) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
      
    } else {
      setOpenKeys(keys);  // Keep all keys
    }

  };
  };


  const onClick = ({ key }: { key: string }) => {
    setClickOccurred(true);  // Update the state to indicate a click occurred
    if (multiple) {
      if (selectedKeys.includes(key)) {
        setSelectedKeys(selectedKeys.filter(k => k !== key));
      } else {
        setSelectedKeys([...selectedKeys, key]);
      }
    } else {
      setSelectedKeys([key]);
    }
  };


  useEffect(() => {
    if (clickOccurred) {
      // console.log("Sending selected keys to Streamlit:", selectedKeys);
      Streamlit.setComponentValue(selectedKeys);
    }  }, [selectedKeys]);




  return (
    <>
      <Helmet>
        <script
          src={custom_font_awesome_url}
          crossOrigin="anonymous"
          id="font-awesome-icons"
        />
      </Helmet>
     
        <style dangerouslySetInnerHTML={{ __html: generall_css_styling }} />
      <Menu
        id={key}
        mode={modus}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        inlineIndent={inlineIndent}
        style={{
          width: "100%",
          height: "100%",
          borderRight: 0,
          overflow: "auto",
          borderRadius: "10px",
          ...css_styling
        }}
        theme={theme}
        items={parseMenuItems(menu_data, iconSize, iconMinWidth)}
        multiple={multiple}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        onClick={onClick}
      />
    </>
  );
};



export default withStreamlitConnection(MenuComponent);