import { Flex, Container, Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useAuth } from '../context/AuthContext';
import {useLocation} from 'react-router-dom';

const langs = [
    {code: "en", lang: "EN"},
    {code: "es", lang: "ES"}
];

function Header()
{
    const {t,i18n} = useTranslation();
    const {logout} = useAuth();

    function change(lng)
    {
        i18n.changeLanguage(lng);
    }

    return(
        <Container>
            <Flex display="inline-flex" gap="3" align="center" justify="start">
                <p>{t("language")}</p>
                {
                    langs.map(function(lng)
                    {
                        return(
                            <Button
                                key={lng.code}
                                onClick={()=>change(lng.code)}
                            >
                                {lng.lang}
                            </Button>
                        )
                    })
                }
            </Flex>

            {
                useLocation().pathname === "/" ?
                <div></div>
                :
                <Flex align="center" justify="end" style={{float: "right", marginTop: "1vh"}}>
                    <Button onClick={()=>logout()}>LOGOUT</Button>
                </Flex>
            }
        </Container>
    )
}   

export default Header