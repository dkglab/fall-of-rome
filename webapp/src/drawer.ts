function toggleDrawer(event: PointerEvent) {
    let element = event.target
    if (element instanceof HTMLButtonElement) {
        let drawerId = element.getAttribute("drawer")
        if (drawerId) {
            let drawer = document.getElementById(drawerId)
            if (drawer?.classList.contains("drawer-inactive")) {
                drawer.classList.replace("drawer-inactive", "drawer-active")
            } else if (drawer?.classList.contains("drawer-active")) {
                drawer.classList.replace("drawer-active", "drawer-inactive")
            }
        }
    }
}

(window as any).toggleDrawer = toggleDrawer;