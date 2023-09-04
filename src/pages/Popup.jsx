import { useEffect, useState } from 'react'
import { Alert, Box, Button, FormControl, FormLabel, Input, Textarea, Typography } from '@mui/joy'
import '@fontsource/inter'
import './Popup.css'

async function fillInputs(addressList, prefix) {
  const selectors = {
    openAddressDialogButton: '#root > div > div > div.balance-bottom > div > div.withdraw-book > div.filter-search > div.filter-search-form.filter-search-form-md > button',
    dialog: '#body > div.okui-transition-fade.okui-dialog.okui-dialog-float.okui-transition-fade-entered > div',
    addAddressInput: '#scroll-box > div > div > form > div:nth-child(5) > div > div > div > div > div.add-address-form-btn',
    saveAsTrustCheckbox: '#scroll-box > div > div > form > div:nth-child(6) > div > div > div > label > span.okui-checkbox-children',

    addressInputSelector: i => `#scroll-box > div > div > form > div:nth-child(5) > div > div > div > div > div:nth-child(${i}) > div.okui-form-item-control > div > div > div > div > input`,
    nameInputSelector: i => `#scroll-box > div > div > form > div:nth-child(5) > div > div > div > div > div:nth-child(${i}) > div.okui-form-item-control > div > div > div > div > input`,
  }

  const fillInput = (selector, value) => {
    const input = document.querySelector(selector)
    input.setAttribute('value', value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const dialogElement = document.querySelector(selectors.dialog)
  const addAddressElement = document.querySelector(selectors.addAddressInput)

  // open dialog if not opened
  if (!dialogElement) {
    const openDialogButton = document.querySelector(selectors.openAddressDialogButton)
    openDialogButton.click()
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

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
        addressList.split(/\r?\n/).slice(20),
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
          <b>xs</b>OKX tool
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
