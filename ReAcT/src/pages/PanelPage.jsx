import { Grid, Box, Text, Spinner, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getYoutubePlaylists, getSpotifyPlaylists } from "../api/playlists";

function PanelPage() {
  const {youtubeT, spotifyT} = useTranslation().t("playlists");
  
  const [ytLoading, setYtLoading] = useState(true);
  const [sLoading, setSLoading] = useState(true);
  const [ytPlaylists, setYtPlaylists] = useState([]);
  const [sPlaylists, setSPlaylists] = useState([]);

  useEffect(async function()
  {
      
  });

  return (
    <Grid columns="2" gap="5" width="auto">
      <Box style={{textAlign:"center"}} width="100%" display="inline">
        <Text>{youtubeT.title}</Text>
      </Box>

      <Box style={{textAlign:"center"}} width="100%" display="inline">
        <Text>{spotifyT.title}</Text>
      </Box>
    </Grid>
  );
}

export default PanelPage;