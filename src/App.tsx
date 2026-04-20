import {
  AbsoluteCenter,
  Alert,
  Box,
  Clipboard,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Text,
} from '@chakra-ui/react'

import { useState } from 'react'

import './App.css'

type UrlError = {
  type: string | null;
  message: string | null;
}

function App() {
  const [protocol, setProtocol] = useState('https')
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState(null)
  const [urlError, setUrlError] = useState<UrlError>({ type: null, message: null })

  const handleUrlInput = (evt: React.FormEvent<HTMLInputElement>) => {
    // move protocol to input group
    let long_protocol_pattern = /https?:\/\//
    let short_protocol_pattern = /https?/
    let inputUrl = evt.currentTarget.value
    if (long_protocol_pattern.test(inputUrl)) {
      let inputProtocol = inputUrl.match(short_protocol_pattern)![0]
      setProtocol(inputProtocol)
      let trimmedUrl = inputUrl.replace(`${inputProtocol}://`, '')
      setUrl(trimmedUrl)
      evt.currentTarget.value = trimmedUrl
    }
    setUrl(evt.currentTarget.value)
  }

  const handleUrlSent = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' && url.length > 0) {
      let urlPattern = /([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/
      if (!urlPattern.test(url)) {
        setUrlError({ type: '格式錯誤', message: '網址格式錯誤, 請修改後再送' })
        return
      }

      setUrlError({ type: null, message: null })
      let fullUrl = `${protocol}://${url}`
      generateSlug(fullUrl)
    }
  }

  const generateSlug = (url: string) => {
    fetch('/api/v1/url', {
      method: 'POST',
      body: JSON.stringify({ url: url }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (!response.ok) {
        setUrlError({ type: '未知錯誤', message: '縮址時發生意外'  })
        throw new Error('縮址時發生意外')
      }

      setUrlError({ type: null, message: ''  })
      return response.json()
    })
    .then(obj => {
      setSlug(obj.data.slug)
    })
  }

  const showShortUrlOnDemand = () => {
    if (slug) {
      return (
        <Stack direction="row">
          <Clipboard.Root value={`${location.protocol}//${location.host}/${slug}`}>
            <Clipboard.Trigger asChild>
              <IconButton variant="surface" size="xs">
                <Clipboard.Indicator />
              </IconButton>
            </Clipboard.Trigger>
          </Clipboard.Root>
          <Text
            color="tomato"
            textStyle="2xl"
            fontWeight="bold"
          >
            { `${location.protocol}//${location.host}/${slug}` }
          </Text>
        </Stack>
      )
    }
  }

  const showUrlFormatAlertOnDemand = () => {
    if (urlError.type) {
      return (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{ urlError.type }</Alert.Title>
              <Alert.Description>{urlError.message}</Alert.Description>
          </Alert.Content>
              <Alert.Description></Alert.Description>
        </Alert.Root>
      )
    }
  }

  return (
    <>
      <Grid h="100vh" templateRows="repeat(7, 1fr)" templateColumns="repeat(13, 1fr)">
        <GridItem rowStart={2} rowEnd={7} colStart={2} colEnd={13}>
          <Box borderRadius="lg" h="100%" background="blue.400" padding="4">
            <Box background="gray.100" w="100%" h="100%">
            <AbsoluteCenter w="100%">
              <Stack>
                <Text
                  color="skyblue"
                  fontWeight="bold"
                  textStyle="2xl"
                >
                  Short URL generator!
                </Text>
                <InputGroup startAddon={`${protocol}://`}>
                  <Input
                    placeholder="long.url.com"
                    onKeyPress={handleUrlSent}
                    onInput={handleUrlInput}
                  >
                  </Input>
                </InputGroup>
                  { showShortUrlOnDemand() }
                  { showUrlFormatAlertOnDemand()  }
              </Stack>
            </AbsoluteCenter>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </>
  )
}

export default App
