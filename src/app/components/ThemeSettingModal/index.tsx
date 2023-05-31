import { Link } from '@tanstack/react-router'
import cx from 'classnames'
import { useAtom } from 'jotai'
import { FC, useCallback, useState } from 'react'
import { ColorResult, TwitterPicker } from 'react-color'
import { useTranslation } from 'react-i18next'
import { usePremium } from '~app/hooks/use-premium'
import { trackEvent } from '~app/plausible'
import { followArcThemeAtom, themeColorAtom } from '~app/state'
import { applyThemeMode, getDefaultThemeColor } from '~app/utils/color-scheme'
import { isArcBrowser } from '~app/utils/env'
import { ThemeMode, getUserThemeMode, setUserThemeMode } from '~services/theme'
import Dialog from '../Dialog'
import Select from '../Select'

const THEME_COLORS = [
  getDefaultThemeColor(),
  '#FF6900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#0693E3',
  '#ABB8C3',
  '#EB144C',
  '#F78DA7',
  '#555555',
]

interface Props {
  open: boolean
  onClose: () => void
}

const ThemeSettingModal: FC<Props> = (props) => {
  const { t } = useTranslation()
  const [themeColor, setThemeColor] = useAtom(themeColorAtom)
  const [themeMode, setThemeMode] = useState(getUserThemeMode())
  const premiumState = usePremium()
  const [followArcTheme, setFollowArcTheme] = useAtom(followArcThemeAtom)

  const onThemeModeChange = useCallback((mode: ThemeMode) => {
    setUserThemeMode(mode)
    setThemeMode(mode)
    applyThemeMode(mode)
    trackEvent('change_theme_mode', { mode })
  }, [])

  const onThemeColorChange = useCallback(
    (color: ColorResult) => {
      setThemeColor(color.hex)
      trackEvent('change_theme_color', { color: color.hex })
    },
    [setThemeColor],
  )

  return (
    <Dialog
      title={t('Theme Settings')}
      open={props.open}
      onClose={props.onClose}
      className="rounded-xl w-[600px] min-h-[300px]"
    >
      <div className="p-5 pb-10 flex flex-col gap-5">
        <div className="w-[300px]">
          <p className="font-bold text-lg mb-3">{t('Theme Mode')}</p>
          <Select
            options={[
              { name: t('Auto'), value: ThemeMode.Auto },
              { name: t('Light'), value: ThemeMode.Light },
              { name: t('Dark'), value: ThemeMode.Dark },
            ]}
            value={themeMode}
            onChange={onThemeModeChange}
          />
        </div>
        <div>
          <p className="font-bold text-lg mb-3">
            {t('Theme Color')}{' '}
            {!premiumState.activated && (
              <Link to="/premium" className="text-sm font-normal ml-1 underline italic" onClick={() => props.onClose()}>
                ({t('Premium Feature')})
              </Link>
            )}
          </p>
          <div className={cx(!premiumState.activated && 'opacity-50 pointer-events-none')}>
            {isArcBrowser() && (
              <div className="mb-3 flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  id="arc-theme-check"
                  checked={followArcTheme}
                  onChange={(e) => setFollowArcTheme(e.target.checked)}
                  disabled={!premiumState.activated}
                />
                <label htmlFor="arc-theme-check">{t('Follow Arc browser theme')}</label>
              </div>
            )}
            {!followArcTheme && (
              <TwitterPicker
                colors={THEME_COLORS}
                color={themeColor}
                onChange={onThemeColorChange}
                triangle="hide"
                width="300px"
              />
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default ThemeSettingModal
