import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createBinding, createComputed } from "ags";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import AstalBattery from "gi://AstalBattery";

// const QuickToggle = ({ iconName, label }: { iconName: string; label: string }) => {
// 	return (
// 		<button cssClasses={["quick-toggle"]}>
// 			<box orientation={Gtk.Orientation.VERTICAL} spacing={4} halign={Gtk.Align.CENTER}>
// 				<image iconName={iconName} pixelSize={24} />
// 				<label label={label} wrap justify={Gtk.Justification.CENTER} />
// 			</box>
// 		</button>
// 	);
// };

export default function SystemMenuWindow() {
	const { TOP, RIGHT } = Astal.WindowAnchor;
	const battery = AstalBattery.get_default();

	// 밝기 값을 poll로 주기적으로 업데이트
	const brightnessValue = createPoll(50, 2000, async () => {
		try {
			const output = await execAsync("brightnessctl get");
			const maxOutput = await execAsync("brightnessctl max");
			const brightness = parseInt(output.trim());
			const maxBrightness = parseInt(maxOutput.trim());
			return Math.round((brightness / maxBrightness) * 100);
		} catch (e) {
			console.log("Failed to get brightness:", e);
			return 50;
		}
	});

	const brightnessAdjustment = new Gtk.Adjustment({
		lower: 1,
		upper: 100,
		step_increment: 1,
		page_increment: 10,
	});

	return (
		<window
			name="system-menu"
			cssName="system-menu-window"
			visible={false}
			anchor={TOP | RIGHT}
			application={app}
		>
			<box
				orientation={Gtk.Orientation.VERTICAL}
				spacing={12}
				cssClasses={["system-menu"]}
				marginTop={10}
				marginEnd={10}
				marginBottom={10}
				marginStart={10}
			>
				{/* 상단 빠른 설정 버튼들 */}
				{/* <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} homogeneous>
					<QuickToggle iconName="wifi-strength-4-symbolic" label="WiFi" />
					<QuickToggle iconName="bluetooth-active-symbolic" label="Bluetooth" />
					<QuickToggle iconName="weather-clear-symbolic" label="DND" />
					<QuickToggle iconName="airplane-mode-symbolic" label="Airplane" />
				</box> */}

				{/* 밝기 조절 */}
				<box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
					<box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
						<image iconName="display-brightness-symbolic" pixelSize={16} />
						<label label="Brightness" halign={Gtk.Align.START} hexpand />
					</box>
					<slider
						orientation={Gtk.Orientation.HORIZONTAL}
						drawValue={true}
						value={brightnessValue}
						adjustment={brightnessAdjustment}
						onValueChanged={(self: any) => {
							const value = Math.floor(self.get_value());
							execAsync(["brightnessctl", "set", `${value}%`]).catch((e: any) => {
								console.log("Failed to set brightness:", e);
							});
						}}
					/>
				</box>

				{/* 음량 조절 */}
				<box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
					<box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
						<image iconName="audio-volume-high-symbolic" pixelSize={16} />
						<label label="Volume" halign={Gtk.Align.START} hexpand />
					</box>
					<slider
						orientation={Gtk.Orientation.HORIZONTAL}
						drawValue={true}
						value={50}
						adjustment={new Gtk.Adjustment({
							lower: 0,
							upper: 100,
							step_increment: 1,
							page_increment: 5,
						})}
						onValueChanged={(self: any) => {
							const value = Math.floor(self.get_value());
							execAsync(["amixer", "set", "Master", `${value}%`]).catch((e: any) => {
								console.log("Failed to set volume:", e);
							});
						}}
					/>
				</box>

				{/* 배터리 상태 */}
				<box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} cssClasses={["battery-info"]}>
					<image iconName="battery-full-symbolic" pixelSize={16} />
					<label
						label={createComputed(
							[
								createBinding(battery, "percentage"),
								createBinding(battery, "charging"),
							],
							(percentage, charging) =>
								`${Math.floor(percentage * 100)}% - ${charging ? "Charging" : "Discharging"}`
						)}
						halign={Gtk.Align.START}
						hexpand
					/>
				</box>

				{/* 하단 설정 버튼 */}
				{/* <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} homogeneous>
					<button cssClasses={["system-button"]}>
						<box orientation={Gtk.Orientation.VERTICAL} spacing={4} halign={Gtk.Align.CENTER}>
							<image iconName="emblem-system-symbolic" pixelSize={24} />
							<label label="Settings" justify={Gtk.Justification.CENTER} />
						</box>
					</button>
					<button cssClasses={["system-button"]}>
						<box orientation={Gtk.Orientation.VERTICAL} spacing={4} halign={Gtk.Align.CENTER}>
							<image iconName="system-shutdown-symbolic" pixelSize={24} />
							<label label="Power" justify={Gtk.Justification.CENTER} />
						</box>
					</button>
				</box> */}
			</box>
		</window>
	);
}
