import sys

with open("legacy_html/index.html", "r") as f:
    lines = f.readlines()

header = "".join(lines[:300]) # 1 to 300
footer = "".join(lines[1322:]) # 1323 to end

grafisk_content = """
    <main class="container" style="padding-top: 120px; padding-bottom: 120px; min-height: 80vh;">
        <header style="text-align: center; margin-bottom: 48px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 16px;">Grafisk Design</h1>
            <p style="color: var(--text-muted, #64748b); font-size: 1.125rem;">Her finner du grafiske dokumenter, logoer, plakater og ressurser.</p>
        </header>

        <div class="grid" id="graphic-docs-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; margin-bottom: 48px;">
            <p style="text-align: center; width: 100%; color: #666;">Laster inn dokumenter...</p>
        </div>
    </main>

    <!-- JS logikk for henting av grafiske dokumenter -->
    <script type="module" src="/js/documents.js"></script>
    <style>
        .grid .card {
            background: var(--card-bg, #ffffff);
            border-radius: var(--radius-card, 20px);
            border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            transition: transform 200ms ease-out, box-shadow 200ms ease-out;
            display: flex;
            flex-direction: column;
        }
        .grid .card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .grid .card-img {
            width: 100%;
            height: 200px;
            background: #e2e8f0;
            object-fit: cover;
        }
        .grid .card-content {
            padding: 24px;
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .grid .card-title {
            font-size: 1.25rem;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .grid .card-desc {
            color: var(--text-muted, #64748b);
            margin-bottom: 24px;
            flex: 1;
        }
        .grid .tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }
        .grid .tag {
            background: #f1f5f9;
            color: var(--text-muted, #64748b);
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.875rem;
            border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
        }
        .grid .btn {
            display: inline-block;
            background: var(--clr-base, #2563eb);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-btn, 12px);
            text-decoration: none;
            font-weight: 500;
            text-align: center;
        }
    </style>
"""

with open("legacy_html/grafisk.html", "w") as f:
    f.write(header + grafisk_content + footer)

print("Created legacy_html/grafisk.html")
