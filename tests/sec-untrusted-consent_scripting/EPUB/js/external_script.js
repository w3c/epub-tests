function test_support_external() {
    const report = document.getElementById('scripting_support');
    report.textContent = 'The script has been executed. Test passes if consent has been given, otherwise it fails.';
}
window.addEventListener('load', test_support_external);