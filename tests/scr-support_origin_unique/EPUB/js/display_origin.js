function test_url() {
    try {
        document.getElementById('no_scripting').style.display = 'none';
        document.getElementById('scripting').style.display = 'block';
        const origin = self.origin;
        document.getElementById('origin').textContent = origin === "null" || origin === null ? "opaque" : origin;
    } catch (e) {
        alert(e)
    }
}
window.addEventListener('load', test_url);
