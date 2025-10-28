import { Astal, Gtk, Gdk } from "ags/gtk4";

export const Center_hexpand = () => {
	return (
		<box hexpand halign={Gtk.Align.CENTER} widthRequest={100}></box>
	);
};


export const Start_hexpand = () => {
	return (
		<box hexpand halign={Gtk.Align.START} widthRequest={100}></box>
	);
};


export const End_hexpand = () => {
	return (
		<box hexpand halign={Gtk.Align.END} widthRequest={100}></box>
	);
};
