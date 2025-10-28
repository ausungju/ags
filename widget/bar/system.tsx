import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createBinding, For } from "ags";
import AstalTray from "gi://AstalTray";


export const SystemMenuToggle = () => {
	return (
		<button
			cssClasses={["system-menu-toggle"]}
			onClicked={() => {
				const window = app.get_window("system-menu");
				if (window) {
					window.visible ? window.hide() : window.show();
				}
			}}
		>
			<label label="system" />
		</button>
	);
};


export const Tray = () => {
  const tray = AstalTray.get_default();
  const items = createBinding(tray, "items");

  return (
    <box cssClasses={["pill", "tray"]} spacing={5}>
      <For each={items}>{(item: any) => <Item item={item} />}</For>
    </box>
  );
};

const Item = ({ item }: { item: any }) => {
  return (
    <menubutton>
      <image gicon={createBinding(item, "gicon")} iconSize={Gtk.IconSize.NORMAL} />
    </menubutton>
  );
};