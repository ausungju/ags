import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { execAsync } from "ags/process";
import GLib from "gi://GLib";
// import { createPoll, } from "ags/time";
// import { WorkspaceButton } from "./workspace";
import { Time } from "./time";
import { Battery } from "./battery";
import { Start_hexpand, Center_hexpand, End_hexpand } from "./utils";
import { SystemMenuToggle, Tray} from "./system";


export default function Bar(gdkmonitor: Gdk.Monitor) {
	// const time = createPoll("", 1000, "date")
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

	return (
		<window
			visible
			name="bar"
			class="Bar"
			gdkmonitor={gdkmonitor}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			anchor={TOP | LEFT | RIGHT}
			application={app}
		>
			<centerbox cssName="centerbox">
				<box $type="start" hexpand halign={Gtk.Align.CENTER} >
				 < Tray />
				</box>
				<box $type="center" hexpand halign={Gtk.Align.CENTER} >
					< Time />
				</box>
				<box $type="end" hexpand halign={Gtk.Align.END} >
					< Battery />
					< SystemMenuToggle />
				</box>
			</centerbox>
		</window>
	)
}
