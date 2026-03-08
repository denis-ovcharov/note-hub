import css from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={css.footer}>
      <div className={css.content}>
        <p>© {new Date().getFullYear()} NoteHub. All rights reserved.</p>
        <div className={css.wrap}>
          <p>Developer: Denys Ovcharov</p>
          <p>
            Contact us:
            <a
              href="https://www.linkedin.com/in/denys-ovcharov-dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
