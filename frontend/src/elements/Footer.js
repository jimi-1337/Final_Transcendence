import styles from './../css_files/main.module.css'


function Footer() {
  return (
    <div >
      <footer className={styles.footer +  " bg-dark"}>
        <div className="social">
          <a className="m-1" href="http://facebook.com">
            <i className={styles.fb + " fab fa-facebook fa-2x"}></i>
          </a>
          <a className="m-1" href="http://twitter.com">
            <i className={styles.tw + " fab fa-twitter fa-2x"}></i>
          </a>
          <a className="m-1" href="http://youtube.com">
            <i className={styles.yt + " fab fa-youtube fa-2x"}></i>
          </a>
          <a className="m-1" href="http://linkedin.com">
            <i className={styles.li + " fab fa-linkedin fa-2x"}></i>
          </a>
        </div>
        <p>Copyright &copy; 2021 - Ayoub</p>
      </footer>
    </div>
  );
}

export default Footer;