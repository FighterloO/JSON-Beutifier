export function highlightJson(jsonString: string): string {
    if (!jsonString) {
        return '';
    }

    let html = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
        let cls = 'text-emerald-400'; // String
        if (/:$/.test(match)) {
            cls = 'text-sky-400'; // Key
        }
        return `<span class="${cls}">${match}</span>`;
    });

    html = html.replace(/\b(true|false)\b/g, '<span class="text-amber-400">$1</span>');
    html = html.replace(/\bnull\b/g, '<span class="text-slate-400">$&</span>');
    html = html.replace(/(?<!")\b-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?\b(?!")/g, '<span class="text-fuchsia-400">$&</span>');

    return html;
}