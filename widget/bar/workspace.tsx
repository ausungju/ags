import { createBinding, createComputed, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland";

// type WsButtonProps = {
// 	ws: AstalHyprland.Workspace;
// };

const Workspace = ({ ws }: WsButtonProps) => {
	// Hyprland connection can fail (Hyprland not running / socket missing).
	// Wrap get_default() to avoid native segfaults when module can't connect.
	let hyprland: any = null;
	try {
		hyprland = AstalHyprland.get_default();
	} catch (e) {
		// Log for debugging; we intentionally swallow to keep UI alive.
		// Native module may throw or abort if connection fails.
		// eslint-disable-next-line no-console
		console.error("AstalHyprland.get_default() failed:", e);
		hyprland = null;
	}

	// If hyprland is not available, provide a fallback binding so UI still renders.
	const focusedWorkspace = hyprland ? createBinding(hyprland, "focusedWorkspace") : createComputed([], () => ({ id: -1 }));

	const classNames = createComputed([focusedWorkspace], (fws) => {
		const classes = ["workspace-button"];

		const active = fws && fws.id == ws.id;
		active && classes.push("active");

		const occupied = hyprland ? (hyprland.get_workspace(ws.id)?.get_clients().length > 0) : false;
		occupied && classes.push("occupied");
		return classes;
	});

	return (
		<button
			cssClasses={classNames}
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			onClicked={() => ws.focus()}
			cursor={Gdk.Cursor.new_from_name("pointer", null)}
			widthRequest={32}
			heightRequest={32}
		/>
	);
};

export const WorkspaceButton = () => {
	const range = Array.from({ length: 4 + 1 }, (_, i) => i);
	return (
		<box cssClasses={["workspace-container"]} spacing={4} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} heightRequest={40}>
			{range.map((i) => (
				<Workspace ws={AstalHyprland.Workspace.dummy(i + 1, null)} />
			))}
		</box>
	);
};

export const FocusedClient = () => {
	let hyprland: any = null;
	try {
		hyprland = AstalHyprland.get_default();
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error("AstalHyprland.get_default() failed:", e);
		hyprland = null;
	}
	const focused = hyprland ? createBinding(hyprland, "focusedClient") : createComputed([], () => null as any);

	return (
		<box cssClasses={["focused-client"]} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} heightRequest={40}>
			<With value={focused}>
				{(client) => client && <label label={createBinding(client, "title")} />}
			</With>
		</box>
	);
};