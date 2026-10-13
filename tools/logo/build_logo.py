# Builds design-system/assets/logo/*.svg (jouleWise in ergOS Harmony glass, plus the classic 2D glass).
#   python3 tools/logo/build_logo.py
# Letter outlines come from wordmark-outlines.json (Urbanist 600 "j"+"ule", 500 "Wise", 140 px, baseline 120),
# made once with fontTools from the Urbanist font; regenerate it with outlines.py if the type changes.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, 'wordmark-outlines.json')))
OUT = os.path.join(HERE, '..', '..', 'design-system', 'assets', 'logo')
os.makedirs(OUT, exist_ok=True)
r=P['xh']/2*1.16; cx=P['cx']; cy=P['base']-P['xh']/2
W=round(P['w']+10); H=160
GLYPH='M35 17V55C35 68 26 74 16 68M46 55C50 33 57 33 60 51S69 71 74 52S80 35 86 45'

def orb_defs(i, light=False):
    """Defs for a glass orb drawn in a 100×100 box. light=True: tuned for pale grounds."""
    body = (['#F2FFF6', '#A7F3C0', '#46B06C', '#1E5C37'] if not light else ['#E9FBEF', '#7FD9A0', '#2E9A55', '#14432A'])
    op = ['0.96', '0.80', '0.72', '0.90'] if not light else ['0.98', '0.88', '0.85', '0.95']
    return (
      f'<radialGradient id="{i}b" cx="38" cy="30" r="78" gradientUnits="userSpaceOnUse">'
      + ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in zip(['0', '.28', '.68', '1'], body, op))
      + '</radialGradient>'
      f'<radialGradient id="{i}c" cx="52" cy="92" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#C9FFD9" stop-opacity=".75"/><stop offset=".55" stop-color="#68E78E" stop-opacity=".22"/><stop offset="1" stop-color="#68E78E" stop-opacity="0"/></radialGradient>'
      f'<linearGradient id="{i}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
      f'<linearGradient id="{i}r" x1="20" y1="4" x2="80" y2="96" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset=".8" stop-color="#9AF0B5" stop-opacity=".25"/><stop offset="1" stop-color="#E9FBEF" stop-opacity=".7"/></linearGradient>'
      f'<linearGradient id="{i}g" x1="0" y1="10" x2="0" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#EAFBF0" stop-opacity=".9"/></linearGradient>'
      f'<filter id="{i}f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'
      f'<filter id="{i}e" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.8"/></filter>'
    )

def orb_body(i, shadow=True):
    """The orb: soft floor shadow, translucent body, caustic glow, engraved glyph, specular cap, rim light."""
    return (
      (f'<ellipse cx="52" cy="99" rx="34" ry="5" fill="#000B1A" opacity=".28" filter="url(#{i}f)"/>' if shadow else '')
      + f'<circle cx="50" cy="50" r="49" fill="url(#{i}b)"/>'
      + f'<circle cx="50" cy="50" r="49" fill="url(#{i}c)"/>'
      # engraved glyph: a soft dark bed, then the white stroke on top
      + f'<path d="{GLYPH}" transform="translate(0.6 1.8)" fill="none" stroke="#0B3A20" stroke-opacity=".45" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#{i}e)"/>'
      + f'<path d="{GLYPH}" fill="none" stroke="url(#{i}g)" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>'
      # specular cap and a pin-point highlight
      + f'<ellipse cx="40" cy="24" rx="27" ry="13" transform="rotate(-24 40 24)" fill="url(#{i}s)" opacity=".85"/>'
      + '<circle cx="27" cy="27" r="2.6" fill="#fff" opacity=".9"/>'
      # rim light
      + f'<circle cx="50" cy="50" r="48.6" fill="none" stroke="url(#{i}r)" stroke-width="1.4"/>'
    )

def placed(i, shadow=True):
    s = 2*r/100; tx = cx-r; ty = cy-r
    return f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})">{orb_body(i, shadow)}</g>'

def wordmark(i, joule_top, joule_bot, wise, light=False, title='jouleWise'):
    defs = orb_defs(i, light) + (f'<linearGradient id="{i}t" x1="0" y1="20" x2="0" y2="150" gradientUnits="userSpaceOnUse">'
                                 f'<stop offset="0" stop-color="{joule_top}"/><stop offset="1" stop-color="{joule_bot}"/></linearGradient>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="{i}T">'
            f'<title id="{i}T">{title}</title><defs>{defs}</defs>'
            f'<path d="{P["j"]}{P["ule"]}" fill="url(#{i}t)"/>{placed(i)}<path d="{P["wise"]}" fill="{wise}"/></svg>\n')

