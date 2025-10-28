import app from "ags/gtk4/app"
import GLib from "gi://GLib";
import style from "./style/main.scss"
import Bar from "./widget/bar/Bar"
import SystemMenuWindow from "./widget/system-menu-window"


const icons = `${GLib.get_user_config_dir()}/tpanel/assets/icons`;

app.start({

	css: style,
	icons,
	main() {
		app.get_monitors().map(Bar)
		SystemMenuWindow()
	},
	
})
