import { Grid, Box, Flex, Text, Spinner, Card, Avatar, Link, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getYoutubePlaylists, getSpotifyPlaylists } from "../api/playlists";

function PanelPage() {
  const {youtubeT, spotifyT} = useTranslation().t("playlists");
  
  const [ytLoading, setYtLoading] = useState(false);
  const [sLoading, setSLoading] = useState(false);
  const [ytPlaylists, setYtPlaylists] = useState([]);
  const [sPlaylists, setSPlaylists] = useState([]);

  useEffect(function()
  {
      fetchData();
  },[]);

  async function fetchData()
  {
    setSLoading(true); setYtLoading(true);
    
    getYoutubePlaylists().then((res) => 
    {
        console.log(res.data);
        setYtPlaylists(res.data);
        setYtLoading(false);
    });

    getSpotifyPlaylists().then((response) =>
        {
            console.log(response.data);
            setSPlaylists(response.data);
            setSLoading(false);
        })
  }

  return (
    <Grid columns="2" gap="5" width="auto">
      <Box style={{textAlign:"center"}} width="100%" display="inline">
        <Text>{youtubeT.title}</Text>
        {
          ytLoading ? <Flex justify="center" align="center">
                        <br/>
                        <Spinner size="3"/>
                      </Flex>
          : (
            ytPlaylists.length === 0 ? <div><br/><Text color="red">NO SE ENCONTRARON PLAYLISTS</Text></div> 
            : ytPlaylists.map(function(playlist)
            {
              return(
                <Card key={playlist.id} maxwidth="400px">
                  <Flex gap="3" align="center">
                    <Avatar
                      size="3"
                      src={playlist.snippet.thumbnails.default.url}
                      radius="none"
                      fallback="T"
                    />
                    <Box>
                      <Link href="#" as="div" size="3" weight="bold">
                        {playlist.snippet.title}
                      </Link>
                      <Text as="div" size="2" color="gray">
                        {playlist.snippet.description}
                      </Text>
                    </Box>
                  </Flex>
              </Card>
              )
            })
          )
        }
      </Box>

      <Box style={{textAlign:"center"}} width="100%" display="inline">
        <Text>{spotifyT.title}</Text>
        {
          sLoading ? <Flex justify="center" align="center">
                      <br/>
                      <Spinner size="3"/>
                    </Flex>
          : (
            sPlaylists.length === 0 ? <Text color="red">NO SE ENCONTRARON PLAYLISTS</Text> 
            : sPlaylists.map(function(playlist)
            {
              return(
                <Card key={playlist.id}>
                  <Flex gap="3" align="center">
                    <Avatar
                      size="3"
                      src={playlist.images[0].url}
                      radius="none"
                      fallback="T"
                    />
                    <Box>
                      <Link href="www.google.com" as="div" size="2" weight="bold">
                        {playlist.name}
                      </Link>
                      <Text as="div" size="2" color="gray">
                        {playlist.description}
                      </Text>
                    </Box>
                  </Flex>
              </Card>
              )
            })
          )
        }
      </Box>
    </Grid>
  );
}

export default PanelPage;