files = {
  'joulewise-dark.svg': wordmark('jd', '#B8F5CB', '#4FC27A', '#F2F6F3'),
  'joulewise-light.svg': wordmark('jl', '#2E9A55', '#1B5A33', '#000B1A', light=True),
}
# mono (currentColor, flat): for one-colour print, embroidery, favicons at tiny sizes
s = 2*r/100
files['joulewise-mono.svg'] = (
  f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="mT" fill="currentColor"><title id="mT">jouleWise</title>'
  f'<defs><mask id="mM" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><path d="{GLYPH}" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>'
  f'<path d="{P["j"]}{P["ule"]}{P["wise"]}"/><g transform="translate({cx-r:.2f} {cy-r:.2f}) scale({s:.4f})"><circle cx="50" cy="50" r="50" mask="url(#mM)"/></g></svg>\n')
# the orb alone (transparent ground)
files['joulewise-mark.svg'] = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 112" width="108" height="112" role="img" aria-label="jouleWise">'
                               f'<defs>{orb_defs("mk")}</defs>{orb_body("mk")}</svg>\n')
# app icon: charcoal tile, aurora glow, the orb
files['joulewise-app-icon.svg'] = (
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168" width="512" height="512" role="img" aria-label="jouleWise">'
  f'<defs>{orb_defs("ai")}'
  '<radialGradient id="aiG" cx="50%" cy="58%" r="62%"><stop offset="0" stop-color="#68E78E" stop-opacity=".42"/><stop offset=".6" stop-color="#2B7445" stop-opacity=".12"/><stop offset="1" stop-color="#000B1A" stop-opacity="0"/></radialGradient>'
  '<linearGradient id="aiE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
  '<rect width="168" height="168" rx="38" fill="#000B1A"/><rect width="168" height="168" rx="38" fill="url(#aiG)"/>'
  '<rect x=".75" y=".75" width="166.5" height="166.5" rx="37.3" fill="none" stroke="url(#aiE)" stroke-width="1.5"/>'
  f'<g transform="translate(34 30)">{orb_body("ai")}</g></svg>\n')
for n, c in files.items(): open(os.path.join(OUT, n), 'w').write(c)
print(W, H, sorted(files))

# ---------------------------------------------------------------- 2D glass, original colours
GOLD, BROWN, CREAM = '#CEAB0E', '#4D3C00', '#F3EAC3'
def flat_disc(i):
    """Flat (2D) translucent glass disc: tinted pane, one diagonal facet, inner light edge, crisp white glyph."""
    return (
      f'<clipPath id="{i}k"><circle cx="50" cy="50" r="49"/></clipPath>'
      , f'<circle cx="50" cy="50" r="49" fill="{GOLD}" fill-opacity=".74"/>'
        f'<g clip-path="url(#{i}k)"><path d="M-2 -2H70L-2 70Z" fill="#fff" fill-opacity=".20"/><path d="M84 -2H100V12L12 100H-2V86Z" fill="#fff" fill-opacity=".08"/></g>'
        f'<circle cx="50" cy="50" r="46.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>'
        f'<circle cx="50" cy="50" r="49.2" fill="none" stroke="{GOLD}" stroke-width="1.6"/>'
        f'<path d="{GLYPH}" fill="none" stroke="#fff" stroke-opacity=".96" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>'
    )
def classic(i, wise, title='jouleWise'):
    d, body = flat_disc(i)
    s = 2*r/100
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="{i}T">'
            f'<title id="{i}T">{title}</title><defs>{d}</defs>'
            f'<path d="{P["j"]}{P["ule"]}" fill="{GOLD}"/><g transform="translate({cx-r:.2f} {cy-r:.2f}) scale({s:.4f})">{body}</g>'
            f'<path d="{P["wise"]}" fill="{wise}"/></svg>\n')
extra = {
  'joulewise-classic-glass.svg': classic('cg', BROWN),
  'joulewise-classic-glass-dark.svg': classic('cd', CREAM),
}
d, body = flat_disc('cm')
extra['joulewise-classic-mark.svg'] = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="jouleWise"><defs>{d}</defs>{body}</svg>\n'
for n, c in extra.items(): open(os.path.join(OUT, n), 'w').write(c)
print(sorted(extra))
