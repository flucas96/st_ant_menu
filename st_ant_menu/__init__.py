import streamlit.components.v1 as components
import os

_RELEASE = True

if not _RELEASE:
    # Declare the component with a given name and URL if we're not in release mode.
    _component_func = components.declare_component(
        # We give the component a simple, descriptive name ("my_component"
        # does not fit this bill, so please choose something better for your
        # own component :)
        "st_ant_menu",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3000",
    )
else:
    # When we're distributing a production version of the component, we'll
    # replace the `url` param with `path`, and point it to to the component's
    # build directory:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("st_ant_menu", path=build_dir)


def validate_menu_data(menu_data):
    if not isinstance(menu_data, list):
        raise ValueError("menu_data must be a list of dictionaries")

    for item in menu_data:
        if not isinstance(item, dict):
            raise ValueError("Each menu item must be a dictionary")

        if "key" not in item or "label" not in item:
            raise ValueError("Each menu item must have 'key' and 'label' fields")

        if "label" in item and item["label"] is not None and not isinstance(item["label"], str):
            raise ValueError("The 'label' field must be a string or null")

        if "icon" in item and not isinstance(item["icon"], str):
            raise ValueError("The 'icon' field must be a string")

        if "children" in item:
            if not isinstance(item["children"], list):
                raise ValueError("The 'children' field must be a list of dictionaries")
            validate_menu_data(item["children"])

        if "type" in item and item["type"] not in [None, "group", "divider"]:
            raise ValueError("The 'type' field must be either 'group', 'divider', or null")

        if "disabled" in item and not isinstance(item["disabled"], bool):
            raise ValueError("The 'disabled' field must be a boolean")


def st_ant_menu(menu_data = None, key="first_menu", defaultValue=[], defaultSelectedKeys=[], defaultOpenKeys=[], additionalHeight=0, multiple=False, css_styling=None, css_styling_menu=None,
                 generall_css_styling=None, theme="light",menu_click=False, iconSize=15, modus = "inline", inlineIndent=24, close_auto=True, custom_font_awesome_url = "https://kit.fontawesome.com/c7cbba6207.js",
                 iconMinWidth=20,return_value=True) :
    """
    Create a menu component that can be used in Streamlit.

    generall_css_styling example:

    .ant-menu-item-divider {
    /* Add your custom styles for the divider here */
    border-top: 3px solid red !important;
    }
    

    :param menu_data: The data to be displayed in the menu. Must be a list of dictionaries
        that conform to the Ant Design Menu item specification. See
        https://ant.design/components/menu/#Menu.Item for more information.
    :param key: The key associated with the component. This is used to ensure that
        the component is rendered properly when its value changes.
    :param defaultValue: The default value to be displayed in the component.
    :param defaultSelectedKeys: The default selected keys in the menu.
    :param defaultOpenKeys: The default open keys in the menu.
    :param additionalHeight: The additional height of the menu that should be added
        to the Streamlit iframe height. This is used to ensure that the entire menu
        is visible in the Streamlit app.
    :param multiple: Whether the menu allows multiple selections. (Broken)
    :param css_styling_menu: A dictionary of CSS styling to be applied to the Menu component.
    :param theme: The theme of the menu. Can be either "light" or "dark".
    :param iconSize: The size of the icons in the menu. Default is 15.
    :param modus: The modus of the menu. Can be either "inline" or "horizontal".
    :param inlineIndent: The indent of the menu items in inline modus. Default is 24.
    :param close_auto: Whether the menus collapse if another one is opened. Default is True.
    :param custom_font_awesome_url: The url of the font awesome library. Default is "https://kit.fontawesome.com/c7cbba6207.js".
    :param iconMinWidth: The minimum width of the icons in the menu. Default is 30. - Used to make sure that the text always starts at the same position.
    :param return_value: Whether the component should return a value. Default is True.

    :return: The value of the component.
    """
    # css_styling is an alias for css_styling_menu (fixes #2)
    if css_styling is not None and css_styling_menu is None:
        css_styling_menu = css_styling

    # Call the component function with the given parameters.
    component_value = _component_func(
        menu_data=menu_data,
        key=key,
        defaultSelectedKeys=defaultSelectedKeys,
        defaultOpenKeys=defaultOpenKeys,
        default=defaultValue,
        multiple=multiple,
        additionalHeight=additionalHeight,
        css_styling_menu=css_styling_menu,
        generall_css_styling=generall_css_styling,
        theme = theme, 
        menu_click = menu_click,
        iconSize = iconSize,
        modus = modus,
        inlineIndent = inlineIndent,
        close_auto = close_auto,
        custom_font_awesome_url = custom_font_awesome_url,
        iconMinWidth = iconMinWidth
    )
        # Return the component value, handling the case where it's a list.
    if return_value == True:
        if menu_click == True:
            if isinstance(component_value, list):
                return component_value[0] if len(component_value) == 1 else component_value[-1]
            
        if multiple == False:
            if isinstance(component_value, list):
                if len(component_value) == 0:
                    return None
                else:
                    return component_value[0]
            

        return component_value