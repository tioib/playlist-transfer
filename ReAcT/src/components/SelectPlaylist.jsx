import { Grid, Box, Flex, Text, TextField, Spinner, Card, Avatar, Link, Button, Dialog } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getYoutubeTracks, getSpotifyTracks } from "../api/playlists";

function SelectPlaylist(props)
{
    const t = useTranslation().t("playlists");

    return(
        <div>
            <Dialog.Root>
                <Dialog.Trigger>
                    <Link style={{textOverflow: "ellipsis"}} href="#" size="3" weight="bold">{props.title}</Link>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>
                        <Link href={props.link} target="_blank">
                            <Flex align="center" gap="3">
                                <Avatar
                                size="3"
                                src={props.img}
                                radius="none"
                                fallback="T"
                                />
                                {props.title}
                            </Flex>
                        </Link>
                    </Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        {props.which ? t.which.youtube : t.which.spotify}
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            {t.title.t}
                        </Text>
                        <TextField.Root
                        defaultValue={props.title}
                        placeholder={t.title.placeholder}
                        />
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            {t.desc.t}
                        </Text>
                        <TextField.Root
                        defaultValue={props.desc}
                        placeholder={t.desc.placeholder}
                        />
                    </label>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            {t.cancel}
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button>{t.create}</Button>
                    </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

        </div>
    )
}

export default SelectPlaylist;