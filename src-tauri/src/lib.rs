use tauri_plugin_shell::ShellExt;

#[cfg(desktop)]
fn start_sidecar(app: &tauri::App) {
    let sidecar = app.shell()
        .sidecar("server-sidecar")
        .expect("failed to create sidecar command");

    let (_rx, _child) = sidecar
        .spawn()
        .expect("failed to spawn sidecar");
}

#[cfg(mobile)]
fn start_sidecar(_app: &tauri::App) {
    // Sidecar not available on mobile - using cloud API instead
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            if cfg!(desktop) {
                start_sidecar(app);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
