import { Grid, Box, Flex, Text, Spinner, Card, Avatar, Link, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getYoutubePlaylists, getSpotifyPlaylists } from "../api/playlists";

function PanelPage() {
  const {youtubeT, spotifyT} = useTranslation().t("playlists");
  
  const [ytLoading, setYtLoading] = useState(true);
  const [sLoading, setSLoading] = useState(true);
  const [ytPlaylists, setYtPlaylists] = useState([]);
  const [sPlaylists, setSPlaylists] = useState([]);

  useEffect(function()
  {
      if(ytLoading)
      {
        setYtPlaylists(getYoutubePlaylists());
        setYtLoading(false);
      }

      if(sLoading)
      {
        setSPlaylists(getSpotifyPlaylists());
        setSLoading(false);
      }
  },[ytLoading,sLoading]);

  return (
    <Grid columns="2" gap="5" width="auto">
      <Box style={{textAlign:"center"}} width="100%" display="inline">
        <Text>{youtubeT.title}</Text>
        {
          ytLoading ? <Spinner/>
          : (
            ytPlaylists.length === 0 ? <Text color="red">NO SE ENCONTRARON PLAYLISTS</Text> 
            : ytPlaylists.map(function(playlist)
            {
              return(
                <Card key={playlist.list.id} maxWidth="400px">
                  <Flex gap="3" align="center">
                    <Avatar
                      size="3"
                      src={playlist.list.snippet.thumbnails.default.url}
                      radius="none"
                      fallback="T"
                    />
                    <Box>
                      <Link as="div" size="2" weight="bold">
                        {playlist.list.snippet.title}
                      </Link>
                      <Text as="div" size="2" color="gray">
                        {playlist.list.snippet.description}
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
          sLoading ? <Spinner/>
          : (
            sPlaylists.length === 0 ? <Text color="red">NO SE ENCONTRARON PLAYLISTS</Text> 
            : sPlaylists.map(function(playlist)
            {
              return(
                <Card key={playlist.list.id} maxWidth="400px">
                  <Flex gap="3" align="center">
                    <Avatar
                      size="3"
                      src={playlist.list.images[0].href}
                      radius="none"
                      fallback="T"
                    />
                    <Box>
                      <Link as="div" size="2" weight="bold">
                        {playlist.list.name}
                      </Link>
                      <Text as="div" size="2" color="gray">
                        {playlist.list.description}
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