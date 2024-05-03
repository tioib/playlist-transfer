import LoginButton from '../components/LoginButton';
import { useTranslation } from 'react-i18next';
import { Heading } from '@radix-ui/themes';
import './css/App.css';

function HomePage() {
  const {t} = useTranslation();

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <img src='https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png' className="Brand-logo" alt="logo-yt"/>
          <img src='https://cdn4.iconfinder.com/data/icons/iready-symbols-arrows-vol-2/28/004_060_refresh_update_sign_arrow1x-512.png' className="App-logo" alt="arrows" />
          <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png' className="Brand-logo" alt="logo-s"/>
        </div>
        <div>
          <br/>
          <Heading>
            {t("homePageTitle")}
          </Heading>
          <br/>
          <LoginButton which={true}/>
          <LoginButton which={false}/>
        </div>
      </header>
    </div>
  );
}

export default HomePage;
