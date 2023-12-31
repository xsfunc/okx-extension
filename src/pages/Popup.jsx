import { useEffect, useState } from 'react'
import { Alert, Box, Button, FormControl, FormLabel, Input, Textarea, Typography } from '@mui/joy'
import '@fontsource/inter'

async function fillInputs(addressList, prefix) {
  const selectors = {
    openAddressDialogButton: '.filter-search-form-btn',
    dialog: '#body > div.okui-transition-fade.okui-dialog.okui-dialog-float.okui-transition-fade-entered > div',
    addAddressInput: '.add-address-form-btn',
    saveAsTrustCheckbox: 'form span.okui-checkbox input',

    addressInputSelector: i => `form .okui-form-item:nth-child(6) .okui-form-item:nth-child(${i}) .okui-input-input`,
    nameInputSelector: i => `form .okui-form-item:nth-child(6) .okui-form-item:nth-child(${i}) .okui-input-input`,
  }

  const fillInput = (selector, value) => {
    const input = document.querySelector(selector)
    input.setAttribute('value', value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // open dialog if not opened
  const dialogElement = document.querySelector(selectors.dialog)
  if (!dialogElement) {
    const openDialogButton = document.querySelector(selectors.openAddressDialogButton)
    openDialogButton.click()
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const addAddressElement = document.querySelector(selectors.addAddressInput)

  // fill addresses and names
  let index = 0
  for await (const address of addressList) {
    const addressInputSelector = selectors.addressInputSelector(index * 5 + 3)
    fillInput(addressInputSelector, address)

    if (prefix) {
      const nameInputSelector = selectors.nameInputSelector(index * 5 + 5)
      const nameValue = `${prefix}-${address.slice(0, 5)}...${address.slice(-5)}`
      fillInput(nameInputSelector, nameValue)
    }

    if (index < addressList.length - 1) {
      addAddressElement.click()
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    index += 1
  }

  const saveAsTrustElement = document.querySelector(selectors.saveAsTrustCheckbox)
  saveAsTrustElement.click()
}

async function addToWl(addressList, prefix) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: fillInputs,
      args: [
        addressList.split(/\r?\n/).slice(0, 20),
        prefix,
      ],
    })
}

async function isOkxOpen() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab?.url.includes('/withdrawal-address')
}

export default function () {
  const [addressList, setAddressList] = useState('')
  const [prefix, setPrefix] = useState('')
  const [okxTabOpen, setTabOpen] = useState(false)
  const [addressCount, setAddressCount] = useState(0)

  useEffect(() => {
    isOkxOpen().then(setTabOpen)
  }, [])

  useEffect(() => {
    if (!addressList)
      return

    const count = addressList.split(/\r?\n/).length
    setAddressCount(Math.min(count, 20))
  }, [addressList])

  return (
    <Box
      sx={{
        m: 0,
        py: 3,
        px: 2,
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <Typography level="h5" component="h1">
          <b>xs</b>Okx tool
        </Typography>
        <Typography level="body-sm">Add wallets to WL with ease</Typography>
      </div>

      {!okxTabOpen && <Alert
        color="warning"
        variant="outlined"
        size="sm"
      >
        Open OKX address book page first
      </Alert>}

      <FormControl size='sm'>
        <FormLabel>Address list</FormLabel>
        <Textarea
          onChange={event => setAddressList(event.target.value)}
          minRows={4}
          maxRows={6}
        />
      </FormControl>
      <FormControl size='sm'>
        <FormLabel>Name prefix (optional)</FormLabel>
        <Input
          onChange={event => setPrefix(event.target.value)}
          value={prefix}
          name="prefix"
          type="text"
          placeholder="twink"
        />
      </FormControl>
      <Button
        onClick={() => addToWl(addressList, prefix)}
        disabled={!okxTabOpen || !addressList}
        sx={{ mt: 1 }}
        size='sm'
      >
        Add {addressCount}
      </Button>
    </Box>
  )
}
