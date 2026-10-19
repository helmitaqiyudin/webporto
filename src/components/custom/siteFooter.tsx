/** Copyright line at the bottom of the page. */
export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="text-xs text-muted-foreground text-start">
            <p>© {year} Helmi Taqiyudin</p>
        </footer>
    );
}
