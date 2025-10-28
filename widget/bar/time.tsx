import { createPoll } from "ags/time";
import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import GLib from "gi://GLib";



export const Time = () => {
	const time = createPoll("", 1000, () => 
		GLib.DateTime.new_now_local().format("%B %d  %H:%M")!,
	);

	return (
		<menubutton>
			<label label={time} />
			<popover>
				<Gtk.Calendar />
			</popover>
		</menubutton>
	);
};
